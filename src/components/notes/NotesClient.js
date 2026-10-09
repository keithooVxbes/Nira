"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import NoteEditor from './NoteEditor';
import FolderSidebar from './FolderSidebar';
import NoteCard from './NoteCard';
import FolderModal from '@/app/notes/FolderModal';
import FolderDeleteModal from '@/app/notes/FolderDeleteModal';
import styles from '@/app/notes/page.module.css';

export default function NotesClient() {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isFolderDeleteModalOpen, setIsFolderDeleteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  
  const [activeFolder, setActiveFolder] = useState('All notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [folders, setFolders] = useState(['Personal', 'Work']);
  const [editingFolder, setEditingFolder] = useState('');
  const [deletingFolder, setDeletingFolder] = useState('');
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Project Ideas',
      content: '## New app ideas\n- SaaS dashboard\n- Note taking app',
      folder: 'Work',
      pinned: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Grocery List',
      content: '- Milk\n- Bread\n- Eggs',
      folder: 'Personal',
      pinned: false,
      updatedAt: new Date().toISOString()
    }
  ]);

  const handleSaveNote = (newNote) => {
    const existingIndex = notes.findIndex(n => n.id === newNote.id);
    if (existingIndex >= 0) {
      const updatedNotes = [...notes];
      updatedNotes[existingIndex] = newNote;
      setNotes(updatedNotes);
    } else {
      setNotes([newNote, ...notes]);
    }
  };

  const handleDeleteNote = (id) => {
    if (activeFolder === 'Trash') {
      setNotes(notes.filter(n => n.id !== id));
    } else {
      const updatedNotes = notes.map(n => n.id === id ? { ...n, folder: 'Trash' } : n);
      setNotes(updatedNotes);
    }
  };

  const handleCreateOrUpdateFolder = (newName, oldName) => {
    if (oldName) {
      setFolders(folders.map(f => f === oldName ? newName : f));
      setNotes(notes.map(n => n.folder === oldName ? { ...n, folder: newName } : n));
      if (activeFolder === oldName) setActiveFolder(newName);
    } else {
      setFolders([...folders, newName]);
    }
  };

  const openFolderModal = (folderName = '') => {
    setEditingFolder(folderName);
    setIsFolderModalOpen(true);
  };

  const openFolderDeleteModal = (folderName) => {
    setDeletingFolder(folderName);
    setIsFolderDeleteModalOpen(true);
  };

  const handleDeleteFolder = (folderName, moveOption) => {
    setFolders(folders.filter(f => f !== folderName));
    setNotes(notes.map(n => n.folder === folderName ? { ...n, folder: moveOption } : n));
    if (activeFolder === folderName) setActiveFolder('All notes');
  };

  const filteredNotes = notes.filter(n => {
    if (activeFolder === 'Trash') return n.folder === 'Trash';
    if (n.folder === 'Trash') return false;
    
    const matchesFolder = activeFolder === 'All notes' || n.folder === activeFolder;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <>
      <Header 
        title="Notes"
        subtitle={activeFolder}
        actions={actions}
      />

      <div className={styles.layout}>
        <FolderSidebar 
          folders={folders}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
          setIsFolderModalOpen={() => openFolderModal('')}
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
                No notes found.
              </div>
            ) : (
              <div className={styles.notesGrid}>
                {recentNotes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onClick={(n) => { setEditingNote(n); setIsNoteModalOpen(true); }} 
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
        onClose={() => setIsNoteModalOpen(false)} 
        onSave={handleSaveNote} 
        onDelete={handleDeleteNote}
      />

      <FolderModal 
        isOpen={isFolderModalOpen} 
        onClose={() => setIsFolderModalOpen(false)} 
        onSave={handleCreateOrUpdateFolder} 
        initialFolderName={editingFolder}
        existingFolders={folders}
      />
      
      <FolderDeleteModal
        isOpen={isFolderDeleteModalOpen}
        folderName={deletingFolder}
        onClose={() => setIsFolderDeleteModalOpen(false)}
        onDelete={handleDeleteFolder}
      />
    </>
  );
}
