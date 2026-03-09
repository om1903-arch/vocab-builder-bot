import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Trash2, Search, Brain, Loader2, CheckCircle, XCircle, Award, BookMarked, Mic } from 'lucide-react';
import PronunciationTester from '@/components/PronunciationTester';

interface DictEntry {
  id: string;
  word: string;
  translation: string;
  context: string | null;
  word_type: string | null;
  created_at: string;
  review_count: number;
  ease_factor: number;
  interval_days: number;
}

interface QuizQuestion {
  id: number;
  type: string;
  question: string;
  options: string[];
  correct: number;
  word: string;
}

const MASTERY_THRESHOLD = 5; // interval_days >= 30 and review_count >= 5

const Dictionary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [masteredEntries, setMasteredEntries] = useState<DictEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizCurrent, setQuizCurrent] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizShowResult, setQuizShowResult] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    const { data } = await supabase
      .from('dictionary')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    const all = (data as unknown as DictEntry[]) || [];
    const active = all.filter(e => !(e.interval_days >= 30 && e.review_count >= MASTERY_THRESHOLD));
    const mastered = all.filter(e => e.interval_days >= 30 && e.review_count >= MASTERY_THRESHOLD);
    setEntries(active);
    setMasteredEntries(mastered);
    setLoading(false);
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('dictionary').delete().eq('id', id);
    setEntries(entries.filter(e => e.id !== id));
    setMasteredEntries(masteredEntries.filter(e => e.id !== id));
    toast({ title: 'تم الحذف' });
  };

  const speak = (word: string) => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  const startQuiz = async () => {
    if (entries.length < 4) {
      toast({ title: 'تحتاج 4 كلمات على الأقل', variant: 'destructive' });
      return;
    }
    setQuizLoading(true);
    try {
      const wordsForQuiz = entries.slice(0, 20).map(e => ({ word: e.word, translation: e.translation }));
      const { data, error } = await supabase.functions.invoke('generate-word-quiz', {
        body: { words: wordsForQuiz },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setQuizQuestions(data.questions || []);
      setQuizMode(true);
      setQuizCurrent(0);
      setQuizAnswers([]);
      setQuizFinished(false);
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    } finally {
      setQuizLoading(false);
    }
  };

  const selectQuizAnswer = (idx: number) => {
    if (quizShowResult) return;
    setQuizSelected(idx);
    setQuizShowResult(true);
    const newAnswers = [...quizAnswers, idx];
    setQuizAnswers(newAnswers);

    setTimeout(() => {
      setQuizShowResult(false);
      setQuizSelected(null);
      if (quizCurrent + 1 < quizQuestions.length) {
        setQuizCurrent(quizCurrent + 1);
      } else {
        finishQuiz(newAnswers);
      }
    }, 1500);
  };

  const finishQuiz = async (allAnswers: number[]) => {
    let score = 0;
    quizQuestions.forEach((q, i) => {
      if (q.correct === allAnswers[i]) score++;
    });
    setQuizFinished(true);

    const xpEarned = score * 3;
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('xp').eq('user_id', user.id).single();
      if (prof) {
        await supabase.from('profiles').update({ xp: (prof as any).xp + xpEarned }).eq('user_id', user.id);
      }
    }
    toast({ title: `نتيجة الاختبار: ${score}/${quizQuestions.length} 🎯`, description: `+${xpEarned} XP` });
  };

  const filtered = entries.filter(e =>
    e.word.toLowerCase().includes(search.toLowerCase()) ||
    e.translation.includes(search)
  );

  const filteredMastered = masteredEntries.filter(e =>
    e.word.toLowerCase().includes(search.toLowerCase()) ||
    e.translation.includes(search)
  );

  if (quizMode && !quizFinished && quizQuestions.length > 0) {
    const q = quizQuestions[quizCurrent];
    return (
      <Layout>
        <div className="space-y-6" dir="rtl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">اختبار المفردات 🧠</h1>
            <Button variant="ghost" onClick={() => setQuizMode(false)}>إلغاء</Button>
          </div>
          <div className="text-sm text-muted-foreground">{quizCurrent + 1}/{quizQuestions.length}</div>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="article-text text-base mb-4" dir="ltr">{q.question}</p>
              <div className="grid gap-2">
                {q.options.map((opt, i) => {
                  let variant: "outline" | "default" | "destructive" = "outline";
                  if (quizShowResult && i === q.correct) variant = "default";
                  else if (quizShowResult && i === quizSelected && i !== q.correct) variant = "destructive";
                  return (
                    <Button
                      key={i}
                      variant={variant}
                      className="justify-start text-left h-auto py-2 px-3"
                      onClick={() => selectQuizAnswer(i)}
                      disabled={quizShowResult}
                    >
                      <span className="font-mono text-xs text-muted-foreground ml-2">{String.fromCharCode(65 + i)}</span>
                      {opt}
                      {quizShowResult && i === q.correct && <CheckCircle className="h-4 w-4 mr-auto text-primary-foreground" />}
                      {quizShowResult && i === quizSelected && i !== q.correct && <XCircle className="h-4 w-4 mr-auto" />}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (quizMode && quizFinished) {
    const score = quizAnswers.filter((a, i) => quizQuestions[i] && a === quizQuestions[i].correct).length;
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 space-y-6" dir="rtl">
          <div className="text-6xl">{score === quizQuestions.length ? '🏆' : score >= quizQuestions.length / 2 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold">{score}/{quizQuestions.length} إجابة صحيحة</h2>
          <p className="text-muted-foreground">+{score * 3} XP</p>
          <div className="flex gap-3">
            <Button onClick={() => { setQuizMode(false); }}>العودة للقاموس</Button>
            <Button variant="outline" onClick={() => { setQuizFinished(false); setQuizCurrent(0); setQuizAnswers([]); startQuiz(); }}>
              اختبار جديد
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">القاموس الشخصي 📖</h1>
          <span className="text-muted-foreground">{entries.length + masteredEntries.length} كلمة</span>
        </div>

        <div className="flex gap-3" dir="rtl">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن كلمة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
              dir="rtl"
            />
          </div>
          <Button onClick={startQuiz} disabled={quizLoading || entries.length < 4}>
            {quizLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Brain className="h-4 w-4 ml-2" />}
            اختبار
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab} dir="rtl">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              <BookMarked className="h-4 w-4 ml-1" />
              قيد التعلم ({entries.length})
            </TabsTrigger>
            <TabsTrigger value="mastered" className="flex-1">
              <Award className="h-4 w-4 ml-1" />
              تم إتقانها ({masteredEntries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            <AnimatePresence>
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className="glass-card">
                    <CardContent className="py-4 flex items-center gap-4">
                      <Button variant="ghost" size="icon" className="shrink-0" onClick={() => speak(entry.word)}>
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold article-text text-lg" dir="ltr">{entry.word}</span>
                          {entry.word_type && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">{entry.word_type}</span>
                          )}
                          <span className="text-xs text-muted-foreground font-mono">
                            مراجعة {entry.review_count || 0}×
                          </span>
                        </div>
                        <div className="text-sm text-foreground mt-0.5">{entry.translation}</div>
                        {entry.context && (
                          <div className="text-xs text-muted-foreground mt-1 truncate article-text" dir="ltr">
                            "{entry.context.substring(0, 100)}..."
                          </div>
                        )}
                        <div className="mt-2 w-full max-w-sm">
                           <PronunciationTester word={entry.word} />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-20 text-muted-foreground">
                {search ? 'لا توجد نتائج' : 'لم تحفظ أي كلمات بعد. ابدأ بقراءة مقال واضغط على أي كلمة!'}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mastered" className="space-y-3 mt-4">
            <AnimatePresence>
              {filteredMastered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className="glass-card border-primary/20">
                    <CardContent className="py-4 flex items-center gap-4">
                      <Award className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold article-text text-lg" dir="ltr">{entry.word}</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">✓ متقنة</span>
                        </div>
                        <div className="text-sm text-foreground mt-0.5">{entry.translation}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0" onClick={() => speak(entry.word)}>
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredMastered.length === 0 && !loading && (
              <div className="text-center py-20 text-muted-foreground">
                لم تتقن أي كلمات بعد. استمر في المراجعة من خلال البطاقات التعليمية!
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dictionary;
