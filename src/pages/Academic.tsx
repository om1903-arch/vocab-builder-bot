import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GraduationCap, BookOpen, Brain, Settings, Volume2, BookMarked } from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';
import ArticleQuiz from '@/components/ArticleQuiz';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Faculty {
  id: string;
  stage: 'high_school' | 'university';
  name_ar: string;
  name_en: string;
  description: string;
}

interface Article {
  title: string;
  content: string;
  key_words: string[];
}

// Inline word tooltip for academic page (simplified)
const AcademicWordTooltip = ({ word, sentence, articleId, savedWords, onSaved }: {
  word: string;
  sentence: string;
  articleId: string | null;
  savedWords: Set<string>;
  onSaved: (word: string) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<{ translation: string; word_type: string; example: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isSaved = savedWords.has(word.toLowerCase());

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
      onSaved(word);
      toast({ title: 'تمت الإضافة 📚', description: `"${word}" أُضيفت إلى قاموسك` });
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) loadTranslation(); }}>
      <PopoverTrigger asChild>
        <span className="cursor-help hover:text-primary transition-colors">{word}</span>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" dir="rtl" side="top">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg" dir="ltr">{word}</span>
                <span className="text-xs text-muted-foreground mr-2 font-mono">({data.word_type})</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                const u = new SpeechSynthesisUtterance(word);
                u.lang = 'en-US';
                speechSynthesis.speak(u);
              }}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm font-medium">{data.translation}</div>
            <div className="text-xs text-muted-foreground" dir="ltr">{data.example}</div>
            {!isSaved && (
              <Button size="sm" className="w-full" onClick={saveWord}>
                <BookMarked className="h-4 w-4 ml-2" />
                أضف للقاموس
              </Button>
            )}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

const AcademicPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedStage, setSelectedStage] = useState<'high_school' | 'university' | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [level, setLevel] = useState('intermediate');
  const [topic, setTopic] = useState('');
  
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;
      try {
        const { data: facultiesData, error: facultiesError } = await supabase
          .from('faculties')
          .select('*');
          
        if (facultiesError) throw facultiesError;
        setFaculties(facultiesData as Faculty[]);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('faculty_id, level')
          .eq('user_id', user.id)
          .single();
          
        if (profileData?.faculty_id) {
          setSelectedFacultyId(profileData.faculty_id);
          const faculty = facultiesData.find(f => f.id === profileData.faculty_id);
          if (faculty) setSelectedStage(faculty.stage as 'high_school' | 'university');
        }
        
        if (profileData?.level) {
          setLevel(profileData.level);
        }
      } catch {
        toast({ title: 'خطأ', description: 'حدث خطأ أثناء تحميل البيانات', variant: 'destructive' });
      } finally {
        setLoadingConfig(false);
      }
    };
    
    fetchConfig();
  }, [user, toast]);

  const saveFaculty = async (facultyId: string) => {
    if (!user) return;
    try {
      await supabase.from('profiles').update({ faculty_id: facultyId }).eq('user_id', user.id);
      toast({ title: 'تم الحفظ', description: 'تم حفظ التخصص بنجاح' });
    } catch {
      toast({ title: 'خطأ', description: 'لم يتم حفظ التخصص', variant: 'destructive' });
    }
  };

  const generateArticle = async () => {
    if (!selectedFacultyId) {
      toast({ title: 'تنبيه', description: 'الرجاء اختيار التخصص أولاً', variant: 'destructive' });
      return;
    }
    
    setGenerating(true);
    setArticle(null);
    setArticleId(null);
    setShowConfig(false);
    setSavedWords(new Set());
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-academic-article', {
        body: { faculty_id: selectedFacultyId, level, topic: topic.trim() || undefined }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      setArticle(data);
      
      if (user) {
        const { data: saved } = await supabase.from('articles').insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          level,
          category: 'Academic',
          key_words: data.key_words,
          is_academic: true
        }).select('id').single();
        
        if (saved) setArticleId(saved.id);
      }
    } catch (error: any) {
      toast({ title: 'خطأ', description: error.message || 'حدث خطأ أثناء توليد المقال', variant: 'destructive' });
      setShowConfig(true);
    } finally {
      setGenerating(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = (text: string) => {
    return text.split('\n\n').filter(Boolean).map((paragraph, i) => (
      <p key={i} className="mb-4 leading-relaxed">
        {paragraph.split(' ').map((word, j) => {
          const cleanWord = word.replace(/[.,!?();:]/g, '');
          const isKeyword = article?.key_words?.some(kw =>
            cleanWord.toLowerCase() === kw.toLowerCase()
          );
          
          return (
            <span key={j}>
              <span className={isKeyword ? 'font-semibold text-primary underline decoration-primary/30 underline-offset-4' : ''}>
                <AcademicWordTooltip
                  word={cleanWord}
                  sentence={paragraph}
                  articleId={articleId}
                  savedWords={savedWords}
                  onSaved={(w) => setSavedWords(prev => new Set([...prev, w.toLowerCase()]))}
                />
              </span>
              {word !== cleanWord ? word.slice(cleanWord.length) : ''}{' '}
            </span>
          );
        })}
      </p>
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">الدراسة الأكاديمية</h1>
            <p className="text-muted-foreground mt-1">مقالات ومصطلحات متخصصة حسب مجالك الدراسي</p>
          </div>
        </div>
        
        {!showConfig && article && (
          <Button variant="outline" onClick={() => setShowConfig(true)} className="gap-2">
            <Settings className="h-4 w-4" />
            تغيير الإعدادات
          </Button>
        )}
      </div>

      {showConfig && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>إعدادات الدراسة</CardTitle>
            <CardDescription>اختر المرحلة والتخصص لتوليد محتوى يناسب احتياجاتك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">المرحلة الدراسية</label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={selectedStage === 'high_school' ? 'default' : 'outline'}
                  onClick={() => { setSelectedStage('high_school'); setSelectedFacultyId(null); }}
                  className="h-16 text-base"
                >
                  🏫 الثانوية العامة
                </Button>
                <Button 
                  variant={selectedStage === 'university' ? 'default' : 'outline'}
                  onClick={() => { setSelectedStage('university'); setSelectedFacultyId(null); }}
                  className="h-16 text-base"
                >
                  🎓 المرحلة الجامعية
                </Button>
              </div>
            </div>
            
            {selectedStage && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  {selectedStage === 'high_school' ? 'المسار الدراسي' : 'الكلية / التخصص'}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {faculties
                    .filter(f => f.stage === selectedStage)
                    .map(f => (
                      <button
                        key={f.id}
                        onClick={() => { setSelectedFacultyId(f.id); saveFaculty(f.id); }}
                        className={`p-3 rounded-lg border text-sm font-medium text-right transition-all ${
                          selectedFacultyId === f.id 
                            ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                            : 'bg-card border-border hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {f.name_ar}
                        <span className="block text-xs opacity-70 font-normal mt-0.5">{f.name_en}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {selectedFacultyId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">مستوى اللغة</label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">مبتدئ (A1-A2)</SelectItem>
                      <SelectItem value="elementary">أساسي (A2-B1)</SelectItem>
                      <SelectItem value="intermediate">متوسط (B1-B2)</SelectItem>
                      <SelectItem value="upper_intermediate">فوق المتوسط (B2-C1)</SelectItem>
                      <SelectItem value="advanced">متقدم (C1)</SelectItem>
                      <SelectItem value="proficient">محترف (C2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">موضوع محدد (اختياري)</label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="مثال: الخلية النباتية، العقود..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            )}

            <Button 
              className="w-full h-12 text-base gap-2" 
              onClick={generateArticle}
              disabled={generating || !selectedFacultyId}
            >
              {generating ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> جاري التوليد...</>
              ) : (
                <><Brain className="h-5 w-5" /> توليد مقال أكاديمي</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {generating && !showConfig && (
        <Card className="p-12 flex flex-col items-center justify-center space-y-4 glass-card">
          <Brain className="h-16 w-16 text-primary animate-pulse" />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">جاري إعداد المحتوى الأكاديمي...</h3>
            <p className="text-muted-foreground">نقوم باختيار المصطلحات العلمية المناسبة لتخصصك</p>
          </div>
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </Card>
      )}

      {article && !generating && (
        <div className="space-y-6 animate-fade-in pb-20">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2" dir="rtl">
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    {faculties.find(f => f.id === selectedFacultyId)?.name_ar}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground text-xs font-medium border border-accent/20">
                    أكاديمي 🎓
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-2xl font-serif" dir="ltr">{article.title}</CardTitle>
                  <AudioPlayer text={article.content} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="article-text text-lg leading-loose font-serif" dir="ltr">
                {renderContent(article.content)}
              </div>
            </CardContent>
          </Card>

          {article.key_words && article.key_words.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  المصطلحات الأكاديمية الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2" dir="ltr">
                  {article.key_words.map((kw, i) => (
                    <AcademicWordTooltip
                      key={i}
                      word={kw}
                      sentence={article.content.split('\n')[0]}
                      articleId={articleId}
                      savedWords={savedWords}
                      onSaved={(w) => setSavedWords(prev => new Set([...prev, w.toLowerCase()]))}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <ArticleQuiz 
            title={article.title} 
            content={article.content} 
            difficulty="hard"
            keyWords={article.key_words}
            onComplete={(xp) => console.log(`+${xp} XP from academic quiz`)} 
          />
        </div>
      )}
    </div>
  );
};

export default AcademicPage;
