'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const STORAGE_KEY = 'horo-ambient-muted';
const TARGET_VOLUME = 0.03;
const FADE_IN_MS = 3000;
const AUDIO_SRC = '/ambient.mp3';

interface UseAmbientAudioReturn {
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
}

/**
 * Ambient audio hook that plays a looping creepy soundscape.
 *
 * Strategy for fast playback:
 * 1. Preloads audio on mount (starts buffering immediately)
 * 2. Attempts autoplay as soon as buffered (works if browser allows)
 * 3. Falls back to play on first user interaction if autoplay blocked
 * 4. Audio keeps playing when muted (toggle is instant via .muted property)
 */
export function useAmbientAudio(): UseAmbientAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitializedRef = useRef(false);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isInitializedRef.current) return;

    isInitializedRef.current = true;
    audio.volume = 0;
    audio.muted = isMutedRef.current;

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        // Gentle fade-in
        if (!isMutedRef.current) {
          let step = 0;
          const steps = 30;
          const stepMs = FADE_IN_MS / steps;
          fadeRef.current = setInterval(() => {
            step++;
            if (step >= steps) {
              audio.volume = TARGET_VOLUME;
              if (fadeRef.current) clearInterval(fadeRef.current);
              fadeRef.current = null;
            } else {
              audio.volume = (step / steps) * TARGET_VOLUME;
            }
          }, stepMs);
        } else {
          audio.volume = TARGET_VOLUME;
        }
      })
      .catch(() => {
        // Autoplay blocked — will retry on user interaction
        isInitializedRef.current = false;
      });
  }, []);

  // Preload + attempt autoplay immediately
  useEffect(() => {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;

      // As soon as enough is buffered, try to play
      const onCanPlay = () => {
        if (!isInitializedRef.current) {
          startPlayback();
        }
      };
      audio.addEventListener('canplay', onCanPlay);
      audio.src = AUDIO_SRC;

      return () => {
        audio.removeEventListener('canplay', onCanPlay);
      };
    } catch (err) {
      console.warn('[AmbientAudio] Failed to create audio:', err);
    }
  }, [startPlayback]);

  // Fallback: play on first user interaction if autoplay was blocked
  useEffect(() => {
    const handleInteraction = () => {
      removeListeners();
      if (!isInitializedRef.current) {
        startPlayback();
      }
    };

    const removeListeners = () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return removeListeners;
  }, [startPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.load();
      }
      isInitializedRef.current = false;
      audioRef.current = null;
    };
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      localStorage.setItem(STORAGE_KEY, String(newMuted));
      const audio = audioRef.current;
      if (audio) audio.muted = newMuted;
      return newMuted;
    });
  }, []);

  return { isMuted, toggleMute, isPlaying };
}
