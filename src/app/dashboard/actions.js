'use server'

import { createClient } from '@/utils/supabase/server'

export async function getBalanceSummary() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { balance: 0, totalIncome: 0, totalExpense: 0, error: 'Unauthorized' }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', user.id)

  if (error) {
    return { balance: 0, totalIncome: 0, totalExpense: 0, error: error.message }
  }

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(tx => {
    if (tx.type === 'income') totalIncome += Number(tx.amount);
    if (tx.type === 'expense') totalExpense += Number(tx.amount);
  });

  return { balance: totalIncome - totalExpense, totalIncome, totalExpense }
}

export async function getUpcomingAssignments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', user.id)
    .neq('status', 'completed')
    .order('due_date', { ascending: true })
    .limit(5)

  if (error) return { data: [], error: error.message }
  return { data }
}

export async function getTodayClasses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: [], error: 'Unauthorized' }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = days[new Date().getDay()]

  const { data, error } = await supabase
    .from('schedule_classes')
    .select('*')
    .eq('user_id', user.id)
    .eq('day', today)
    .order('start_time', { ascending: true })
    .limit(5)

  if (error) return { data: [], error: error.message }
  return { data }
}

export async function getPinnedNotes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('pinned', true)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) return { data: [], error: error.message }
  return { data }
}

export async function getActiveFocusSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['running', 'paused'])
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    return { data: null, error: error.message }
  }

  return { data }
}

export async function startFocusSession(mode, duration) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Cancel any currently running or paused sessions first
  await supabase
    .from('focus_sessions')
    .update({ status: 'cancelled' })
    .eq('user_id', user.id)
    .in('status', ['running', 'paused'])

  const { data, error } = await supabase
    .from('focus_sessions')
    .insert({
      user_id: user.id,
      mode,
      duration,
      remaining_seconds: duration,
      status: 'running',
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function completeFocusSession(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('focus_sessions')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function cancelFocusSession(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('focus_sessions')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function pauseFocusSession(id, remainingSeconds) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('focus_sessions')
    .update({ 
      status: 'paused', 
      remaining_seconds: remainingSeconds,
      paused_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function resumeFocusSession(id, remainingSeconds) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('focus_sessions')
    .update({ 
      status: 'running', 
      remaining_seconds: remainingSeconds,
      started_at: new Date().toISOString() // Reset start time for new delta
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
