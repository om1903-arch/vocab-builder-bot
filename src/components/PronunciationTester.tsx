import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PronunciationTesterProps {
  word: string;
}

export default function PronunciationTester({ word }: PronunciationTesterProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);

  let recognition: any = null;

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // Adjust based on language

      recognition.onresult = (event: any) => {
        const spokenWord = event.results[0][0].transcript.toLowerCase().trim();
        // Remove punctuation
        const cleanSpoken = spokenWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        const cleanTarget = word.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        
        setTranscript(cleanSpoken);
        
        // Simple Levenshtein distance based score or just exact match for now
        if (cleanSpoken === cleanTarget) {
          setScore(100);
          toast.success("نطق ممتاز! 👏");
        } else if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
          setScore(80);
          toast.success("نطق جيد، قارب على الصح! 👍");
        } else {
          setScore(30);
          toast.error(`سمعت: "${cleanSpoken}". حاول مرة أخرى!`);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        toast.error("حدث خطأ أثناء التعرف على الصوت");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    }
  }, [word]);

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error("متصفحك لا يدعم التعرف على الصوت");
      return;
    }

    if (isRecording) {
      recognition?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setScore(null);
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          const spokenWord = event.results[0][0].transcript.toLowerCase().trim();
          const cleanSpoken = spokenWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
          const cleanTarget = word.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
          
          setTranscript(cleanSpoken);
          
          if (cleanSpoken === cleanTarget) {
            setScore(100);
            toast.success("نطق ممتاز! 👏");
          } else if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
            setScore(80);
            toast.success("نطق جيد، قارب على الصح! 👍");
          } else {
            setScore(30);
            toast.error(`سمعت: "${cleanSpoken}". حاول مرة أخرى!`);
          }
        };

        recognition.onend = () => setIsRecording(false);
        recognition.onerror = () => {
          setIsRecording(false);
          toast.error("لم أتمكن من سماعك بوضوح");
        };

        recognition.start();
        setIsRecording(true);
      } catch (e) {
         console.error(e);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-2 p-3 bg-secondary/30 rounded-lg" dir="rtl">
      <div className="flex items-center gap-4">
        <Button 
          variant={isRecording ? "destructive" : "secondary"} 
          size="icon" 
          className="rounded-full h-10 w-10 shrink-0 shadow-sm"
          onClick={toggleRecording}
        >
          {isRecording ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5 text-primary" />}
        </Button>
        <div className="flex-1 text-sm font-medium">
          {isRecording ? "جاري الاستماع..." : "اضغط للتدرب على النطق"}
        </div>
      </div>
      
      {score !== null && (
        <div className="w-full flex items-center justify-between text-sm mt-1 px-1">
          <span className="text-muted-foreground" dir="ltr">{transcript}</span>
          <span className={`font-bold ${score >= 80 ? 'text-green-500' : 'text-red-500'}`}>
            {score}%
          </span>
        </div>
      )}
    </div>
  );
}