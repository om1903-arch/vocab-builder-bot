import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Volume2, Pause, Square, Play, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  label?: string;
  compact?: boolean;
}

const AudioPlayer = ({ text, label, compact = false }: AudioPlayerProps) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const usingWebSpeech = useRef(false);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (usingWebSpeech.current) {
      speechSynthesis.cancel();
      usingWebSpeech.current = false;
    }
    setStatus('idle');
  }, []);

  const fallbackToWebSpeech = useCallback(() => {
    usingWebSpeech.current = true;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    u.onend = () => { setStatus('idle'); usingWebSpeech.current = false; };
    u.onerror = () => { setStatus('idle'); usingWebSpeech.current = false; };
    utteranceRef.current = u;
    speechSynthesis.speak(u);
    setStatus('playing');
  }, [text]);

  const play = useCallback(async () => {
    stopAll();
    setStatus('loading');
    
    try {
      // Try ElevenLabs first
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, voiceId: 'JBFqnCBsd6RMkjVDRZzb' }),
      });

      if (!response.ok) throw new Error('ElevenLabs failed');

      const blob = await response.blob();
      if (blob.size < 100) throw new Error('Empty audio');
      
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => setStatus('idle');
      audio.onerror = () => {
        // Fallback to web speech
        fallbackToWebSpeech();
      };

      await audio.play();
      setStatus('playing');
    } catch {
      // Fallback to Web Speech API
      fallbackToWebSpeech();
    }
  }, [text, stopAll, fallbackToWebSpeech]);

  const pause = useCallback(() => {
    if (usingWebSpeech.current) {
      speechSynthesis.pause();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (usingWebSpeech.current) {
      speechSynthesis.resume();
    } else if (audioRef.current) {
      audioRef.current.play();
    }
    setStatus('playing');
  }, []);

  if (compact) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={status === 'idle' ? play : stopAll} disabled={status === 'loading'}>
        {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'idle' && (
        <Button variant="outline" size="sm" onClick={play}>
          <Volume2 className="h-4 w-4 ml-2" />
          {label || 'استمع'}
        </Button>
      )}
      {status === 'loading' && (
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          جاري التحميل...
        </Button>
      )}
      {status === 'playing' && (
        <>
          <Button variant="outline" size="sm" onClick={pause}>
            <Pause className="h-4 w-4 ml-2" />
            إيقاف مؤقت
          </Button>
          <Button variant="destructive" size="sm" onClick={stopAll}>
            <Square className="h-4 w-4 ml-2" />
            إيقاف
          </Button>
        </>
      )}
      {status === 'paused' && (
        <>
          <Button variant="outline" size="sm" onClick={resume}>
            <Play className="h-4 w-4 ml-2" />
            استئناف
          </Button>
          <Button variant="destructive" size="sm" onClick={stopAll}>
            <Square className="h-4 w-4 ml-2" />
            إيقاف
          </Button>
        </>
      )}
    </div>
  );
};

export default AudioPlayer;
