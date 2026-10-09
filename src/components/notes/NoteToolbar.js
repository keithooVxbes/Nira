import { Bold, Italic, Heading1, List, ListOrdered, CheckSquare, Quote, Code, Link } from 'lucide-react';
import styles from './NoteEditor.module.css';

export default function NoteToolbar({ isPreview, setIsPreview, onInsertText }) {
  return (
    <div className={styles.toolbar}>
      <button className={styles.toolbarBtn} onClick={() => setIsPreview(!isPreview)}>
        {isPreview ? 'Edit' : 'Preview'}
      </button>
      <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)', margin: '0 8px' }} />
      
      {!isPreview && (
        <>
          <button className={styles.toolbarBtn} onClick={() => onInsertText('**', '**')}><Bold size={16} strokeWidth={2.5} /></button>
          <button className={styles.toolbarBtn} onClick={() => onInsertText('*', '*')}><Italic size={16} strokeWidth={2.5} /></button>
          <button className={styles.toolbarBtn} onClick={() => onInsertText('# ')}><Heading1 size={16} strokeWidth={2.5} /></button>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
          <button className={styles.toolbarBtn} onClick={() => onInsertText('- ')}><List size={16} strokeWidth={2.5} /></button>
          <button className={styles.toolbarBtn} onClick={() => onInsertText('1. ')}><ListOrdered size={16} strokeWidth={2.5} /></button>
          <button className={styles.toolbarBtn} onClick={() => onInsertText('- [ ] ')}><CheckSquare size={16} strokeWidth={2.5} /></button>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
          <button className={styles.toolbarBtn} onClick={() => onInsertText('> ')}><Quote size={16} strokeWidth={2.5} /></button>
          <button className={styles.toolbarBtn} onClick={() => onInsertText('```\n', '\n```')}><Code size={16} strokeWidth={2.5} /></button>
          <button className={styles.toolbarBtn} onClick={() => onInsertText('[', '](url)')}><Link size={16} strokeWidth={2.5} /></button>
        </>
      )}
    </div>
  );
}
