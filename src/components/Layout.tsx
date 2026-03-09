import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, LayoutDashboard, BookMarked, TrendingUp, LogOut, Menu, X, Sparkles, Sun, Moon, Layers, Trophy, GraduationCap, BarChart, ShieldAlert, Download, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
  { path: '/articles', icon: BookOpen, label: 'المقالات' },
  { path: '/academic', icon: GraduationCap, label: 'أكاديمي' },
  { path: '/academic/stats', icon: BarChart, label: 'إحصائياتي' },
  { path: '/dictionary', icon: BookMarked, label: 'القاموس' },
  { path: '/flashcards', icon: Layers, label: 'بطاقات' },
  { path: '/roleplay', icon: Mic, label: 'محاكاة' },
  { path: '/achievements', icon: Trophy, label: 'الإنجازات' },
  { path: '/progress', icon: TrendingUp, label: 'التقدم' },
];

const adminItems = [
  { path: '/admin/curriculum', icon: ShieldAlert, label: 'لوحة الإدارة' },
];

const Layout = ({ children }: { children: ReactNode }) => {
  const { signOut, user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark(!dark);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 right-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.aside
            className={`fixed lg:sticky top-0 right-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-l border-sidebar-border z-40 flex flex-col transition-transform lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            }`}
          >
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <BookOpen className="h-7 w-7 text-sidebar-primary" />
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-xl font-bold">LinguaAI</span>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-sidebar-accent text-sidebar-primary'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
              {isAdmin && adminItems.map(({ path, icon: Icon, label }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-sidebar-accent text-sidebar-primary'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-sidebar-border space-y-2">
              <button
                onClick={toggleDark}
                className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors"
              >
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="text-sm">{dark ? 'وضع فاتح' : 'وضع ليلي'}</span>
              </button>
              {installPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-primary hover:bg-sidebar-accent/50 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span className="text-sm font-medium">تثبيت التطبيق</span>
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-destructive hover:bg-sidebar-accent/50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm">خروج</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
