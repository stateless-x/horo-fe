'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const STORAGE_KEY = 'horo-ambient-muted';
const TARGET_VOLUME = 0.15;
const FADE_DURATION_MS = 2000;
const AUDIO_SRC = '/ambient.mp3';

interface UseAmbientAudioReturn {
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
}

/**
 * Ambient audio hook that plays a looping creepy soundscape.
 *
 * Uses a pre-generated MP3 file (/public/ambient.mp3) for consistent,
 * high-quality audio across all browsers.
 *
 * - Starts on first user interaction (respects autoplay policy)
 * - Loops seamlessly at 15% volume
 * - Fades in/out smoothly on mute toggle
 * - Mute preference persisted in localStorage
 * - Full cleanup on unmount
 */
export function useAmbientAudio(): UseAmbientAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitializedRef = useRef(false);

  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  /**
   * Smoothly fade audio volume from current to target over duration.
   */
  const fadeTo = useCallback(
    (audio: HTMLAudioElement, target: number, durationMs: number) => {
      // Clear any existing fade
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      const start = audio.volume;
      const diff = target - start;
      if (Math.abs(diff) < 0.001) {
        audio.volume = target;
        return;
      }

      const steps = 30; // ~30 steps for smooth fade
      const stepMs = durationMs / steps;
      const stepSize = diff / steps;
      let current = 0;

      fadeIntervalRef.current = setInterval(() => {
        current++;
        if (current >= steps) {
          audio.volume = target;
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
        } else {
          audio.volume = Math.max(0, Math.min(1, start + stepSize * current));
        }
      }, stepMs);
    },
    []
  );

  const initAudio = useCallback(() => {
    if (isInitializedRef.current) return;

    try {
      const audio = new Audio(AUDIO_SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0; // Start silent, will fade in
      audioRef.current = audio;
      isInitializedRef.current = true;

      if (!isMutedRef.current) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            fadeTo(audio, TARGET_VOLUME, FADE_DURATION_MS);
          })
          .catch((err) => {
            console.warn('[AmbientAudio] Playback failed:', err);
          });
      } else {
        // Pre-load but don't play
        audio.load();
      }
    } catch (err) {
      console.warn('[AmbientAudio] Failed to initialize:', err);
    }
  }, [fadeTo]);

  // Register interaction listeners to start audio (autoplay policy)
  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      removeListeners();
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
  }, [initAudio]);

  // Cleanup on unmount (leaving /fortune page)
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.load(); // Release resources
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
      if (audio) {
        if (newMuted) {
          // Fade out then pause
          fadeTo(audio, 0, FADE_DURATION_MS);
          setTimeout(() => {
            if (isMutedRef.current && audio) {
              audio.pause();
              setIsPlaying(false);
            }
          }, FADE_DURATION_MS + 100);
        } else {
          // Resume and fade in
          audio.volume = 0;
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              fadeTo(audio, TARGET_VOLUME, FADE_DURATION_MS);
            })
            .catch((err) => {
              console.warn('[AmbientAudio] Resume failed:', err);
            });
        }
      }

      return newMuted;
    });
  }, [fadeTo]);

  return { isMuted, toggleMute, isPlaying };
}
