"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Wallet, ClipboardList, StickyNote, Clock, Calendar, Play, Pause, RotateCcw } from 'lucide-react';
import styles from './page.module.css';
import AssignmentModal from '@/app/assignments/AssignmentModal';
import NoteEditor from '@/components/notes/NoteEditor';
import TransactionModal from '@/components/cashflow/TransactionModal';

import { startFocusSession, completeFocusSession, cancelFocusSession, pauseFocusSession, resumeFocusSession } from './actions';

export default function DashboardClient({ username, initial, greeting, balance, assignments: initialAssignments, classes, notes: initialNotes, activeFocusSession }) {
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

  const [assignments, setAssignments] = useState(initialAssignments || []);
  const [notes, setNotes] = useState(initialNotes || []);
  
  // Focus Timer Modes: Focus (25m), Long (60m), Short (5m)
  const MODES = {
    'Focus': 25 * 60,
    'Long': 60 * 60,
    'Short': 5 * 60
  };
  
  const [timerMode, setTimerMode] = useState('Focus');
  const [timeLeft, setTimeLeft] = useState(MODES['Focus']);
  const [isActive, setIsActive] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const audioRef = useRef(null);
  const endTimeRef = useRef(null);

  const handleCompleteSession = async (sessionId, currentMode) => {
    setIsActive(false);
    endTimeRef.current = null;

    // 1. Play bell/ringing sound
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (err) {
        console.warn('Audio play was prevented or interrupted:', err);
      }
    }

    // 2. Update focus_sessions status to completed
    if (sessionId) {
      await completeFocusSession(sessionId);
    }
    setActiveSessionId(null);

    // 3. Show completion toast notification
    setToastMsg('Focus session completed 🎉');
    setTimeout(() => setToastMsg(''), 5000);

    // 4. Reset timer to selected mode duration
    setTimeLeft(MODES[currentMode] || MODES['Focus']);
  };

  useEffect(() => {
    audioRef.current = new Audio('/sounds/focus-complete.mp3');
    
    if (activeFocusSession) {
      const mode = MODES[activeFocusSession.mode] ? activeFocusSession.mode : 'Focus';
      setTimerMode(mode);
      setActiveSessionId(activeFocusSession.id);

      if (activeFocusSession.status === 'running') {
        const baseSeconds = activeFocusSession.remaining_seconds != null 
          ? activeFocusSession.remaining_seconds 
          : (activeFocusSession.duration || MODES[mode]);
        const elapsed = Math.floor((Date.now() - new Date(activeFocusSession.started_at).getTime()) / 1000);
        const remaining = baseSeconds - elapsed;
        
        if (remaining > 0) {
          setTimeLeft(remaining);
          setIsActive(true);
          endTimeRef.current = Date.now() + remaining * 1000;
        } else {
          // Already completed while offline / away
          completeFocusSession(activeFocusSession.id);
          setTimeLeft(MODES[mode]);
          setIsActive(false);
          setActiveSessionId(null);
        }
      } else if (activeFocusSession.status === 'paused') {
        const remaining = activeFocusSession.remaining_seconds != null 
          ? activeFocusSession.remaining_seconds 
          : MODES[mode];
        setTimeLeft(remaining);
        setIsActive(false);
      }
    }
  }, [activeFocusSession]);

  useEffect(() => {
    if (!isActive) return;

    const tick = () => {
      if (endTimeRef.current) {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        if (remaining <= 0) {
          setTimeLeft(0);
          handleCompleteSession(activeSessionId, timerMode);
        } else {
          setTimeLeft(remaining);
        }
      } else {
        setTimeLeft(t => {
          if (t <= 1) {
            handleCompleteSession(activeSessionId, timerMode);
            return 0;
          }
          return t - 1;
        });
      }
    };

    const interval = setInterval(tick, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, timerMode, activeSessionId]);

  const toggleTimer = async () => {
    if (isActive) {
      // Pause
      setIsActive(false);
      endTimeRef.current = null;
      if (activeSessionId) {
        await pauseFocusSession(activeSessionId, timeLeft);
      }
    } else {
      // Start or Resume
      setIsActive(true);
      endTimeRef.current = Date.now() + timeLeft * 1000;

      // Preload audio on user gesture to avoid autoplay restrictions
      if (audioRef.current) {
        audioRef.current.load();
      }

      if (activeSessionId) {
        await resumeFocusSession(activeSessionId, timeLeft);
      } else {
        const res = await startFocusSession(timerMode, timeLeft);
        if (res?.data) {
          setActiveSessionId(res.data.id);
        }
      }
    }
  };

  const resetTimer = async () => {
    setIsActive(false);
    endTimeRef.current = null;
    setTimeLeft(MODES[timerMode]);
    if (activeSessionId) {
      const sid = activeSessionId;
      setActiveSessionId(null);
      await cancelFocusSession(sid);
    }
  };

  const changeMode = async (mode) => {
    if (mode === timerMode && !activeSessionId && timeLeft === MODES[mode]) return;
    setIsActive(false);
    endTimeRef.current = null;
    setTimerMode(mode);
    setTimeLeft(MODES[mode]);
    if (activeSessionId) {
      const sid = activeSessionId;
      setActiveSessionId(null);
      await cancelFocusSession(sid);
    }
  };
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  
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
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--text-primary)', color: 'var(--surface)', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, boxShadow: 'var(--shadow-lg)' }}>
          {toastMsg}
        </div>
      )}
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
          <div className={styles.kpiValue}>{Number(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
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
              <div className={`${styles.kpiIconBox} ${styles.iconEmerald}`}>
                <Clock size={18} strokeWidth={2.5} />
              </div>
              <span className={styles.kpiLabel}>Focus Timer</span>
            </div>
          </div>

          <div className={styles.timerModeGroup}>
            {['Focus', 'Long', 'Short'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => changeMode(mode)}
                className={`${styles.timerModeChip} ${timerMode === mode ? styles.timerModeChipActive : ''}`}
              >
                {mode}
              </button>
            ))}
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
                  <span>{timeLeft < MODES[timerMode] ? 'Resume' : 'Start'}</span>
                </>
              )}
            </Button>
            {(isActive || timeLeft < MODES[timerMode]) && (
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
            {assignments?.length > 0 ? (
              assignments.slice(0, 4).map(assign => (
                <div key={assign.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>{assign.title}</div>
                    <div className={styles.itemMeta}>{assign.course || assign.course_name} · {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : 'No date'}</div>
                  </div>
                  <Badge variant={assign.priority?.toLowerCase() || 'medium'}>{assign.priority || 'Medium'}</Badge>
                </div>
              ))
            ) : (
              <div className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-24) 0', fontSize: '14px' }}>
                No upcoming assignments.
              </div>
            )}
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
              <div className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-24) 0', fontSize: '14px' }}>
                No classes scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Pinned Notes Card */}
        <div className={`${styles.gridCard} ${styles.cardTintEmerald}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <div className={`${styles.kpiIconBox} ${styles.iconEmerald}`}>
                <StickyNote size={18} strokeWidth={2.5} />
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
              <div className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-24) 0', fontSize: '14px' }}>
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
    </>
  );
}
