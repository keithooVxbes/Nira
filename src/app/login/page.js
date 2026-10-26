'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { signIn, resendVerification } from '@/app/auth/actions';
import styles from './page.module.css';

export default function Login() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleSubmit(formData) {
    setError(null);
    setNeedsVerification(false);
    setResendSuccess(false);
    setLoading(true);
    
    const submittedEmail = formData.get('email');
    setEmail(submittedEmail);
    
    const res = await signIn(formData);
    if (res?.error) {
      setError(res.error);
      if (res?.needsVerification) {
        setNeedsVerification(true);
      }
      setLoading(false);
    }
  }
  
  async function handleResendVerification() {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('email', email);
    
    const res = await resendVerification(formData);
    if (res?.error) {
      setError(res.error);
    } else {
      setResendSuccess(true);
    }
    setLoading(false);
  }

  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2 className="h1">Welcome back</h2>
        <p className="text-secondary">Sign in to your account to continue</p>
      </div>

      <form action={handleSubmit} className={styles.form}>
        {error && <div style={{ color: '#ff4d4f', fontSize: '13px' }}>{error}</div>}
        {resendSuccess && <div style={{ color: 'var(--accent)', fontSize: '13px' }}>Verification email sent. Please check your inbox.</div>}
        
        <div className={styles.field}>
          <label htmlFor="email" className="text-secondary">Email</label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        
        <div className={styles.field}>
          <label htmlFor="password" className="text-secondary">Password</label>
          <Input id="password" name="password" type="password" placeholder="Password" required />
        </div>

        <div className={styles.forgotPassword}>
          <Link href="/forgot-password" className={styles.accentLink}>Forgot password?</Link>
        </div>

        <Button variant="primary" type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
        
        {needsVerification && (
          <Button variant="secondary" type="button" onClick={handleResendVerification} disabled={loading} style={{ marginTop: '8px', border: '1px solid var(--border)' }}>
            Resend verification email
          </Button>
        )}
      </form>

      <div className={styles.footerText}>
        <span className="text-secondary">Don&apos;t have an account? </span>
        <Link href="/signup" className={styles.accentLink}>Create account</Link>
      </div>
    </AuthLayout>
  );
}
