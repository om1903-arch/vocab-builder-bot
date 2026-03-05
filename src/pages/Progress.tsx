import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Flame, Zap, BookOpen, BookMarked, Target, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const levelOrder = ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'proficient'];
const levelLabels: Record<string, string> = {
  beginner: 'مبتدئ A1',
  elementary: 'أساسي A2',
  intermediate: 'متوسط B1',
  upper_intermediate: 'فوق المتوسط B2',
  advanced: 'متقدم C1',
  proficient: 'احترافي C2',
};

// XP needed per level transition
const xpPerLevel: Record<string, number> = {
  beginner: 500,
  elementary: 1000,
  intermediate: 2000,
  upper_intermediate: 3500,
  advanced: 5000,
};

const ProgressPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ articles: 0, words: 0, xp: 0 });
  const [dailyMinutes, setDailyMinutes] = useState('30');
  const [dictCount, setDictCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [profileRes, progressRes, dictRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
      supabase.from('daily_progress')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(7),
      supabase.from('dictionary').select('id', { count: 'exact' }).eq('user_id', user!.id),
    ]);

    setProfile(profileRes.data);
    setDictCount(dictRes.count || 0);

    const days = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const progress = (progressRes.data || []).reverse().map((d: any) => ({
      day: days[new Date(d.date).getDay()],
      مقالات: d.articles_read,
      كلمات: d.words_saved,
      XP: d.xp_earned,
    }));
    setWeeklyData(progress);

    const allProgress = progressRes.data || [];
    setTotals({
      articles: allProgress.reduce((s: number, d: any) => s + d.articles_read, 0),
      words: allProgress.reduce((s: number, d: any) => s + d.words_saved, 0),
      xp: allProgress.reduce((s: number, d: any) => s + d.xp_earned, 0),
    });
  };

  // Calculate time to next level
  const getTimeEstimate = () => {
    if (!profile) return null;
    const currentIdx = levelOrder.indexOf(profile.level);
    if (currentIdx === -1 || currentIdx >= levelOrder.length - 1) return null;

    const nextLevel = levelOrder[currentIdx + 1];
    const xpNeeded = xpPerLevel[profile.level] || 2000;
    const currentXp = profile.xp || 0;
    const remaining = Math.max(0, xpNeeded - currentXp);

    const mins = parseInt(dailyMinutes);
    // Estimate: ~15 XP per 30 min session (reading + words + quizzes)
    const xpPerDay = (mins / 30) * 15;
    const daysNeeded = xpPerDay > 0 ? Math.ceil(remaining / xpPerDay) : 999;
    const weeksNeeded = Math.ceil(daysNeeded / 7);

    return {
      nextLevel: levelLabels[nextLevel],
      remaining,
      xpNeeded,
      daysNeeded,
      weeksNeeded,
      progress: Math.min(100, Math.round((currentXp / xpNeeded) * 100)),
    };
  };

  const estimate = getTimeEstimate();

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">تقدمك 📊</h1>

        {/* Level & Streak */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-sm text-muted-foreground">المستوى</div>
              <div className="text-lg font-bold mt-1">{levelLabels[profile?.level] || 'غير محدد'}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6 text-center">
              <Flame className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-sm text-muted-foreground">أيام متتالية</div>
              <div className="text-3xl font-bold mt-1">{profile?.streak || 0}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-sm text-muted-foreground">إجمالي XP</div>
              <div className="text-3xl font-bold mt-1">{profile?.xp || 0}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6 text-center">
              <BookMarked className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-sm text-muted-foreground">كلمات محفوظة</div>
              <div className="text-3xl font-bold mt-1">{dictCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Level progression estimate */}
        {estimate && (
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                تحليل الوصول للمستوى التالي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" dir="rtl">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">كم دقيقة تتعلم يومياً؟</span>
                <Select value={dailyMinutes} onValueChange={setDailyMinutes}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 دقيقة</SelectItem>
                    <SelectItem value="30">30 دقيقة</SelectItem>
                    <SelectItem value="45">45 دقيقة</SelectItem>
                    <SelectItem value="60">ساعة</SelectItem>
                    <SelectItem value="90">ساعة ونصف</SelectItem>
                    <SelectItem value="120">ساعتان</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">المستوى التالي: {estimate.nextLevel}</span>
                  <span className="text-sm font-mono text-primary">{estimate.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <motion.div
                    className="h-3 rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${estimate.progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center mt-3">
                  <div>
                    <div className="text-2xl font-bold text-primary">{estimate.daysNeeded}</div>
                    <div className="text-xs text-muted-foreground">يوم متبقي</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">{estimate.weeksNeeded}</div>
                    <div className="text-xs text-muted-foreground">أسبوع تقريباً</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  تحتاج {estimate.remaining} XP إضافية • بمعدل {dailyMinutes} دقيقة يومياً
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>نشاط الأسبوع</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="مقالات" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="كلمات" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد بيانات بعد. ابدأ بقراءة المقالات!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold">{totals.articles}</div>
              <div className="text-xs text-muted-foreground">مقالات هذا الأسبوع</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6 text-center">
              <BookMarked className="h-6 w-6 mx-auto mb-1 text-accent" />
              <div className="text-2xl font-bold">{totals.words}</div>
              <div className="text-xs text-muted-foreground">كلمات محفوظة</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6 text-center">
              <Zap className="h-6 w-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold">{totals.xp}</div>
              <div className="text-xs text-muted-foreground">XP مكتسبة</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProgressPage;
