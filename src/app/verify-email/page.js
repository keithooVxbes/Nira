import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import styles from './page.module.css';

export default function VerifyEmail() {
  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2 className="h1">Check your email</h2>
        <p className="text-secondary">
          We sent a verification link to your email address. Please verify your account before signing in.
        </p>
      </div>

      <div className={styles.backToLogin}>
        <Link href="/login" className={styles.accentLink}>Back to login</Link>
      </div>
    </AuthLayout>
  );
}
