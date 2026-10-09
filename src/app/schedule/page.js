import AppShell from '@/components/layout/AppShell';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { Plus } from 'lucide-react';
import styles from './page.module.css';

export default function Schedule() {
  const actions = (
    <>
      <div className={styles.filterGroup}>
        <Badge variant="chip" active>Week</Badge>
        <Badge variant="chip">Day</Badge>
      </div>
      <Button variant="primary">
        <Plus size={16} strokeWidth={2} />
        Add class
      </Button>
    </>
  );

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  // Dummy classes with themes mapped to our CSS variables
  const dummyClasses = [
    { name: 'Class name', time: 'start - end', room: 'Room', theme: 'blue' },
    { name: 'Class name', time: 'start - end', room: 'Room', theme: 'green' },
  ];

  return (
    <AppShell>
      <Header 
        title="Schedule"
        subtitle="Weekly class timetable"
        actions={actions}
      />

      <div className={styles.grid}>
        {days.map((day, index) => (
          <Card key={day} className={styles.dayCard}>
            <h3 className={styles.dayTitle}>{day}</h3>
            
            <div className={styles.classList}>
              {dummyClasses.map((cls, idx) => (
                <div key={idx} className={`${styles.classBlock} ${styles[`theme-${index % 4}`]}`}>
                  <div className={styles.className}>{cls.name}</div>
                  <div className={styles.classTime}>{cls.time}</div>
                  <div className={styles.classRoom}>{cls.room}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
