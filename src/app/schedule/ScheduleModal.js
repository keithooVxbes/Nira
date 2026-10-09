import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './ScheduleModal.module.css';

const DEFAULT_TIMEZONE = "WIB";

export default function ScheduleModal({ isOpen, onClose, onSave, initialData }) {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    day: 'Monday',
    start_time: '',
    end_time: '',
    room: '',
    color_theme: 'blue'
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('');
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          ...initialData,
          start_time: initialData.start_time ? initialData.start_time.slice(0, 5) : '',
          end_time: initialData.end_time ? initialData.end_time.slice(0, 5) : ''
        });
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          name: '',
          day: 'Monday',
          start_time: '',
          end_time: '',
          room: '',
          color_theme: 'blue'
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
    if (!formData.name.trim() || !formData.day || !formData.start_time || !formData.end_time) {
      setError('Please fill in all required fields.');
      return;
    }
    
    // Validate HH:mm format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.start_time) || !timeRegex.test(formData.end_time)) {
      setError('Please enter a valid time in HH:mm format.');
      return;
    }
    
    onSave({ 
      ...formData, 
      id: initialData ? initialData.id : Date.now(),
      // Ensure we format as HH:mm:00 for database compatibility
      start_time: formData.start_time.length === 5 ? `${formData.start_time}:00` : formData.start_time,
      end_time: formData.end_time.length === 5 ? `${formData.end_time}:00` : formData.end_time
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{initialData ? 'Edit Class' : 'Add Class'}</h2>
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
              <label className={styles.label}>Name *</label>
              <Input 
                name="name" 
                value={formData.name} 
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
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Input 
                    type="text"
                    name="start_time" 
                    value={formData.start_time} 
                    onChange={handleChange} 
                    placeholder="HH:mm"
                    maxLength={5}
                    required
                  />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>{DEFAULT_TIMEZONE}</span>
                </div>
              </div>

              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>End Time *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Input 
                    type="text"
                    name="end_time" 
                    value={formData.end_time} 
                    onChange={handleChange} 
                    placeholder="HH:mm"
                    maxLength={5}
                    required
                  />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>{DEFAULT_TIMEZONE}</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Color Theme</label>
              <select 
                className={styles.select}
                name="color_theme"
                value={formData.color_theme}
                onChange={handleChange}
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="amber">Orange/Amber</option>
                <option value="emerald">Emerald</option>
                <option value="violet">Purple/Violet</option>
                <option value="rose">Rose</option>
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
