'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getFolders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('note_folders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return { data: [], error: error.message }
  return { data }
}

export async function getNotes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data }
}

export async function createNote(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: formData.title,
      content: formData.content,
      folder_id: formData.folder_id || null,
      pinned: formData.pinned || false
    })
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true, data }
}

export async function updateNote(id, formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('notes')
    .update({
      title: formData.title,
      content: formData.content,
      folder_id: formData.folder_id || null,
      pinned: formData.pinned,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true, data }
}

export async function deleteNote(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function moveNote(noteId, folderId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('notes')
    .update({
      folder_id: folderId || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', noteId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true, data }
}

export async function togglePinned(id, currentPinnedState) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('notes')
    .update({ pinned: !currentPinnedState, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true, data }
}

// Extra methods for folder management
export async function createFolder(name) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('note_folders')
    .insert({ user_id: user.id, name })
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, data }
}

export async function updateFolder(id, name) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('note_folders')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFolder(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('note_folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  // Optionally reset folder_id on related notes
  await supabase.from('notes').update({ folder_id: null }).eq('folder_id', id).eq('user_id', user.id)
  
  revalidatePath('/', 'layout')
  return { success: true }
}
