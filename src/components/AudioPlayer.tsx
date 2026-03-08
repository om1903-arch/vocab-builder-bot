import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, Pause, Square, Play, Loader2, Gauge } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  label?: string;
  compact?: boolean;
  onCharIndex?: (charIndex: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
}

const AudioPlayer = ({ text, label, compact = false, onCharIndex, onPlayStateChange }: AudioPlayerProps) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [speed, setSpeed] = useState(0.85);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const usingWebSpeech = useRef(false);
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateStatus = useCallback((s: 'idle' | 'loading' | 'playing' | 'paused') => {
    setStatus(s);
    onPlayStateChange?.(s === 'playing');
    if (s === 'idle' || s === 'loading') {
      onCharIndex?.(-1);
    }
  }, [onPlayStateChange, onCharIndex]);

  const stopWordTimer = useCallback(() => {
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
  }, []);

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
    stopWordTimer();
    updateStatus('idle');
  }, [updateStatus, stopWordTimer]);

  const startWordEstimation = useCallback((audio: HTMLAudioElement) => {
    // Estimate word positions based on audio time
    const words = text.split(/(\s+)/);
    const charPositions: number[] = [];
    let pos = 0;
    for (const w of words) {
      charPositions.push(pos);
      pos += w.length;
    }
    const totalChars = text.length;

    const tick = () => {
      if (!audio || audio.paused || !audio.duration) return;
      const progress = audio.currentTime / audio.duration;
      const estimatedChar = Math.floor(progress * totalChars);
      onCharIndex?.(estimatedChar);
    };

    wordTimerRef.current = setInterval(tick, 150);
  }, [text, onCharIndex]);

  const fallbackToWebSpeech = useCallback(() => {
    usingWebSpeech.current = true;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = speed;
    u.pitch = 0.95;

    // Try to find a calm, stable voice
    const voices = speechSynthesis.getVoices();
    const preferredVoices = [
      'Google UK English Female',
      'Google US English',
      'Samantha',           // macOS
      'Karen',              // macOS Australian
      'Moira',              // macOS Irish
      'Microsoft Zira',     // Windows
      'Microsoft Hazel',    // Windows UK
    ];
    
    const selectedVoice = preferredVoices
      .map(name => voices.find(v => v.name.includes(name)))
      .find(v => v !== undefined);
    
    if (selectedVoice) {
      u.voice = selectedVoice;
    } else {
      // Fallback: pick any female English voice for calmer tone
      const femaleVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen'))
      );
      if (femaleVoice) u.voice = femaleVoice;
    }

    if (onCharIndex) {
      u.onboundary = (e: SpeechSynthesisEvent) => {
        if (e.name === 'word') {
          onCharIndex(e.charIndex);
        }
      };
    }

    u.onend = () => { updateStatus('idle'); usingWebSpeech.current = false; };
    u.onerror = () => { updateStatus('idle'); usingWebSpeech.current = false; };
    utteranceRef.current = u;
    speechSynthesis.speak(u);
    updateStatus('playing');
  }, [text, onCharIndex, updateStatus]);

  const play = useCallback(async () => {
    stopAll();
    updateStatus('loading');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s max wait

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, voiceId: 'JBFqnCBsd6RMkjVDRZzb' }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) throw new Error('ElevenLabs failed');

      const blob = await response.blob();
      if (blob.size < 100) throw new Error('Empty audio');
      
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => { stopWordTimer(); updateStatus('idle'); };
      audio.onerror = () => { stopWordTimer(); fallbackToWebSpeech(); };
      audio.onpause = () => { stopWordTimer(); };
      audio.onplay = () => { if (onCharIndex) startWordEstimation(audio); };

      await audio.play();
      updateStatus('playing');
      if (onCharIndex) startWordEstimation(audio);
    } catch {
      clearTimeout(timeout);
      fallbackToWebSpeech();
    }
  }, [text, stopAll, fallbackToWebSpeech, updateStatus, onCharIndex, startWordEstimation, stopWordTimer]);

  const pause = useCallback(() => {
    if (usingWebSpeech.current) {
      speechSynthesis.pause();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    stopWordTimer();
    updateStatus('paused');
  }, [updateStatus, stopWordTimer]);

  const resume = useCallback(() => {
    if (usingWebSpeech.current) {
      speechSynthesis.resume();
    } else if (audioRef.current) {
      audioRef.current.play();
    }
    updateStatus('playing');
  }, [updateStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWordTimer();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (usingWebSpeech.current) { speechSynthesis.cancel(); }
    };
  }, [stopWordTimer]);

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
