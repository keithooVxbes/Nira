'use client';

import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Camera, Upload, RotateCcw, Check, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './TransactionModal.module.css';
import { createTransaction, updateTransaction, deleteTransaction } from '@/app/cashflow/actions';
import { scanReceiptAction } from '@/lib/actions/receipt';
import { compressImage } from '@/lib/utils/image';
import ReceiptCamera from './ReceiptCamera';

export default function TransactionModal({ isOpen, onClose, transaction, onSave }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Other',
    transaction_date: '',
  });

  // Scanner state
  const fileInputRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  // Undo Toast state
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (cameraOpen) {
          setCameraOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, cameraOpen, onClose]);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setError('');
      setScanError('');
      setLoading(false);
      setCameraOpen(false);

      if (transaction) {
        setFormData({
          description: transaction.description || '',
          amount: transaction.amount || '',
          type: transaction.type || 'expense',
          category: transaction.category || 'Other',
          transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
        });
      } else {
        setFormData({
          description: '',
          amount: '',
          type: 'expense',
          category: 'Food',
          transaction_date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [isOpen, transaction]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleReceiptFile = async (file) => {
    if (!file) return;
    setScanning(true);
    setScanError('');
    setCameraOpen(false);

    try {
      const compressed = await compressImage(file);
      const body = new FormData();
      body.set('receipt', compressed);

      const result = await scanReceiptAction(body);
      if (!result.ok || !result.transaction) {
        setScanError(result.message || 'Could not read receipt. Try another photo or enter manually.');
        return;
      }

      const t = result.transaction;
      onClose();
      if (onSave) onSave(t);

      // Trigger Toast with Undo option
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({
        id: t.id,
        message: `Added ${t.description || t.category}: ${Number(t.amount).toLocaleString('en-US')} IDR (${t.category}).`,
        isUndone: false,
        undoing: false,
      });

      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 7000);
    } catch (err) {
      console.error('Scan receipt error:', err);
      setScanError('Failed to process the receipt. Please try again or add manually.');
    } finally {
      setScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUndo = async () => {
    if (!toast?.id || toast.undoing || toast.isUndone) return;

    setToast((prev) => ({ ...prev, undoing: true }));
    try {
      const res = await deleteTransaction(toast.id);
      if (res?.error) {
        setToast((prev) => ({ ...prev, undoing: false, message: 'Failed to undo: ' + res.error }));
      } else {
        setToast((prev) => ({
          ...prev,
          undoing: false,
          isUndone: true,
          message: 'Transaction removed.',
        }));
        setTimeout(() => setToast(null), 2500);
      }
    } catch (err) {
      console.error('Undo error:', err);
      setToast((prev) => ({ ...prev, undoing: false, message: 'Failed to undo transaction.' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim() || !String(formData.amount).trim() || !formData.category || !formData.transaction_date) {
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
        if (onSave) onSave(result.data || formData);
        onClose();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen && !toast) return null;

  return (
    <>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h2 className={styles.title}>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close"
                disabled={loading || scanning}
                type="button"
              >
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

                {/* Receipt scanning section for new transactions */}
                {!transaction && (
                  <div className={styles.scanSection}>
                    <div className={styles.scanHeader}>
                      <span className={styles.scanTitle}>
                        Automatic Receipt Scan
                      </span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => handleReceiptFile(e.target.files?.[0])}
                    />

                    {cameraOpen && !scanning ? (
                      <ReceiptCamera
                        onCapture={handleReceiptFile}
                        onCancel={() => setCameraOpen(false)}
                      />
                    ) : (
                      <>
                        <p className={styles.scanSubtitle}>
                          Snap a photo or upload receipt to record expense automatically.
                        </p>
                        <div className={styles.scanButtons}>
                          <button
                            type="button"
                            className={styles.scanBtn}
                            onClick={() => {
                              setScanError('');
                              setCameraOpen(true);
                            }}
                            disabled={scanning || loading}
                          >
                            {scanning ? (
                              <>
                                <Loader2 size={15} className="animate-spin" />
                                Reading receipt…
                              </>
                            ) : (
                              <>
                                <Camera size={15} />
                                Take photo
                              </>
                            )}
                          </button>

                          {!scanning && (
                            <button
                              type="button"
                              className={styles.scanBtn}
                              onClick={() => {
                                setScanError('');
                                fileInputRef.current?.click();
                              }}
                              disabled={loading}
                            >
                              <Upload size={15} />
                              Upload file
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {scanError && (
                      <div className={styles.errorBanner}>
                        <AlertCircle size={16} />
                        <span>{scanError}</span>
                      </div>
                    )}

                    <div className={styles.divider}>
                      <span>or enter details manually</span>
                    </div>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={styles.select}
                    disabled={loading || scanning}
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
                    disabled={loading || scanning}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={styles.select}
                    disabled={loading || scanning}
                  >
                    <option value="Food">Food</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Health">Health</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Bills">Bills</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Education">Education</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Description *</label>
                  <Input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="E.g., Superindo Groceries, Kopi Kenangan"
                    required
                    disabled={loading || scanning}
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
                    disabled={loading || scanning}
                  />
                </div>
              </div>

              <div className={styles.footer}>
                <Button variant="secondary" onClick={onClose} type="button" disabled={loading || scanning}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading || scanning}>
                  {loading
                    ? transaction
                      ? 'Updating...'
                      : 'Saving...'
                    : transaction
                    ? 'Update Transaction'
                    : 'Save Transaction'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Undo Feedback Toast */}
      {toast && (
        <div className={styles.toast} role="status">
          {toast.isUndone ? (
            <RotateCcw size={16} color="#9E9890" />
          ) : (
            <Check size={16} color="#10B981" />
          )}
          <span className={styles.toastMessage}>{toast.message}</span>
          {!toast.isUndone && (
            <button
              type="button"
              className={styles.undoBtn}
              onClick={handleUndo}
              disabled={toast.undoing}
            >
              {toast.undoing ? 'Undoing…' : 'Undo'}
            </button>
          )}
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => setToast(null)}
            aria-label="Dismiss toast"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
