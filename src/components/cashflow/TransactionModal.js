import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './TransactionModal.module.css';

export default function TransactionModal({ isOpen, onClose, onSave }) {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Expense'
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        description: '',
        amount: '',
        type: 'Expense'
      });
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
    if (!formData.description.trim() || !formData.amount.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError('Amount must be a valid positive number.');
      return;
    }
    
    onSave({ ...formData, id: Date.now() });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add Transaction</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
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
              <label className={styles.label}>Description *</label>
              <Input 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="E.g., Spotify Premium"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Amount (IDR) *</label>
              <Input 
                type="number"
                name="amount" 
                value={formData.amount} 
                onChange={handleChange} 
                placeholder="0"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Type</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>
          </div>
          
          <div className={styles.footer}>
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Save Transaction</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
