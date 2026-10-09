import { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { signOut } from '@/app/auth/actions';
import styles from './ProfileMenu.module.css';

export default function ProfileMenu({ profile, onOpenEditProfile, isCollapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const handleEditClick = () => {
    setIsOpen(false);
    onOpenEditProfile();
  };

  return (
    <div className={styles.profileMenuContainer} ref={menuRef}>
      <button 
        className={`${styles.profileTrigger} ${isCollapsed ? styles.collapsed : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
      >
        <div className={styles.avatar}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className={styles.avatarImage} />
          ) : (
            profile.initial || 'U'
          )}
        </div>
        {!isCollapsed && (
          <div className={styles.profileInfo}>
            <span className={styles.username}>{profile.username}</span>
            <span className={styles.userRole}>Active Workspace</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.menuHeader}>
            <div className={`${styles.avatar} ${styles.menuAvatar}`}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className={styles.avatarImage} />
              ) : (
                profile.initial || 'U'
              )}
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.username}>{profile.username}</span>
              <span className={styles.userRole}>Active Workspace</span>
            </div>
          </div>
          
          <button className={styles.menuItem} onClick={handleEditClick}>
            <User size={16} />
            Edit Profile
          </button>
          
          <form action={signOut} className={styles.logoutForm}>
            <button type="submit" className={`${styles.menuItem} ${styles.menuItemDanger}`}>
              <LogOut size={16} />
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
