import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Search, Plus } from 'lucide-react';
import styles from './page.module.css';

export default function Dashboard() {
  const username = "username";

  const actions = (
    <>
      <Button variant="secondary" icon aria-label="Search">
        <Search size={16} strokeWidth={2} />
      </Button>
      <Button variant="primary">
        <Plus size={16} strokeWidth={2} />
        Quick add
      </Button>
    </>
  );

  return (
    <AppShell>
      <Header 
        title={`Good day, ${username}`} 
        subtitle="Overview of money, deadlines and classes"
        actions={actions}
      />

      <section className={styles.statsRow}>
        <Card>
          <div className={styles.cardTitleRow}>
            <span className={`${styles.iconBadge} ${styles.balanceIcon}`}>💰</span>
            <div className="text-secondary">Balance (IDR)</div>
          </div>
          <div className="stat-number">0.00</div>
          <div className="text-small text-secondary">income - expenses</div>
        </Card>
        <Card>
          <div className={styles.cardTitleRow}>
            <span className={`${styles.iconBadge} ${styles.incomeIcon}`}>↗</span>
            <div className="text-secondary">Income this month</div>
          </div>
          <div className="stat-number">0.00</div>
        </Card>
        <Card>
          <div className={styles.cardTitleRow}>
            <span className={`${styles.iconBadge} ${styles.expenseIcon}`}>↘</span>
            <div className="text-secondary">Expenses this month</div>
          </div>
          <div className="stat-number">0.00</div>
        </Card>
        <Card>
          <div className={styles.cardTitleRow}>
            <span className={`${styles.iconBadge} ${styles.timerIcon}`} title="Subscriptions">◷</span>
            <div className="text-secondary">Subscriptions / month</div>
          </div>
          <div className="stat-number">0.00</div>
          <div className="text-small text-secondary">from subscriptions</div>
        </Card>
      </section>

      <section className={styles.dashboardGrid}>
        {/* Assignments */}
        <Card className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <span className={`${styles.iconBadge} ${styles.taskIcon}`}>□</span>
              <h2 className="card-title">Upcoming assignments</h2>
            </div>
            <Link href="/assignments" className={styles.link}>View all</Link>
          </div>
          <div className={styles.list}>
            <div className={styles.listItem}>
              <div>
                <div className={styles.itemTitle}>Assignment title</div>
                <div className="text-secondary">Course · due date</div>
              </div>
              <Badge variant="pill">High</Badge>
            </div>
            <div className={styles.divider} />
            <div className={styles.listItem}>
              <div>
                <div className={styles.itemTitle}>Assignment title</div>
                <div className="text-secondary">Course · due date</div>
              </div>
              <Badge variant="pill">Medium</Badge>
            </div>
            <div className={styles.divider} />
            <div className={styles.listItem}>
              <div>
                <div className={styles.itemTitle}>Assignment title</div>
                <div className="text-secondary">Course · due date</div>
              </div>
              <Badge variant="pill">Low</Badge>
            </div>
          </div>
        </Card>

        {/* Schedule */}
        <Card className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <span className={`${styles.iconBadge} ${styles.scheduleIcon}`}>□</span>
              <h2 className="card-title">Today's classes</h2>
            </div>
            <Link href="/schedule" className={styles.link}>Schedule</Link>
          </div>
          <div className={styles.list}>
            <div className={styles.listItem}>
              <div>
                <div className={styles.itemTitle}>Class name</div>
                <div className="text-secondary">start - end · room</div>
              </div>
              <Badge variant="pill">Mon</Badge>
            </div>
            <div className={styles.divider} />
            <div className={styles.listItem}>
              <div>
                <div className={styles.itemTitle}>Class name</div>
                <div className="text-secondary">start - end · room</div>
              </div>
              <Badge variant="pill">Mon</Badge>
            </div>
          </div>
        </Card>

        {/* Cashflow */}
        <Card className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <span className={`${styles.iconBadge} ${styles.balanceIcon}`}>💰</span>
              <h2 className="card-title">Recent transactions</h2>
            </div>
            <Link href="/cashflow" className={styles.link}>Cashflow</Link>
          </div>
          <div className={styles.list}>
            <div className={styles.listItem}>
              <div>
                <div className={styles.itemTitle}>Description</div>
                <div className="text-secondary">category · date</div>
              </div>
              <Badge variant="pill">- amount</Badge>
            </div>
            <div className={styles.divider} />
            <div className={styles.listItem}>
              <div>
                <div className={styles.itemTitle}>Description</div>
                <div className="text-secondary">category · date</div>
              </div>
              <Badge variant="pill">+ amount</Badge>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <span className={`${styles.iconBadge} ${styles.weatherIcon}`} title="Pinned notes">□</span>
              <h2 className="card-title">Pinned notes</h2>
            </div>
            <Link href="/notes" className={styles.link}>Notes</Link>
          </div>
          <div className={styles.skeletonList}>
            <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
            <div className={styles.skeletonLine} style={{ width: '100%' }}></div>
            <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
