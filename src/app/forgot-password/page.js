'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { forgotPassword } from '@/app/auth/actions';
import styles from './page.module.css';

export default function ForgotPassword() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setError(null);
    setSuccess(false);
    setLoading(true);
    const res = await forgotPassword(formData);
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2 className="h1">Reset your password</h2>
        <p className="text-secondary">Enter your email address and we will send you a link to reset your password.</p>
      </div>

      {success ? (
        <div className={styles.successMessage}>
          <p className="text-secondary" style={{ marginBottom: '16px' }}>Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.</p>
          <div className={styles.backToLogin}>
            <Link href="/login" className={styles.accentLink}>Return to login</Link>
          </div>
        </div>
      ) : (
        <form action={handleSubmit} className={styles.form}>
          {error && <div style={{ color: '#ff4d4f', fontSize: '13px' }}>{error}</div>}
          
          <div className={styles.field}>
            <label htmlFor="email" className="text-secondary">Email</label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>

          <Button variant="primary" type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Sending link...' : 'Send reset link'}
          </Button>

          <div className={styles.backToLogin}>
            <Link href="/login" className={styles.accentLink}>Return to login</Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
