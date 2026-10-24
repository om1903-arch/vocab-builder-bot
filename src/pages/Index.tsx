import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  BookOpen, Sparkles, Languages, Volume2, GraduationCap, Code2, MessageSquare,
  Layers, Target, Trophy, FileText, Menu, X, ArrowLeft, Check,
} from 'lucide-react';

const navLinks = [
  { href: '#features', label: 'المميزات' },
  { href: '#how', label: 'كيف يعمل' },
  { href: '#paths', label: 'المسارات' },
  { href: '#faq', label: 'الأسئلة الشائعة' },
];

const coreFeatures = [
  { icon: Sparkles, title: 'مقالات مولّدة لك', desc: 'مقالات جديدة في كل مرة، بمستواك من A1 إلى C2 وفي المجال الذي تختاره.' },
  { icon: Languages, title: 'ترجمة في السياق', desc: 'اضغط على كلمة أو حدّد جملة كاملة لترى معناها داخل النص، واحفظها بضغطة.' },
  { icon: Volume2, title: 'استماع واضح', desc: 'استمع للمقال مع تمييز الكلمة المنطوقة، وتحكّم في السرعة والإيقاف.' },
  { icon: Layers, title: 'مراجعة ذكية', desc: 'بطاقات تعليمية بالتكرار المتباعد واختبارات لكلمات قاموسك حتى تتقنها.' },
];

const showcase = [
  {
    icon: GraduationCap, tag: 'المسار الأكاديمي',
    title: 'إنجليزية تخدم دراستك',
    desc: 'اختر كليتك وقسمك ومادتك، واحصل على مقالات أطول تركّز على المصطلحات العلمية مع اختبارات أصعب. يمكنك أيضاً رفع ملف PDF من منهجك.',
    points: ['طب، هندسة، صيدلة، حقوق وغيرها', 'استخراج المصطلحات من ملفات PDF', 'إحصائيات تقدّم حسب التخصص'],
  },
  {
    icon: Code2, tag: 'للمبرمجين',
    title: 'تعلّم مصطلحات البرمجة بالإنجليزية',
    desc: 'أساسيات البرمجة، هياكل البيانات، تطوير الويب، قواعد البيانات وGit — مقالات تشرح المفاهيم وتبني مفرداتك التقنية.',
    points: ['مواد مرتّبة حسب الأقسام', 'مصطلحات تقنية مع ترجمتها', 'اختبارات فهم بعد كل مقال'],
  },
  {
    icon: MessageSquare, tag: 'المحادثة',
    title: 'تدرّب على مواقف حقيقية',
    desc: 'محاكاة مقابلة عمل، مطار، مطعم أو فندق مع مساعد ذكي يرد عليك ويصحّح أسلوبك، إلى جانب اختبار نطقك بالميكروفون.',
    points: ['سيناريوهات متنوعة', 'ردود صوتية', 'تقييم النطق'],
  },
];

const steps = [
  { icon: Target, title: 'حدّد مستواك', desc: 'اختبار قصير يضبط صعوبة المحتوى من البداية.' },
  { icon: BookOpen, title: 'اختر مجالك', desc: 'تكنولوجيا، صحة، أعمال، أو تخصصك الدراسي.' },
  { icon: FileText, title: 'اقرأ وتفاعل', desc: 'ترجم، استمع، واحفظ الكلمات الجديدة.' },
  { icon: Trophy, title: 'راجع وتقدّم', desc: 'اختبارات، نقاط XP، شارات وتقدير لموعد مستواك التالي.' },
];

const faqs = [
  { q: 'هل التطبيق مجاني؟', a: 'يمكنك إنشاء حساب والبدء في التعلم مباشرة دون أي دفع.' },
  { q: 'كيف يحدد التطبيق مستواي؟', a: 'بعد التسجيل تجيب عن اختبار تحديد مستوى قصير، ويمكنك تغيير المستوى لاحقاً في أي مقال.' },
  { q: 'هل يُحفظ تقدّمي؟', a: 'نعم، قاموسك ونقاطك وإحصائياتك محفوظة في حسابك، فتكمل من حيث توقفت من أي جهاز.' },
  { q: 'هل يناسب طلاب الثانوية والجامعة؟', a: 'نعم، يوجد مسار أكاديمي مستقل حسب الكلية والقسم والمادة، مع إمكانية رفع ملفات المنهج.' },
  { q: 'هل يعمل على الهاتف؟', a: 'نعم، الموقع يعمل على الهاتف والحاسوب ويمكن تثبيته على الشاشة الرئيسية.' },
];

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

function ProductMockup() {
  const [open, setOpen] = useState(true);
  return (
    <div className="relative rounded-3xl border border-border bg-card p-5 md:p-7 shadow-2xl shadow-primary/10" dir="ltr">
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-destructive/70" />
          <span className="h-3 w-3 rounded-full bg-accent/70" />
          <span className="h-3 w-3 rounded-full bg-primary/70" />
        </div>
        <span className="text-xs text-muted-foreground">نموذج توضيحي</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1">Technology</span>
        <span className="rounded-full bg-muted text-muted-foreground text-xs font-medium px-3 py-1">B1</span>
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-card-foreground mb-3">How AI Is Changing Everyday Apps</h3>
      <p className="text-card-foreground/80 leading-relaxed relative">
        Modern apps now use artificial intelligence to{' '}
        <button
          onClick={() => setOpen(o => !o)}
          className="rounded bg-primary/15 px-1 font-semibold text-primary underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          anticipate
        </button>{' '}
        what users need, making <span className="rounded bg-accent/30 px-0.5">everyday</span> tasks faster and simpler.
      </p>
      {open && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4" dir="rtl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">anticipate</span>
            <Volume2 className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">يتوقّع — يتنبّأ بما سيحدث مسبقاً</p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground text-xs px-3 py-1">
            <Check className="h-3 w-3" /> أُضيفت إلى قاموسي
          </div>
        </div>
      )}
      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-muted p-3">
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
          <Volume2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
          <div className="h-full w-2/5 bg-primary rounded-full" />
        </div>
        <span className="text-xs text-muted-foreground">1.0×</span>
      </div>
    </div>
  );
}

const Index = () => {
  const [menu, setMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth" dir="rtl">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-bold text-lg">
            <span className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </span>
            LinguaAI
          </a>
          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild><Link to="/auth">تسجيل الدخول</Link></Button>
            <Button asChild className="rounded-full"><Link to="/auth">ابدأ مجاناً</Link></Button>
          </div>
          <button className="md:hidden p-2" aria-label="القائمة" aria-expanded={menu} onClick={() => setMenu(m => !m)}>
            {menu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
        {menu && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="block py-1 text-foreground">{l.label}</a>
            ))}
            <Button asChild className="w-full rounded-full"><Link to="/auth">ابدأ مجاناً</Link></Button>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />
          <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-6">
                <Sparkles className="h-4 w-4 text-primary" /> تعلّم الإنجليزية بالذكاء الاصطناعي
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
                اقرأ ما يهمّك،
                <br />
                <span className="text-primary">وتعلّم الإنجليزية أثناءها</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                مقالات تُكتب خصيصاً لمستواك واهتماماتك، مع ترجمة فورية في السياق، ونطق واضح، وقاموس شخصي يتذكّر كل كلمة جديدة.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild className="rounded-full px-8">
                  <Link to="/auth">ابدأ التعلم مجاناً <ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full px-8">
                  <a href="#how">كيف يعمل؟</a>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.15}><ProductMockup /></Reveal>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-muted/50 py-20 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">كل ما تحتاجه في مكان واحد</h2>
                <p className="text-muted-foreground">من القراءة إلى المراجعة، كل خطوة مصممة لتثبيت ما تتعلمه.</p>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {coreFeatures.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.07}>
                  <div className="h-full rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-card-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Paths */}
        <section id="paths" className="py-20 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 space-y-20">
            {showcase.map((s, i) => (
              <Reveal key={s.title}>
                <div className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
                  <div>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-3">
                      <s.icon className="h-4 w-4" /> {s.tag}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">{s.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">{s.desc}</p>
                    <ul className="space-y-2">
                      {s.points.map(p => (
                        <li key={p} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="aspect-[4/3] rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-accent/15 flex items-center justify-center">
                    <s.icon className="h-24 w-24 text-primary/60" strokeWidth={1.2} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How */}
        <section id="how" className="bg-muted/50 py-20 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">أربع خطوات للبدء</h2>
            </Reveal>
            <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.07}>
                  <li className="h-full rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <s.icon className="h-6 w-6 text-primary" />
                      <span className="text-3xl font-bold text-muted-foreground/30">0{i + 1}</span>
                    </div>
                    <h3 className="font-bold text-card-foreground mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 scroll-mt-16">
          <div className="max-w-3xl mx-auto px-4">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">الأسئلة الشائعة</h2>
            </Reveal>
            <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-6">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`f${i}`} className={i === faqs.length - 1 ? 'border-b-0' : ''}>
                  <AccordionTrigger className="text-right font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20">
          <Reveal>
            <div className="max-w-5xl mx-auto rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">ابدأ رحلتك مع الإنجليزية اليوم</h2>
              <p className="opacity-90 mb-8 max-w-xl mx-auto">أنشئ حسابك، حدّد مستواك، واقرأ أول مقال مصمم لك خلال دقائق.</p>
              <Button size="lg" variant="secondary" asChild className="rounded-full px-10">
                <Link to="/auth">إنشاء حساب مجاني</Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6 items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <BookOpen className="h-5 w-5 text-primary" /> LinguaAI
          </div>
          <div className="flex flex-wrap gap-6">
            {navLinks.map(l => <a key={l.href} href={l.href} className="hover:text-foreground">{l.label}</a>)}
            <Link to="/auth" className="hover:text-foreground">تسجيل الدخول</Link>
          </div>
          <p>© {new Date().getFullYear()} LinguaAI</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
