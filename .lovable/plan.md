

## Plan: Academic Study Mode for High School & University Students

### Overview
Create a dedicated "Academic Articles" section where students select their education level (high school / university) and their faculty/major. The system generates articles focused on academic terminology and concepts from their field, with harder quizzes.

### Architecture

```text
Student → /academic → Selects education stage → Selects faculty/major
  → Edge function generates academic article using faculty curriculum context
  → Harder quiz (10 questions, terminology-focused, analytical)
```

### Database Changes

**New table: `faculties`** (pre-populated reference data)
- `id` (uuid, PK)
- `stage` (text) — `high_school` or `university`
- `name_ar` (text) — Arabic name
- `name_en` (text) — English name
- `key_topics` (text[]) — Core topics/curriculum keywords for AI prompt context
- `description` (text) — Brief description of the field

Pre-populated with ~15-20 entries:
- **High School**: Science Track, Literary Track, Math Track
- **University**: Medicine, Engineering, Computer Science, Business/Economics, Law, Pharmacy, Dentistry, Science, Arts/Literature, Media, Education, Architecture

**New column on `profiles`**: `faculty_id` (uuid, nullable, FK to faculties)

**New column on `articles`**: `is_academic` (boolean, default false)

### New Files

1. **`src/pages/Academic.tsx`** — Main academic articles page
   - Stage selector (high school / university)
   - Faculty/major grid selector
   - Saves selection to profile
   - Generates academic articles via new edge function
   - Uses existing `WordTooltip`, `GrammarTip`, `AudioPlayer` components
   - Uses `ArticleQuiz` with `difficulty="hard"` prop

2. **`supabase/functions/generate-academic-article/index.ts`** — New edge function
   - Receives `faculty_id`, `level`, and `topic` (optional)
   - Fetches faculty's `key_topics` from DB
   - Generates article with academic register, field-specific terminology
   - Returns more key_words (8-12 instead of 5-8)
   - Prompt emphasizes: academic vocabulary, formal register, field-specific concepts

3. **`supabase/functions/generate-academic-quiz/index.ts`** — Harder quiz generator
   - 8-10 questions instead of 6-8
   - Includes terminology definition questions
   - Includes analytical/application questions
   - Higher XP reward (score * 8 instead of * 5)

### Changes to Existing Files

- **`src/App.tsx`** — Add `/academic` route
- **`src/components/Layout.tsx`** — Add "الدراسة الأكاديمية" nav item with `GraduationCap` icon
- **`src/components/ArticleQuiz.tsx`** — Add optional `difficulty` prop that passes to the quiz edge function
- **`supabase/config.toml`** — Add new edge functions config

### Edge Function Prompt Strategy

The `generate-academic-article` function will use faculty `key_topics` as context:

```
Generate an academic English article for a {faculty_name} student at {level}.
Focus on these curriculum topics: {key_topics}.
Use formal academic register with field-specific terminology.
Include 8-12 key academic terms the student should learn.
Article should be 300-500 words with proper academic structure.
```

### Migration SQL Summary
1. Create `faculties` table with RLS (public SELECT, no insert/update/delete for users)
2. Insert seed data for all faculties
3. Add `faculty_id` column to `profiles`
4. Add `is_academic` boolean to `articles`

### Steps
1. Run migration (create table, seed data, alter existing tables)
2. Create `generate-academic-article` edge function
3. Create `generate-academic-quiz` edge function
4. Build `Academic.tsx` page
5. Update `App.tsx`, `Layout.tsx`, `ArticleQuiz.tsx`, `config.toml`

