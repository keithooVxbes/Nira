'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getScheduleClasses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('schedule_classes')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time', { ascending: true })

  if (error) return { data: [], error: error.message }
  return { data }
}

export async function createScheduleClass(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('schedule_classes')
    .insert({
      user_id: user.id,
      name: formData.name,
      room: formData.room,
      day: formData.day,
      start_time: formData.start_time,
      end_time: formData.end_time,
      color_theme: formData.color_theme || 'blue'
    })

  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateScheduleClass(id, formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('schedule_classes')
    .update({
      name: formData.name,
      room: formData.room,
      day: formData.day,
      start_time: formData.start_time,
      end_time: formData.end_time,
      color_theme: formData.color_theme
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteScheduleClass(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('schedule_classes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true }
}
