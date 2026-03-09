import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Brain, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface Faculty {
  id: string;
  name_ar: string;
  name_en: string;
  stage: string;
  structure: any[];
  curriculum_analysis: any;
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .order('stage');
      
      if (error) throw error;
      setFaculties(data as Faculty[]);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      toast({ title: 'خطأ', description: 'فشل في تحميل بيانات الكليات', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const analyzeCurriculum = async (facultyId: string) => {
    setAnalyzingId(facultyId);
    try {
      const { data, error } = await supabase.functions.invoke('seed-curriculum-analysis', {
        body: { faculty_id: facultyId }
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      toast({ title: 'نجاح', description: 'تم تحليل المناهج بنجاح.' });
      fetchFaculties(); // Refresh data
    } catch (err: any) {
      console.error(err);
      toast({ title: 'خطأ', description: err.message || 'فشل تحليل المناهج', variant: 'destructive' });
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate overall stats
  let totalSubjects = 0;
  let analyzedSubjects = 0;

  faculties.forEach(f => {
    const structure = f.structure || [];
    const analysis = f.curriculum_analysis || {};
    
    structure.forEach(dept => {
      const deptName = dept.department_en || dept.name_en || "General Department";
      const subjects = dept.subjects || [];
      totalSubjects += subjects.length;
      
      subjects.forEach((sub: any) => {
        const subName = sub.subject_en || sub.name_en;
        if (analysis[deptName] && analysis[deptName][subName]) {
          analyzedSubjects++;
        }
      });
    });
  });

  const overallProgress = totalSubjects === 0 ? 0 : Math.round((analyzedSubjects / totalSubjects) * 100);

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <ShieldAlert className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground mt-1">إدارة وتحليل المناهج الدراسية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">إجمالي الكليات/المسارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{faculties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">إجمالي المواد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSubjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">المواد المحللة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{analyzedSubjects}</span>
              <span className="text-muted-foreground text-sm">من {totalSubjects}</span>
            </div>
            <Progress value={overallProgress} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">{overallProgress}% مكتمل</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">تفاصيل الكليات والمناهج</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faculties.map((faculty) => {
          let facTotalSub = 0;
          let facAnalyzedSub = 0;
          
          const structure = faculty.structure || [];
          const analysis = faculty.curriculum_analysis || {};
          
          structure.forEach(dept => {
            const deptName = dept.department_en || dept.name_en || "General Department";
            const subjects = dept.subjects || [];
            facTotalSub += subjects.length;
            
            subjects.forEach((sub: any) => {
              const subName = sub.subject_en || sub.name_en;
              if (analysis[deptName] && analysis[deptName][subName]) {
                facAnalyzedSub++;
              }
            });
          });

          const facProgress = facTotalSub === 0 ? 0 : Math.round((facAnalyzedSub / facTotalSub) * 100);
          const isComplete = facProgress === 100 && facTotalSub > 0;

          return (
            <Card key={faculty.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{faculty.name_ar}</CardTitle>
                    <CardDescription>{faculty.stage === 'university' ? 'جامعي' : 'مدرسي'}</CardDescription>
                  </div>
                  {isComplete && <CheckCircle2 className="h-5 w-5 text-success" />}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>تقدم التحليل</span>
                    <span className="font-medium">{facAnalyzedSub} / {facTotalSub}</span>
                  </div>
                  <Progress value={facProgress} className="h-2" />
                </div>
                
                <Button 
                  onClick={() => analyzeCurriculum(faculty.id)} 
                  disabled={analyzingId === faculty.id || isComplete || facTotalSub === 0}
                  className="w-full"
                  variant={isComplete ? "secondary" : "default"}
                >
                  {analyzingId === faculty.id ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري التحليل...</>
                  ) : isComplete ? (
                    'مكتمل التحليل'
                  ) : (
                    <><Brain className="h-4 w-4 mr-2" /> {facProgress > 0 ? 'استكمال التحليل' : 'بدء التحليل'}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;