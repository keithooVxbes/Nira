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
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please verify your email before signing in.', needsVerification: true, email }
    }
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
      emailRedirectTo: `${origin}/auth/callback`
    }
  })

  if (error) {
    console.error('Supabase signup error (original message):', error.message)
    console.error('Supabase signup full error object:', JSON.stringify(error, null, 2))
    
    // Provide a more helpful message if it's an SMTP issue
    let errorMessage = error.message
    if (errorMessage.includes('Error sending confirmation email')) {
      errorMessage = 'Error sending confirmation email. (Hint: If using Resend onboarding domain, you can only send to your own email address. Otherwise, verify your domain or disable email confirmation in Supabase for dev).'
    }
    
    return { error: errorMessage }
  }

  revalidatePath('/', 'layout')
  redirect('/verify-email')
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

export async function resendVerification(formData) {
  const email = formData.get('email')
  const supabase = await createClient()

  const origin = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateProfile(formData) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return { error: 'Unauthorized. Please log in.' }
  }

  const fullName = formData.get('fullName')?.toString().trim()
  const username = formData.get('username')?.toString().trim()
  const bio = formData.get('bio')?.toString().trim() || ''
  const removeAvatar = formData.get('removeAvatar') === 'true'
  const avatarFile = formData.get('avatar')

  if (!fullName || !username) {
    return { error: 'Full Name and Username are required.' }
  }

  let currentAvatarUrl = user.user_metadata?.avatar_url || ''
  let newAvatarUrl = currentAvatarUrl

  const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  const removePaths = possibleExtensions.map(ext => `${user.id}/avatar.${ext}`)

  if (removeAvatar) {
    await supabase.storage.from('avatars').remove(removePaths).catch(() => {})
    await supabase.storage.from('receipts').remove(removePaths).catch(() => {})
    newAvatarUrl = ''
  } else if (avatarFile && avatarFile instanceof File && avatarFile.size > 0) {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validMimes.includes(avatarFile.type)) {
      return { error: 'Please upload a valid JPG, PNG, GIF, or WebP image.' }
    }
    if (avatarFile.size > 5 * 1024 * 1024) {
      return { error: 'Avatar image must be smaller than 5MB.' }
    }

    const rawExt = avatarFile.type.split('/')[1]?.toLowerCase() || 'jpg'
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt
    const filePath = `${user.id}/avatar.${ext}`
    const buffer = Buffer.from(await avatarFile.arrayBuffer())

    // Try 'avatars' bucket first, fallback to 'receipts'
    let uploadSuccess = false
    const { error: avatarsErr } = await supabase.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: avatarFile.type,
        upsert: true,
      })

    if (!avatarsErr) {
      uploadSuccess = true
    } else {
      const { error: receiptsErr } = await supabase.storage
        .from('receipts')
        .upload(filePath, buffer, {
          contentType: avatarFile.type,
          upsert: true,
        })

      if (!receiptsErr) {
        uploadSuccess = true
      } else {
        console.error('Storage upload failed:', avatarsErr, receiptsErr)
        return { error: 'Failed to upload photo. Please try again.' }
      }
    }

    if (uploadSuccess) {
      // Remove other extensions to prevent conflicts
      const oldPaths = possibleExtensions
        .filter(e => e !== ext)
        .map(e => `${user.id}/avatar.${e}`)
      await supabase.storage.from('avatars').remove(oldPaths).catch(() => {})
      await supabase.storage.from('receipts').remove(oldPaths).catch(() => {})

      newAvatarUrl = `/api/user/avatar?t=${Date.now()}`
    }
  }

  // Update Supabase Auth user metadata
  const { error: updateErr } = await supabase.auth.updateUser({
    data: {
      username,
      full_name: fullName,
      bio,
      avatar_url: newAvatarUrl,
    }
  })

  if (updateErr) {
    return { error: updateErr.message }
  }

  // Also update public.profiles table username if it exists
  try {
    await supabase
      .from('profiles')
      .update({ username })
      .eq('user_id', user.id)
  } catch (err) {
    console.warn('Could not update profiles table username:', err)
  }

  revalidatePath('/', 'layout')

  return {
    success: true,
    profile: {
      username,
      fullName,
      bio,
      avatarUrl: newAvatarUrl,
      initial: (fullName || username).charAt(0).toUpperCase(),
      email: user.email,
    }
  }
}

