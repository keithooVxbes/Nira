import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './ScheduleModal.module.css';

export default function ScheduleModal({ isOpen, onClose, onSave }) {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    day: 'Mon',
    startTime: '',
    endTime: '',
    room: '',
    theme: '0'
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('');
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.day || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields.');
      return;
    }
    onSave({ ...formData, id: Date.now() });
    setFormData({
      subject: '',
      day: 'Mon',
      startTime: '',
      endTime: '',
      room: '',
      theme: '0'
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add Class</h2>
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
              <label className={styles.label}>Subject / Course *</label>
              <Input 
                name="subject" 
                value={formData.subject} 
                onChange={handleChange} 
                placeholder="E.g., Intro to Computer Science"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Day *</label>
                <select 
                  className={styles.select}
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                >
                  <option value="Mon">Monday</option>
                  <option value="Tue">Tuesday</option>
                  <option value="Wed">Wednesday</option>
                  <option value="Thu">Thursday</option>
                  <option value="Fri">Friday</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Room / Location</label>
                <Input 
                  name="room" 
                  value={formData.room} 
                  onChange={handleChange} 
                  placeholder="E.g., Room 402"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Start Time *</label>
                <Input 
                  type="time"
                  name="startTime" 
                  value={formData.startTime} 
                  onChange={handleChange} 
                  required
                />
              </div>

              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>End Time *</label>
                <Input 
                  type="time"
                  name="endTime" 
                  value={formData.endTime} 
                  onChange={handleChange} 
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Color Theme</label>
              <select 
                className={styles.select}
                name="theme"
                value={formData.theme}
                onChange={handleChange}
              >
                <option value="0">Blue</option>
                <option value="1">Green</option>
                <option value="2">Orange/Amber</option>
                <option value="3">Purple/Violet</option>
              </select>
            </div>
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Save Class</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
