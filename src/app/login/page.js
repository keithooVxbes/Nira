'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { signIn } from '@/app/auth/actions';
import styles from './page.module.css';

export default function Login() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setError(null);
    setLoading(true);
    const res = await signIn(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2 className="h1">Welcome back</h2>
        <p className="text-secondary">Sign in to your account to continue</p>
      </div>

      <form action={handleSubmit} className={styles.form}>
        {error && <div style={{ color: '#ff4d4f', fontSize: '13px' }}>{error}</div>}
        
        <div className={styles.field}>
          <label htmlFor="email" className="text-secondary">Email</label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        
        <div className={styles.field}>
          <label htmlFor="password" className="text-secondary">Password</label>
          <Input id="password" name="password" type="password" placeholder="Password" required />
        </div>

        <div className={styles.forgotPassword}>
          <Link href="/reset-password" className={styles.accentLink}>Forgot password?</Link>
        </div>

        <Button variant="primary" type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className={styles.footerText}>
        <span className="text-secondary">Don&apos;t have an account? </span>
        <Link href="/signup" className={styles.accentLink}>Create account</Link>
      </div>
    </AuthLayout>
  );
}
