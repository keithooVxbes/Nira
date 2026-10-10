'use client';

import { useState } from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { resetPassword } from '@/app/auth/actions';
import styles from './page.module.css';

export default function ResetPassword() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setError(null);
    setLoading(true);
    const res = await resetPassword(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2 className="h1">Set new password</h2>
        <p className="text-secondary">Please enter your new password below.</p>
      </div>

      <form action={handleSubmit} className={styles.form}>
        {error && <div style={{ color: '#ff4d4f', fontSize: '13px' }}>{error}</div>}
        
        <div className={styles.field}>
          <label htmlFor="password" className="text-secondary">New Password</label>
          <Input id="password" name="password" type="password" placeholder="New password" required minLength={6} />
        </div>
        
        <div className={styles.field}>
          <label htmlFor="confirmPassword" className="text-secondary">Confirm Password</label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm new password" required minLength={6} />
        </div>

        <Button variant="primary" type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
