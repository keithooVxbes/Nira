import Link from 'next/link';
import { LayoutDashboard, Wallet, ClipboardList, Calendar, StickyNote, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/app/auth/actions';
import styles from './Sidebar.module.css';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Cashflow', icon: Wallet, href: '/cashflow' },
  { name: 'Assignments', icon: ClipboardList, href: '/assignments' },
  { name: 'Schedule', icon: Calendar, href: '/schedule' },
  { name: 'Notes', icon: StickyNote, href: '/notes' },
];

export default async function Sidebar() {
  // We don't implement full path checking here to keep it static without "use client"
  const currentPath = '/dashboard'; 
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const username = user?.user_metadata?.username || 'User';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.brand}>Productivity</h1>
      </div>
      
      <nav className={styles.nav}>
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <Icon size={16} strokeWidth={2} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <div className={styles.profile}>
          <div className={styles.avatar}></div>
          <span className={styles.username}>{username}</span>
        </div>
        <form action={signOut} className={styles.logoutForm}>
          <button type="submit" className={styles.logoutBtn} aria-label="Logout">
            <LogOut size={16} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
