import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from '@/app/notes/FolderModal.module.css';

export default function FolderDeleteModal({ isOpen, folderName, onClose, onDelete }) {
  const [moveOption, setMoveOption] = useState('All notes');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      /* eslint-disable react-hooks/set-state-in-effect */
      setMoveOption('All notes');
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className={styles.header}>
          <h2 className={styles.title}>Delete Folder</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className={styles.body}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Are you sure you want to delete the folder <strong>&quot;{folderName}&quot;</strong>?
          </p>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>What should happen to the notes inside?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="moveOption" 
                  value="All notes" 
                  checked={moveOption === 'All notes'} 
                  onChange={(e) => setMoveOption(e.target.value)}
                />
                Move notes to All Notes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="moveOption" 
                  value="Trash" 
                  checked={moveOption === 'Trash'} 
                  onChange={(e) => setMoveOption(e.target.value)}
                />
                Move notes to Trash
              </label>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={() => { onDelete(folderName, moveOption); onClose(); }}
            style={{ backgroundColor: '#EF4444' }}
          >
            <Trash2 size={16} style={{ marginRight: '4px' }} />
            Delete Folder
          </Button>
        </div>
      </div>
    </div>
  );
}
