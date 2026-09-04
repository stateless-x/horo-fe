'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const STORAGE_KEY = 'horo-ambient-muted';
const TARGET_VOLUME = 0.03;
const FADE_IN_MS = 3000;
const AUDIO_SRC = '/ambient-new.mp3';

interface UseAmbientAudioReturn {
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
}

/**
 * Ambient audio hook that plays a looping creepy soundscape.
 *
 * Uses Web Audio API GainNode for volume control (works on iOS where
 * HTMLMediaElement.volume is read-only and always 1).
 *
 * Strategy for fast playback:
 * 1. Preloads audio on mount (starts buffering immediately)
 * 2. Attempts autoplay as soon as buffered (works if browser allows)
 * 3. Falls back to play on first user interaction if autoplay blocked
 * 4. Audio keeps playing when muted (toggle is instant via gain value)
 */
export function useAmbientAudio(): UseAmbientAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
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

  const ensureAudioContext = useCallback(() => {
    if (audioContextRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(ctx.destination);

    audioContextRef.current = ctx;
    gainNodeRef.current = gain;
  }, []);

  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isInitializedRef.current) return;

    isInitializedRef.current = true;

    // Set up Web Audio API graph
    ensureAudioContext();
    const gain = gainNodeRef.current;
    const ctx = audioContextRef.current;

    // HTMLMediaElement volume stays at 1 — GainNode controls actual volume
    audio.volume = 1;
    if (gain) gain.gain.value = 0;

    // Resume AudioContext if suspended (required on iOS after user interaction)
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        if (!isMutedRef.current && gain) {
          // Gentle fade-in via GainNode
          let step = 0;
          const steps = 30;
          const stepMs = FADE_IN_MS / steps;
          fadeRef.current = setInterval(() => {
            step++;
            if (step >= steps) {
              gain.gain.value = TARGET_VOLUME;
              if (fadeRef.current) clearInterval(fadeRef.current);
              fadeRef.current = null;
            } else {
              gain.gain.value = (step / steps) * TARGET_VOLUME;
            }
          }, stepMs);
        } else if (gain) {
          // Muted — set target volume but it's inaudible (gain acts as mute)
          gain.gain.value = 0;
        }
      })
      .catch(() => {
        // Autoplay blocked — will retry on user interaction
        isInitializedRef.current = false;
      });
  }, [ensureAudioContext]);

  // Preload + attempt autoplay immediately
  useEffect(() => {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 1; // Leave at 1 — GainNode controls volume
      audio.crossOrigin = 'anonymous';
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
      // Resume AudioContext on user interaction (iOS requirement)
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
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
      const ctx = audioContextRef.current;
      if (ctx) {
        ctx.close();
      }
      isInitializedRef.current = false;
      audioRef.current = null;
      audioContextRef.current = null;
      gainNodeRef.current = null;
    };
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      localStorage.setItem(STORAGE_KEY, String(newMuted));
      const gain = gainNodeRef.current;
      if (gain) {
        gain.gain.value = newMuted ? 0 : TARGET_VOLUME;
      }
      return newMuted;
    });
  }, []);

  return { isMuted, toggleMute, isPlaying };
}
