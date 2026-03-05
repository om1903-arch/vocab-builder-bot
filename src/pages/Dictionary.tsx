import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Trash2, Search } from 'lucide-react';

interface DictEntry {
  id: string;
  word: string;
  translation: string;
  context: string | null;
  word_type: string | null;
  created_at: string;
}

const Dictionary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    const { data } = await supabase
      .from('dictionary')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setEntries((data as DictEntry[]) || []);
    setLoading(false);
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('dictionary').delete().eq('id', id);
    setEntries(entries.filter(e => e.id !== id));
    toast({ title: 'تم الحذف' });
  };

  const speak = (word: string) => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  const filtered = entries.filter(e =>
    e.word.toLowerCase().includes(search.toLowerCase()) ||
    e.translation.includes(search)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">القاموس الشخصي 📖</h1>
          <span className="text-muted-foreground">{entries.length} كلمة</span>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن كلمة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            dir="rtl"
          />
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="glass-card">
                  <CardContent className="py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => speak(entry.word)}>
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold article-text text-lg" dir="ltr">{entry.word}</span>
                        {entry.word_type && (
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">{entry.word_type}</span>
                        )}
                      </div>
                      <div className="text-sm text-foreground mt-0.5">{entry.translation}</div>
                      {entry.context && (
                        <div className="text-xs text-muted-foreground mt-1 truncate article-text" dir="ltr">
                          "{entry.context.substring(0, 100)}..."
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => deleteEntry(entry.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-20 text-muted-foreground">
              {search ? 'لا توجد نتائج' : 'لم تحفظ أي كلمات بعد. ابدأ بقراءة مقال واضغط على أي كلمة!'}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dictionary;
