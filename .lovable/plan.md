

## خطة توسيع قاعدة بيانات الأقسام والمواد

### الوضع الحالي
حالياً يوجد 16 كلية في قاعدة البيانات، لكن معظمها يحتوي فقط على "General Department" مع مواد عامة. الكليات التي لديها تفاصيل كاملة:
- **Science Track** (ثانوي): فيزياء، كيمياء، أحياء
- **Computer Science**: 3 أقسام بمواد تفصيلية
- **Business Administration**: 3 أقسام بمواد تفصيلية

الكليات التي تحتاج توسيع: Medicine, Engineering, Law, Pharmacy, Dentistry, Education, Media, Arts, Architecture, Nursing, Science

### التوسيع المقترح

سأضيف أقسام ومواد تفصيلية لكل كلية بناءً على المناهج الأكاديمية الحقيقية:

**1. كلية الطب (Medicine)**
- علم التشريح: Anatomy, Embryology, Histology
- علم وظائف الأعضاء: Physiology, Neurophysiology
- الكيمياء الحيوية: Biochemistry, Molecular Biology
- علم الأمراض: Pathology, Immunopathology
- علم الأدوية: Pharmacology, Clinical Pharmacology
- الطب الباطني: Internal Medicine, Cardiology, Pulmonology
- الجراحة: General Surgery, Orthopedics

**2. كلية الهندسة (Engineering)**
- الهندسة المدنية: Structural Analysis, Soil Mechanics, Construction Management
- الهندسة الكهربائية: Circuit Analysis, Power Systems, Electronics
- الهندسة الميكانيكية: Thermodynamics, Fluid Mechanics, Machine Design
- هندسة الاتصالات: Signal Processing, Wireless Communications
- الهندسة المعمارية: Architectural Design, Building Systems

**3. كلية الصيدلة (Pharmacy)**
- الكيمياء الصيدلية: Medicinal Chemistry, Pharmaceutical Analysis
- الصيدلانيات: Dosage Forms, Drug Delivery Systems
- علم الأدوية والسموم: Pharmacology, Toxicology
- الصيدلة السريرية: Clinical Pharmacy, Pharmacotherapy

**4. كلية الحقوق (Law)**
- القانون المدني: Contract Law, Property Law, Family Law
- القانون الجنائي: Criminal Law, Criminal Procedure
- القانون التجاري: Commercial Law, Company Law
- القانون الدولي: International Law, Human Rights

**5. كلية طب الأسنان (Dentistry)**
- جراحة الفم: Oral Surgery, Dental Anesthesia
- التركيبات: Prosthodontics, Crown and Bridge
- تقويم الأسنان: Orthodontics
- علاج الجذور: Endodontics
- أمراض اللثة: Periodontics

**6. كلية التربية (Education)**
- المناهج وطرق التدريس: Curriculum Design, Teaching Methods
- علم النفس التربوي: Educational Psychology, Learning Theories
- تكنولوجيا التعليم: Educational Technology, E-Learning
- الإدارة التربوية: Educational Administration

**7. كلية الإعلام (Media)**
- الصحافة: News Writing, Investigative Journalism
- الإذاعة والتلفزيون: Broadcasting, TV Production
- العلاقات العامة: Public Relations, Corporate Communication
- الإعلام الرقمي: Digital Media, Social Media

**8. كلية العمارة (Architecture)**
- التصميم المعماري: Architectural Design, Urban Planning
- الإنشاءات: Building Construction, Structural Systems
- التاريخ والنظريات: History of Architecture, Design Theory
- التقنيات: CAD, BIM, Environmental Design

**9. كلية العلوم (Science)**
- الفيزياء: Quantum Mechanics, Thermodynamics, Optics
- الكيمياء: Organic, Inorganic, Physical Chemistry
- الرياضيات: Analysis, Algebra, Statistics
- الأحياء: Microbiology, Genetics, Ecology
- الجيولوجيا: Mineralogy, Structural Geology

**10. كلية الآداب (Arts & Literature)**
- اللغة العربية: Arabic Grammar, Arabic Literature
- اللغة الإنجليزية: English Literature, Linguistics
- التاريخ: Ancient History, Modern History
- الفلسفة: Philosophy, Logic, Ethics
- الجغرافيا: Physical Geography, Human Geography

**11. كلية التمريض (Nursing)**
- أساسيات التمريض: Fundamentals of Nursing
- تمريض الباطني والجراحي: Medical-Surgical Nursing
- تمريض الأطفال: Pediatric Nursing
- تمريض صحة المجتمع: Community Health Nursing

### التنفيذ التقني
- استخدام أداة تعديل البيانات لتحديث عمود `structure` في جدول `faculties`
- تحديث كل كلية بهيكل JSONB كامل يحتوي على الأقسام والمواد
- المحافظة على تنسيق البيانات الحالي

### الخطوات
1. تحديث Medicine بأقسام ومواد طبية تفصيلية
2. تحديث Engineering بـ 5 أقسام هندسية
3. تحديث Pharmacy, Dentistry, Nursing
4. تحديث Law, Education, Media
5. تحديث Architecture, Arts, Science

