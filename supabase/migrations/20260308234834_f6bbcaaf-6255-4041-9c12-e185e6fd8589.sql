-- Add structure column to faculties
ALTER TABLE public.faculties ADD COLUMN IF NOT EXISTS structure JSONB DEFAULT '[]'::jsonb;

-- Update High School Science
UPDATE public.faculties SET structure = '[
  {"department_ar": "الفيزياء", "department_en": "Physics", "subjects": [{"name_ar": "الميكانيكا", "name_en": "Mechanics"}, {"name_ar": "الكهرومغناطيسية", "name_en": "Electromagnetism"}, {"name_ar": "الفيزياء الحديثة", "name_en": "Modern Physics"}]},
  {"department_ar": "الكيمياء", "department_en": "Chemistry", "subjects": [{"name_ar": "الكيمياء العضوية", "name_en": "Organic Chemistry"}, {"name_ar": "الكيمياء غير العضوية", "name_en": "Inorganic Chemistry"}]},
  {"department_ar": "الأحياء", "department_en": "Biology", "subjects": [{"name_ar": "علم الخلية", "name_en": "Cell Biology"}, {"name_ar": "الوراثة", "name_en": "Genetics"}, {"name_ar": "علم البيئة", "name_en": "Ecology"}]}
]'::jsonb WHERE name_en = 'Science Track';

-- Update High School Literary
UPDATE public.faculties SET structure = '[
  {"department_ar": "التاريخ", "department_en": "History", "subjects": [{"name_ar": "التاريخ القديم", "name_en": "Ancient History"}, {"name_ar": "التاريخ الحديث", "name_en": "Modern History"}]},
  {"department_ar": "الجغرافيا", "department_en": "Geography", "subjects": [{"name_ar": "الجغرافيا الطبيعية", "name_en": "Physical Geography"}, {"name_ar": "الجغرافيا البشرية", "name_en": "Human Geography"}]},
  {"department_ar": "الفلسفة والمنطق", "department_en": "Philosophy", "subjects": [{"name_ar": "المنطق", "name_en": "Logic"}, {"name_ar": "الأخلاق", "name_en": "Ethics"}]}
]'::jsonb WHERE name_en = 'Literary Track';

-- Update High School Math
UPDATE public.faculties SET structure = '[
  {"department_ar": "الرياضيات البحتة", "department_en": "Pure Mathematics", "subjects": [{"name_ar": "التفاضل والتكامل", "name_en": "Calculus"}, {"name_ar": "الجبر", "name_en": "Algebra"}]},
  {"department_ar": "الرياضيات التطبيقية", "department_en": "Applied Mathematics", "subjects": [{"name_ar": "الديناميكا", "name_en": "Dynamics"}, {"name_ar": "الاستاتيكا", "name_en": "Statics"}]}
]'::jsonb WHERE name_en = 'Math Track';

-- Update Medicine
UPDATE public.faculties SET structure = '[
  {"department_ar": "العلوم الطبية الأساسية", "department_en": "Basic Medical Sciences", "subjects": [{"name_ar": "علم التشريح", "name_en": "Anatomy"}, {"name_ar": "علم وظائف الأعضاء", "name_en": "Physiology"}, {"name_ar": "الكيمياء الحيوية", "name_en": "Biochemistry"}]},
  {"department_ar": "العلوم الباثولوجية", "department_en": "Pathological Sciences", "subjects": [{"name_ar": "علم الأمراض", "name_en": "Pathology"}, {"name_ar": "علم الأدوية", "name_en": "Pharmacology"}, {"name_ar": "علم الأحياء الدقيقة", "name_en": "Microbiology"}]},
  {"department_ar": "العلوم السريرية", "department_en": "Clinical Sciences", "subjects": [{"name_ar": "الباطنة", "name_en": "Internal Medicine"}, {"name_ar": "الجراحة العامة", "name_en": "General Surgery"}, {"name_ar": "طب الأطفال", "name_en": "Pediatrics"}]}
]'::jsonb WHERE name_en = 'Medicine';

-- Update Engineering
UPDATE public.faculties SET structure = '[
  {"department_ar": "الهندسة المدنية", "department_en": "Civil Engineering", "subjects": [{"name_ar": "التحليل الإنشائي", "name_en": "Structural Analysis"}, {"name_ar": "ميكانيكا التربة", "name_en": "Soil Mechanics"}, {"name_ar": "هندسة النقل", "name_en": "Transportation Engineering"}]},
  {"department_ar": "الهندسة الميكانيكية", "department_en": "Mechanical Engineering", "subjects": [{"name_ar": "الديناميكا الحرارية", "name_en": "Thermodynamics"}, {"name_ar": "ميكانيكا الموائع", "name_en": "Fluid Mechanics"}, {"name_ar": "تصميم الآلات", "name_en": "Machine Design"}]},
  {"department_ar": "الهندسة الكهربائية", "department_en": "Electrical Engineering", "subjects": [{"name_ar": "الدوائر الكهربائية", "name_en": "Electrical Circuits"}, {"name_ar": "الأنظمة الكهرومغناطيسية", "name_en": "Electromagnetic Systems"}, {"name_ar": "الإشارات والنظم", "name_en": "Signals and Systems"}]}
]'::jsonb WHERE name_en = 'Engineering';

-- Update Computer Science
UPDATE public.faculties SET structure = '[
  {"department_ar": "علوم الحاسب", "department_en": "Computer Science", "subjects": [{"name_ar": "هياكل البيانات", "name_en": "Data Structures"}, {"name_ar": "الخوارزميات", "name_en": "Algorithms"}, {"name_ar": "أنظمة التشغيل", "name_en": "Operating Systems"}]},
  {"department_ar": "هندسة البرمجيات", "department_en": "Software Engineering", "subjects": [{"name_ar": "تصميم البرمجيات", "name_en": "Software Design"}, {"name_ar": "اختبار البرمجيات", "name_en": "Software Testing"}]},
  {"department_ar": "الذكاء الاصطناعي", "department_en": "Artificial Intelligence", "subjects": [{"name_ar": "تعلم الآلة", "name_en": "Machine Learning"}, {"name_ar": "رؤية الحاسب", "name_en": "Computer Vision"}, {"name_ar": "معالجة اللغات الطبيعية", "name_en": "NLP"}]}
]'::jsonb WHERE name_en = 'Computer Science';

-- Update Business
UPDATE public.faculties SET structure = '[
  {"department_ar": "الإدارة", "department_en": "Management", "subjects": [{"name_ar": "السلوك التنظيمي", "name_en": "Organizational Behavior"}, {"name_ar": "الإدارة الاستراتيجية", "name_en": "Strategic Management"}]},
  {"department_ar": "المحاسبة", "department_en": "Accounting", "subjects": [{"name_ar": "المحاسبة المالية", "name_en": "Financial Accounting"}, {"name_ar": "المحاسبة الإدارية", "name_en": "Managerial Accounting"}]},
  {"department_ar": "التسويق", "department_en": "Marketing", "subjects": [{"name_ar": "سلوك المستهلك", "name_en": "Consumer Behavior"}, {"name_ar": "بحوث التسويق", "name_en": "Marketing Research"}]}
]'::jsonb WHERE name_en = 'Business Administration';

-- Update generic fallback for the rest
UPDATE public.faculties SET structure = '[
  {"department_ar": "القسم العام", "department_en": "General Department", "subjects": [{"name_ar": "مقدمة", "name_en": "Introduction"}, {"name_ar": "مفاهيم متقدمة", "name_en": "Advanced Concepts"}]}
]'::jsonb WHERE structure = '[]'::jsonb OR structure IS NULL;