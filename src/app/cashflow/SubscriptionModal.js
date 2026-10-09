'use client'

import { useState, useEffect } from 'react'
import { createSubscription, updateSubscription } from './actions'
import styles from './Modal.module.css'
import Button from '@/components/ui/Button'

export default function SubscriptionModal({ isOpen, onClose, initialData, onSave }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    billing_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (isOpen) {
      setError(null)
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          amount: initialData.amount || '',
          category: initialData.category || '',
          billing_date: initialData.billing_date || new Date().toISOString().split('T')[0]
        })
      } else {
        setFormData({
          name: '',
          amount: '',
          category: '',
          billing_date: new Date().toISOString().split('T')[0]
        })
      }
    }
  }, [isOpen, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const submitData = new FormData(e.target)
    
    let result;
    if (initialData) {
      result = await updateSubscription(initialData.id, submitData)
    } else {
      result = await createSubscription(submitData)
    }
    
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      if (onSave) {
        onSave({
          id: initialData ? initialData.id : Date.now(),
          ...formData,
          amount: parseFloat(formData.amount)
        })
      }
      onClose()
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>{initialData ? 'Edit Subscription' : 'Add Subscription'}</h3>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <input type="text" name="name" className={styles.input} value={formData.name} onChange={handleChange} required />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Amount</label>
            <input type="number" step="0.01" name="amount" className={styles.input} value={formData.amount} onChange={handleChange} required />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Category</label>
            <input type="text" name="category" className={styles.input} value={formData.category} onChange={handleChange} required />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Next Billing Date</label>
            <input type="date" name="billing_date" className={styles.input} value={formData.billing_date} onChange={handleChange} required />
          </div>
          
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (initialData ? 'Update Subscription' : 'Save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
