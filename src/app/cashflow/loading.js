import AppShell from '@/components/layout/AppShell';
import Header from '@/components/layout/Header';
import styles from './page.module.css';

export default function Loading() {
  return (
    <AppShell>
      <Header 
        title="Cashflow Analytics"
        subtitle="Manage liquidity, track expenses and monitor subscriptions"
      />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="text-secondary">Loading transactions...</div>
      </div>
    </AppShell>
  );
}
