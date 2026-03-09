import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Trophy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const DailyChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    loadChallenges();
  }, [user]);

  const loadChallenges = async () => {
    const { data } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('user_id', user!.id)
      .gte('created_at', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(3);

    if (data && data.length > 0) {
      setChallenges(data);
    } else {
      const defaults = [
        { user_id: user!.id, challenge_type: 'read_articles', target_count: 2, xp_reward: 20 },
        { user_id: user!.id, challenge_type: 'save_words', target_count: 5, xp_reward: 15 },
        { user_id: user!.id, challenge_type: 'quiz_perfect', target_count: 1, xp_reward: 30 },
      ];
      const { data: newChallenges } = await supabase.from('daily_challenges').insert(defaults).select();
      if (newChallenges) setChallenges(newChallenges);
    }
  };

  const getLabel = (type: string) => {
    if (type === 'read_articles') return 'اقرأ مقالات جديدة';
    if (type === 'save_words') return 'احفظ كلمات جديدة';
    if (type === 'quiz_perfect') return 'أكمل اختباراً بنجاح';
    return type;
  };

  if (!challenges.length) return null;

  return (
    <Card className="glass-card mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          تحديات اليوم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4 bg-primary/5 p-3 rounded-lg border border-primary/10">
            <div className="bg-primary/10 p-2 rounded-full">
              {c.is_completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Trophy className="h-5 w-5 text-accent" />}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{getLabel(c.challenge_type)}</span>
                <span className="text-muted-foreground">{c.current_count}/{c.target_count}</span>
              </div>
              <Progress value={Math.min((c.current_count / c.target_count) * 100, 100)} className="h-2" />
            </div>
            <div className="text-sm font-bold text-primary">+{c.xp_reward} XP</div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
