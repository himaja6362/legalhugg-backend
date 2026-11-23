import React, { useState, useEffect } from 'react';
import { Volume2, Pause, Play, Square, Loader2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

const LANG_BCP47: Record<SupportedLanguage, string[]> = {
  English: ['en-IN', 'en-US', 'en-GB', 'en'],
  Kannada: ['kn-IN', 'kn'],
  Hindi: ['hi-IN', 'hi'],
  Telugu: ['te-IN', 'te'],
};

// Global active speech controller so starting new speech stops any previous speech immediately
let activeStopCallback: (() => void) | null = null;
let activeAudioElement: HTMLAudioElement | null = null;

export function stopAllActiveSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  if (activeStopCallback) {
    activeStopCallback();
    activeStopCallback = null;
  }
}

interface VoiceSpeakerButtonProps {
  text: string;
  language: SupportedLanguage;
  label?: string;
}

export const VoiceSpeakerButton: React.FC<VoiceSpeakerButtonProps> = ({
  text,
  language,
  label,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [notice, setNotice] = useState<string | null>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    // Stop speech if language changes or component unmounts
    return () => {
      if (status !== 'idle') {
        stopAllActiveSpeech();
      }
    };
  }, [language]);

  async function handlePlay() {
    if (!text || !text.trim()) return;
    stopAllActiveSpeech();
    setNotice(null);

    activeStopCallback = () => {
      setStatus('idle');
    };

    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const targetCodes = LANG_BCP47[language];

    if (synth) {
      const voices = synth.getVoices();
      const matchingVoice = voices.find((v) =>
        targetCodes.some((code) => v.lang.toLowerCase().startsWith(code.toLowerCase()))
      );

      // If browser has a matching voice (or for English default), use Web Speech API
      if (matchingVoice || language === 'English') {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetCodes[0];
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
        utterance.onend = () => {
          setStatus('idle');
          activeStopCallback = null;
        };
        utterance.onerror = () => {
          setStatus('idle');
          activeStopCallback = null;
        };
        setStatus('playing');
        synth.speak(utterance);
        return;
      }
    }

    // Fallback to Server Gemini TTS for Kannada, Hindi, or Telugu when local OS lacks the voice pack
    setStatus('loading');
    try {
      const rawApiBase = String((import.meta as any).env?.VITE_API_BASE_URL || '').trim();
      const apiBase = /^https?:\/\//i.test(rawApiBase) ? rawApiBase.replace(/\/+$/, '') : '';
      const res = await fetch(`${apiBase}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      if (!res.ok) {
        throw new Error('TTS unavailable');
      }
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        activeAudioElement = audio;
        audio.onended = () => {
          setStatus('idle');
          activeAudioElement = null;
        };
        audio.onerror = () => {
          setStatus('idle');
          activeAudioElement = null;
        };
        setStatus('playing');
        await audio.play();
        return;
      }
    } catch (_err) {
      // If server TTS also fails, try browser speech synthesis with language tag anyway
      if (synth) {
        setNotice(t.voiceUnavailableMsg);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetCodes[0];
        utterance.onend = () => setStatus('idle');
        utterance.onerror = () => setStatus('idle');
        setStatus('playing');
        synth.speak(utterance);
      } else {
        setStatus('idle');
        setNotice(t.voiceUnavailableMsg);
      }
    }
  }

  function handlePause() {
    if (activeAudioElement) {
      activeAudioElement.pause();
      setStatus('paused');
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setStatus('paused');
    }
  }

  function handleResume() {
    if (activeAudioElement) {
      activeAudioElement.play();
      setStatus('playing');
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setStatus('playing');
    }
  }

  function handleStop() {
    stopAllActiveSpeech();
    setStatus('idle');
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {status === 'idle' && (
        <button
          type="button"
          onClick={handlePlay}
          title={t.voicePlay}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono border border-neutral-200 hover:border-neutral-950 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{label || t.voicePlay}</span>
        </button>
      )}

      {status === 'loading' && (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono border border-neutral-200 text-neutral-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>...</span>
        </span>
      )}

      {status === 'playing' && (
        <span className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={handlePause}
            title={t.voicePause}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-neutral-950 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Pause className="w-3 h-3" />
            <span>{t.voicePause}</span>
          </button>
          <button
            type="button"
            onClick={handleStop}
            title={t.voiceStop}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono border border-neutral-300 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <Square className="w-3 h-3" />
            <span>{t.voiceStop}</span>
          </button>
        </span>
      )}

      {status === 'paused' && (
        <span className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={handleResume}
            title={t.voiceResume}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-neutral-950 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3" />
            <span>{t.voiceResume}</span>
          </button>
          <button
            type="button"
            onClick={handleStop}
            title={t.voiceStop}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono border border-neutral-300 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <Square className="w-3 h-3" />
            <span>{t.voiceStop}</span>
          </button>
        </span>
      )}

      {notice && (
        <span className="text-[11px] font-mono text-neutral-400">{notice}</span>
      )}
    </span>
  );
};
