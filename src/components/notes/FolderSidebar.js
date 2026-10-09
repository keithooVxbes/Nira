import { Edit2, Trash2 } from 'lucide-react';
import styles from '@/app/notes/page.module.css';

export default function FolderSidebar({ folders, activeFolderId, setActiveFolderId, setIsFolderModalOpen, onEditFolder, onDeleteFolder }) {
  return (
    <div className={styles.sidebar}>
      <div className="card-title" style={{ marginBottom: '16px', fontWeight: 600 }}>Folders</div>
      <div className={styles.folderList}>
        <div 
          className={`${styles.folderItem} ${activeFolderId === null ? styles.active : ''}`}
          onClick={() => setActiveFolderId(null)}
        >
          <span className={styles.folderItemText}>All notes</span>
        </div>
        {folders.map(folder => (
          <div 
            key={folder.id}
            className={`${styles.folderItem} ${activeFolderId === folder.id ? styles.active : ''}`}
            onClick={() => setActiveFolderId(folder.id)}
          >
            <span className={styles.folderItemText}>{folder.name}</span>
            <div className={styles.folderActions}>
              <button 
                className={styles.folderActionBtn} 
                onClick={(e) => { e.stopPropagation(); onEditFolder(folder); }} 
                title="Edit Folder"
              >
                <Edit2 size={14} />
              </button>
              <button 
                className={`${styles.folderActionBtn} ${styles.folderActionBtnDelete}`} 
                onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder); }} 
                title="Delete Folder"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <div 
          className={`${styles.folderItem} ${activeFolderId === 'Trash' ? styles.active : ''}`}
          onClick={() => setActiveFolderId('Trash')}
          style={{ marginTop: '16px' }}
        >
          <span className={styles.folderItemText}>Trash</span>
        </div>
        <div className={styles.addFolder} onClick={() => setIsFolderModalOpen(true)}>
          + Folder
        </div>
      </div>
    </div>
  );
}
