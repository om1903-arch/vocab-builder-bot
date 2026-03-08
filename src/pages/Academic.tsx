import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GraduationCap, BookOpen, Brain, Settings } from 'lucide-react';
import WordTooltip from '@/components/WordTooltip';
import GrammarTip from '@/components/GrammarTip';
import AudioPlayer from '@/components/AudioPlayer';
import ArticleQuiz from '@/components/ArticleQuiz';

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
  const [showConfig, setShowConfig] = useState(true);

  // Fetch faculties and user's saved faculty
  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;
      
      try {
        // Fetch faculties
        const { data: facultiesData, error: facultiesError } = await supabase
          .from('faculties')
          .select('*');
          
        if (facultiesError) throw facultiesError;
        setFaculties(facultiesData);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('faculty_id, level')
          .eq('user_id', user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        
        if (profileData?.faculty_id) {
          setSelectedFacultyId(profileData.faculty_id);
          const faculty = facultiesData.find(f => f.id === profileData.faculty_id);
          if (faculty) setSelectedStage(faculty.stage);
        }
        
        if (profileData?.level) {
          setLevel(profileData.level);
        }
      } catch (error: any) {
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
      const { error } = await supabase
        .from('profiles')
        .update({ faculty_id: facultyId })
        .eq('user_id', user.id);
        
      if (error) throw error;
      toast({ title: 'تم الحفظ', description: 'تم حفظ التخصص بنجاح' });
    } catch (error) {
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
    setShowConfig(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-academic-article', {
        body: { 
          faculty_id: selectedFacultyId, 
          level,
          topic: topic.trim() || undefined
        }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      setArticle(data);
      
      // Save article to DB
      if (user) {
        await supabase.from('articles').insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          level,
          category: 'Academic',
          key_words: data.key_words,
          is_academic: true
        });
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
    return text.split('\n').map((paragraph, i) => (
      <p key={i} className="mb-4">
        {paragraph.split(' ').map((word, j) => {
          const cleanWord = word.replace(/[.,!?()]/g, '');
          const isKeyword = article?.key_words?.some(kw => 
            cleanWord.toLowerCase().includes(kw.toLowerCase()) || 
            kw.toLowerCase().includes(cleanWord.toLowerCase())
          );
          
          return (
            <span key={j}>
              <WordTooltip word={cleanWord} context={paragraph}>
                <span className={`hover:text-primary transition-colors cursor-help ${isKeyword ? 'font-bold text-primary underline decoration-primary/30 underline-offset-4' : ''}`}>
                  {word}
                </span>
              </WordTooltip>
              {' '}
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
            تغيير التخصص
          </Button>
        )}
      </div>

      {showConfig && (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>إعدادات الدراسة</CardTitle>
            <CardDescription>اختر المرحلة والتخصص لتوليد محتوى يناسب احتياجاتك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">المرحلة الدراسية</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant={selectedStage === 'high_school' ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedStage('high_school');
                      setSelectedFacultyId(null);
                    }}
                    className="h-16"
                  >
                    الثانوية العامة
                  </Button>
                  <Button 
                    variant={selectedStage === 'university' ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedStage('university');
                      setSelectedFacultyId(null);
                    }}
                    className="h-16"
                  >
                    المرحلة الجامعية
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium">التخصص</label>
                <Select 
                  value={selectedFacultyId || undefined} 
                  onValueChange={(val) => {
                    setSelectedFacultyId(val);
                    saveFaculty(val);
                  }}
                  disabled={!selectedStage}
                >
                  <SelectTrigger className="h-16 text-lg">
                    <SelectValue placeholder="اختر التخصص..." />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties
                      .filter(f => f.stage === selectedStage)
                      .map(f => (
                        <SelectItem key={f.id} value={f.id} className="text-base py-3">
                          {f.name_ar} - {f.name_en}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-3">
                <label className="text-sm font-medium">مستوى اللغة الإنجليزية</label>
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
              
              <div className="space-y-3">
                <label className="text-sm font-medium">موضوع محدد (اختياري)</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: الخلية النباتية، العقود التجارية..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <Button 
              className="w-full h-12 text-lg mt-4 gap-2" 
              onClick={generateArticle}
              disabled={generating || !selectedFacultyId}
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  توليد مقال أكاديمي
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {generating && !showConfig && (
        <Card className="p-12 flex flex-col items-center justify-center space-y-6 glass-card">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Brain className="h-16 w-16 text-primary animate-pulse relative z-10" />
          </div>
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
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4" dir="ltr">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2" dir="rtl">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                      {faculties.find(f => f.id === selectedFacultyId)?.name_ar}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                      {level}
                    </span>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-serif text-foreground leading-tight">
                    {article.title}
                  </CardTitle>
                </div>
                <div className="shrink-0 flex gap-2">
                  <AudioPlayer text={article.content} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose dark:prose-invert max-w-none">
                <div className="article-text text-lg leading-relaxed text-foreground/90 font-serif" dir="ltr">
                  <GrammarTip text={article.content}>
                    <div className="space-y-4">
                      {renderContent(article.content)}
                    </div>
                  </GrammarTip>
                </div>
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
                    <WordTooltip key={i} word={kw} context={article.content}>
                      <span className="px-3 py-1.5 rounded-md bg-background border shadow-sm text-sm font-medium cursor-help hover:border-primary/50 transition-colors">
                        {kw}
                      </span>
                    </WordTooltip>
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
            onComplete={(xp) => {
              console.log(`Earned ${xp} XP from academic quiz!`);
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default AcademicPage;
