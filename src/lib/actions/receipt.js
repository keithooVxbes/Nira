'use server';

import { createClient } from '@/utils/supabase/server';
import { createTransaction } from '@/app/cashflow/actions';
import {
  RECEIPT_MAX_BYTES,
  RECEIPT_MIME_TYPES,
  RECEIPT_PROMPT,
  RECEIPT_RESPONSE_SCHEMA,
  parseReceiptResponse,
} from '@/lib/receipt';

/**
 * Tried in order. Google retires older models and busy ones answer 503,
 * so a fallback chain ensures high availability. GEMINI_MODEL, when set, goes first.
 */
const MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
].filter((m, i, all) => Boolean(m) && all.indexOf(m) === i);

async function askGemini(apiKey, mimeType, data) {
  for (const model of MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: RECEIPT_PROMPT }, { inline_data: { mime_type: mimeType, data } }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: RECEIPT_RESPONSE_SCHEMA,
            temperature: 0,
            thinkingConfig: { thinkingLevel: 'low' },
          },
        }),
        signal: AbortSignal.timeout(20_000),
      });

      if (res.ok) {
        const body = await res.json();
        return body.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      }

      console.error(`[receipt] ${model} failed`, res.status, (await res.text()).slice(0, 300));
    } catch (error) {
      console.error(`[receipt] ${model} error`, error instanceof Error ? error.name : error);
    }
  }
  return null;
}

/**
 * Reads a receipt photo with a vision model and records it as an expense.
 * The image is only forwarded to the model; it is never stored.
 */
export async function scanReceiptAction(formData) {
  const file = formData.get('receipt');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choose a receipt photo.' };
  }
  if (!RECEIPT_MIME_TYPES.includes(file.type)) {
    return { ok: false, message: 'Use a JPG, PNG or WebP image.' };
  }
  if (file.size > RECEIPT_MAX_BYTES) {
    return { ok: false, message: 'Image is too large (max 4 MB).' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, message: 'Receipt scanning is not configured.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, message: 'Unauthorized. Please log in.' };
    }

    const data = Buffer.from(await file.arrayBuffer()).toString('base64');
    const text = await askGemini(apiKey, file.type, data);
    if (text === null) {
      return { ok: false, message: 'The scanner is busy right now. Try again in a moment.' };
    }

    const receipt = parseReceiptResponse(text);
    if (!receipt) {
      return { ok: false, message: 'No receipt total found. Try a clearer photo or add it manually.' };
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const dateStr = nowIso.split('T')[0];

    const txFormData = new FormData();
    txFormData.append('type', 'expense');
    txFormData.append('amount', String(receipt.amount));
    txFormData.append('category', receipt.category);
    txFormData.append('description', receipt.description || receipt.category);
    txFormData.append('transaction_date', dateStr);

    const created = await createTransaction(txFormData);
    if (created?.error) {
      return { ok: false, message: created.error };
    }

    return {
      ok: true,
      transaction: {
        id: created.data?.id,
        amount: receipt.amount,
        category: receipt.category,
        description: receipt.description || receipt.category,
        date: dateStr,
      },
    };
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      return { ok: false, message: 'Scanning timed out. Try again.' };
    }
    console.error('Scan receipt error:', error);
    return { ok: false, message: 'Something went wrong while scanning receipt.' };
  }
}
