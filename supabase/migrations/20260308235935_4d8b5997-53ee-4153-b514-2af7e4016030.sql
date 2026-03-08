UPDATE faculties SET structure = '[
  {
    "name_en": "Anatomy",
    "name_ar": "علم التشريح",
    "subjects": [
      { "name_en": "Anatomy", "name_ar": "علم التشريح العام" },
      { "name_en": "Embryology", "name_ar": "علم الأجنة" },
      { "name_en": "Histology", "name_ar": "علم الأنسجة" }
    ]
  },
  {
    "name_en": "Physiology",
    "name_ar": "علم وظائف الأعضاء",
    "subjects": [
      { "name_en": "Physiology", "name_ar": "علم وظائف الأعضاء" },
      { "name_en": "Neurophysiology", "name_ar": "الفيزيولوجيا العصبية" }
    ]
  },
  {
    "name_en": "Biochemistry",
    "name_ar": "الكيمياء الحيوية",
    "subjects": [
      { "name_en": "Biochemistry", "name_ar": "الكيمياء الحيوية" },
      { "name_en": "Molecular Biology", "name_ar": "البيولوجيا الجزيئية" }
    ]
  },
  {
    "name_en": "Pathology",
    "name_ar": "علم الأمراض",
    "subjects": [
      { "name_en": "Pathology", "name_ar": "علم الأمراض" },
      { "name_en": "Immunopathology", "name_ar": "علم الأمراض المناعي" }
    ]
  },
  {
    "name_en": "Pharmacology",
    "name_ar": "علم الأدوية",
    "subjects": [
      { "name_en": "Pharmacology", "name_ar": "علم الأدوية" },
      { "name_en": "Clinical Pharmacology", "name_ar": "علم الأدوية السريري" }
    ]
  },
  {
    "name_en": "Internal Medicine",
    "name_ar": "الطب الباطني",
    "subjects": [
      { "name_en": "Internal Medicine", "name_ar": "الطب الباطني العام" },
      { "name_en": "Cardiology", "name_ar": "أمراض القلب" },
      { "name_en": "Pulmonology", "name_ar": "أمراض الرئة" }
    ]
  },
  {
    "name_en": "Surgery",
    "name_ar": "الجراحة",
    "subjects": [
      { "name_en": "General Surgery", "name_ar": "الجراحة العامة" },
      { "name_en": "Orthopedics", "name_ar": "جراحة العظام" }
    ]
  }
]'::jsonb WHERE name_en = 'Medicine';

UPDATE faculties SET structure = '[
  {
    "name_en": "Civil Engineering",
    "name_ar": "الهندسة المدنية",
    "subjects": [
      { "name_en": "Structural Analysis", "name_ar": "التحليل الإنشائي" },
      { "name_en": "Soil Mechanics", "name_ar": "ميكانيكا التربة" },
      { "name_en": "Construction Management", "name_ar": "إدارة التشييد" }
    ]
  },
  {
    "name_en": "Electrical Engineering",
    "name_ar": "الهندسة الكهربائية",
    "subjects": [
      { "name_en": "Circuit Analysis", "name_ar": "تحليل الدوائر" },
      { "name_en": "Power Systems", "name_ar": "أنظمة القوى" },
      { "name_en": "Electronics", "name_ar": "الإلكترونيات" }
    ]
  },
  {
    "name_en": "Mechanical Engineering",
    "name_ar": "الهندسة الميكانيكية",
    "subjects": [
      { "name_en": "Thermodynamics", "name_ar": "الديناميكا الحرارية" },
      { "name_en": "Fluid Mechanics", "name_ar": "ميكانيكا الموائع" },
      { "name_en": "Machine Design", "name_ar": "تصميم الآلات" }
    ]
  },
  {
    "name_en": "Communications Engineering",
    "name_ar": "هندسة الاتصالات",
    "subjects": [
      { "name_en": "Signal Processing", "name_ar": "معالجة الإشارات" },
      { "name_en": "Wireless Communications", "name_ar": "الاتصالات اللاسلكية" }
    ]
  }
]'::jsonb WHERE name_en = 'Engineering';

UPDATE faculties SET structure = '[
  {
    "name_en": "Medicinal Chemistry",
    "name_ar": "الكيمياء الصيدلية",
    "subjects": [
      { "name_en": "Medicinal Chemistry", "name_ar": "الكيمياء الصيدلية" },
      { "name_en": "Pharmaceutical Analysis", "name_ar": "التحليل الصيدلي" }
    ]
  },
  {
    "name_en": "Pharmaceutics",
    "name_ar": "الصيدلانيات",
    "subjects": [
      { "name_en": "Dosage Forms", "name_ar": "الأشكال الصيدلانية" },
      { "name_en": "Drug Delivery Systems", "name_ar": "أنظمة توصيل الدواء" }
    ]
  },
  {
    "name_en": "Pharmacology and Toxicology",
    "name_ar": "علم الأدوية والسموم",
    "subjects": [
      { "name_en": "Pharmacology", "name_ar": "علم الأدوية" },
      { "name_en": "Toxicology", "name_ar": "علم السموم" }
    ]
  },
  {
    "name_en": "Clinical Pharmacy",
    "name_ar": "الصيدلة السريرية",
    "subjects": [
      { "name_en": "Clinical Pharmacy", "name_ar": "الصيدلة السريرية" },
      { "name_en": "Pharmacotherapy", "name_ar": "العلاج الدوائي" }
    ]
  }
]'::jsonb WHERE name_en = 'Pharmacy';

UPDATE faculties SET structure = '[
  {
    "name_en": "Civil Law",
    "name_ar": "القانون المدني",
    "subjects": [
      { "name_en": "Contract Law", "name_ar": "قانون العقود" },
      { "name_en": "Property Law", "name_ar": "قانون الملكية" },
      { "name_en": "Family Law", "name_ar": "قانون الأسرة" }
    ]
  },
  {
    "name_en": "Criminal Law",
    "name_ar": "القانون الجنائي",
    "subjects": [
      { "name_en": "Criminal Law", "name_ar": "القانون الجنائي" },
      { "name_en": "Criminal Procedure", "name_ar": "الإجراءات الجنائية" }
    ]
  },
  {
    "name_en": "Commercial Law",
    "name_ar": "القانون التجاري",
    "subjects": [
      { "name_en": "Commercial Law", "name_ar": "القانون التجاري" },
      { "name_en": "Company Law", "name_ar": "قانون الشركات" }
    ]
  },
  {
    "name_en": "International Law",
    "name_ar": "القانون الدولي",
    "subjects": [
      { "name_en": "International Law", "name_ar": "القانون الدولي" },
      { "name_en": "Human Rights", "name_ar": "حقوق الإنسان" }
    ]
  }
]'::jsonb WHERE name_en = 'Law';

UPDATE faculties SET structure = '[
  {
    "name_en": "Oral Surgery",
    "name_ar": "جراحة الفم",
    "subjects": [
      { "name_en": "Oral Surgery", "name_ar": "جراحة الفم" },
      { "name_en": "Dental Anesthesia", "name_ar": "تخدير الأسنان" }
    ]
  },
  {
    "name_en": "Prosthodontics",
    "name_ar": "التركيبات",
    "subjects": [
      { "name_en": "Prosthodontics", "name_ar": "التركيبات" },
      { "name_en": "Crown and Bridge", "name_ar": "التيجان والجسور" }
    ]
  },
  {
    "name_en": "Orthodontics",
    "name_ar": "تقويم الأسنان",
    "subjects": [
      { "name_en": "Orthodontics", "name_ar": "تقويم الأسنان" }
    ]
  },
  {
    "name_en": "Endodontics",
    "name_ar": "علاج الجذور",
    "subjects": [
      { "name_en": "Endodontics", "name_ar": "علاج الجذور" }
    ]
  },
  {
    "name_en": "Periodontics",
    "name_ar": "أمراض اللثة",
    "subjects": [
      { "name_en": "Periodontics", "name_ar": "أمراض اللثة" }
    ]
  }
]'::jsonb WHERE name_en = 'Dentistry';

UPDATE faculties SET structure = '[
  {
    "name_en": "Curriculum & Instruction",
    "name_ar": "المناهج وطرق التدريس",
    "subjects": [
      { "name_en": "Curriculum Design", "name_ar": "تصميم المناهج" },
      { "name_en": "Teaching Methods", "name_ar": "طرق التدريس" }
    ]
  },
  {
    "name_en": "Educational Psychology",
    "name_ar": "علم النفس التربوي",
    "subjects": [
      { "name_en": "Educational Psychology", "name_ar": "علم النفس التربوي" },
      { "name_en": "Learning Theories", "name_ar": "نظريات التعلم" }
    ]
  },
  {
    "name_en": "Educational Technology",
    "name_ar": "تكنولوجيا التعليم",
    "subjects": [
      { "name_en": "Educational Technology", "name_ar": "تكنولوجيا التعليم" },
      { "name_en": "E-Learning", "name_ar": "التعلم الإلكتروني" }
    ]
  },
  {
    "name_en": "Educational Administration",
    "name_ar": "الإدارة التربوية",
    "subjects": [
      { "name_en": "Educational Administration", "name_ar": "الإدارة التربوية" }
    ]
  }
]'::jsonb WHERE name_en = 'Education';

UPDATE faculties SET structure = '[
  {
    "name_en": "Journalism",
    "name_ar": "الصحافة",
    "subjects": [
      { "name_en": "News Writing", "name_ar": "الكتابة الصحفية" },
      { "name_en": "Investigative Journalism", "name_ar": "الصحافة الاستقصائية" }
    ]
  },
  {
    "name_en": "Broadcasting",
    "name_ar": "الإذعة والتلفزيون",
    "subjects": [
      { "name_en": "Broadcasting", "name_ar": "الإذاعة" },
      { "name_en": "TV Production", "name_ar": "الإنتاج التلفزيوني" }
    ]
  },
  {
    "name_en": "Public Relations",
    "name_ar": "العلاقات العامة",
    "subjects": [
      { "name_en": "Public Relations", "name_ar": "العلاقات العامة" },
      { "name_en": "Corporate Communication", "name_ar": "الاتصال المؤسسي" }
    ]
  },
  {
    "name_en": "Digital Media",
    "name_ar": "الإعلام الرقمي",
    "subjects": [
      { "name_en": "Digital Media", "name_ar": "الإعلام الرقمي" },
      { "name_en": "Social Media", "name_ar": "وسائل التواصل الاجتماعي" }
    ]
  }
]'::jsonb WHERE name_en = 'Media & Communication';

UPDATE faculties SET structure = '[
  {
    "name_en": "Architectural Design",
    "name_ar": "التصميم المعماري",
    "subjects": [
      { "name_en": "Architectural Design", "name_ar": "التصميم المعماري" },
      { "name_en": "Urban Planning", "name_ar": "التخطيط الحضري" }
    ]
  },
  {
    "name_en": "Construction",
    "name_ar": "الإنشاءات",
    "subjects": [
      { "name_en": "Building Construction", "name_ar": "تشييد المباني" },
      { "name_en": "Structural Systems", "name_ar": "النظم الإنشائية" }
    ]
  },
  {
    "name_en": "History and Theory",
    "name_ar": "التاريخ والنظريات",
    "subjects": [
      { "name_en": "History of Architecture", "name_ar": "تاريخ العمارة" },
      { "name_en": "Design Theory", "name_ar": "نظريات التصميم" }
    ]
  },
  {
    "name_en": "Technologies",
    "name_ar": "التقنيات",
    "subjects": [
      { "name_en": "CAD", "name_ar": "التصميم بالحاسب" },
      { "name_en": "BIM", "name_ar": "نمذجة معلومات البناء" },
      { "name_en": "Environmental Design", "name_ar": "التصميم البيئي" }
    ]
  }
]'::jsonb WHERE name_en = 'Architecture';

UPDATE faculties SET structure = '[
  {
    "name_en": "Physics",
    "name_ar": "الفيزياء",
    "subjects": [
      { "name_en": "Quantum Mechanics", "name_ar": "ميكانيكا الكم" },
      { "name_en": "Thermodynamics", "name_ar": "الديناميكا الحرارية" },
      { "name_en": "Optics", "name_ar": "البصريات" }
    ]
  },
  {
    "name_en": "Chemistry",
    "name_ar": "الكيمياء",
    "subjects": [
      { "name_en": "Organic Chemistry", "name_ar": "الكيمياء العضوية" },
      { "name_en": "Inorganic Chemistry", "name_ar": "الكيمياء غير العضوية" },
      { "name_en": "Physical Chemistry", "name_ar": "الكيمياء الفيزيائية" }
    ]
  },
  {
    "name_en": "Mathematics",
    "name_ar": "الرياضيات",
    "subjects": [
      { "name_en": "Analysis", "name_ar": "التحليل الرياضي" },
      { "name_en": "Algebra", "name_ar": "الجبر" },
      { "name_en": "Statistics", "name_ar": "الإحصاء" }
    ]
  },
  {
    "name_en": "Biology",
    "name_ar": "الأحياء",
    "subjects": [
      { "name_en": "Microbiology", "name_ar": "الأحياء الدقيقة" },
      { "name_en": "Genetics", "name_ar": "علم الوراثة" },
      { "name_en": "Ecology", "name_ar": "علم البيئة" }
    ]
  },
  {
    "name_en": "Geology",
    "name_ar": "الجيولوجيا",
    "subjects": [
      { "name_en": "Mineralogy", "name_ar": "علم المعادن" },
      { "name_en": "Structural Geology", "name_ar": "الجيولوجيا التركيبية" }
    ]
  }
]'::jsonb WHERE name_en = 'Science';

UPDATE faculties SET structure = '[
  {
    "name_en": "Arabic Language",
    "name_ar": "اللغة العربية",
    "subjects": [
      { "name_en": "Arabic Grammar", "name_ar": "النحو" },
      { "name_en": "Arabic Literature", "name_ar": "الأدب العربي" }
    ]
  },
  {
    "name_en": "English Language",
    "name_ar": "اللغة الإنجليزية",
    "subjects": [
      { "name_en": "English Literature", "name_ar": "الأدب الإنجليزي" },
      { "name_en": "Linguistics", "name_ar": "اللسانيات" }
    ]
  },
  {
    "name_en": "History",
    "name_ar": "التاريخ",
    "subjects": [
      { "name_en": "Ancient History", "name_ar": "التاريخ القديم" },
      { "name_en": "Modern History", "name_ar": "التاريخ الحديث" }
    ]
  },
  {
    "name_en": "Philosophy",
    "name_ar": "الفلسفة",
    "subjects": [
      { "name_en": "Philosophy", "name_ar": "الفلسفة" },
      { "name_en": "Logic", "name_ar": "المنطق" },
      { "name_en": "Ethics", "name_ar": "الأخلاق" }
    ]
  },
  {
    "name_en": "Geography",
    "name_ar": "الجغرافيا",
    "subjects": [
      { "name_en": "Physical Geography", "name_ar": "الجغرافيا الطبيعية" },
      { "name_en": "Human Geography", "name_ar": "الجغرافيا البشرية" }
    ]
  }
]'::jsonb WHERE name_en = 'Arts & Literature';

UPDATE faculties SET structure = '[
  {
    "name_en": "Nursing Fundamentals",
    "name_ar": "أساسيات التمريض",
    "subjects": [
      { "name_en": "Fundamentals of Nursing", "name_ar": "أساسيات التمريض" }
    ]
  },
  {
    "name_en": "Medical-Surgical Nursing",
    "name_ar": "تمريض الباطني والجراحي",
    "subjects": [
      { "name_en": "Medical-Surgical Nursing", "name_ar": "تمريض الباطني والجراحي" }
    ]
  },
  {
    "name_en": "Pediatric Nursing",
    "name_ar": "تمريض الأطفال",
    "subjects": [
      { "name_en": "Pediatric Nursing", "name_ar": "تمريض الأطفال" }
    ]
  },
  {
    "name_en": "Community Health Nursing",
    "name_ar": "تمريض صحة المجتمع",
    "subjects": [
      { "name_en": "Community Health Nursing", "name_ar": "تمريض صحة المجتمع" }
    ]
  }
]'::jsonb WHERE name_en = 'Nursing';