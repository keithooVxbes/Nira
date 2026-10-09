import { createClient } from './server'

// Get user profile
export async function getUserProfile(userId) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

// Reusable user helper
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  return { user, error }
}
