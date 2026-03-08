-- Create faculties reference table
CREATE TABLE public.faculties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL CHECK (stage IN ('high_school', 'university')),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  key_topics TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public read, no write for users)
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read faculties"
ON public.faculties
FOR SELECT
USING (true);

-- Seed high school tracks
INSERT INTO public.faculties (stage, name_ar, name_en, key_topics, description) VALUES
('high_school', 'المسار العلمي', 'Science Track', ARRAY['physics', 'chemistry', 'biology', 'mathematics', 'scientific method', 'laboratory', 'experiments', 'formulas', 'equations'], 'Scientific subjects including physics, chemistry, and biology'),
('high_school', 'المسار الأدبي', 'Literary Track', ARRAY['literature', 'history', 'geography', 'philosophy', 'sociology', 'psychology', 'critical thinking', 'essays', 'analysis'], 'Humanities and social sciences track'),
('high_school', 'مسار الرياضيات', 'Math Track', ARRAY['calculus', 'algebra', 'geometry', 'statistics', 'probability', 'trigonometry', 'functions', 'proofs', 'theorems'], 'Advanced mathematics focus');

-- Seed university faculties
INSERT INTO public.faculties (stage, name_ar, name_en, key_topics, description) VALUES
('university', 'الطب', 'Medicine', ARRAY['anatomy', 'physiology', 'pathology', 'pharmacology', 'diagnosis', 'clinical', 'symptoms', 'treatment', 'prognosis', 'epidemiology'], 'Medical sciences and clinical practice'),
('university', 'الهندسة', 'Engineering', ARRAY['mechanics', 'thermodynamics', 'circuits', 'structures', 'design', 'materials', 'systems', 'optimization', 'CAD', 'manufacturing'], 'Engineering principles and applications'),
('university', 'علوم الحاسب', 'Computer Science', ARRAY['algorithms', 'data structures', 'programming', 'databases', 'networks', 'software engineering', 'artificial intelligence', 'machine learning', 'cybersecurity'], 'Computing and software development'),
('university', 'إدارة الأعمال', 'Business Administration', ARRAY['management', 'marketing', 'finance', 'accounting', 'economics', 'strategy', 'entrepreneurship', 'operations', 'human resources'], 'Business and management studies'),
('university', 'القانون', 'Law', ARRAY['jurisprudence', 'legislation', 'contracts', 'litigation', 'constitutional', 'criminal law', 'civil law', 'legal precedent', 'jurisdiction'], 'Legal studies and practice'),
('university', 'الصيدلة', 'Pharmacy', ARRAY['pharmaceutics', 'pharmacokinetics', 'drug interactions', 'dosage', 'compounding', 'therapeutics', 'medicinal chemistry', 'toxicology'], 'Pharmaceutical sciences'),
('university', 'طب الأسنان', 'Dentistry', ARRAY['oral anatomy', 'dental procedures', 'orthodontics', 'periodontics', 'endodontics', 'prosthodontics', 'oral pathology', 'dental materials'], 'Dental medicine and oral health'),
('university', 'العلوم', 'Science', ARRAY['research methodology', 'hypothesis', 'experimentation', 'data analysis', 'scientific writing', 'peer review', 'laboratory techniques', 'theories'], 'Pure and applied sciences'),
('university', 'الآداب', 'Arts & Literature', ARRAY['literary criticism', 'linguistics', 'rhetoric', 'narrative', 'poetry', 'prose', 'comparative literature', 'translation studies'], 'Language, literature and humanities'),
('university', 'الإعلام', 'Media & Communication', ARRAY['journalism', 'broadcasting', 'public relations', 'digital media', 'mass communication', 'media ethics', 'content creation', 'audience analysis'], 'Media and communication studies'),
('university', 'التربية', 'Education', ARRAY['pedagogy', 'curriculum', 'assessment', 'learning theories', 'classroom management', 'educational psychology', 'instructional design', 'special education'], 'Educational sciences and teaching'),
('university', 'العمارة', 'Architecture', ARRAY['architectural design', 'urban planning', 'construction', 'sustainability', 'building codes', 'CAD', 'structural systems', 'aesthetics'], 'Architecture and urban design'),
('university', 'الاقتصاد', 'Economics', ARRAY['microeconomics', 'macroeconomics', 'econometrics', 'monetary policy', 'fiscal policy', 'international trade', 'market analysis', 'economic indicators'], 'Economic theory and analysis'),
('university', 'التمريض', 'Nursing', ARRAY['patient care', 'clinical nursing', 'health assessment', 'nursing procedures', 'medical terminology', 'healthcare ethics', 'pharmacology basics'], 'Nursing sciences and patient care');

-- Add faculty_id to profiles
ALTER TABLE public.profiles
ADD COLUMN faculty_id UUID REFERENCES public.faculties(id) ON DELETE SET NULL;

-- Add is_academic to articles
ALTER TABLE public.articles
ADD COLUMN is_academic BOOLEAN NOT NULL DEFAULT false;