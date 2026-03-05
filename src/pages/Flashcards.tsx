import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ThumbsUp, ThumbsDown, Zap, Volume2, BookOpen } from 'lucide-react';

interface FlashcardEntry {
  id: string;
  word: string;
  translation: string;
  context: string | null;
  word_type: string | null;
  next_review: string;
  review_count: number;
  ease_factor: number;
  interval_days: number;
}

const Flashcards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<FlashcardEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionDone, setSessionDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadDueCards();
  }, [user]);

  const loadDueCards = async () => {
    const { data } = await supabase
      .from('dictionary')
      .select('*')
      .eq('user_id', user!.id)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true })
      .limit(20);

    const typed = (data as unknown as FlashcardEntry[]) || [];
    setCards(typed);
    setLoading(false);
    if (typed.length === 0) setSessionDone(true);
  };

  const speak = (word: string) => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  const handleResponse = async (quality: number) => {
    // quality: 0=forgot, 1=hard, 2=good, 3=easy
    const card = cards[currentIndex];
    let { ease_factor, interval_days, review_count } = card;

    if (quality < 2) {
      // Reset
      interval_days = 0;
      ease_factor = Math.max(1.3, ease_factor - 0.2);
    } else {
      if (interval_days === 0) {
        interval_days = 1;
      } else if (interval_days === 1) {
        interval_days = 3;
      } else {
        interval_days = Math.round(interval_days * ease_factor);
      }
      if (quality === 3) ease_factor = Math.min(3.0, ease_factor + 0.15);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + (interval_days || 0.01));

    await supabase.from('dictionary').update({
      next_review: nextReview.toISOString(),
      review_count: review_count + 1,
      ease_factor,
      interval_days,
    } as any).eq('id', card.id);

    if (quality >= 2) setCorrect(c => c + 1);
    setTotal(t => t + 1);

    // Next card
    setFlipped(false);
    if (currentIndex + 1 < cards.length) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 200);
    } else {
      setSessionDone(true);
      // Award XP
      if (user) {
        const xpEarned = (correct + (quality >= 2 ? 1 : 0)) * 2;
        const { data: prof } = await supabase.from('profiles').select('xp').eq('user_id', user.id).single();
        if (prof) {
          await supabase.from('profiles').update({ xp: (prof as any).xp + xpEarned }).eq('user_id', user.id);
        }
        toast({ title: `جلسة مراجعة مكتملة! 🎉`, description: `+${xpEarned} XP` });
      }
    }
  };

  const card = cards[currentIndex];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (sessionDone) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 space-y-6" dir="rtl">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">🎯</motion.div>
          <h2 className="text-2xl font-bold">
            {cards.length === 0 ? 'لا توجد بطاقات للمراجعة الآن!' : 'أحسنت! أنهيت جلسة المراجعة'}
          </h2>
          {total > 0 && (
            <p className="text-muted-foreground">
              أجبت على {correct} من {total} بشكل صحيح ({Math.round((correct / total) * 100)}%)
            </p>
          )}
          {cards.length === 0 && (
            <p className="text-muted-foreground">احفظ كلمات من المقالات لتبدأ المراجعة</p>
          )}
          <Button onClick={() => { setSessionDone(false); setCurrentIndex(0); setCorrect(0); setTotal(0); loadDueCards(); }}>
            <RotateCcw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">بطاقات المراجعة 🃏</h1>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md perspective-1000">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex + (flipped ? '-flipped' : '')}
                initial={{ rotateY: flipped ? 90 : 0, opacity: flipped ? 0 : 1 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="glass-card cursor-pointer min-h-[280px] flex items-center justify-center"
                  onClick={() => setFlipped(!flipped)}
                >
                  <CardContent className="text-center py-10 w-full">
                    {!flipped ? (
                      <div className="space-y-4">
                        <div className="text-4xl font-bold article-text" dir="ltr">{card.word}</div>
                        {card.word_type && (
                          <span className="text-xs bg-secondary px-3 py-1 rounded-full font-mono">{card.word_type}</span>
                        )}
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); speak(card.word); }}>
                          <Volume2 className="h-5 w-5" />
                        </Button>
                        <p className="text-sm text-muted-foreground mt-6">اضغط لرؤية الإجابة</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-3xl font-bold text-primary">{card.translation}</div>
                        <div className="text-lg article-text" dir="ltr">{card.word}</div>
                        {card.context && (
                          <p className="text-sm text-muted-foreground article-text mt-4" dir="ltr">
                            "{card.context.substring(0, 120)}..."
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-3"
          >
            <Button variant="destructive" onClick={() => handleResponse(0)} className="flex-1 max-w-[120px]">
              <ThumbsDown className="h-4 w-4 ml-1" />
              نسيت
            </Button>
            <Button variant="outline" onClick={() => handleResponse(1)} className="flex-1 max-w-[120px]">
              صعب
            </Button>
            <Button variant="secondary" onClick={() => handleResponse(2)} className="flex-1 max-w-[120px]">
              جيد
            </Button>
            <Button onClick={() => handleResponse(3)} className="flex-1 max-w-[120px]">
              <ThumbsUp className="h-4 w-4 ml-1" />
              سهل
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Flashcards;
