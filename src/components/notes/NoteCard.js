import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import styles from '@/app/notes/page.module.css';

export default function NoteCard({ note, onClick }) {
  return (
    <Card variant="alt" className={styles.noteCard} onClick={() => onClick(note)}>
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
        <span className="text-small text-secondary">{new Date(note.updatedAt).toLocaleDateString()}</span>
      </div>
    </Card>
  );
}
