import AppShell from '@/components/layout/AppShell';
import { getTransactions, getSubscriptions } from './actions';
import CashflowClient from './CashflowClient';

export default async function Cashflow() {
  const [{ data: transactions, error: txError }, { data: subscriptions, error: subError }] = await Promise.all([
    getTransactions(),
    getSubscriptions()
  ]);

  const hasError = !!txError || !!subError;

  return (
    <AppShell>
      <CashflowClient 
        transactions={transactions} 
        subscriptions={subscriptions} 
        hasError={hasError}
        txError={txError}
        subError={subError}
      />
    </AppShell>
  );
}
