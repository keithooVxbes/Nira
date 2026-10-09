import { useState, useEffect } from 'react';
import { X, Pin, Save, Trash2 } from 'lucide-react';
import NoteToolbar from './NoteToolbar';
import styles from './NoteEditor.module.css';

export default function NoteEditor({ isOpen, note, onClose, onSave, onDelete, folders = [] }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState('');
  const [pinned, setPinned] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title || '');
        setContent(note.content || '');
        setFolderId(note.folder_id || '');
        setPinned(note.pinned || false);
      } else {
        setTitle('');
        setContent('');
        setFolderId('');
        setPinned(false);
      }
      setIsPreview(false);
    }
  }, [isOpen, note]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      id: note ? note.id : Date.now(),
      title: title || 'Untitled Note',
      content,
      folder_id: folderId || null,
      pinned,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const insertText = (prefix, suffix = '') => {
    const textarea = document.getElementById('note-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end, text.length);
    setContent(before + prefix + selected + suffix + after);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const renderMarkdown = (text) => {
    if (!text) return { __html: '<p class="text-secondary italic">Empty note...</p>' };
    
    let html = text
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/```([^`]*)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`([^`]*)`/gim, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" style="color:var(--accent-blue)">$1</a>')
      .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/^\d+\. (.*$)/gim, '<ol><li>$1</li></ol>')
      .replace(/^- \[ \] (.*$)/gim, '<ul><li><input type="checkbox" disabled> $1</li></ul>')
      .replace(/^- \[x\] (.*$)/gim, '<ul><li><input type="checkbox" checked disabled> $1</li></ul>')
      .replace(/\n/gim, '<br>');
      
    html = html.replace(/<\/ul><br><ul>/gim, '');
    html = html.replace(/<\/ol><br><ol>/gim, '');
      
    return { __html: html };
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <input 
              type="text" 
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              autoFocus
            />
            <div className={styles.meta} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select 
                value={folderId} 
                onChange={e => setFolderId(e.target.value)}
                style={{ 
                  background: 'var(--surface-input)', 
                  border: '1px solid var(--border-input)', 
                  borderRadius: '16px', 
                  padding: '4px 12px', 
                  fontSize: '12px', 
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Notes</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{note ? 'Editing' : 'New note'}</span>
            </div>
          </div>
          
          <div className={styles.actionGroup}>
            <button className={`${styles.iconBtn} ${pinned ? styles.activeIcon : ''}`} onClick={() => setPinned(!pinned)} title="Pin Note">
              <Pin size={18} strokeWidth={2.5} />
            </button>
            {note && (
              <button className={styles.iconBtn} onClick={() => { onDelete(note.id); onClose(); }} title="Delete Note">
                <Trash2 size={18} strokeWidth={2.5} />
              </button>
            )}
            <button className={styles.iconBtn} onClick={handleSave} title="Save Note">
              <Save size={18} strokeWidth={2.5} />
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
            <button className={styles.iconBtn} onClick={onClose} title="Close">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <NoteToolbar 
          isPreview={isPreview}
          setIsPreview={setIsPreview}
          onInsertText={insertText}
        />

        {/* Body */}
        <div className={styles.body}>
          {isPreview ? (
            <div 
              className={styles.previewArea}
              dangerouslySetInnerHTML={renderMarkdown(content)}
            />
          ) : (
            <textarea 
              id="note-textarea"
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note in Markdown..."
            />
          )}
        </div>
        
      </div>
    </div>
  );
}
