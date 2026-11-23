import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

const SPEECH_RECOGNITION_LANG: Record<SupportedLanguage, string> = {
  English: 'en-IN',
  Kannada: 'kn-IN',
  Hindi: 'hi-IN',
  Telugu: 'te-IN',
};

interface VoiceMicButtonProps {
  language: SupportedLanguage;
  onTranscript: (recognizedText: string) => void;
  onError?: (errorMsg: string) => void;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  language,
  onTranscript,
  onError,
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    // Stop recognition if language changes or component unmounts
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_e) {
          // Ignore stop errors
        }
      }
    };
  }, [language]);

  function toggleListening() {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_e) {
          // Ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (onError) onError(t.voiceMicUnsupported);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = SPEECH_RECOGNITION_LANG[language];
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          onTranscript(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          if (onError) onError(t.voiceMicPermissionDenied);
        } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
          if (onError) onError(`Speech recognition error (${event.error}).`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (_err) {
      setIsListening(false);
      if (onError) onError(t.voiceMicUnsupported);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? t.voiceMicListening : t.voiceMicStart}
      className={`px-3.5 py-3 border text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
        isListening
          ? 'bg-neutral-950 text-white border-neutral-950'
          : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-950 hover:text-neutral-950'
      }`}
    >
      {isListening ? (
        <>
          <MicOff className="w-4 h-4 animate-pulse" />
          <span className="hidden sm:inline">{t.voiceMicListening}</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" />
          <span className="hidden sm:inline">{t.voiceMicStart}</span>
        </>
      )}
    </button>
  );
};
