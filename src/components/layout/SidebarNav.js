"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ClipboardList, Calendar, StickyNote } from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Cashflow', icon: Wallet, href: '/cashflow' },
  { name: 'Assignments', icon: ClipboardList, href: '/assignments' },
  { name: 'Schedule', icon: Calendar, href: '/schedule' },
  { name: 'Notes', icon: StickyNote, href: '/notes' },
];

export default function SidebarNav({ isCollapsed }) {
  const currentPath = usePathname();
  
  return (
    <nav className={styles.nav}>
      <ul>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <li key={item.name}>
              <Link 
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''} ${isCollapsed ? styles.collapsedNavItem : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <div className={styles.navIconBox}>
                  <Icon size={16} strokeWidth={2.2} />
                </div>
                {!isCollapsed && <span className={styles.navLabel}>{item.name}</span>}
                {isActive && !isCollapsed && <span className={styles.activePill} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
