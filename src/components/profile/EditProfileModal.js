import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './EditProfileModal.module.css';

export default function EditProfileModal({ isOpen, onClose, onSave, currentProfile }) {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    avatarUrl: ''
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        fullName: currentProfile?.fullName || currentProfile?.username || '',
        username: currentProfile?.username || '',
        bio: currentProfile?.bio || '',
        avatarUrl: currentProfile?.avatarUrl || ''
      });
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, currentProfile]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: url }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim()) {
      setError('Full Name and Username are required.');
      return;
    }
    onSave({
      ...currentProfile,
      ...formData,
      initial: formData.username.charAt(0).toUpperCase()
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Profile</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.body}>
            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.avatarSection}>
              <div className={styles.avatarPreview}>
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className={styles.avatarImage} />
                ) : (
                  formData.username ? formData.username.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div className={styles.avatarActions}>
                <label className={styles.uploadBtn}>
                  Change Photo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </label>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>JPG, GIF or PNG. Max size of 800K</div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name *</label>
              <Input 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                placeholder="E.g., Myoumiaw"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Username *</label>
              <Input 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="E.g., myoumiaw"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <Input 
                value={currentProfile?.email || 'user@email.com'} 
                readOnly
                disabled
                style={{ backgroundColor: 'rgba(25, 25, 27, 0.04)', color: 'var(--text-tertiary)' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bio</label>
              <Input 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Tell us a little about yourself"
              />
            </div>
          </div>
          
          <div className={styles.footer}>
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
