"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { Edit2, Trash2, Plus } from 'lucide-react';
import ScheduleModal from './ScheduleModal';
import Header from '@/components/layout/Header';
import styles from './page.module.css';
import { createScheduleClass, updateScheduleClass, deleteScheduleClass } from './actions';

const DEFAULT_TIMEZONE = "WIB";

export default function ScheduleClient({ initialClasses = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  
  const [classes, setClasses] = useState(initialClasses);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSaveClass = async (newClass) => {
    const existingIndex = classes.findIndex(c => c.id === newClass.id);
    if (existingIndex >= 0) {
      const updated = [...classes];
      updated[existingIndex] = newClass;
      setClasses(updated);
      await updateScheduleClass(newClass.id, newClass);
    } else {
      setClasses([...classes, newClass]);
      await createScheduleClass(newClass);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this class?')) {
      setClasses(classes.filter(c => c.id !== id));
      await deleteScheduleClass(id);
    }
  };

  const openNewModal = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setIsModalOpen(true);
  };

  const actions = (
    <>
      <div className={styles.filterGroup}>
        <Badge variant="chip" active>Week</Badge>
        <Badge variant="chip">Day</Badge>
      </div>
      <Button variant="primary" onClick={openNewModal}>
        <Plus size={16} strokeWidth={2.5} />
        Add class
      </Button>
    </>
  );

  return (
    <>
      <Header 
        title="Schedule"
        subtitle="Weekly class timetable"
        actions={actions}
      />

      <div className={styles.grid}>
        {days.map((day) => {
          const dayClasses = classes.filter(c => c.day === day).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
          
          return (
            <Card key={day} className={styles.dayCard}>
              <h3 className={styles.dayTitle}>{day}</h3>
              
              <div className={styles.classList}>
                {dayClasses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '13px', fontStyle: 'italic' }}>
                    No classes scheduled.
                  </div>
                ) : (
                  dayClasses.map((cls) => {
                    const formatTime = (t) => t ? t.slice(0, 5) : '';
                    return (
                      <div key={cls.id} className={`${styles.classBlock} ${styles[`theme-${cls.color_theme}`]}`} style={{ position: 'relative' }}>
                        <div className={styles.className}>{cls.name}</div>
                        <div className={styles.classTime}>{formatTime(cls.start_time)} - {formatTime(cls.end_time)} {DEFAULT_TIMEZONE}</div>
                        {cls.room && <div className={styles.classRoom}>{cls.room}</div>}
                        
                        <div className={styles.classActions} style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                          <button onClick={() => openEditModal(cls)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }} title="Edit">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDelete(cls.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }} title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClass}
        initialData={editingClass}
      />
    </>
  );
}
