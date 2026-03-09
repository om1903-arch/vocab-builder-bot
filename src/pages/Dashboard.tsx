import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BookOpen, BookMarked, Flame, Zap, Target, ArrowLeft } from 'lucide-react';
import { DailyChallenges } from '@/components/DailyChallenges';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [todayProgress, setTodayProgress] = useState<any>(null);
  const [totalWords, setTotalWords] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [profileRes, progressRes, wordsRes, articlesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
      supabase.from('daily_progress').select('*').eq('user_id', user!.id).eq('date', new Date().toISOString().split('T')[0]).maybeSingle(),
      supabase.from('dictionary').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('is_read', true),
    ]);
    setProfile(profileRes.data);
    setTodayProgress(progressRes.data);
    setTotalWords(wordsRes.count || 0);
    setTotalArticles(articlesRes.count || 0);
  };

  const levelLabels: Record<string, string> = {
    beginner: 'مبتدئ A1',
    elementary: 'أساسي A2',
    intermediate: 'متوسط B1',
    upper_intermediate: 'فوق المتوسط B2',
    advanced: 'متقدم C1',
  };

  const stats = [
    { icon: Flame, label: 'أيام متتالية', value: profile?.streak || 0, color: 'text-accent' },
    { icon: Zap, label: 'نقاط XP', value: profile?.xp || 0, color: 'text-primary' },
    { icon: BookOpen, label: 'مقالات مقروءة', value: totalArticles, color: 'text-success' },
    { icon: BookMarked, label: 'كلمات محفوظة', value: totalWords, color: 'text-accent' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">
            مرحباً، {profile?.display_name || 'متعلم'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            مستواك الحالي: <span className="font-semibold text-primary">{levelLabels[profile?.level] || 'لم يُحدد'}</span>
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card">
                <CardContent className="pt-6 text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${color}`} />
                  <div className="text-3xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/articles')}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">اقرأ مقالاً جديداً</h3>
                <p className="text-sm text-muted-foreground">اختر مجالاً وابدأ القراءة</p>
              </div>
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="glass-card hover:border-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/dictionary')}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
                <BookMarked className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">راجع قاموسك</h3>
                <p className="text-sm text-muted-foreground">{totalWords} كلمة محفوظة</p>
              </div>
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Daily Challenges */}
        <DailyChallenges />

        {/* Level test CTA */}
        {profile?.level === 'beginner' && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">لم تحدد مستواك بعد!</h3>
                <p className="text-sm text-muted-foreground">خذ اختبار تحديد المستوى لتحصل على محتوى مناسب</p>
              </div>
              <Button onClick={() => navigate('/assessment')}>
                <Target className="h-4 w-4 ml-2" />
                اختبار المستوى
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
