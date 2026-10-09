import AppShell from '@/components/layout/AppShell';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Search, Plus } from 'lucide-react';
import styles from './page.module.css';

export default function Notes() {
  const actions = (
    <>
      <Button variant="secondary">
        Search
      </Button>
      <Button variant="primary">
        <Plus size={16} strokeWidth={2} />
        Note
      </Button>
    </>
  );

  return (
    <AppShell>
      <Header 
        title="Notes"
        subtitle="Pinned and recent notes"
        actions={actions}
      />

      <div className={styles.layout}>
        {/* Sidebar Folders */}
        <div className={styles.sidebar}>
          <div className="card-title" style={{ marginBottom: '16px' }}>Folders</div>
          <div className={styles.folderList}>
            <div className={`${styles.folderItem} ${styles.active}`}>All notes</div>
            <div className={styles.folderItem}>Folder name</div>
            <div className={styles.folderItem}>Folder name</div>
            <div className={styles.folderItem}>Trash</div>
            <div className={styles.addFolder}>+ Folder</div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Pinned Section */}
          <div className={styles.section}>
            <h3 className="text-secondary" style={{ marginBottom: '16px' }}>Pinned</h3>
            <div className={styles.notesGrid}>
              {[...Array(2)].map((_, i) => (
                <Card key={i} variant="alt" className={styles.noteCard}>
                  <div className={styles.noteHeader}>
                    <div className="card-title">Note title</div>
                    <Badge variant="pill">Pinned</Badge>
                  </div>
                  <div className={styles.previewLines}>
                    <div className={styles.previewLine} style={{ width: '80%' }}></div>
                    <div className={styles.previewLine} style={{ width: '90%' }}></div>
                    <div className={styles.previewLine} style={{ width: '60%' }}></div>
                  </div>
                  <div className={styles.noteFooter}>
                    <span className="text-small text-secondary">Last modified</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Section */}
          <div className={styles.section}>
            <h3 className="text-secondary" style={{ marginBottom: '16px' }}>Recent</h3>
            <div className={styles.notesGrid}>
              {[...Array(3)].map((_, i) => (
                <Card key={i} variant="alt" className={styles.noteCard}>
                  <div className={styles.noteHeader}>
                    <div className="card-title">Note title</div>
                  </div>
                  <div className={styles.previewLines}>
                    <div className={styles.previewLine} style={{ width: '70%' }}></div>
                    <div className={styles.previewLine} style={{ width: '85%' }}></div>
                    <div className={styles.previewLine} style={{ width: '50%' }}></div>
                  </div>
                  <div className={styles.noteFooter}>
                    <span className="text-small text-secondary">Last modified</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
