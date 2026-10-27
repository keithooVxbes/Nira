'use client';

import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { updateProfile } from '@/app/auth/actions';
import styles from './EditProfileModal.module.css';

async function resizeImage(file, maxSize = 512) {
  if (!file || !file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(file);
        return;
      }
      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, { type: file.type });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        0.9
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}

export default function EditProfileModal({ isOpen, onClose, onSave, currentProfile }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const previewRef = useRef('');

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    avatarUrl: ''
  });

  useEffect(() => {
    previewRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      setError('');
      setLoading(false);
      setSelectedFile(null);
      setRemoveAvatar(false);
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
      setPreviewUrl('');
      setFormData({
        fullName: currentProfile?.fullName || currentProfile?.username || '',
        username: currentProfile?.username || '',
        bio: currentProfile?.bio || '',
        avatarUrl: currentProfile?.avatarUrl || ''
      });
    } else {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = '';
      }
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, currentProfile, loading]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      setError('Please select a JPG, PNG, GIF, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Please select an image under 5MB.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreview = URL.createObjectURL(file);
    setPreviewUrl(newPreview);
    setSelectedFile(file);
    setRemoveAvatar(false);
    if (error) setError('');
  };

  const handleRemoveAvatar = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setSelectedFile(null);
    setRemoveAvatar(true);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim()) {
      setError('Full Name and Username are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('fullName', formData.fullName.trim());
      fd.append('username', formData.username.trim());
      fd.append('bio', formData.bio.trim());

      if (removeAvatar) {
        fd.append('removeAvatar', 'true');
      } else if (selectedFile) {
        const fileToUpload = await resizeImage(selectedFile, 512);
        fd.append('avatar', fileToUpload);
      }

      const res = await updateProfile(fd);

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      if (res?.success && res.profile) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        onSave(res.profile);
        onClose();
      }
    } catch (err) {
      console.error('Save profile error:', err);
      setError('An error occurred while saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeAvatar = removeAvatar ? null : (previewUrl || formData.avatarUrl);

  return (
    <div className={styles.overlay} onClick={() => !loading && onClose()}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Profile</h2>
          <button className={styles.closeBtn} onClick={() => !loading && onClose()} aria-label="Close" disabled={loading}>
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

            <div className={styles.avatarSection}>
              <div className={styles.avatarPreview}>
                {activeAvatar ? (
                  <img src={activeAvatar} alt="Avatar" className={styles.avatarImage} />
                ) : (
                  formData.username ? formData.username.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div className={styles.avatarActions}>
                <div className={styles.avatarBtnGroup}>
                  <label className={styles.uploadBtn} style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                    {activeAvatar ? 'Change Photo' : 'Upload Photo'}
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif" 
                      style={{ display: 'none' }} 
                      onChange={handleAvatarChange} 
                      disabled={loading}
                    />
                  </label>
                  {activeAvatar && (
                    <button 
                      type="button" 
                      className={styles.removeBtn} 
                      onClick={handleRemoveAvatar}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>JPG, PNG or WebP. Max size of 5MB</div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name *</label>
              <Input 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                placeholder="E.g., Myoumiaw"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Username *</label>
              <Input 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="E.g., myoumiaw"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <Input 
                value={currentProfile?.email || 'user@email.com'} 
                readOnly
                disabled
                style={{ backgroundColor: 'rgba(25, 25, 27, 0.04)', color: 'var(--text-tertiary)' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bio</label>
              <Input 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Tell us a little about yourself"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className={styles.footer}>
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
