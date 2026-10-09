"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Repeat, 
  CreditCard, Paperclip, TrendingDown, RefreshCw, Plus,
  Edit, Trash2, AlertCircle, Search, Inbox
} from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './page.module.css';
import cardStyles from '@/components/ui/Card.module.css';
import TransactionModal from '@/components/cashflow/TransactionModal';
import SubscriptionModal from './SubscriptionModal';
import { deleteTransaction, deleteSubscription } from './actions';

export default function CashflowClient({ transactions, subscriptions, hasError, txError, subError }) {
  const [chartFilter, setChartFilter] = useState('Daily');
  const [ledgerFilter, setLedgerFilter] = useState('All Records');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [deletingSub, setDeletingSub] = useState(null);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  // Chart calculation
  const chartData = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let maxExpense = 0;
  let avgExpense = 0;
  let dataPoints = 0;

  if (chartFilter === 'Daily') {
    dataPoints = 30;
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
      if (dailyTotal > maxExpense) maxExpense = dailyTotal;
      chartData.push({ label: d.getDate().toString(), total: dailyTotal, tooltip: dateStr });
    }
    avgExpense = totalExpense / 30;
  } else if (chartFilter === 'Weekly') {
    dataPoints = 12; // Last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() - (i * 7));
      const startOfWeek = new Date(endOfWeek);
      startOfWeek.setDate(startOfWeek.getDate() - 6);
      
      let weeklyTotal = 0;
      if (transactions) {
        transactions.forEach(tx => {
          const txDate = new Date(tx.transaction_date);
          txDate.setHours(0,0,0,0);
          if (tx.type === 'expense' && txDate >= startOfWeek && txDate <= endOfWeek) {
            weeklyTotal += Number(tx.amount);
          }
        });
      }
      if (weeklyTotal > maxExpense) maxExpense = weeklyTotal;
      chartData.push({ label: `W${12-i}`, total: weeklyTotal, tooltip: `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}` });
    }
    avgExpense = totalExpense / 12;
  } else if (chartFilter === 'Monthly') {
    dataPoints = 6; // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = targetMonth.toLocaleString('default', { month: 'short' });
      const yearStr = targetMonth.getFullYear();
      
      let monthlyTotal = 0;
      if (transactions) {
        transactions.forEach(tx => {
          const txDate = new Date(tx.transaction_date);
          if (tx.type === 'expense' && txDate.getMonth() === targetMonth.getMonth() && txDate.getFullYear() === targetMonth.getFullYear()) {
            monthlyTotal += Number(tx.amount);
          }
        });
      }
      if (monthlyTotal > maxExpense) maxExpense = monthlyTotal;
      chartData.push({ label: monthStr, total: monthlyTotal, tooltip: `${monthStr} ${yearStr}` });
    }
    avgExpense = totalExpense / 6; // Just approx avg across last 6 months 
  }

  const activeSubsCount = subscriptions ? subscriptions.length : 0;
  
  // Total Subscriptions Cost
  let totalSubsCost = 0;
  if (subscriptions) {
    subscriptions.forEach(sub => totalSubsCost += Number(sub.amount));
  }

  const actions = (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <div className={styles.currencySelect}>
        <select className={styles.select}>
          <option>IDR (Rp) ▾</option>
        </select>
      </div>
      <Button variant="primary" onClick={() => {
        setEditingTransaction(null);
        setIsTransactionOpen(true);
      }}>
        <Plus size={16} strokeWidth={2} />
        Transaction
      </Button>
    </div>
  );

  const filteredTransactions = transactions?.filter(tx => {
    if (ledgerFilter === 'Income' && tx.type !== 'income') return false;
    if (ledgerFilter === 'Expenses' && tx.type !== 'expense') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description?.toLowerCase().includes(q);
      const matchCat = tx.category?.toLowerCase().includes(q);
      const matchAmount = tx.amount?.toString().includes(q);
      if (!matchDesc && !matchCat && !matchAmount) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortOrder === 'Newest') return new Date(b.transaction_date) - new Date(a.transaction_date);
    if (sortOrder === 'Oldest') return new Date(a.transaction_date) - new Date(b.transaction_date);
    if (sortOrder === 'Highest Amount') return Number(b.amount) - Number(a.amount);
    if (sortOrder === 'Lowest Amount') return Number(a.amount) - Number(b.amount);
    return 0;
  }) || [];

  const renderEmptyState = () => {
    if (isTxEmpty) {
      return (
        <div className={styles.emptyState}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--surface-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
            <Inbox size={24} />
          </div>
          <h3 className={styles.emptyStateTitle}>No transactions yet</h3>
          <p className={styles.emptyStateDesc}>You haven't recorded any income or expenses.</p>
        </div>
      );
    }
    
    if (searchQuery.trim() !== '') {
      return (
        <div className={styles.emptyState}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--surface-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
            <Search size={24} />
          </div>
          <h3 className={styles.emptyStateTitle}>No results found</h3>
          <p className={styles.emptyStateDesc}>No transactions match "{searchQuery}"</p>
        </div>
      );
    }
    
    return (
      <div className={styles.emptyState}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--surface-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
          <CreditCard size={24} />
        </div>
        <h3 className={styles.emptyStateTitle}>No {ledgerFilter.toLowerCase()} found</h3>
        <p className={styles.emptyStateDesc}>Try selecting a different filter.</p>
      </div>
    );
  };

  return (
    <>
      <Header 
        title="Cashflow Analytics"
        subtitle="Manage liquidity, track expenses and monitor subscriptions"
        actions={actions}
      />

      {hasError && (
        <Card style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: 'var(--space-24)' }}>
          Error loading data: {txError ? (txError.message || JSON.stringify(txError)) : subError ? (subError.message || JSON.stringify(subError)) : 'Unknown error'}
        </Card>
      )}

      {/* 4 Metric Cards */}
      <section className={styles.statsRow}>
        <div className={cardStyles.kpiCard}>
          <div className={cardStyles.kpiTop}>
            <div className={cardStyles.kpiLabelGroup}>
              <div className={`${cardStyles.kpiIconBox} ${cardStyles.iconViolet}`}>
                <Wallet size={18} strokeWidth={2.5} />
              </div>
              <span className={cardStyles.kpiLabel}>Net Liquidity</span>
            </div>
          </div>
          <div className={cardStyles.kpiValue}>{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className={cardStyles.kpiFooter}>
            <span>IDR • available balance</span>
          </div>
        </div>

        <div className={cardStyles.kpiCard}>
          <div className={cardStyles.kpiTop}>
            <div className={cardStyles.kpiLabelGroup}>
              <div className={`${cardStyles.kpiIconBox} ${cardStyles.iconEmerald}`}>
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </div>
              <span className={cardStyles.kpiLabel}>Total Income</span>
            </div>
          </div>
          <div className={cardStyles.kpiValue}>{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className={cardStyles.kpiFooter}>
            <span>IDR • this month</span>
          </div>
        </div>

        <div className={cardStyles.kpiCard}>
          <div className={cardStyles.kpiTop}>
            <div className={cardStyles.kpiLabelGroup}>
              <div className={`${cardStyles.kpiIconBox} ${cardStyles.iconRose}`}>
                <ArrowDownRight size={18} strokeWidth={2.5} />
              </div>
              <span className={cardStyles.kpiLabel}>Total Spent</span>
            </div>
          </div>
          <div className={cardStyles.kpiValue}>{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className={cardStyles.kpiFooter}>
            <span>IDR • this month</span>
          </div>
        </div>
        
        <div className={cardStyles.kpiCard}>
          <div className={cardStyles.kpiTop}>
            <div className={cardStyles.kpiLabelGroup}>
              <div className={`${cardStyles.kpiIconBox} ${cardStyles.iconAmber}`}>
                <Repeat size={18} strokeWidth={2.5} />
              </div>
              <span className={cardStyles.kpiLabel}>Active Subscriptions</span>
            </div>
          </div>
          <div className={cardStyles.kpiValue}>{activeSubsCount}</div>
          <div className={cardStyles.kpiFooter}>
            <span>Cost: {totalSubsCost.toLocaleString('en-US')} IDR</span>
          </div>
        </div>
      </section>

      {/* Middle Analytics Row */}
      <div className={styles.bottomRow}>
        <div className={styles.transactionsCard} style={{ flex: 2, marginBottom: 'var(--space-24)' }}>
          <div className={styles.chartHeader}>
            <div className={styles.cardTitleRow}>
              <div className={`${cardStyles.kpiIconBox} ${cardStyles.iconViolet}`}>
                <TrendingDown size={18} strokeWidth={2.5} />
              </div>
              <h2 className={styles.cardTitle}>Daily Spending Flow</h2>
            </div>
            <div className={styles.monthSelector}>
              <span 
                className={styles.monthText} 
                style={{ fontWeight: chartFilter === 'Daily' ? '600' : 'normal', color: chartFilter === 'Daily' ? 'var(--text-primary)' : 'var(--text-tertiary)', cursor: 'pointer' }}
                onClick={() => setChartFilter('Daily')}
              >Daily</span>
              <span className={styles.monthText} style={{ color: 'var(--text-tertiary)', fontWeight: 'normal' }}>|</span>
              <span 
                className={styles.monthText} 
                style={{ fontWeight: chartFilter === 'Weekly' ? '600' : 'normal', color: chartFilter === 'Weekly' ? 'var(--text-primary)' : 'var(--text-tertiary)', cursor: 'pointer' }}
                onClick={() => setChartFilter('Weekly')}
              >Weekly</span>
              <span className={styles.monthText} style={{ color: 'var(--text-tertiary)', fontWeight: 'normal' }}>|</span>
              <span 
                className={styles.monthText} 
                style={{ fontWeight: chartFilter === 'Monthly' ? '600' : 'normal', color: chartFilter === 'Monthly' ? 'var(--text-primary)' : 'var(--text-tertiary)', cursor: 'pointer' }}
                onClick={() => setChartFilter('Monthly')}
              >Monthly</span>
            </div>
          </div>

          <div className={styles.chartSummary}>
            <div>
              <div className="text-secondary" style={{ fontSize: '13px', marginBottom: '4px' }}>Average / {chartFilter.toLowerCase().replace('ly','')}</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{avgExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '13px', marginBottom: '4px' }}>Peak {chartFilter.toLowerCase().replace('ly','')}</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{maxExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div className={styles.chartArea}>
            <div className={styles.yAxis}>
              <span>max</span>
              <span>avg</span>
              <span>0</span>
            </div>
            <div className={styles.chartBars}>
              {maxExpense > 0 && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    bottom: `${(avgExpense / maxExpense) * 100}%`, 
                    left: 0, 
                    right: 0, 
                    borderBottom: '1px dashed var(--text-tertiary)', 
                    opacity: 0.5,
                    zIndex: 0 
                  }}
                />
              )}
              {chartData.map((data, i) => {
                const height = maxExpense > 0 ? (data.total / maxExpense) * 100 : 0;
                const isMax = data.total === maxExpense && maxExpense > 0;
                
                let showLabel = false;
                if (chartFilter === 'Daily') showLabel = (i === 0 || i === 7 || i === 14 || i === 21 || i === 29);
                else if (chartFilter === 'Weekly') showLabel = true;
                else if (chartFilter === 'Monthly') showLabel = true;
                
                return (
                  <div key={i} className={styles.barColumn} style={{ zIndex: 1 }}>
                    <div 
                      className={`${styles.bar} ${isMax ? styles.barAccent : ''}`} 
                      style={{ height: `${height}%`, transition: 'height 0.3s ease' }}
                      title={`${data.tooltip}: ${data.total.toLocaleString()}`}
                    ></div>
                    {showLabel && (
                      <span className={styles.xLabel} style={{ fontSize: chartFilter === 'Daily' ? '12px' : '10px', marginTop: '8px' }}>
                        {data.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.subscriptionsCard} style={{ flex: 1, marginBottom: 'var(--space-24)' }}>
          <div className={styles.cardHeader} style={{ marginBottom: '16px' }}>
            <div className={styles.cardTitleRow}>
              <div className={`${cardStyles.kpiIconBox} ${cardStyles.iconEmerald}`}>
                <RefreshCw size={18} strokeWidth={2.5} />
              </div>
              <h2 className={styles.cardTitle}>Subscriptions Hub</h2>
            </div>
            <button type="button" className={styles.link} onClick={() => { setEditingSub(null); setIsSubModalOpen(true); }}>
              + Add
            </button>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
             <Badge variant="chip" style={{ width: '100%', justifyContent: 'center', padding: '8px' }}>
                Runway: 5.2 months burn rate
             </Badge>
          </div>
          
          {isSubEmpty ? (
            <div className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-24) 0' }}>
              No subscriptions added.
            </div>
          ) : (
            <div className={styles.subsList}>
              {subscriptions.map((sub) => (
                <div key={sub.id} className={styles.subItem}>
                  <div className={styles.subInfo}>
                    <div className={styles.itemTitle}>{sub.name}</div>
                    <div className="text-secondary" style={{ fontSize: '12px' }}>{Number(sub.amount).toLocaleString('en-US')} IDR/mo</div>
                  </div>
                  
                  <div className={styles.subDate}>
                    <Badge variant="pill">{new Date(sub.billing_date).toLocaleDateString('en-GB')}</Badge>
                  </div>
                  
                  <div className={styles.subActions}>
                    <button onClick={() => { setEditingSub(sub); setIsSubModalOpen(true); }} className={styles.subActionBtn} title="Edit">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => setDeletingSub(sub)} className={`${styles.subActionBtn} ${styles.subActionBtnDanger}`} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Ledger Feed */}
      <div className={styles.transactionsCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleRow}>
            <div className={`${cardStyles.kpiIconBox} ${cardStyles.iconBlue}`}>
              <CreditCard size={18} strokeWidth={2.5} />
            </div>
            <h2 className={styles.cardTitle}>Ledger Feed</h2>
          </div>
          <div className={styles.filterChips}>
            <div className={styles.searchBox}>
              <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <select 
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="Highest Amount">Highest Amount</option>
              <option value="Lowest Amount">Lowest Amount</option>
            </select>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-input)', margin: '0 4px' }} />

            <Badge variant="chip" active={ledgerFilter === 'All Records'} onClick={() => setLedgerFilter('All Records')} style={{ cursor: 'pointer' }}>All Records</Badge>
            <Badge variant="chip" active={ledgerFilter === 'Income'} onClick={() => setLedgerFilter('Income')} style={{ cursor: 'pointer' }}>Income</Badge>
            <Badge variant="chip" active={ledgerFilter === 'Expenses'} onClick={() => setLedgerFilter('Expenses')} style={{ cursor: 'pointer' }}>Expenses</Badge>
          </div>
        </div>
        
        {filteredTransactions.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className={styles.transactionList}>
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const TxIcon = isIncome ? ArrowUpRight : ArrowDownRight;
              return (
                <div key={tx.id} className={styles.txItem}>
                  <div className={styles.txLeft}>
                    <div className={isIncome ? styles.txIconPos : styles.txIconNeg}>
                      <TxIcon size={20} />
                    </div>
                    <div className={styles.txInfo}>
                      <div className={styles.txTitle}>{tx.description}</div>
                      <div className={styles.txMeta}>
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{new Date(tx.transaction_date).toLocaleDateString()}</span>
                        {tx.receipt_url && (
                          <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer" className={styles.txReceipt}>
                            <Paperclip size={10} /> Receipt
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.txRight}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className={styles.txHoverActions}>
                        <button 
                          onClick={() => {
                            setEditingTransaction(tx);
                            setIsTransactionOpen(true);
                          }} 
                          className={styles.txActionBtn}
                          title="Edit Transaction"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => setDeletingTransaction(tx)} 
                          className={`${styles.txActionBtn} ${styles.txActionBtnDanger}`}
                          title="Delete Transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className={isIncome ? styles.txAmountPos : styles.txAmountNeg}>
                        {isIncome ? '+' : '-'}{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className={styles.txStatus} style={{ textTransform: 'capitalize' }}>{tx.type}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransactionModal 
        isOpen={isTransactionOpen}
        onClose={() => {
          setIsTransactionOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
      />

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => {
          setIsSubModalOpen(false);
          setEditingSub(null);
        }}
        initialData={editingSub}
        onSave={() => setIsSubModalOpen(false)}
      />

      {(deletingTransaction || deletingSub) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => { setDeletingTransaction(null); setDeletingSub(null); }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: 'var(--space-24)', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Delete {deletingTransaction ? 'Transaction' : 'Subscription'}?</h3>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to delete this {deletingTransaction ? 'transaction' : 'subscription'}? 
              <br/>
              <strong style={{ color: 'var(--text-primary)' }}>{deletingTransaction ? deletingTransaction.description : deletingSub.name}</strong> 
              {deletingTransaction && ` (${Number(deletingTransaction.amount).toLocaleString('en-US')} IDR)`}
            </p>

            {deleteError && (
              <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{deleteError}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => { setDeletingTransaction(null); setDeletingSub(null); }} disabled={isDeleting}>Cancel</Button>
              <Button 
                variant="primary" 
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  setDeleteError('');
                  let res;
                  if (deletingTransaction) {
                    res = await deleteTransaction(deletingTransaction.id);
                  } else if (deletingSub) {
                    res = await deleteSubscription(deletingSub.id);
                  }
                  
                  setIsDeleting(false);
                  if (res?.error) {
                    setDeleteError(res.error);
                  } else {
                    setDeletingTransaction(null);
                    setDeletingSub(null);
                  }
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
