import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './TransactionModal.module.css';
import { createTransaction, updateTransaction } from '@/app/cashflow/actions';

export default function TransactionModal({ isOpen, onClose, transaction }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Others',
    transaction_date: ''
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      setError('');
      setLoading(false);
      
      if (transaction) {
        setFormData({
          description: transaction.description || '',
          amount: transaction.amount || '',
          type: transaction.type || 'expense',
          category: transaction.category || 'Others',
          transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0]
        });
      } else {
        setFormData({
          description: '',
          amount: '',
          type: 'expense',
          category: 'Food',
          transaction_date: new Date().toISOString().split('T')[0]
        });
      }
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, transaction]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim() || !formData.amount.trim() || !formData.category || !formData.transaction_date) {
      setError('Please fill in all required fields.');
      return;
    }
    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError('Amount must be a valid positive number.');
      return;
    }
    
    setLoading(true);
    
    const submitData = new FormData();
    submitData.append('type', formData.type);
    submitData.append('amount', formData.amount);
    submitData.append('category', formData.category);
    submitData.append('description', formData.description);
    submitData.append('transaction_date', formData.transaction_date);

    try {
      const result = transaction 
        ? await updateTransaction(transaction.id, submitData)
        : await createTransaction(submitData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        setLoading(false);
        onClose();
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close" disabled={loading}>
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
              <label className={styles.label}>Type</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={styles.select}
                disabled={loading}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
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
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category *</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.select}
                disabled={loading}
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Utilities">Utilities</option>
                <option value="Shopping">Shopping</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Salary">Salary</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description *</label>
              <Input 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="E.g., Spotify Premium"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Date *</label>
              <Input 
                type="date"
                name="transaction_date" 
                value={formData.transaction_date} 
                onChange={handleChange} 
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className={styles.footer}>
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (transaction ? 'Updating...' : 'Saving...') : (transaction ? 'Update Transaction' : 'Save Transaction')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
