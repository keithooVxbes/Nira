"use client";

import { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import SidebarNav from './SidebarNav';
import ProfileMenu from '@/components/profile/ProfileMenu';
import EditProfileModal from '@/components/profile/EditProfileModal';
import styles from './Sidebar.module.css';

export default function SidebarClient({ initial, username, email }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profile, setProfile] = useState({
    username: username,
    fullName: username,
    email: email,
    initial: initial,
    bio: '',
    avatarUrl: ''
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200 && window.innerWidth >= 768) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1200) {
        setIsCollapsed(false);
      }
    };
    
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <button 
          className={styles.collapseToggle} 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={styles.header}>
          <div className={styles.brandRow}>
            <div className={styles.brandIcon}>
              <img src="/brand/nira-mark.svg" alt="Nira" width="32" height="32" style={{ display: 'block' }} />
            </div>
            {!isCollapsed && (
              <div className={styles.brandTextGroup}>
                <span className={styles.brand}>Nira</span>
                <span className={styles.workspaceTag}>Personal Workspace</span>
              </div>
            )}
          </div>
        </div>
        
        <SidebarNav isCollapsed={isCollapsed} />

        <div className={styles.footer}>
          <ProfileMenu 
            profile={profile}
            isCollapsed={isCollapsed}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
        </div>
      </aside>

      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
        currentProfile={profile}
      />
    </>
  );
}
