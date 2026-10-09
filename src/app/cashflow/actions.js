'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function getTransactions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })

  if (data) {
    for (let tx of data) {
      if (tx.receipt_url) {
        // If the old public URL is still stored, this will fail. Assuming path is stored now.
        // We could also check if it starts with 'http' to avoid breaking existing.
        if (!tx.receipt_url.startsWith('http')) {
          const { data: signedUrlData } = await supabase.storage
            .from('receipts')
            .createSignedUrl(tx.receipt_url, 3600)
          
          if (signedUrlData) {
            tx.receipt_url = signedUrlData.signedUrl
          }
        }
      }
    }
  }

  return { data, error }
}

export async function createTransaction(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const type = formData.get('type')
  const amount = parseFloat(formData.get('amount'))
  const category = formData.get('category')
  const description = formData.get('description')
  const transaction_date = formData.get('transaction_date')
  const receipt = formData.get('receipt')

  // Create transaction first to get the ID
  const { data: newTx, error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type,
      amount,
      category,
      description,
      transaction_date
    })
    .select()
    .single()

  if (txError) return { error: txError.message }

  // Upload receipt if provided
  if (type === 'expense' && receipt && receipt.size > 0) {
    const ext = receipt.name.split('.').pop()
    const filePath = `${user.id}/${newTx.id}.${ext}`
    
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, receipt)
      
    if (uploadError) {
      // Best effort cleanup or just return error
      return { error: 'Transaction created, but receipt upload failed: ' + uploadError.message }
    }
    
    // Store the raw file path in the database. 
    // Signed URLs will be generated dynamically on read.
    await supabase
      .from('transactions')
      .update({ receipt_url: filePath })
      .eq('id', newTx.id)
  }

  revalidatePath('/cashflow')
  return { success: true }
}

export async function getSubscriptions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function createSubscription(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name')
  const amount = parseFloat(formData.get('amount'))
  const category = formData.get('category')
  const billing_date = formData.get('billing_date')

  const { error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      name,
      amount,
      category,
      billing_date
    })

  if (error) return { error: error.message }

  revalidatePath('/cashflow')
  return { success: true }
}
