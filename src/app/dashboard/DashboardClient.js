"use client";

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Wallet, ClipboardList, StickyNote, TrendingUp, TrendingDown, Clock, Calendar } from 'lucide-react';
import styles from './page.module.css';
import AssignmentModal from '@/app/assignments/AssignmentModal';
import NoteEditor from '@/components/notes/NoteEditor';
import TransactionModal from '@/components/cashflow/TransactionModal';

export default function DashboardClient({ username, initial, greeting }) {
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

  // Mock local state lists just for the dashboard preview
  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Physics Midterm Prep', course: 'Physics 101', priority: 'High', dueDate: 'Tomorrow' },
    { id: 2, title: 'Calculus Assignment 4', course: 'MATH 202', priority: 'Medium', dueDate: 'In 3 days' },
    { id: 3, title: 'History Reading', course: 'HIST 105', priority: 'Low', dueDate: 'Next week' }
  ]);

  const [notes, setNotes] = useState([]);
  
  const handleSaveAssignment = (newAssignment) => {
    const mapped = {
      id: newAssignment.id,
      title: newAssignment.title,
      course: newAssignment.course,
      priority: newAssignment.priority,
      dueDate: newAssignment.dueDate || 'Soon'
    };
    setAssignments([mapped, ...assignments]);
  };

  const handleSaveNote = (newNote) => {
    setNotes([newNote, ...notes]);
  };

  const handleTransactionSubmit = (newTransaction) => {
    // Basic no-op mapping for local dashboard display since cashflow doesn't render here yet
    setIsTransactionOpen(false);
  };

  const actions = (
    <div className={styles.actionGroup}>
      <Button variant="secondary" className={styles.actionBtn} onClick={() => setIsTransactionOpen(true)}>
        <Wallet size={16} strokeWidth={2.5} />
        <span className={styles.actionText}>Add Transaction</span>
      </Button>
      <Button variant="secondary" className={styles.actionBtn} onClick={() => setIsAssignmentOpen(true)}>
        <ClipboardList size={16} strokeWidth={2.5} />
        <span className={styles.actionText}>Add Assignment</span>
      </Button>
      <Button variant="primary" className={styles.actionBtn} onClick={() => setIsNoteOpen(true)}>
        <StickyNote size={16} strokeWidth={2.5} />
        <span className={styles.actionText}>Add Note</span>
      </Button>
    </div>
  );

  return (
    <>
      <header className={styles.dashboardHero}>
        <div className={styles.heroTop}>
          <h1 className={styles.heroTitle}>{greeting}, {username} ✨</h1>
        </div>
        <div className={styles.heroActions}>
          {actions}
        </div>
      </header>

      {/* 4 Stat/KPI Cards with elevated visual hierarchy and NO pills */}
      <section className={styles.statsRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiLabelGroup}>
              <div className={`${styles.kpiIconBox} ${styles.iconViolet}`}>
                <Wallet size={18} strokeWidth={2.5} />
              </div>
              <span className={styles.kpiLabel}>Balance (IDR)</span>
            </div>
          </div>
          <div className={styles.kpiValue}>0.00</div>
          <div className={styles.kpiFooter}>
            <span>income - expenses</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiLabelGroup}>
              <div className={`${styles.kpiIconBox} ${styles.iconBlue}`}>
                <ClipboardList size={18} strokeWidth={2.5} />
              </div>
              <span className={styles.kpiLabel}>Assignments Due</span>
            </div>
          </div>
          <div className={styles.kpiValue}>{assignments.length}</div>
          <div className={styles.kpiFooter}>
            <div style={{ width: '100%', backgroundColor: 'var(--surface-input)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '40%', backgroundColor: '#3B82F6', height: '100%' }}></div>
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiLabelGroup}>
              <div className={`${styles.kpiIconBox} ${styles.iconAmber}`}>
                <Calendar size={18} strokeWidth={2.5} />
              </div>
              <span className={styles.kpiLabel}>Today&apos;s Classes</span>
            </div>
          </div>
          <div className={styles.kpiValue}>3</div>
          <div className={styles.kpiFooter}>
            <span>Physics, Calculus, History</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiLabelGroup}>
              <div className={`${styles.kpiIconBox} ${styles.iconEmerald}`}>
                <TrendingUp size={18} strokeWidth={2.5} />
              </div>
              <span className={styles.kpiLabel}>Weekly Progress</span>
            </div>
          </div>
          <div className={styles.kpiValue}>78%</div>
          <div className={styles.kpiFooter}>
            <span>+12% from last week</span>
          </div>
        </div>
      </section>

      {/* Main Content Workspace Grid */}
      <section className={styles.dashboardGrid}>
        {/* Assignments Card */}
        <div className={`${styles.gridCard} ${styles.cardTintBlue}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <div className={`${styles.kpiIconBox} ${styles.iconBlue}`}>
                <ClipboardList size={18} strokeWidth={2.5} />
              </div>
              <h2 className={styles.cardTitle}>Upcoming assignments</h2>
            </div>
            <Link href="/assignments" className={styles.link}>
              View all
            </Link>
          </div>
          <div className={styles.list}>
            {assignments.slice(0, 4).map(assign => (
              <div key={assign.id} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTitle}>{assign.title}</div>
                  <div className={styles.itemMeta}>{assign.course} · {assign.dueDate}</div>
                </div>
                <Badge variant={assign.priority.toLowerCase()}>{assign.priority}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Card */}
        <div className={`${styles.gridCard} ${styles.cardTintAmber}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <div className={`${styles.kpiIconBox} ${styles.iconAmber}`}>
                <Calendar size={18} strokeWidth={2.5} />
              </div>
              <h2 className={styles.cardTitle}>Today&apos;s classes</h2>
            </div>
            <Link href="/schedule" className={styles.link}>
              Schedule
            </Link>
          </div>
          <div className={styles.list}>
            <div className={styles.listItem}>
              <div className={styles.itemInfo}>
                <div className={styles.itemTitle}>Physics 101</div>
                <div className={styles.itemMeta}>09:00 - 10:30 · Room 302</div>
              </div>
            </div>
            <div className={styles.listItem}>
              <div className={styles.itemInfo}>
                <div className={styles.itemTitle}>Calculus III</div>
                <div className={styles.itemMeta}>11:00 - 12:30 · Room 415</div>
              </div>
            </div>
            <div className={styles.listItem}>
              <div className={styles.itemInfo}>
                <div className={styles.itemTitle}>History of Art</div>
                <div className={styles.itemMeta}>14:00 - 15:30 · Main Hall</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AssignmentModal 
        isOpen={isAssignmentOpen}
        onClose={() => setIsAssignmentOpen(false)}
        onSave={handleSaveAssignment}
      />

      <NoteEditor 
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        onSave={handleSaveNote}
      />

      <TransactionModal 
        isOpen={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
        onSave={handleTransactionSubmit}
      />
    </>
  );
}
