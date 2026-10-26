'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './ReceiptCamera.module.css';

/**
 * Live camera preview that captures a photo frame as a JPEG File.
 * Prefers the rear camera on mobile devices (facingMode: 'environment').
 */
export default function ReceiptCamera({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera is not available in this browser. Please use "Upload file" instead.');
        return;
      }
      try {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } catch {
          // Fallback if environmental or resolution constraints fail on laptop webcams
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = async () => {
            try {
              await video.play();
              if (!cancelled) setReady(true);
            } catch (playErr) {
              console.error('Video play error:', playErr);
            }
          };
        }
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : '';
        setError(
          name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow it in browser settings or use "Upload file".'
            : name === 'NotFoundError'
              ? 'No camera found on this device. Use "Upload file" instead.'
              : 'Could not start camera. Use "Upload file" instead.'
        );
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCapture(new File([blob], 'receipt.jpg', { type: 'image/jpeg' }));
        }
      },
      'image/jpeg',
      0.9
    );
  };

  return (
    <div className={styles.cameraContainer}>
      {error ? (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : (
        <div className={styles.videoWrapper}>
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            aria-label="Camera preview"
            className={styles.video}
          />
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} type="button">
          <X size={16} />
          Cancel
        </Button>
        {!error && (
          <Button variant="primary" onClick={handleCapture} disabled={!ready} type="button">
            <Camera size={16} />
            Capture
          </Button>
        )}
      </div>
    </div>
  );
}
