'use client'

import { useState } from 'react'
import { createSubscription } from './actions'
import styles from './Modal.module.css'
import pageStyles from './page.module.css'
import Button from '@/components/ui/Button'

export default function SubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.target)
    const result = await createSubscription(formData)
    
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button type="button" className={pageStyles.link} onClick={() => setIsOpen(true)}>
        + Add
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Add Subscription</h3>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name</label>
                <input type="text" name="name" className={styles.input} required />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Amount</label>
                <input type="number" step="0.01" name="amount" className={styles.input} required />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <input type="text" name="category" className={styles.input} required />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Billing Date</label>
                <input type="date" name="billing_date" className={styles.input} required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              
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
