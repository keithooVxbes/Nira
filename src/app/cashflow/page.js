import AppShell from '@/components/layout/AppShell';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import TransactionModal from './TransactionModal';
import SubscriptionModal from './SubscriptionModal';
import { getTransactions, getSubscriptions } from './actions';

export default async function Cashflow() {
  const [{ data: transactions, error: txError }, { data: subscriptions, error: subError }] = await Promise.all([
    getTransactions(),
    getSubscriptions()
  ]);

  const hasError = txError || subError;
  const isTxEmpty = !transactions || transactions.length === 0;
  const isSubEmpty = !subscriptions || subscriptions.length === 0;

  // Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;

  if (transactions) {
    transactions.forEach(tx => {
      if (tx.type === 'income') totalIncome += Number(tx.amount);
      if (tx.type === 'expense') totalExpense += Number(tx.amount);
    });
  }

  const balance = totalIncome - totalExpense;

  // Chart calculation (last 30 days of expenses)
  const chartData = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let maxDailyExpense = 0;
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    let dailyTotal = 0;
    if (transactions) {
      transactions.forEach(tx => {
        if (tx.type === 'expense' && tx.transaction_date === dateStr) {
          dailyTotal += Number(tx.amount);
        }
      });
    }
    
    if (dailyTotal > maxDailyExpense) maxDailyExpense = dailyTotal;
    
    chartData.push({
      date: dateStr,
      dayOfMonth: d.getDate(),
      total: dailyTotal
    });
  }
  
  const avgExpense = totalExpense / 30;

  const actions = (
    <>
      <div className={styles.currencySelect}>
        <span className="text-secondary">Currency</span>
        <select className={styles.select}>
          <option>IDR ▾</option>
        </select>
      </div>
      <TransactionModal />
    </>
  );

  return (
    <AppShell>
      <Header 
        title="Cashflow"
        subtitle="Transactions and recurring subscriptions"
        actions={actions}
      />

      {hasError && (
        <Card style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: 'var(--space-24)' }}>
          Error loading data: {txError ? (txError.message || JSON.stringify(txError)) : subError ? (subError.message || JSON.stringify(subError)) : 'Unknown error'}
        </Card>
      )}

      <section className={styles.statsRow}>
        <Card>
          <div className={styles.cardTitleRow}>
            <span className={`${styles.iconBadge} ${styles.balanceIcon}`}>💰</span>
            <div className="text-secondary">Balance</div>
          </div>
          <div className="stat-number">{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card>
          <div className={styles.cardTitleRow}>
            <span className={`${styles.iconBadge} ${styles.incomeIcon}`}>↗</span>
            <div className="text-secondary">Income</div>
          </div>
          <div className="stat-number">{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-small text-secondary">total</div>
        </Card>
        <Card>
          <div className={styles.cardTitleRow}>
            <span className={`${styles.iconBadge} ${styles.expenseIcon}`}>↘</span>
            <div className="text-secondary">Expenses</div>
          </div>
          <div className="stat-number">{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-small text-secondary">total</div>
        </Card>
      </section>

      <Card className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.cardTitleRow}>
            <span className={`${styles.iconBadge} ${styles.taskIcon}`}>▥</span>
            <h2 className="card-title">Daily Spending</h2>
          </div>
          <div className={styles.monthSelector}>
            <Button variant="secondary" icon aria-label="Previous month"><ChevronLeft size={16} /></Button>
            <span className={styles.monthText}>Current Period ▾</span>
            <Button variant="secondary" icon aria-label="Next month"><ChevronRight size={16} /></Button>
          </div>
          <div className={styles.periodChips}>
            <Badge variant="chip" active>Daily</Badge>
            <Badge variant="chip">Weekly</Badge>
            <Badge variant="chip">Monthly</Badge>
          </div>
        </div>

        <div className={styles.chartSummary}>
          <div>
            <div className="text-secondary">Total spent</div>
            <div className="h1">{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div className={styles.summaryTitleRow}>
              <span className={`${styles.iconBadge} ${styles.timerIcon}`}>◷</span>
              <div className="text-secondary">Average / day</div>
            </div>
            <div className="h1">{avgExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div className="text-secondary">Highest day</div>
            <div className="h1">{maxDailyExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className={styles.chartArea}>
          <div className={styles.yAxis}>
            <span>max</span>
            <span>½</span>
            <span>0</span>
          </div>
          <div className={styles.chartBars}>
            {chartData.map((data, i) => {
              const height = maxDailyExpense > 0 ? (data.total / maxDailyExpense) * 100 : 0;
              const isMax = data.total === maxDailyExpense && maxDailyExpense > 0;
              return (
                <div key={i} className={styles.barColumn}>
                  <div 
                    className={`${styles.bar} ${isMax ? styles.barAccent : ''}`} 
                    style={{ height: `${height}%` }}
                    title={`${data.date}: ${data.total}`}
                  ></div>
                  {(i === 0 || i === 7 || i === 14 || i === 21 || i === 29) && (
                    <span className={styles.xLabel}>{data.dayOfMonth}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className={styles.bottomRow}>
        <Card className={styles.transactionsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <span className={`${styles.iconBadge} ${styles.balanceIcon}`}>💰</span>
              <h2 className="card-title">Transactions</h2>
            </div>
            <div className={styles.filterChips}>
              <Badge variant="chip" active>All</Badge>
              <Badge variant="chip">Income</Badge>
              <Badge variant="chip">Expense</Badge>
            </div>
          </div>
          
          {isTxEmpty ? (
            <div className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-24) 0' }}>
              No transactions yet. Add one to get started!
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th className={styles.textRight}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="text-secondary">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                    <td>
                      {tx.description}
                      {tx.receipt_url && (
                        <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--accent)' }}>
                          📎 Receipt
                        </a>
                      )}
                    </td>
                    <td className="text-secondary">{tx.category}</td>
                    <td><Badge variant="pill">{tx.type}</Badge></td>
                    <td className={styles.textRight}>{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className={styles.subscriptionsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <span className={`${styles.iconBadge} ${styles.scheduleIcon}`} title="Spending by Category">□</span>
              <h2 className="card-title">Subscriptions</h2>
            </div>
            <SubscriptionModal />
          </div>
          
          {isSubEmpty ? (
            <div className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-24) 0' }}>
              No subscriptions added.
            </div>
          ) : (
            <div className={styles.subsList}>
              {subscriptions.map((sub) => (
                <div key={sub.id} className={styles.subItem}>
                  <div>
                    <div className={styles.itemTitle}>{sub.name}</div>
                    <div className="text-secondary">{sub.category} · {new Date(sub.billing_date).toLocaleDateString()}</div>
                  </div>
                  <Badge variant="pill">{Number(sub.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
