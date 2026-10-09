import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './FolderModal.module.css';

export default function FolderModal({ isOpen, onClose, onSave, initialFolderName = '', existingFolders = [] }) {
  const [error, setError] = useState('');
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      /* eslint-disable react-hooks/set-state-in-effect */
      setError('');
      setFolderName(initialFolderName);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, initialFolderName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = folderName.trim();
    if (!trimmedName) {
      setError('Please enter a folder name.');
      return;
    }
    if (trimmedName.toLowerCase() === 'all notes' || trimmedName.toLowerCase() === 'trash') {
      setError('This folder name is reserved.');
      return;
    }
    if (trimmedName !== initialFolderName && existingFolders.includes(trimmedName)) {
      setError('A folder with this name already exists.');
      return;
    }
    onSave(trimmedName, initialFolderName);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className={styles.header}>
          <h2 className={styles.title}>{initialFolderName ? 'Rename Folder' : 'New Folder'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
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

            <div className={styles.formGroup}>
              <label className={styles.label}>Folder Name *</label>
              <Input 
                value={folderName} 
                onChange={(e) => { setFolderName(e.target.value); setError(''); }} 
                placeholder="E.g., Ideas"
                autoFocus
                required
              />
            </div>
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Save Folder</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
