'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { signUp } from '@/app/auth/actions';
import styles from '../login/page.module.css';

export default function SignUp() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setError(null);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    const res = await signUp(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2 className="h1">Create your account</h2>
        <p className="text-secondary">Start organizing money, classes and notes</p>
      </div>

      <form action={handleSubmit} className={styles.form}>
        {error && <div style={{ color: '#ff4d4f', fontSize: '13px' }}>{error}</div>}
        
        <div className={styles.field}>
          <label htmlFor="username" className="text-secondary">Username</label>
          <Input id="username" name="username" type="text" placeholder="Username" required />
        </div>
        
        <div className={styles.field}>
          <label htmlFor="email" className="text-secondary">Email</label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        
        <div className={styles.field}>
          <label htmlFor="password" className="text-secondary">Password</label>
          <Input id="password" name="password" type="password" placeholder="Password" required />
        </div>
        
        <div className={styles.field}>
          <label htmlFor="confirmPassword" className="text-secondary">Confirm password</label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat password" required />
        </div>

        <Button variant="primary" type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className={styles.footerText}>
        <span className="text-secondary">Already have an account? </span>
        <Link href="/login" className={styles.accentLink}>Sign in</Link>
      </div>
    </AuthLayout>
  );
}
