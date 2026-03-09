ALTER TABLE public.faculties 
ADD COLUMN IF NOT EXISTS curriculum_analysis jsonb DEFAULT '{}'::jsonb;