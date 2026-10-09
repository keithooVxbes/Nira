import AppShell from '@/components/layout/AppShell';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Plus } from 'lucide-react';
import styles from './page.module.css';

export default function Assignments() {
  const actions = (
    <>
      <div className={styles.filterGroup}>
        <Badge variant="chip" active>All</Badge>
        <Badge variant="chip">Priority ▾</Badge>
        <Badge variant="chip">Course ▾</Badge>
      </div>
      <Button variant="primary">
        <Plus size={16} strokeWidth={2} />
        New
      </Button>
    </>
  );

  return (
    <AppShell>
      <Header 
        title="Assignments"
        subtitle="Track deadlines by course and priority"
        actions={actions}
      />

      <div className={styles.kanbanBoard}>
        {/* To Do Column */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>To do</h3>
          <div className={styles.cardList}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.assignmentCard}>
                <div className={styles.cardHeader}>
                  <div className="card-title">Assignment title</div>
                </div>
                <div className="text-secondary" style={{ marginBottom: '16px' }}>Course</div>
                <div className={styles.cardFooter}>
                  <div className="text-secondary">Due date</div>
                  <Badge variant="pill">Priority</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>In progress</h3>
          <div className={styles.cardList}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className={styles.assignmentCard}>
                <div className={styles.cardHeader}>
                  <div className="card-title">Assignment title</div>
                </div>
                <div className="text-secondary" style={{ marginBottom: '16px' }}>Course</div>
                <div className={styles.cardFooter}>
                  <div className="text-secondary">Due date</div>
                  <Badge variant="pill">Priority</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Done</h3>
          <div className={styles.cardList}>
            {[...Array(1)].map((_, i) => (
              <div key={i} className={styles.assignmentCard}>
                <div className={styles.cardHeader}>
                  <div className="card-title">Assignment title</div>
                </div>
                <div className="text-secondary" style={{ marginBottom: '16px' }}>Course</div>
                <div className={styles.cardFooter}>
                  <div className="text-secondary">Due date</div>
                  <Badge variant="pill">Priority</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
