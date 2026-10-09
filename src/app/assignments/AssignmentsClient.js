"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AssignmentModal from './AssignmentModal';
import styles from './page.module.css';
import Header from '@/components/layout/Header';

export default function AssignmentsClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Physics Midterm Prep', course: 'Physics 101', dueDate: '2026-10-10', priority: 'High', status: 'To Do' },
    { id: 2, title: 'Read Chapter 4', course: 'History', dueDate: '2026-10-15', priority: 'Medium', status: 'In Progress' }
  ]);

  const [draggedId, setDraggedId] = useState(null);
  
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');

  // --- Handlers ---
  const handleSaveAssignment = (newAssignment) => {
    const existingIndex = assignments.findIndex(a => a.id === newAssignment.id);
    if (existingIndex >= 0) {
      const updated = [...assignments];
      updated[existingIndex] = newAssignment;
      setAssignments(updated);
    } else {
      setAssignments([...assignments, newAssignment]);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this assignment?")) {
      setAssignments(assignments.filter(a => a.id !== id));
    }
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingAssignment(null);
    setIsModalOpen(true);
  };

  // --- Drag and Drop ---
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    // e.dataTransfer.effectAllowed = 'move';
    // Firefox requires setting data to drag
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (!draggedId) return;
    setAssignments(assignments.map(a => 
      a.id === draggedId ? { ...a, status: targetStatus } : a
    ));
    setDraggedId(null);
  };

  // --- Styling ---
  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'var(--accent-rose)';
    if (priority === 'Medium') return 'var(--accent-amber)';
    return 'var(--accent-emerald)';
  };

  const getDeadlineStatus = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDate);
    due.setHours(0,0,0,0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: '#EF4444' };
    if (diffDays === 0) return { text: 'Due today', color: '#F59E0B' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: '#F59E0B' };
    return null;
  };

  // --- Filters ---
  const courses = Array.from(new Set(assignments.map(a => a.course)));

  const filteredAssignments = assignments.filter(a => {
    if (filterPriority !== 'All' && a.priority !== filterPriority) return false;
    if (filterCourse !== 'All' && a.course !== filterCourse) return false;
    return true;
  });

  const cyclePriorityFilter = () => {
    const states = ['All', 'High', 'Medium', 'Low'];
    const nextIdx = (states.indexOf(filterPriority) + 1) % states.length;
    setFilterPriority(states[nextIdx]);
  };

  const cycleCourseFilter = () => {
    const states = ['All', ...courses];
    const nextIdx = (states.indexOf(filterCourse) + 1) % states.length;
    setFilterCourse(states[nextIdx]);
  };

  const resetFilters = () => {
    setFilterPriority('All');
    setFilterCourse('All');
  };

  const renderColumn = (status, title) => {
    const columnTasks = filteredAssignments.filter(a => a.status === status);
    
    return (
      <div 
        className={styles.column}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <h3 className={styles.columnTitle}>
          {title} 
          <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginLeft: '8px' }}>
            {columnTasks.length}
          </span>
        </h3>
        <div className={styles.cardList}>
          {columnTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)', fontSize: '14px', fontStyle: 'italic', backgroundColor: 'var(--surface-alt)', borderRadius: '12px', border: '1px dashed rgba(223, 217, 209, 0.8)' }}>
              No assignments here.
            </div>
          ) : (
            columnTasks.map((assignment) => {
              const deadlineInfo = getDeadlineStatus(assignment.dueDate);
              const isDragging = draggedId === assignment.id;
              
              return (
                <div 
                  key={assignment.id} 
                  className={styles.assignmentCard}
                  style={{ opacity: isDragging ? 0.5 : 1, transform: isDragging ? 'scale(1.02)' : 'scale(1)', boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.1)' : 'none' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, assignment.id)}
                  onDragEnd={() => setDraggedId(null)}
                >
                  <div className={styles.cardHeader}>
                    <div className="card-title" style={{ fontWeight: 600, color: '#3F3A36' }}>{assignment.title}</div>
                    <div className={styles.cardActions}>
                      <button className={styles.actionBtn} onClick={() => openEditModal(assignment)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => handleDelete(assignment.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-secondary" style={{ marginBottom: '16px', fontSize: '13px' }}>{assignment.course}</div>
                  <div className={styles.cardFooter}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div className="text-secondary" style={{ fontSize: '12px' }}>{assignment.dueDate || 'No date'}</div>
                      {deadlineInfo && (
                        <div style={{ fontSize: '11px', fontWeight: 600, color: deadlineInfo.color }}>
                          {deadlineInfo.text}
                        </div>
                      )}
                    </div>
                    <Badge variant="pill" style={{ backgroundColor: getPriorityColor(assignment.priority) + '20', color: getPriorityColor(assignment.priority), fontWeight: 600 }}>
                      {assignment.priority}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const actions = (
    <>
      <div className={styles.filterGroup}>
        <Badge variant="chip" active={filterPriority === 'All' && filterCourse === 'All'} onClick={resetFilters} style={{ cursor: 'pointer' }}>
          All
        </Badge>
        <Badge variant="chip" active={filterPriority !== 'All'} onClick={cyclePriorityFilter} style={{ cursor: 'pointer' }}>
          Priority: {filterPriority}
        </Badge>
        <Badge variant="chip" active={filterCourse !== 'All'} onClick={cycleCourseFilter} style={{ cursor: 'pointer' }}>
          Course: {filterCourse}
        </Badge>
      </div>
      <Button variant="primary" onClick={openNewModal}>
        <Plus size={16} strokeWidth={2.5} />
        New
      </Button>
    </>
  );

  return (
    <>
      <Header 
        title="Assignments"
        subtitle="Track deadlines by course and priority"
        actions={actions}
      />

      <div className={styles.kanbanBoard}>
        {renderColumn('To Do', 'To do')}
        {renderColumn('In Progress', 'In progress')}
        {renderColumn('Done', 'Done')}
      </div>

      <AssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveAssignment} 
        initialData={editingAssignment}
      />
    </>
  );
}
