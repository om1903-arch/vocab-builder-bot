import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, BookOpen, BookMarked, Flame, Zap, Star, Target, Award, Crown, Gem } from 'lucide-react';

interface Achievement {
  key: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  check: (stats: UserStats) => boolean;
}

interface UserStats {
  totalArticles: number;
  totalWords: number;
  xp: number;
  streak: number;
  level: string;
}

const achievementsList: Achievement[] = [
  { key: 'first_article', title: 'القارئ الأول', description: 'اقرأ أول مقال', icon: BookOpen, color: 'text-primary', check: (s) => s.totalArticles >= 1 },
  { key: '5_articles', title: 'قارئ نشط', description: 'اقرأ 5 مقالات', icon: BookOpen, color: 'text-primary', check: (s) => s.totalArticles >= 5 },
  { key: '20_articles', title: 'مثقف', description: 'اقرأ 20 مقالاً', icon: BookOpen, color: 'text-primary', check: (s) => s.totalArticles >= 20 },
  { key: '50_articles', title: 'عالِم', description: 'اقرأ 50 مقالاً', icon: Crown, color: 'text-accent', check: (s) => s.totalArticles >= 50 },
  { key: 'first_word', title: 'الكلمة الأولى', description: 'احفظ أول كلمة', icon: BookMarked, color: 'text-accent', check: (s) => s.totalWords >= 1 },
  { key: '25_words', title: 'جامع الكلمات', description: 'احفظ 25 كلمة', icon: BookMarked, color: 'text-accent', check: (s) => s.totalWords >= 25 },
  { key: '100_words', title: 'معجم متنقل', description: 'احفظ 100 كلمة', icon: Gem, color: 'text-purple-500', check: (s) => s.totalWords >= 100 },
  { key: '3_streak', title: 'ثابت الخطى', description: '3 أيام متتالية', icon: Flame, color: 'text-orange-500', check: (s) => s.streak >= 3 },
  { key: '7_streak', title: 'أسبوع كامل', description: '7 أيام متتالية', icon: Flame, color: 'text-orange-500', check: (s) => s.streak >= 7 },
  { key: '30_streak', title: 'محارب الشهر', description: '30 يوماً متتالية', icon: Trophy, color: 'text-yellow-500', check: (s) => s.streak >= 30 },
  { key: '100_xp', title: 'نجم صاعد', description: 'اجمع 100 XP', icon: Zap, color: 'text-primary', check: (s) => s.xp >= 100 },
  { key: '500_xp', title: 'متميز', description: 'اجمع 500 XP', icon: Star, color: 'text-yellow-500', check: (s) => s.xp >= 500 },
  { key: '2000_xp', title: 'أسطورة', description: 'اجمع 2000 XP', icon: Crown, color: 'text-yellow-500', check: (s) => s.xp >= 2000 },
  { key: 'level_b1', title: 'متوسط!', description: 'وصلت للمستوى B1', icon: Target, color: 'text-green-500', check: (s) => ['intermediate', 'upper_intermediate', 'advanced', 'proficient'].includes(s.level) },
  { key: 'level_c1', title: 'متقدم!', description: 'وصلت للمستوى C1', icon: Award, color: 'text-purple-500', check: (s) => ['advanced', 'proficient'].includes(s.level) },
];

interface WeeklyMission {
  id: string;
  title: string;
  target: number;
  current: number;
  xpReward: number;
  icon: any;
}

const Achievements = () => {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [missions, setMissions] = useState<WeeklyMission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    const [achievementsRes, profileRes, articlesRes, wordsRes, weekProgressRes] = await Promise.all([
      supabase.from('user_achievements').select('achievement_key').eq('user_id', user!.id),
      supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('is_read', true),
      supabase.from('dictionary').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('daily_progress').select('*').eq('user_id', user!.id).gte('date', getWeekStart()).order('date'),
    ]);

    const existingKeys = (achievementsRes.data || []).map((a: any) => a.achievement_key);
    const profile = profileRes.data;
    const stats: UserStats = {
      totalArticles: articlesRes.count || 0,
      totalWords: wordsRes.count || 0,
      xp: profile?.xp || 0,
      streak: profile?.streak || 0,
      level: profile?.level || 'beginner',
    };

    // Check & unlock new achievements
    const newUnlocks: string[] = [];
    for (const ach of achievementsList) {
      if (!existingKeys.includes(ach.key) && ach.check(stats)) {
        newUnlocks.push(ach.key);
      }
    }

    if (newUnlocks.length > 0) {
      await supabase.from('user_achievements').insert(
        newUnlocks.map(key => ({ user_id: user!.id, achievement_key: key }))
      );
    }

    setUnlocked([...existingKeys, ...newUnlocks]);

    // Weekly missions
    const weekProgress = weekProgressRes.data || [];
    const weekArticles = weekProgress.reduce((s: number, d: any) => s + d.articles_read, 0);
    const weekWords = weekProgress.reduce((s: number, d: any) => s + d.words_saved, 0);
    const weekXP = weekProgress.reduce((s: number, d: any) => s + d.xp_earned, 0);
    const activeDays = weekProgress.length;

    setMissions([
      { id: 'read_5', title: 'اقرأ 5 مقالات هذا الأسبوع', target: 5, current: Math.min(weekArticles, 5), xpReward: 25, icon: BookOpen },
      { id: 'save_15', title: 'احفظ 15 كلمة هذا الأسبوع', target: 15, current: Math.min(weekWords, 15), xpReward: 20, icon: BookMarked },
      { id: 'earn_50xp', title: 'اجمع 50 XP هذا الأسبوع', target: 50, current: Math.min(weekXP, 50), xpReward: 15, icon: Zap },
      { id: 'active_5', title: 'تعلّم 5 أيام هذا الأسبوع', target: 5, current: Math.min(activeDays, 5), xpReward: 30, icon: Flame },
    ]);

    setLoading(false);
  };

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  if (loading) return null;

  return (
    <div className="space-y-8">
      {/* Weekly Missions */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          مهام الأسبوع
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {missions.map((m, i) => {
            const done = m.current >= m.target;
            const progress = Math.round((m.current / m.target) * 100);
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`glass-card ${done ? 'border-success/50' : ''}`}>
                  <CardContent className="pt-4 pb-4" dir="rtl">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${done ? 'bg-success/10' : 'bg-primary/10'}`}>
                        <m.icon className={`h-5 w-5 ${done ? 'text-success' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{m.title}</span>
                          {done && <Badge variant="secondary" className="bg-success/10 text-success text-[10px]">✓ مكتملة</Badge>}
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 mt-2">
                          <div className={`h-2 rounded-full transition-all ${done ? 'bg-success' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">{m.current}/{m.target}</span>
                          <span className="text-[10px] text-accent">+{m.xpReward} XP</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          الإنجازات ({unlocked.length}/{achievementsList.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievementsList.map((ach, i) => {
            const isUnlocked = unlocked.includes(ach.key);
            return (
              <motion.div key={ach.key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                <Card className={`glass-card text-center ${isUnlocked ? '' : 'opacity-40 grayscale'}`}>
                  <CardContent className="pt-4 pb-4">
                    <ach.icon className={`h-8 w-8 mx-auto mb-2 ${isUnlocked ? ach.color : 'text-muted-foreground'}`} />
                    <div className="text-sm font-bold">{ach.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{ach.description}</div>
                    {isUnlocked && (
                      <Badge variant="secondary" className="mt-2 text-[10px] bg-primary/10 text-primary">مفتوح ✨</Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
