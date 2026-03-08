import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, BookOpen, GraduationCap } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#db2777', '#0891b2'];

export default function AcademicStats() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Fetch academic words from dictionary (joined with articles)
        const { data: dictData, error: dictError } = await supabase
          .from('dictionary')
          .select(`
            id, 
            word, 
            created_at, 
            article_id
          `)
          .eq('user_id', user.id);

        if (dictError) throw dictError;

        // Fetch articles to check which ones are academic
        const { data: articlesData, error: artError } = await supabase
          .from('articles')
          .select('id, is_academic')
          .eq('user_id', user.id)
          .eq('is_academic', true);

        if (artError) throw artError;

        const academicArticleIds = new Set(articlesData.map(a => a.id));
        
        // Filter dictionary words that belong to academic articles
        const academicWords = dictData.filter(d => 
          d.article_id && academicArticleIds.has(d.article_id)
        );

        // Group by month
        const wordsByMonth = academicWords.reduce((acc: any, curr) => {
          const month = new Date(curr.created_at).toLocaleString('ar-SA', { month: 'short' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.keys(wordsByMonth).map(month => ({
          name: month,
          words: wordsByMonth[month]
        }));

        setStats({
          totalAcademicWords: academicWords.length,
          totalAcademicArticles: articlesData.length,
          chartData
        });
      } catch (error) {
        console.error('Error fetching academic stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الإحصائيات الأكاديمية</h1>
          <p className="text-muted-foreground mt-1">تابع تقدمك في تعلم المصطلحات العلمية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">المصطلحات الأكاديمية المحفوظة</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.totalAcademicWords || 0}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-accent/10 rounded-full">
              <GraduationCap className="h-8 w-8 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">المقالات الأكاديمية المقروءة</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.totalAcademicArticles || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تقدمك الشهري في المصطلحات</CardTitle>
          <CardDescription>عدد المصطلحات الأكاديمية التي تعلمتها كل شهر</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.chartData && stats.chartData.length > 0 ? (
            <div className="h-[300px] w-full mt-4" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="words" fill="#2563eb" radius={[4, 4, 0, 0]} name="مصطلحات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              لا توجد بيانات كافية لعرض الرسم البياني
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
