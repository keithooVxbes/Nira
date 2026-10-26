"use client";

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { Edit2, Trash2, Plus, Clock, MapPin } from 'lucide-react';
import ScheduleModal from './ScheduleModal';
import Header from '@/components/layout/Header';
import styles from './page.module.css';
import { createScheduleClass, updateScheduleClass, deleteScheduleClass } from './actions';

const DEFAULT_TIMEZONE = "WIB";

export default function ScheduleClient({ initialClasses = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  
  const [classes, setClasses] = useState(initialClasses);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }), []);

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
    <Button variant="primary" onClick={openNewModal}>
      <Plus size={16} strokeWidth={2.5} />
      Add class
    </Button>
  );

  return (
    <div className={styles.scheduleContainer}>
      <Header 
        title="Schedule"
        titleClassName={styles.scheduleTitle}
        className={styles.headerReset}
        actions={actions}
      />

      <div className={styles.grid}>
        {days.map((day) => {
          const isToday = day === todayName;
          const dayClasses = classes
            .filter(c => c.day === day)
            .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
          
          return (
            <div key={day} className={styles.dayCard}>
              <div className={styles.dayHeader}>
                <div className={styles.dayTitleGroup}>
                  <h3 className={styles.dayTitle}>{day}</h3>
                  {isToday && <span className={styles.todayBadge}>Today</span>}
                </div>
                {dayClasses.length > 0 && (
                  <span className={styles.dayCount}>{dayClasses.length}</span>
                )}
              </div>
              
              <div className={styles.classList}>
                {dayClasses.length === 0 ? (
                  <div className={styles.emptyDay}>
                    No classes scheduled
                  </div>
                ) : (
                  dayClasses.map((cls) => {
                    const formatTime = (t) => t ? t.slice(0, 5) : '';
                    return (
                      <div 
                        key={cls.id} 
                        className={`${styles.classBlock} ${styles[`theme-${cls.color_theme}`] || styles['theme-blue']}`}
                        onClick={() => openEditModal(cls)}
                      >
                        <div className={styles.classHeaderRow}>
                          <div className={styles.className}>{cls.name}</div>
                          <div className={styles.classActions} onClick={e => e.stopPropagation()}>
                            <button 
                              type="button"
                              onClick={() => openEditModal(cls)} 
                              className={styles.actionBtn} 
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDelete(cls.id)} 
                              className={`${styles.actionBtn} ${styles.actionBtnDanger}`} 
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        
                        <div className={styles.classTime}>
                          <Clock size={11} strokeWidth={2.2} className={styles.themeIcon} />
                          <span>{formatTime(cls.start_time)} - {formatTime(cls.end_time)} {DEFAULT_TIMEZONE}</span>
                        </div>
                        
                        {cls.room && (
                          <div className={styles.classRoom}>
                            <MapPin size={11} strokeWidth={2.2} className={styles.themeIcon} />
                            <span>{cls.room}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClass}
        initialData={editingClass}
      />
    </div>
  );
}
