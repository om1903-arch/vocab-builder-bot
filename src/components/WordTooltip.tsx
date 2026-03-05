import { useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Volume2, BookMarked, Check } from 'lucide-react';

interface WordTooltipProps {
  word: string;
  sentence: string;
  articleId: string | null;
  isSaved: boolean;
  onSaved: (word: string) => void;
  children: ReactNode;
}

interface TranslationData {
  translation: string;
  word_type: string;
  example: string;
  pronunciation: string;
}

const WordTooltip = ({ word, sentence, articleId, isSaved, onSaved, children }: WordTooltipProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<TranslationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [open, setOpen] = useState(false);

  const loadTranslation = async () => {
    if (data) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('translate-word', {
        body: { word, sentence },
      });
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (e: any) {
      toast({ title: 'خطأ في الترجمة', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const saveWord = async () => {
    if (!user || !data) return;
    try {
      await supabase.from('dictionary').insert({
        user_id: user.id,
        word,
        translation: data.translation,
        context: sentence,
        word_type: data.word_type,
        article_id: articleId,
      });

      // Update daily progress
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase.from('daily_progress')
          .update({ words_saved: existing.words_saved + 1, xp_earned: existing.xp_earned + 2 })
          .eq('id', existing.id);
      } else {
        await supabase.from('daily_progress').insert({
          user_id: user.id, date: today, words_saved: 1, xp_earned: 2,
        });
      }

      setSaved(true);
      onSaved(word);
      toast({ title: 'تمت الإضافة 📚', description: `"${word}" أُضيفت إلى قاموسك` });
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    }
  };

  const speak = () => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) loadTranslation(); }}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-0" dir="rtl" side="top">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg article-text" dir="ltr">{word}</span>
                <span className="text-xs text-muted-foreground mr-2 font-mono">({data.word_type})</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={speak}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm font-medium text-foreground">{data.translation}</div>
            {data.pronunciation && (
              <div className="text-xs text-muted-foreground font-mono" dir="ltr">/{data.pronunciation}/</div>
            )}
            <div className="text-xs text-muted-foreground article-text border-t border-border pt-2" dir="ltr">
              {data.example}
            </div>
            {!saved ? (
              <Button size="sm" className="w-full" onClick={saveWord}>
                <BookMarked className="h-4 w-4 ml-2" />
                أضف للقاموس
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-success justify-center">
                <Check className="h-4 w-4" />
                <span>محفوظة في القاموس</span>
              </div>
            )}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

export default WordTooltip;
