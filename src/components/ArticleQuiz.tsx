import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Brain } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  type?: string;
}

interface ArticleQuizProps {
  title: string;
  content: string;
  difficulty?: 'normal' | 'hard';
  keyWords?: string[];
  onComplete: (xp: number) => void;
}

const ArticleQuiz = ({ title, content, onComplete }: ArticleQuizProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { title, content },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions);
      setStarted(true);
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);

    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);

    setTimeout(() => {
      setShowResult(false);
      setSelected(null);
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
      } else {
        finishQuiz(newAnswers);
      }
    }, 1500);
  };

  const finishQuiz = async (allAnswers: number[]) => {
    let score = 0;
    questions.forEach((q, i) => {
      if (q.correct === allAnswers[i]) score++;
    });

    const xpEarned = score * 5;
    setFinished(true);

    if (user) {
      const { data: prof } = await supabase.from('profiles').select('xp').eq('user_id', user.id).single();
      if (prof) {
        await supabase.from('profiles').update({ xp: (prof as any).xp + xpEarned }).eq('user_id', user.id);
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase.from('daily_progress')
          .update({ xp_earned: (existing as any).xp_earned + xpEarned })
          .eq('id', existing.id);
      }
    }

    onComplete(xpEarned);
    toast({
      title: `نتيجة الاختبار: ${score}/${questions.length} 🎯`,
      description: `+${xpEarned} XP`,
    });
  };

  if (!started) {
    return (
      <Card className="border-primary/30 bg-primary/5 mt-6">
        <CardContent className="pt-6 flex items-center justify-between" dir="rtl">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">اختبار فهم المقال</h3>
              <p className="text-sm text-muted-foreground">أجب على الأسئلة واكسب XP إضافي!</p>
            </div>
          </div>
          <Button onClick={startQuiz} disabled={loading} size="sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ابدأ'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (finished) {
    const score = answers.filter((a, i) => questions[i] && a === questions[i].correct).length;
    return (
      <Card className="border-primary/30 bg-primary/5 mt-6" dir="rtl">
        <CardContent className="pt-6 text-center space-y-2">
          <div className="text-4xl">{score === questions.length ? '🏆' : score >= questions.length / 2 ? '👍' : '📚'}</div>
          <p className="font-semibold">{score}/{questions.length} إجابة صحيحة</p>
          <p className="text-sm text-muted-foreground">+{score * 5} XP</p>
        </CardContent>
      </Card>
    );
  }

  const q = questions[current];

  return (
    <Card className="mt-6 glass-card" dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">اختبار الفهم</CardTitle>
          <span className="text-sm text-muted-foreground">{current + 1}/{questions.length}</span>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="article-text text-base mb-4" dir="ltr">{q.question}</p>
            <div className="grid gap-2">
              {q.options.map((opt, i) => {
                let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
                if (showResult && i === q.correct) variant = "default";
                else if (showResult && i === selected && i !== q.correct) variant = "destructive";

                return (
                  <Button
                    key={i}
                    variant={variant}
                    className="justify-start text-left h-auto py-2 px-3 article-text"
                    onClick={() => selectAnswer(i)}
                    disabled={showResult}
                  >
                    <span className="font-mono text-xs text-muted-foreground ml-2">{String.fromCharCode(65 + i)}</span>
                    {opt}
                    {showResult && i === q.correct && <CheckCircle className="h-4 w-4 mr-auto text-primary-foreground" />}
                    {showResult && i === selected && i !== q.correct && <XCircle className="h-4 w-4 mr-auto" />}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ArticleQuiz;
