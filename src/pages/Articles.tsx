import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, Cpu, FlaskConical, Trophy, Palette, Heart, Briefcase, Plane, Landmark, Leaf, UtensilsCrossed, BookOpen as BookOpenIcon } from 'lucide-react';
import WordTooltip from '@/components/WordTooltip';
import GrammarTip from '@/components/GrammarTip';
import ArticleQuiz from '@/components/ArticleQuiz';
import AudioPlayer from '@/components/AudioPlayer';

const categories = [
  { id: 'technology', label: 'تكنولوجيا', icon: Cpu, color: 'text-primary' },
  { id: 'science', label: 'علوم', icon: FlaskConical, color: 'text-green-500' },
  { id: 'sport', label: 'رياضة', icon: Trophy, color: 'text-yellow-500' },
  { id: 'culture', label: 'ثقافة', icon: Palette, color: 'text-purple-500' },
  { id: 'health', label: 'صحة', icon: Heart, color: 'text-red-500' },
  { id: 'business', label: 'أعمال', icon: Briefcase, color: 'text-blue-500' },
  { id: 'travel', label: 'سفر', icon: Plane, color: 'text-cyan-500' },
  { id: 'history', label: 'تاريخ', icon: Landmark, color: 'text-amber-600' },
  { id: 'environment', label: 'بيئة', icon: Leaf, color: 'text-emerald-500' },
  { id: 'food', label: 'طعام', icon: UtensilsCrossed, color: 'text-orange-500' },
];

const levels = [
  { id: 'beginner', label: 'A1 - مبتدئ' },
  { id: 'elementary', label: 'A2 - أساسي' },
  { id: 'intermediate', label: 'B1 - متوسط' },
  { id: 'upper_intermediate', label: 'B2 - فوق المتوسط' },
  { id: 'advanced', label: 'C1 - متقدم' },
  { id: 'proficient', label: 'C2 - احترافي' },
];

interface ArticleData {
  title: string;
  content: string;
  key_words: string[];
}

const Articles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isRead, setIsRead] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('level').eq('user_id', user.id).single();
    setProfile(data);
    if (data && !selectedLevel) setSelectedLevel(data.level);
    return data;
  };

  const generateArticle = async (category: string) => {
    setSelectedCategory(category);
    setLoading(true);
    setArticle(null);
    setIsRead(false);
    try {
      const level = selectedLevel || profile?.level || 'intermediate';

      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: { category, level },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setArticle(data);

      const { data: saved } = await supabase.from('articles').insert({
        user_id: user!.id,
        title: data.title,
        content: data.content,
        category,
        level,
        key_words: data.key_words,
      }).select('id').single();

      if (saved) setArticleId(saved.id);

      const { data: dict } = await supabase.from('dictionary').select('word').eq('user_id', user!.id);
      if (dict) setSavedWords(dict.map((d: any) => d.word.toLowerCase()));
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // speakText removed - using AudioPlayer component instead

  const onWordSaved = (word: string) => {
    setSavedWords(prev => [...prev, word.toLowerCase()]);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 1) {
      const text = selection.toString().trim();
      // Only set if it contains spaces (phrase/sentence)
      if (text.includes(' ')) {
        setSelectedText(text);
      }
    }
  };

  const markAsRead = async () => {
    if (!articleId || !user) return;
    await supabase.from('articles').update({ is_read: true }).eq('id', articleId);
    setIsRead(true);

    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      await supabase.from('daily_progress')
        .update({ articles_read: existing.articles_read + 1, xp_earned: existing.xp_earned + 10 })
        .eq('id', existing.id);
    } else {
      await supabase.from('daily_progress').insert({
        user_id: user.id, date: today, articles_read: 1, xp_earned: 10,
      });
    }

    const { data: profData } = await supabase.from('profiles').select('xp').eq('user_id', user.id).single();
    if (profData) {
      await supabase.from('profiles').update({ xp: (profData as any).xp + 10 }).eq('user_id', user.id);
    }

    toast({ title: 'أحسنت! 🎉', description: '+10 XP لقراءة المقال' });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">المقالات 📖</h1>
        <p className="text-muted-foreground">اختر مجالاً ومستوى وسنولّد لك مقالاً مخصصاً</p>

        {/* Level selector */}
        <div className="flex items-center gap-3" dir="rtl">
          <span className="text-sm font-medium">المستوى:</span>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="اختر المستوى" />
            </SelectTrigger>
            <SelectContent>
              {levels.map(l => (
                <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categories.map(({ id, label, icon: Icon, color }) => (
            <Button
              key={id}
              variant={selectedCategory === id ? 'default' : 'outline'}
              className="h-auto py-3 flex-col gap-1.5 text-sm"
              onClick={() => generateArticle(id)}
              disabled={loading}
            >
              <Icon className={`h-5 w-5 ${selectedCategory === id ? '' : color}`} />
              <span>{label}</span>
            </Button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-3 text-muted-foreground">جاري توليد المقال...</span>
          </div>
        )}

        {article && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="article-text text-2xl">{article.title}</CardTitle>
                  <div className="flex gap-2 items-center">
                    <AudioPlayer text={article.title} compact />
                    <Button variant="ghost" size="icon" onClick={() => selectedCategory && generateArticle(selectedCategory)}>
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2" dir="ltr">
                  {article.key_words.map((kw) => (
                    <span key={kw} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-mono">
                      {kw}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="article-text space-y-4" dir="ltr" onMouseUp={handleTextSelection}>
                  {article.content.split('\n\n').map((para, pi) => (
                    <GrammarTip key={pi} sentence={para}>
                      <p className="cursor-help hover:bg-primary/5 rounded p-1 -m-1 transition-colors">
                        {para.split(/(\s+)/).map((token, ti) => {
                          const cleanWord = token.replace(/[^a-zA-Z'-]/g, '');
                          if (!cleanWord) return <span key={ti}>{token}</span>;
                          
                          const isSaved = savedWords.includes(cleanWord.toLowerCase());
                          return (
                            <WordTooltip
                              key={ti}
                              word={cleanWord}
                              sentence={para}
                              articleId={articleId}
                              isSaved={isSaved}
                              onSaved={onWordSaved}
                            >
                              <span 
                                className={`word-highlight ${isSaved ? 'word-saved' : ''}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {token}
                              </span>
                            </WordTooltip>
                          );
                        })}
                      </p>
                    </GrammarTip>
                  ))}
                </div>

                {/* Selected text translation */}
                {selectedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <Card className="border-accent/30 bg-accent/5">
                      <CardContent className="py-3 flex items-center justify-between" dir="rtl">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <BookOpenIcon className="h-4 w-4 text-accent shrink-0" />
                          <span className="text-sm truncate article-text" dir="ltr">"{selectedText}"</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <WordTooltip
                            word={selectedText}
                            sentence={selectedText}
                            articleId={articleId}
                            isSaved={false}
                            onSaved={onWordSaved}
                          >
                            <Button size="sm" variant="outline">ترجم الجملة</Button>
                          </WordTooltip>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedText('')}>✕</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <div className="flex gap-3 mt-8 justify-end items-center flex-wrap" dir="rtl">
                  {!isRead && (
                    <Button onClick={markAsRead}>أنهيت القراءة ✅</Button>
                  )}
                  <AudioPlayer text={article.content} label="استمع للمقال" />
                </div>

                {isRead && (
                  <ArticleQuiz
                    title={article.title}
                    content={article.content}
                    onComplete={(xp) => {}}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Articles;
