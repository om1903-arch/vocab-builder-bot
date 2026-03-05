import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
        toast({
          title: "تم إنشاء الحساب ✅",
          description: "تحقق من بريدك الإلكتروني لتأكيد الحساب",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">LinguaAI</h1>
          <p className="text-muted-foreground mt-2">تعلّم الإنجليزية بالذكاء الاصطناعي</p>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</CardTitle>
            <CardDescription>
              {isLogin ? 'أدخل بياناتك للمتابعة' : 'أنشئ حسابك وابدأ رحلة التعلم'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  placeholder="الاسم"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  dir="rtl"
                />
              )}
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="text-left"
              />
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                dir="ltr"
                className="text-left"
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '...' : isLogin ? 'دخول' : 'إنشاء حساب'}
              </Button>
            </form>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? 'ليس لديك حساب؟ أنشئ واحداً' : 'لديك حساب؟ سجّل دخولك'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
