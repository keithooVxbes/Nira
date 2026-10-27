"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  getActiveFocusSession,
  startFocusSession,
  completeFocusSession,
  cancelFocusSession,
  pauseFocusSession,
  resumeFocusSession,
} from '@/app/dashboard/actions';

const FocusTimerContext = createContext(null);

const DEFAULT_MINUTES = 25;
const MIN_MINUTES = 1;
const MAX_MINUTES = 180;
const SOUND_REPEAT_COUNT = 4;
const SOUND_URL = '/sounds/focus-complete.mp3';

const clampMinutes = (value) => Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.floor(value)));

export function FocusTimerProvider({ children }) {
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_MINUTES);
  const [durationInput, setDurationInput] = useState(String(DEFAULT_MINUTES));
  const [timeLeft, setTimeLeft] = useState(DEFAULT_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const endTimeRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioBufferRef = useRef(null);
  const scheduledSourcesRef = useRef([]);
  const scheduledSoundRef = useRef(false);
  const scheduledForRef = useRef(null);
  const scheduleTokenRef = useRef(0);
  const fallbackAudioRef = useRef(null);
  const fallbackEndedHandlerRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const isActiveRef = useRef(false);
  const completingRef = useRef(false);

  const durationSeconds = durationMinutes * 60;

  const showToast = useCallback((message) => {
    setToastMsg(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(''), 5000);
  }, []);

  /**
   * Web Audio: audio yang sudah dijadwalkan tetap berbunyi walau tab
   * di-background / aplikasi lain sedang aktif, karena diputar di audio
   * thread dan tidak ikut terkena throttling timer JS.
   */
  const stopScheduledSources = useCallback(() => {
    scheduleTokenRef.current += 1;
    scheduledSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // already stopped / never started
      }
      try {
        source.disconnect();
      } catch {
        // ignore
      }
    });
    scheduledSourcesRef.current = [];
    scheduledSoundRef.current = false;
    scheduledForRef.current = null;
  }, []);

  const prepareAudio = useCallback(async () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      if (!audioBufferRef.current) {
        const response = await fetch(SOUND_URL);
        if (!response.ok) return false;
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await audioCtxRef.current.decodeAudioData(arrayBuffer.slice(0));
      }

      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      return audioCtxRef.current.state === 'running' && !!audioBufferRef.current;
    } catch (err) {
      console.warn('Could not prepare completion sound:', err);
      return false;
    }
  }, []);

  const scheduleCompletionSound = useCallback(async (seconds) => {
    stopScheduledSources();
    const token = scheduleTokenRef.current;

    const ready = await prepareAudio();
    if (!ready || token !== scheduleTokenRef.current) return false;

    const ctx = audioCtxRef.current;
    const buffer = audioBufferRef.current;
    const startAt = ctx.currentTime + Math.max(0, seconds);

    for (let i = 0; i < SOUND_REPEAT_COUNT; i += 1) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(startAt + i * buffer.duration);
      scheduledSourcesRef.current.push(source);
    }

    scheduledSoundRef.current = true;
    scheduledForRef.current = Date.now() + Math.max(0, seconds) * 1000;
    return true;
  }, [prepareAudio, stopScheduledSources]);

  // Fallback HTMLAudioElement path, dipakai kalau Web Audio tidak tersedia
  // atau jadwal suara gagal dibuat.
  const stopFallbackSound = useCallback(() => {
    const audio = fallbackAudioRef.current;
    if (!audio) return;
    if (fallbackEndedHandlerRef.current) {
      audio.removeEventListener('ended', fallbackEndedHandlerRef.current);
      fallbackEndedHandlerRef.current = null;
    }
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const playFallbackSound = useCallback(async () => {
    const audio = fallbackAudioRef.current;
    if (!audio) return;

    stopFallbackSound();
    audio.loop = false;

    let playCount = 0;
    const handleEnded = async () => {
      if (playCount >= SOUND_REPEAT_COUNT) {
        audio.removeEventListener('ended', handleEnded);
        if (fallbackEndedHandlerRef.current === handleEnded) {
          fallbackEndedHandlerRef.current = null;
        }
        return;
      }

      playCount += 1;
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch (err) {
        console.warn('Audio repeat was prevented or interrupted:', err);
        audio.removeEventListener('ended', handleEnded);
        if (fallbackEndedHandlerRef.current === handleEnded) {
          fallbackEndedHandlerRef.current = null;
        }
      }
    };

    fallbackEndedHandlerRef.current = handleEnded;
    audio.addEventListener('ended', handleEnded);

    playCount = 1;
    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (err) {
      console.warn('Audio play was prevented or interrupted:', err);
      audio.removeEventListener('ended', handleEnded);
      if (fallbackEndedHandlerRef.current === handleEnded) {
        fallbackEndedHandlerRef.current = null;
      }
    }
  }, [stopFallbackSound]);

  const playCompletionSound = useCallback((force = false) => {
    if (!force && scheduledSoundRef.current) {
      // Bunyi sudah dijadwalkan via Web Audio, jangan diputar dobel.
      scheduledSoundRef.current = false;
      return;
    }
    playFallbackSound();
  }, [playFallbackSound]);

  const handleCompleteSession = useCallback(async (sessionId) => {
    if (completingRef.current) return;
    completingRef.current = true;

    setIsActive(false);
    endTimeRef.current = null;

    // Kalau handler ini baru jalan jauh setelah jadwalnya (misal tab
    // di-freeze Chrome), jadwal Web Audio mungkin tidak sempat berbunyi,
    // jadi paksa pakai fallback.
    const scheduledFor = scheduledForRef.current;
    const isLate = scheduledFor != null && Date.now() - scheduledFor > 2000;
    if (isLate) {
      stopScheduledSources();
      playCompletionSound(true);
    } else {
      playCompletionSound();
    }

    if (sessionId) {
      await completeFocusSession(sessionId);
    }
    setActiveSessionId(null);

    showToast('Focus session completed 🎉');
    setTimeLeft(durationMinutes * 60);
  }, [durationMinutes, playCompletionSound, showToast, stopScheduledSources]);

  // Audio element fallback (dibuat sekali)
  useEffect(() => {
    fallbackAudioRef.current = new Audio(SOUND_URL);

    return () => {
      stopFallbackSound();
      fallbackAudioRef.current = null;
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [stopFallbackSound]);

  // Unlock audio pada interaksi pertama, supaya sesi yang di-restore
  // setelah reload tetap bisa berbunyi.
  useEffect(() => {
    const unlock = async () => {
      await prepareAudio();
      if (!scheduledSoundRef.current && isActiveRef.current && endTimeRef.current) {
        scheduleCompletionSound(Math.max(0, (endTimeRef.current - Date.now()) / 1000));
      }
    };
    document.addEventListener('pointerdown', unlock, { once: true });
    return () => document.removeEventListener('pointerdown', unlock);
  }, [prepareAudio, scheduleCompletionSound]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Restore sesi aktif + durasi terakhir dari localStorage
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const { data: session } = await getActiveFocusSession();
      if (cancelled) return;

      if (session) {
        const totalDuration = session.duration || session.remaining_seconds || DEFAULT_MINUTES * 60;
        const minutes = Math.max(MIN_MINUTES, Math.round(totalDuration / 60));
        setDurationMinutes(minutes);
        setDurationInput(String(minutes));
        setActiveSessionId(session.id);

        if (session.status === 'running') {
          const baseSeconds = session.remaining_seconds != null ? session.remaining_seconds : totalDuration;
          const elapsed = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
          const remaining = baseSeconds - elapsed;

          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsActive(true);
            completingRef.current = false;
            endTimeRef.current = Date.now() + remaining * 1000;
            scheduleCompletionSound(remaining);
          } else {
            // Sesi sudah habis saat halaman ditutup / tab di-suspend
            playCompletionSound(true);
            completeFocusSession(session.id);
            setActiveSessionId(null);
            setTimeLeft(minutes * 60);
            showToast('Focus session completed 🎉');
          }
        } else if (session.status === 'paused') {
          const remaining = session.remaining_seconds != null ? session.remaining_seconds : totalDuration;
          setTimeLeft(remaining);
          setIsActive(false);
        }
        return;
      }

      const saved = Number(window.localStorage.getItem('focus-duration-minutes'));
      if (Number.isFinite(saved) && saved >= MIN_MINUTES && saved <= MAX_MINUTES) {
        const minutes = clampMinutes(saved);
        setDurationMinutes(minutes);
        setDurationInput(String(minutes));
        setTimeLeft(minutes * 60);
      }
    };

    restore();
    return () => { cancelled = true; };
  }, [playCompletionSound, scheduleCompletionSound, showToast]);

  useEffect(() => {
    window.localStorage.setItem('focus-duration-minutes', String(durationMinutes));
  }, [durationMinutes]);

  // Tick timer (jalan global, tidak ikut unmount saat pindah halaman)
  useEffect(() => {
    if (!isActive) return;

    const tick = () => {
      if (endTimeRef.current) {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        if (remaining <= 0) {
          setTimeLeft(0);
          handleCompleteSession(activeSessionId);
        } else {
          setTimeLeft(remaining);
        }
      } else {
        setTimeLeft(t => {
          if (t <= 1) {
            handleCompleteSession(activeSessionId);
            return 0;
          }
          return t - 1;
        });
      }
    };

    const interval = setInterval(tick, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') tick();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, activeSessionId, handleCompleteSession]);

  const applyDuration = useCallback((minutes) => {
    const clamped = clampMinutes(minutes);
    setDurationMinutes(clamped);
    setDurationInput(String(clamped));
    setTimeLeft(clamped * 60);
  }, []);

  const cancelActiveSession = useCallback(async () => {
    if (!activeSessionId) return;
    const sid = activeSessionId;
    setActiveSessionId(null);
    await cancelFocusSession(sid);
  }, [activeSessionId]);

  const handleDurationInput = useCallback((raw) => {
    setDurationInput(raw);
    const parsed = Number(raw);
    if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= MIN_MINUTES && parsed <= MAX_MINUTES) {
      const clamped = clampMinutes(parsed);
      setDurationMinutes(clamped);
      setTimeLeft(clamped * 60);
    }
  }, []);

  const commitDurationInput = useCallback(async () => {
    const parsed = Number(durationInput);
    if (durationInput.trim() === '' || !Number.isFinite(parsed)) {
      setDurationInput(String(durationMinutes));
      return;
    }

    const clamped = clampMinutes(parsed);
    if (clamped === durationMinutes && timeLeft === clamped * 60) {
      setDurationInput(String(clamped));
      return;
    }

    setIsActive(false);
    endTimeRef.current = null;
    stopScheduledSources();
    stopFallbackSound();
    applyDuration(clamped);
    await cancelActiveSession();
  }, [
    applyDuration,
    cancelActiveSession,
    durationInput,
    durationMinutes,
    stopFallbackSound,
    stopScheduledSources,
    timeLeft,
  ]);

  const toggleTimer = useCallback(async () => {
    if (isActive) {
      // Pause
      setIsActive(false);
      endTimeRef.current = null;
      stopScheduledSources();
      stopFallbackSound();
      if (activeSessionId) {
        await pauseFocusSession(activeSessionId, timeLeft);
      }
      return;
    }

    // Start atau Resume
    completingRef.current = false;
    setIsActive(true);
    endTimeRef.current = Date.now() + timeLeft * 1000;

    if (activeSessionId) {
      await resumeFocusSession(activeSessionId, timeLeft);
      scheduleCompletionSound(timeLeft);
    } else {
      const res = await startFocusSession('Custom', durationMinutes * 60);
      if (res?.data) {
        setActiveSessionId(res.data.id);
      }
      scheduleCompletionSound(durationMinutes * 60);
    }
  }, [
    activeSessionId,
    durationMinutes,
    isActive,
    scheduleCompletionSound,
    stopFallbackSound,
    stopScheduledSources,
    timeLeft,
  ]);

  const resetTimer = useCallback(async () => {
    completingRef.current = false;
    setIsActive(false);
    endTimeRef.current = null;
    stopScheduledSources();
    stopFallbackSound();
    setTimeLeft(durationSeconds);
    await cancelActiveSession();
  }, [cancelActiveSession, durationSeconds, stopFallbackSound, stopScheduledSources]);

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const value = {
    durationMinutes,
    durationInput,
    durationSeconds,
    timeLeft,
    isActive,
    activeSessionId,
    MIN_MINUTES,
    MAX_MINUTES,
    handleDurationInput,
    commitDurationInput,
    toggleTimer,
    resetTimer,
    formatTime,
  };

  return (
    <FocusTimerContext.Provider value={value}>
      {children}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--text-primary)',
            color: 'var(--surface)',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 1000,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {toastMsg}
        </div>
      )}
    </FocusTimerContext.Provider>
  );
}

export function useFocusTimer() {
  const context = useContext(FocusTimerContext);
  if (!context) {
    throw new Error('useFocusTimer must be used within a FocusTimerProvider');
  }
  return context;
}
