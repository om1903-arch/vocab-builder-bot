
## الهدف
إضافة عمود `curriculum_analysis` (JSONB) إلى جدول `faculties` يحتوي على تحليل شامل لمناهج كل قسم وكل مادة في كل كلية. يتم توليد هذا التحليل **مرة واحدة** بواسطة الذكاء الاصطناعي ورفعه لقاعدة البيانات، ثم يُستخدم كـ"سياق" تلقائياً عند توليد كل مقال أكاديمي.

---

## المشكلة الحالية
حالياً `generate-academic-article` يعرف فقط:
- اسم الكلية واسم القسم والمادة
- قائمة `key_topics` عامة
- مصطلحات PDF (اختيارية)

لا يوجد معرفة حقيقية بمحتوى المنهج: ما الذي يدرسه الطالب فعلاً؟ ما المفاهيم الأساسية؟ ما التسلسل المنطقي للمادة؟

---

## الحل المقترح

### 1. إضافة عمود جديد للجدول
```sql
ALTER TABLE public.faculties 
ADD COLUMN curriculum_analysis jsonb DEFAULT '{}'::jsonb;
```

الهيكل المقترح للبيانات:
```json
{
  "Civil Engineering": {
    "Structural Analysis": {
      "overview": "Study of how structures carry loads...",
      "core_concepts": ["equilibrium", "stress", "strain", "beams", "trusses"],
      "typical_topics": ["Force analysis", "Bending moments", "Deflection"],
      "key_terminology": ["shear force", "moment of inertia", "buckling"],
      "learning_outcomes": ["analyze statically determinate structures..."],
      "academic_depth": "This subject builds on mathematics and mechanics..."
    }
  }
}
```

### 2. Edge Function جديدة: `seed-curriculum-analysis`
وظيفتها:
- تستقبل `faculty_id`
- تجلب هيكل الكلية (الأقسام والمواد) من قاعدة البيانات
- لكل مادة في كل قسم: تستدعي الذكاء الاصطناعي لتوليد تحليل تفصيلي
- تجمع كل النتائج في كائن JSON واحد
- تحفظه في `curriculum_analysis` للكلية

### 3. صفحة إدارية خفيفة في `Academic.tsx`
- زر "تحليل مناهج هذه الكلية" يظهر للمستخدم عند اختيار كلية
- يستدعي `seed-curriculum-analysis` ويعرض شريط تقدم
- يُشغَّل مرة واحدة فقط (يتحقق إن كان التحليل موجوداً مسبقاً)

### 4. تحديث `generate-academic-article`
يجلب `curriculum_analysis` من قاعدة البيانات ويضيفه إلى prompt الذكاء الاصطناعي:
```
CURRICULUM CONTEXT for [Subject]:
Overview: ...
Core Concepts: ...
Key Terminology: ...
Academic Depth: ...
```

---

## التسلسل التقني

```text
المستخدم يختار كلية → التحقق من وجود curriculum_analysis
        ↓ غير موجود                    ↓ موجود
  seed-curriculum-analysis        يُستخدم مباشرة في توليد المقال
  (AI يحلل كل مادة)
        ↓
  يحفظ في faculties.curriculum_analysis
        ↓
  generate-academic-article يستخدمه كـ context
```

---

## الملفات المتأثرة

| الملف | التغيير |
|-------|---------|
| `supabase/migrations/new.sql` | إضافة عمود `curriculum_analysis` |
| `supabase/functions/seed-curriculum-analysis/index.ts` | Edge Function جديدة لتوليد التحليل |
| `supabase/functions/generate-academic-article/index.ts` | جلب واستخدام `curriculum_analysis` في الـ prompt |
| `supabase/config.toml` | تسجيل الـ function الجديدة |
| `src/pages/Academic.tsx` | زر لتشغيل التحليل + مؤشر حالة |

---

## ملاحظات مهمة
- التحليل يُولَّد **مرة واحدة فقط** لكل كلية ويُخزَّن، لا يتكرر مع كل مقال
- كل مادة تحصل على تحليل مستقل (~200-300 كلمة من الذكاء الاصطناعي)
- إذا كانت الكلية تحتوي 4 أقسام × 3 مواد = 12 استدعاء AI، لكن يتم مرة واحدة فقط
- يمكن للمستخدم إعادة التحليل إذا أراد تحديثه
