"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ClipboardList, Calendar, StickyNote } from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', tint: 'violet' },
  { name: 'Cashflow', icon: Wallet, href: '/cashflow', tint: 'emerald' },
  { name: 'Assignments', icon: ClipboardList, href: '/assignments', tint: 'blue' },
  { name: 'Schedule', icon: Calendar, href: '/schedule', tint: 'amber' },
  { name: 'Notes', icon: StickyNote, href: '/notes', tint: 'rose' },
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
                <div className={`${styles.navIconBox} ${styles[item.tint]}`}>
                  <Icon size={16} strokeWidth={2.5} />
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
