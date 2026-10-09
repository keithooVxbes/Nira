import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './AssignmentModal.module.css';

export default function AssignmentModal({ isOpen, onClose, onSave, initialData }) {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'To Do'
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(''); // Reset error when opening
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(initialData);
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          title: '',
          course: '',
          description: '',
          dueDate: '',
          priority: 'Medium',
          status: 'To Do'
        });
      }
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.course.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    onSave({ ...formData, id: initialData ? initialData.id : Date.now() });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{initialData ? 'Edit Assignment' : 'New Assignment'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.body}>
            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Title *</label>
              <Input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="E.g., Midterm Essay"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Course / Subject *</label>
              <Input 
                name="course" 
                value={formData.course} 
                onChange={handleChange} 
                placeholder="E.g., English 101"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea 
                className={styles.textarea}
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Any additional notes..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Due Date</label>
              <Input 
                type="date"
                name="dueDate" 
                value={formData.dueDate} 
                onChange={handleChange} 
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Priority</label>
                <select 
                  className={styles.select}
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Status</label>
                <select 
                  className={styles.select}
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Save Assignment</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
