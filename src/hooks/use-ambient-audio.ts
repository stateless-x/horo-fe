'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const STORAGE_KEY = 'horo-ambient-muted';
const TARGET_VOLUME = 0.06;
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
 * Uses a pre-generated MP3 file (/public/ambient.mp3) with streaming playback:
 * - Preloads on mount so buffering starts immediately
 * - Plays as soon as enough data is buffered (no waiting for full download)
 * - Starts on first user interaction (respects browser autoplay policy)
 * - Loops seamlessly at ~6% volume
 * - Fades in/out smoothly on mute toggle
 * - Mute preference persisted in localStorage
 * - Full cleanup on unmount
 */
export function useAmbientAudio(): UseAmbientAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitializedRef = useRef(false);
  const wantsPlayRef = useRef(false); // user has interacted, waiting for buffer

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

      const steps = 30;
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

  /**
   * Actually start playback — called when both conditions are met:
   * 1. User has interacted (wantsPlayRef)
   * 2. Audio has enough buffered data (canplay event or already ready)
   */
  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isInitializedRef.current) return;
    if (!wantsPlayRef.current || isMutedRef.current) return;

    isInitializedRef.current = true;
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        fadeTo(audio, TARGET_VOLUME, FADE_DURATION_MS);
      })
      .catch((err) => {
        console.warn('[AmbientAudio] Playback failed:', err);
        isInitializedRef.current = false;
      });
  }, [fadeTo]);

  // Preload audio on mount — starts downloading immediately
  // Listen for 'canplay' so we can start as soon as enough is buffered
  useEffect(() => {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;

      // When browser has buffered enough to start playing
      const onCanPlay = () => {
        if (wantsPlayRef.current && !isInitializedRef.current) {
          startPlayback();
        }
      };
      audio.addEventListener('canplay', onCanPlay);

      // Start downloading
      audio.src = AUDIO_SRC;

      return () => {
        audio.removeEventListener('canplay', onCanPlay);
      };
    } catch (err) {
      console.warn('[AmbientAudio] Failed to create audio:', err);
    }
  }, [startPlayback]);

  // On first user interaction, mark that we want to play
  // If audio is already buffered, play immediately; otherwise wait for canplay
  useEffect(() => {
    const handleInteraction = () => {
      wantsPlayRef.current = true;
      removeListeners();

      // Try to play right away if already buffered
      const audio = audioRef.current;
      if (audio && audio.readyState >= 3) {
        // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA — ready to play
        startPlayback();
      }
      // Otherwise, the canplay listener will trigger startPlayback
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
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.load();
      }
      isInitializedRef.current = false;
      wantsPlayRef.current = false;
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
          fadeTo(audio, 0, FADE_DURATION_MS);
          setTimeout(() => {
            if (isMutedRef.current && audio) {
              audio.pause();
              setIsPlaying(false);
            }
          }, FADE_DURATION_MS + 100);
        } else {
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
