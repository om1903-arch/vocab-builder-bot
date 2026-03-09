import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Assessment from "./pages/Assessment";
import Dashboard from "./pages/Dashboard";
import Articles from "./pages/Articles";
import Dictionary from "./pages/Dictionary";
import ProgressPage from "./pages/Progress";
import Flashcards from "./pages/Flashcards";
import AchievementsPage from "./pages/AchievementsPage";
import AcademicPage from "./pages/Academic";
import AcademicStats from "./pages/AcademicStats";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Roleplay from "./pages/Roleplay";
import PdfTutor from "./pages/PdfTutor";
import Leaderboard from "./pages/Leaderboard";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
            <Route path="/dictionary" element={<ProtectedRoute><Dictionary /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/admin/curriculum" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
            <Route path="/academic" element={<ProtectedRoute><AcademicPage /></ProtectedRoute>} />
            <Route path="/academic/stats" element={<ProtectedRoute><AcademicStats /></ProtectedRoute>} />
            <Route path="/roleplay" element={<ProtectedRoute><Roleplay /></ProtectedRoute>} />
            <Route path="/pdf-tutor" element={<ProtectedRoute><PdfTutor /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
