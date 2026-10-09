"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Plus, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import NoteEditor from './NoteEditor';
import FolderSidebar from './FolderSidebar';
import NoteCard from './NoteCard';
import FolderModal from '@/app/notes/FolderModal';
import FolderDeleteModal from '@/app/notes/FolderDeleteModal';
import styles from '@/app/notes/page.module.css';
import { createNote, updateNote, deleteNote, moveNote, createFolder, updateFolder, deleteFolder } from '@/app/notes/actions';

export default function NotesClient({ initialNotes = [], initialFolders = [] }) {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isFolderDeleteModalOpen, setIsFolderDeleteModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  
  const [editingNote, setEditingNote] = useState(null);
  const [noteToMove, setNoteToMove] = useState(null);
  
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [editingFolder, setEditingFolder] = useState(null);
  const [deletingFolder, setDeletingFolder] = useState(null);
  
  // Track actual folder objects and notes
  const [localFolders, setLocalFolders] = useState(initialFolders);
  const [notes, setNotes] = useState(initialNotes);

  const handleSaveNote = async (newNote) => {
    const dbData = { ...newNote, folder_id: newNote.folder_id || null };

    const existingIndex = notes.findIndex(n => n.id === newNote.id);
    if (existingIndex >= 0) {
      const updatedNotes = [...notes];
      updatedNotes[existingIndex] = { ...updatedNotes[existingIndex], ...dbData };
      setNotes(updatedNotes);
      await updateNote(newNote.id, dbData);
    } else {
      setNotes([dbData, ...notes]);
      await createNote(dbData);
    }
  };

  const handleMoveNote = async (folderId) => {
    if (!noteToMove) return;
    
    // Optimistic update
    setNotes(notes.map(n => n.id === noteToMove.id ? { ...n, folder_id: folderId || null } : n));
    setIsMoveModalOpen(false);
    setNoteToMove(null);
    
    await moveNote(noteToMove.id, folderId || null);
  };

  const handleDeleteNote = async (note) => {
    // Delete immediately visually
    setNotes(notes.filter(n => n.id !== note.id));
    await deleteNote(note.id);
  };

  const handleCreateOrUpdateFolder = async (newName, oldName) => {
    if (oldName) {
      const oldFolder = localFolders.find(f => f.name === oldName);
      if (oldFolder) {
        setLocalFolders(localFolders.map(f => f.id === oldFolder.id ? { ...f, name: newName } : f));
        await updateFolder(oldFolder.id, newName);
      }
    } else {
      // Optimistic create (id will be replaced on refresh)
      const tempId = Date.now().toString();
      setLocalFolders([...localFolders, { id: tempId, name: newName }]);
      await createFolder(newName);
    }
  };

  const openFolderModal = (folder = null) => {
    setEditingFolder(folder ? folder.name : null);
    setIsFolderModalOpen(true);
  };

  const openFolderDeleteModal = (folder) => {
    setDeletingFolder(folder.name);
    setIsFolderDeleteModalOpen(true);
  };

  const handleDeleteFolder = async (folderName, moveOption) => {
    const fold = localFolders.find(f => f.name === folderName);
    if (!fold) return;
    
    setLocalFolders(localFolders.filter(f => f.id !== fold.id));
    
    // Handle notes inside this folder based on moveOption
    // If moveOption is 'All notes', folder_id becomes null
    // If it's a specific folder, we'd need its ID. Assuming FolderDeleteModal passes folderName string for moveOption.
    let newFolderId = null;
    if (moveOption && moveOption !== 'All notes') {
      const targetFold = localFolders.find(f => f.name === moveOption);
      if (targetFold) newFolderId = targetFold.id;
    }
    
    setNotes(notes.map(n => n.folder_id === fold.id ? { ...n, folder_id: newFolderId } : n));
    
    if (activeFolderId === fold.id) setActiveFolderId(null);
    
    await deleteFolder(fold.id);
  };

  const filteredNotes = notes.filter(n => {
    // Basic filter by folder
    const matchesFolder = activeFolderId === null || n.folder_id === activeFolderId;
    
    const matchesSearch = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (n.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const recentNotes = filteredNotes.filter(n => !n.pinned);

  const actions = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isSearching && (
          <Input 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{ width: '200px' }}
          />
        )}
        <Button variant="secondary" onClick={() => { setIsSearching(!isSearching); setSearchQuery(''); }}>
          <Search size={16} strokeWidth={2.5} />
          <span style={{ marginLeft: '4px' }}>{isSearching ? 'Close' : 'Search'}</span>
        </Button>
      </div>
      <Button variant="primary" onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }}>
        <Plus size={16} strokeWidth={2.5} />
        Note
      </Button>
    </>
  );

  let activeFolderName = 'All notes';
  if (activeFolderId && activeFolderId !== 'Trash') {
    const f = localFolders.find(x => x.id === activeFolderId);
    if (f) activeFolderName = f.name;
  } else if (activeFolderId === 'Trash') {
    activeFolderName = 'Trash';
  }

  return (
    <>
      <Header 
        title="Notes"
        subtitle={activeFolderName}
        actions={actions}
      />

      <div className={styles.layout}>
        <FolderSidebar 
          folders={localFolders}
          activeFolderId={activeFolderId}
          setActiveFolderId={setActiveFolderId}
          setIsFolderModalOpen={() => openFolderModal(null)}
          onEditFolder={openFolderModal}
          onDeleteFolder={openFolderDeleteModal}
        />

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <div className={styles.section}>
              <h3 className="text-secondary" style={{ marginBottom: '16px', fontWeight: 600 }}>Pinned</h3>
              <div className={styles.notesGrid}>
                {pinnedNotes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onClick={(n) => { setEditingNote(n); setIsNoteModalOpen(true); }}
                    onEdit={(n) => { setEditingNote(n); setIsNoteModalOpen(true); }}
                    onMove={(n) => { setNoteToMove(n); setIsMoveModalOpen(true); }}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Section */}
          <div className={styles.section}>
            <h3 className="text-secondary" style={{ marginBottom: '16px', fontWeight: 600 }}>Recent</h3>
            {recentNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)', fontSize: '14px', fontStyle: 'italic', backgroundColor: 'var(--surface-alt)', borderRadius: '12px', border: '1px dashed rgba(223, 217, 209, 0.8)' }}>
                No notes yet.
              </div>
            ) : (
              <div className={styles.notesGrid}>
                {recentNotes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onClick={(n) => { setEditingNote(n); setIsNoteModalOpen(true); }}
                    onEdit={(n) => { setEditingNote(n); setIsNoteModalOpen(true); }}
                    onMove={(n) => { setNoteToMove(n); setIsMoveModalOpen(true); }}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <NoteEditor 
        isOpen={isNoteModalOpen} 
        note={editingNote} 
        folders={localFolders}
        onClose={() => setIsNoteModalOpen(false)} 
        onSave={handleSaveNote} 
        onDelete={handleDeleteNote}
      />

      <FolderModal 
        isOpen={isFolderModalOpen} 
        onClose={() => setIsFolderModalOpen(false)} 
        onSave={handleCreateOrUpdateFolder} 
        initialFolderName={editingFolder || ''}
        existingFolders={localFolders.map(f => f.name)}
      />
      
      <FolderDeleteModal
        isOpen={isFolderDeleteModalOpen}
        folderName={deletingFolder || ''}
        onClose={() => setIsFolderDeleteModalOpen(false)}
        onDelete={handleDeleteFolder}
      />

      {/* Move Note Modal */}
      {isMoveModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setIsMoveModalOpen(false)}>
          <div style={{ backgroundColor: 'var(--surface)', padding: 'var(--space-24)', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Move Note</h3>
              <button onClick={() => setIsMoveModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              <button 
                onClick={() => handleMoveNote(null)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 16px', background: noteToMove?.folder_id === null ? 'var(--surface-hover)' : 'transparent',
                  border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)',
                  fontWeight: noteToMove?.folder_id === null ? '600' : '400',
                  textAlign: 'left'
                }}
              >
                All Notes
              </button>
              
              {localFolders.map(folder => (
                <button 
                  key={folder.id}
                  onClick={() => handleMoveNote(folder.id)}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '12px 16px', background: noteToMove?.folder_id === folder.id ? 'var(--surface-hover)' : 'transparent',
                    border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)',
                    fontWeight: noteToMove?.folder_id === folder.id ? '600' : '400',
                    textAlign: 'left'
                  }}
                >
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
