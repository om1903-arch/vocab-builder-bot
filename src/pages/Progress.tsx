import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Flame, Zap, BookOpen, BookMarked, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProgressPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ articles: 0, words: 0, xp: 0 });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [profileRes, progressRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
      supabase.from('daily_progress')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(7),
    ]);

    setProfile(profileRes.data);

    const days = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const progress = (progressRes.data || []).reverse().map((d: any) => ({
      day: days[new Date(d.date).getDay()],
      مقالات: d.articles_read,
      كلمات: d.words_saved,
      XP: d.xp_earned,
    }));
    setWeeklyData(progress);

    // Calculate totals
    const allProgress = progressRes.data || [];
    setTotals({
      articles: allProgress.reduce((s: number, d: any) => s + d.articles_read, 0),
      words: allProgress.reduce((s: number, d: any) => s + d.words_saved, 0),
      xp: allProgress.reduce((s: number, d: any) => s + d.xp_earned, 0),
    });
  };

  const levelLabels: Record<string, string> = {
    beginner: 'مبتدئ A1',
    elementary: 'أساسي A2',
    intermediate: 'متوسط B1',
    upper_intermediate: 'فوق المتوسط B2',
    advanced: 'متقدم C1',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">تقدمك 📊</h1>

        {/* Level & Streak */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          <Card className="glass-card col-span-2 md:col-span-1">
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-sm text-muted-foreground">إجمالي XP</div>
              <div className="text-3xl font-bold mt-1">{profile?.xp || 0}</div>
            </CardContent>
          </Card>
        </div>

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
