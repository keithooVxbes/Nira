import { Wallet, ClipboardList, Calendar, StickyNote } from 'lucide-react';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.brand}>Productivity</div>
        
        <div className={styles.heroContent}>
          <h1 className="auth-hero">Everything you need to stay on top of student life.</h1>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.iconBox}><Wallet size={20} strokeWidth={2} /></div>
              <div>
                <div className="card-title">Cashflow</div>
                <div className="text-secondary">Track income, expenses and subscriptions</div>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.iconBox}><ClipboardList size={20} strokeWidth={2} /></div>
              <div>
                <div className="card-title">Assignments</div>
                <div className="text-secondary">Keep deadlines by course and priority</div>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.iconBox}><Calendar size={20} strokeWidth={2} /></div>
              <div>
                <div className="card-title">Schedule</div>
                <div className="text-secondary">See your weekly classes at a glance</div>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.iconBox}><StickyNote size={20} strokeWidth={2} /></div>
              <div>
                <div className="card-title">Notes</div>
                <div className="text-secondary">Capture ideas in folders and pinned notes</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>© Productivity Manager</div>
      </div>
      
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          {children}
        </div>
      </div>
    </div>
  );
}
