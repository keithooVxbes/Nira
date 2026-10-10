'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signIn(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const username = formData.get('username')
  const supabase = await createClient()

  // Construct a safe origin for emailRedirectTo to prevent invalid path errors on Vercel
  const origin = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
      emailRedirectTo: `${origin}/dashboard`
    }
  })

  if (error) {
    console.error('Supabase signup error:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(formData) {
  const email = formData.get('email')
  const supabase = await createClient()
  
  const origin = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(formData) {
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/login')
}
