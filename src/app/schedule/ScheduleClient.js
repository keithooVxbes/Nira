"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { Plus } from 'lucide-react';
import ScheduleModal from './ScheduleModal';
import Header from '@/components/layout/Header';
import styles from './page.module.css';

export default function ScheduleClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([
    { id: 1, subject: 'Calculus 101', day: 'Mon', startTime: '09:00', endTime: '10:30', room: 'Room 301', theme: '0' },
    { id: 2, subject: 'Physics Lab', day: 'Wed', startTime: '13:00', endTime: '15:00', room: 'Lab B', theme: '1' },
    { id: 3, subject: 'World History', day: 'Fri', startTime: '11:00', endTime: '12:30', room: 'Hall 2', theme: '2' },
  ]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const handleSaveClass = (newClass) => {
    setClasses([...classes, newClass]);
  };

  const actions = (
    <>
      <div className={styles.filterGroup}>
        <Badge variant="chip" active>Week</Badge>
        <Badge variant="chip">Day</Badge>
      </div>
      <Button variant="primary" onClick={() => setIsModalOpen(true)}>
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
          const dayClasses = classes.filter(c => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          return (
            <Card key={day} className={styles.dayCard}>
              <h3 className={styles.dayTitle}>{day}</h3>
              
              <div className={styles.classList}>
                {dayClasses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '13px', fontStyle: 'italic' }}>
                    No classes
                  </div>
                ) : (
                  dayClasses.map((cls) => (
                    <div key={cls.id} className={`${styles.classBlock} ${styles[`theme-${cls.theme}`]}`}>
                      <div className={styles.className}>{cls.subject}</div>
                      <div className={styles.classTime}>{cls.startTime} - {cls.endTime}</div>
                      {cls.room && <div className={styles.classRoom}>{cls.room}</div>}
                    </div>
                  ))
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
      />
    </>
  );
}
