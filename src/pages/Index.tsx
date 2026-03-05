import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Zap, Globe, Volume2, BookMarked } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Sparkles, title: 'مقالات بالذكاء الاصطناعي', desc: 'محتوى يناسب مستواك في مجالات تهمك' },
    { icon: Globe, title: 'ترجمة سياقية', desc: 'اضغط على أي كلمة لمعرفة معناها في السياق' },
    { icon: Volume2, title: 'نطق احترافي', desc: 'استمع لنطق الكلمات والجمل بوضوح' },
    { icon: BookMarked, title: 'قاموس شخصي', desc: 'احفظ الكلمات الجديدة وراجعها لاحقاً' },
    { icon: Zap, title: 'تتبع التقدم', desc: 'XP ونقاط وإحصائيات أسبوعية' },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <BookOpen className="h-12 w-12 text-primary" />
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">LinguaAI</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              تعلّم الإنجليزية من مقالات مولّدة بالذكاء الاصطناعي
              <br />
              <span className="text-foreground font-medium">في المجالات التي تهمّك</span>
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
                ابدأ الآن مجاناً
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8">
                تسجيل الدخول
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card rounded-xl p-6 text-center"
            >
              <Icon className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>LinguaAI — تعلّم الإنجليزية بذكاء 🧠</p>
      </footer>
    </div>
  );
};

export default Index;
