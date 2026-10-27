"use client";

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Wallet, ClipboardList, StickyNote, Clock, Calendar, Play, Pause, RotateCcw } from 'lucide-react';
import styles from './page.module.css';
import AssignmentModal from '@/app/assignments/AssignmentModal';
import NoteEditor from '@/components/notes/NoteEditor';
import TransactionModal from '@/components/cashflow/TransactionModal';
import { useFocusTimer } from '@/components/focus/FocusTimerProvider';

export default function DashboardClient({ username, initial, greeting, balance, assignments: initialAssignments, classes, notes: initialNotes }) {
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

  const [assignments, setAssignments] = useState(initialAssignments || []);
  const [notes, setNotes] = useState(initialNotes || []);

  const {
    durationInput,
    durationSeconds,
    timeLeft,
    isActive,
    activeSessionId,
    MIN_MINUTES,
    MAX_MINUTES,
    handleDurationInput,
    commitDurationInput,
    toggleTimer,
    resetTimer,
    formatTime,
  } = useFocusTimer();

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

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHero}>
        <div className={styles.heroTop}>
          <h1 className={styles.heroTitle}>{greeting}, {username}</h1>
        </div>
      </header>

      {/* 4 Stat/KPI Cards */}
      <section className={styles.statsRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiLabelGroup}>
              <div className={styles.kpiIconBox}>
                <Wallet size={17} strokeWidth={2.2} />
              </div>
              <span className={styles.kpiLabel}>Balance (IDR)</span>
            </div>
          </div>
          <div className={styles.kpiValue}>{Number(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className={styles.kpiFooter}>
            <span>income - expenses</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiLabelGroup}>
              <div className={styles.kpiIconBox}>
                <ClipboardList size={17} strokeWidth={2.2} />
              </div>
              <span className={styles.kpiLabel}>Assignments Due</span>
            </div>
          </div>
          <div className={styles.kpiValue}>{assignments.length}</div>
          <div className={styles.kpiFooter}>
            <div style={{ width: '100%', backgroundColor: 'var(--surface-input)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '40%', backgroundColor: 'var(--text-primary)', height: '100%' }}></div>
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiLabelGroup}>
              <div className={styles.kpiIconBox}>
                <Calendar size={17} strokeWidth={2.2} />
              </div>
              <span className={styles.kpiLabel}>Today&apos;s Classes</span>
            </div>
          </div>
          <div className={styles.kpiValue}>{classes?.length || 0}</div>
          <div className={styles.kpiFooter}>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {classes?.length > 0 ? classes.map(c => c.title || c.course_name || c.name || 'Class').join(', ') : 'No classes today'}
            </span>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.timerCard}`}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiLabelGroup}>
              <div className={styles.kpiIconBox}>
                <Clock size={17} strokeWidth={2.2} />
              </div>
              <span className={styles.kpiLabel}>Focus Timer</span>
            </div>
          </div>

          <div className={styles.timerDurationRow}>
            <input
              type="number"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              inputMode="numeric"
              aria-label="Focus duration in minutes"
              value={durationInput}
              onChange={(e) => handleDurationInput(e.target.value)}
              onBlur={commitDurationInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              disabled={isActive || !!activeSessionId}
              className={styles.timerDurationInput}
            />
            <span className={styles.timerUnit}>min</span>
          </div>

          <div className={styles.timerDisplay}>
            {formatTime(timeLeft)}
          </div>

          <div className={styles.timerControls}>
            <Button 
              variant={isActive ? "secondary" : "primary"} 
              onClick={toggleTimer} 
              className={styles.timerStartBtn}
            >
              {isActive ? (
                <>
                  <Pause size={14} strokeWidth={2.5} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={14} strokeWidth={2.5} fill="currentColor" />
                  <span>{timeLeft < durationSeconds ? 'Resume' : 'Start'}</span>
                </>
              )}
            </Button>
            {(isActive || timeLeft < durationSeconds) && (
              <Button 
                variant="secondary" 
                onClick={resetTimer} 
                title="Reset timer"
                className={styles.timerResetBtn}
              >
                <RotateCcw size={14} strokeWidth={2} />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Workspace Grid - 3 columns side-by-side */}
      <section className={styles.dashboardGrid}>
        {/* Assignments Card */}
        <div className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <div className={styles.kpiIconBox}>
                <ClipboardList size={16} strokeWidth={2.2} />
              </div>
              <h2 className={styles.cardTitle}>Upcoming assignments</h2>
            </div>
            <Link href="/assignments" className={styles.link}>
              View all
            </Link>
          </div>
          <div className={styles.list}>
            {assignments?.length > 0 ? (
              assignments.slice(0, 4).map(assign => (
                <div key={assign.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>{assign.title}</div>
                    <div className={styles.itemMeta}>{assign.course || assign.course_name} · {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : 'No date'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyList}>
                No upcoming assignments.
              </div>
            )}
          </div>
        </div>

        {/* Schedule Card */}
        <div className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <div className={styles.kpiIconBox}>
                <Calendar size={16} strokeWidth={2.2} />
              </div>
              <h2 className={styles.cardTitle}>Today&apos;s classes</h2>
            </div>
            <Link href="/schedule" className={styles.link}>
              Schedule
            </Link>
          </div>
          <div className={styles.list}>
            {classes?.length > 0 ? (
              classes.slice(0, 4).map(cls => (
                <div key={cls.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>{cls.title || cls.course_name || cls.name}</div>
                    <div className={styles.itemMeta}>
                      {cls.start_time ? cls.start_time.slice(0, 5) : (cls.time || '')} 
                      {cls.end_time ? ` - ${cls.end_time.slice(0, 5)}` : ''} WIB · {cls.room || cls.location || 'TBA'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyList}>
                No classes scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Pinned Notes Card */}
        <div className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <div className={styles.kpiIconBox}>
                <StickyNote size={16} strokeWidth={2.2} />
              </div>
              <h2 className={styles.cardTitle}>Pinned notes</h2>
            </div>
            <Link href="/notes" className={styles.link}>
              View all
            </Link>
          </div>
          <div className={styles.list}>
            {notes?.length > 0 ? (
              notes.slice(0, 4).map(note => (
                <div key={note.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>{note.title}</div>
                    <div className={styles.itemMeta}>{new Date(note.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyList}>
                No pinned notes.
              </div>
            )}
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
    </div>
  );
}
