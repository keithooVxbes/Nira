'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import { createTransaction } from './actions'
import styles from './Modal.module.css'

export default function TransactionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [txType, setTxType] = useState('expense') // default

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.target)
    
    if (txType === 'expense') {
      const receipt = formData.get('receipt')
      if (receipt && receipt.size > 0) {
        if (receipt.size > 5 * 1024 * 1024) {
          setError('Receipt must be less than 5MB')
          return
        }
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
        if (!validTypes.includes(receipt.type)) {
          setError('Receipt must be JPG, JPEG, or PNG')
          return
        }
      }
    }

    setLoading(true)
    const result = await createTransaction(formData)
    
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} strokeWidth={2} />
        Transaction
      </Button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Add Transaction</h3>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Type</label>
                <select name="type" className={styles.input} required value={txType} onChange={e => setTxType(e.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Amount</label>
                <input type="number" step="0.01" name="amount" className={styles.input} required />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <select name="category" className={styles.input} required>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <input type="text" name="description" className={styles.input} required />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Date</label>
                <input type="date" name="transaction_date" className={styles.input} required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              {txType === 'expense' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Receipt (Optional, max 5MB, JPG/PNG)</label>
                  <input type="file" name="receipt" accept=".jpg,.jpeg,.png" className={styles.input} />
                </div>
              )}
              
              <div className={styles.actions}>
                <Button variant="secondary" onClick={() => setIsOpen(false)} type="button">Cancel</Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
