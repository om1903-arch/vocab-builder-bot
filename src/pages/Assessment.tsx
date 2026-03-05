import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  difficulty: string;
}

const Assessment = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [level, setLevel] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const startTest = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-assessment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!resp.ok) throw new Error('Failed to generate test');
      const data = await resp.json();
      setQuestions(data.questions);
      setStarted(true);
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (current + 1 < questions.length) {
      setTimeout(() => setCurrent(current + 1), 300);
    } else {
      calculateLevel(newAnswers);
    }
  };

  const calculateLevel = async (allAnswers: number[]) => {
    let score = 0;
    questions.forEach((q, i) => {
      if (q.correct === allAnswers[i]) score++;
    });

    const pct = score / questions.length;
    let determinedLevel = 'beginner';
    if (pct >= 0.85) determinedLevel = 'advanced';
    else if (pct >= 0.7) determinedLevel = 'upper_intermediate';
    else if (pct >= 0.5) determinedLevel = 'intermediate';
    else if (pct >= 0.3) determinedLevel = 'elementary';

    setLevel(determinedLevel);
    setFinished(true);

    if (user) {
      await supabase
        .from('profiles')
        .update({ level: determinedLevel })
        .eq('user_id', user.id);
    }
  };

  const levelLabels: Record<string, string> = {
    beginner: 'مبتدئ (A1)',
    elementary: 'أساسي (A2)',
    intermediate: 'متوسط (B1)',
    upper_intermediate: 'فوق المتوسط (B2)',
    advanced: 'متقدم (C1)',
  };

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-lg glass-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">اختبار تحديد المستوى 📝</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                سنطرح عليك 15 سؤال لتحديد مستواك في اللغة الإنجليزية.
                <br />الأسئلة تتدرج من السهل إلى الصعب.
              </p>
              <Button onClick={startTest} disabled={loading} size="lg">
                {loading ? <Loader2 className="animate-spin ml-2" /> : null}
                {loading ? 'جاري التحضير...' : 'ابدأ الاختبار'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-lg glass-card text-center">
            <CardHeader>
              <CardTitle className="text-2xl">نتيجة الاختبار 🎉</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-6xl font-bold text-primary">{levelLabels[level]}</div>
              <p className="text-muted-foreground">
                أجبت على {answers.filter((a, i) => questions[i] && a === questions[i].correct).length} من {questions.length} إجابة صحيحة
              </p>
              <Button onClick={() => navigate('/dashboard')} size="lg">
                ابدأ التعلم 🚀
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>سؤال {current + 1} من {questions.length}</span>
          <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">{q.difficulty}</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Card className="glass-card">
              <CardContent className="pt-6">
                <p className="text-lg font-medium article-text mb-6">{q.question}</p>
                <div className="grid gap-3">
                  {q.options.map((opt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 article-text text-base"
                      onClick={() => selectAnswer(i)}
                    >
                      <span className="font-mono text-xs text-muted-foreground ml-3">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Assessment;
