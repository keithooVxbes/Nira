import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Edit2, FolderInput, Trash2 } from 'lucide-react';
import styles from '@/app/notes/page.module.css';

export default function NoteCard({ note, onClick, onEdit, onMove, onDelete }) {
  return (
    <Card variant="alt" className={styles.noteCard} onClick={() => onClick(note)} style={{ position: 'relative' }}>
      <div className={styles.noteHeader}>
        <div className="card-title" style={{ fontWeight: 600 }}>{note.title}</div>
        {note.pinned && <Badge variant="pill">Pinned</Badge>}
      </div>
      <div className={styles.previewLines}>
        <div className={styles.previewLine} style={{ width: '80%' }}></div>
        <div className={styles.previewLine} style={{ width: '90%' }}></div>
        <div className={styles.previewLine} style={{ width: '60%' }}></div>
      </div>
      <div className={styles.noteFooter}>
        <span className="text-small text-secondary">{new Date(note.updated_at || note.updatedAt || new Date()).toLocaleDateString()}</span>
      </div>

      <div className={styles.noteHoverActions} onClick={e => e.stopPropagation()}>
        <button className={styles.noteActionBtn} onClick={() => onEdit(note)} title="Edit">
          <Edit2 size={14} />
        </button>
        <button className={styles.noteActionBtn} onClick={() => onMove(note)} title="Move">
          <FolderInput size={14} />
        </button>
        <button className={`${styles.noteActionBtn} ${styles.noteActionBtnDanger}`} onClick={() => onDelete(note)} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </Card>
  );
}
