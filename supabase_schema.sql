-- =========================================================================
-- عالم الحروف والأرقام - مخطط قاعدة بيانات Supabase مع سياسات الأمان RLS
-- World of Letters & Numbers - Comprehensive Supabase SQL Schema
-- =========================================================================

-- تفعيل ملحقات بوستجريس اللازمة لتوليد المعرفات الفريدة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. جدول ملفات أولياء الأمور (مرتبط بحساب Supabase Auth)
CREATE TABLE IF NOT EXISTS public.parent_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT DEFAULT 'ولي الأمر',
    daily_goal_minutes INT DEFAULT 15,
    sound_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول ملفات الأطفال التابعين لولي الأمر
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES public.parent_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🐰',
    age SMALLINT NOT NULL CHECK (age BETWEEN 2 AND 7),
    age_group TEXT NOT NULL CHECK (age_group IN ('3-4', '5-6')),
    grade_level TEXT NOT NULL,
    learning_track TEXT CHECK (learning_track IN ('2-4', '5-7')),
    current_level INT NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 6),
    stars_count INT NOT NULL DEFAULT 0,
    total_time_minutes INT NOT NULL DEFAULT 0,
    unlocked_characters TEXT[] NOT NULL DEFAULT ARRAY['farfour_rabbit']::TEXT[],
    mastered_letters INT[] NOT NULL DEFAULT ARRAY[]::INT[],
    mastered_numbers INT[] NOT NULL DEFAULT ARRAY[]::INT[],
    completed_lessons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    troubled_items JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول الحروف العربية وبياناتها التعليمية (متاح للقراءة العامة لجميع المتعلمين)
CREATE TABLE IF NOT EXISTS public.letters (
    id INT PRIMARY KEY,
    letter TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    sound_phonic TEXT NOT NULL,
    isolated_shape TEXT NOT NULL,
    beginning_shape TEXT NOT NULL,
    middle_shape TEXT NOT NULL,
    ending_shape TEXT NOT NULL,
    example_word TEXT NOT NULL,
    example_tashkeel TEXT NOT NULL,
    example_meaning TEXT NOT NULL,
    example_emoji TEXT NOT NULL,
    description TEXT,
    color_hex TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول الأرقام والعد
CREATE TABLE IF NOT EXISTS public.numbers (
    id INT PRIMARY KEY,
    number INT NOT NULL UNIQUE,
    arabic_numeral TEXT NOT NULL,
    name_arabic TEXT NOT NULL,
    visual_emoji TEXT NOT NULL,
    item_label TEXT NOT NULL,
    level_tier INT NOT NULL CHECK (level_tier BETWEEN 1 AND 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. جدول تعريف المستويات وشروط الاجتياز
CREATE TABLE IF NOT EXISTS public.levels (
    id INT PRIMARY KEY,
    name TEXT NOT NULL,
    title_arabic TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    required_stars INT NOT NULL DEFAULT 0,
    min_exam_score_percent INT NOT NULL DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. جدول تقدم الطفل في الحروف والأرقام
CREATE TABLE IF NOT EXISTS public.child_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('letter', 'number')),
    item_id INT NOT NULL,
    mastered BOOLEAN DEFAULT FALSE,
    attempts_count INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    last_studied TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(child_id, item_type, item_id)
);

-- 7. جدول نتائج الاختبارات والمحاولات (Quiz Attempts)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('letter', 'number', 'game', 'level_exam')),
    title TEXT NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    score_percent INT NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. جدول الشارات والأوسمة
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    required_metric TEXT NOT NULL,
    required_value INT NOT NULL
);

-- 9. جدول شارات الأطفال المكتسبة
CREATE TABLE IF NOT EXISTS public.child_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(child_id, badge_id)
);

-- 10. سجل الأنشطة والوقت اليومي للطفل
CREATE TABLE IF NOT EXISTS public.daily_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INT NOT NULL DEFAULT 0,
    activities_completed INT NOT NULL DEFAULT 0,
    stars_earned INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(child_id, activity_date)
);

-- 11. جدول الشخصيات الكرتونية القابلة للفتح
CREATE TABLE IF NOT EXISTS public.child_characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    character_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(child_id, character_id)
);

-- =========================================================================
-- إعداد الفهارس (Indexes) لأداء فائق السرعة
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON public.children(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_progress_child_id ON public.child_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_child_id ON public.quiz_attempts(child_id);
CREATE INDEX IF NOT EXISTS idx_child_badges_child_id ON public.child_badges(child_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_child_id ON public.daily_activity_logs(child_id);

-- =========================================================================
-- تفعيل أمان الصفوف (Row Level Security - RLS)
-- =========================================================================
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_characters ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- سياسات الأمان (RLS Policies)
-- =========================================================================

-- أ. الجداول التعليمية العامة: قراءة متاحة للجميع (أولياء أمور وأطفال)
CREATE POLICY "Public read access for letters"
    ON public.letters FOR SELECT
    USING (true);

CREATE POLICY "Public read access for numbers"
    ON public.numbers FOR SELECT
    USING (true);

CREATE POLICY "Public read access for levels"
    ON public.levels FOR SELECT
    USING (true);

CREATE POLICY "Public read access for badges"
    ON public.badges FOR SELECT
    USING (true);

-- ب. جدول ملفات أولياء الأمور: ولي الأمر يقرأ ويعدل ملفه الخاص فقط
CREATE POLICY "Parents can view own profile"
    ON public.parent_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Parents can update own profile"
    ON public.parent_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Parents can insert own profile"
    ON public.parent_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ج. جدول الأطفال: ولي الأمر يقرأ ويتحكم بأطفاله فقط
CREATE POLICY "Parents can view their own children"
    ON public.children FOR SELECT
    USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert children for themselves"
    ON public.children FOR INSERT
    WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update their own children"
    ON public.children FOR UPDATE
    USING (parent_id = auth.uid());

CREATE POLICY "Parents can delete their own children"
    ON public.children FOR DELETE
    USING (parent_id = auth.uid());

-- د. جدول تقدم الطفل: محمي بحيث يمكن قراءته وتعديله فقط إذا كان الطفل تابعاً لولي الأمر المسجل
CREATE POLICY "Parents can view progress of their children"
    ON public.child_progress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = child_progress.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can insert progress for their children"
    ON public.child_progress FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = child_progress.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can update progress for their children"
    ON public.child_progress FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = child_progress.child_id
            AND children.parent_id = auth.uid()
        )
    );

-- هـ. جدول نتائج الاختبارات
CREATE POLICY "Parents can view quiz attempts of their children"
    ON public.quiz_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = quiz_attempts.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can insert quiz attempts for their children"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = quiz_attempts.child_id
            AND children.parent_id = auth.uid()
        )
    );

-- و. شارات الأطفال
CREATE POLICY "Parents can view badges of their children"
    ON public.child_badges FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = child_badges.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can award badges to their children"
    ON public.child_badges FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = child_badges.child_id
            AND children.parent_id = auth.uid()
        )
    );

-- ز. السجل اليومي والشخصيات
CREATE POLICY "Parents can view daily logs of their children"
    ON public.daily_activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = daily_activity_logs.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can manage child characters"
    ON public.child_characters FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = child_characters.child_id
            AND children.parent_id = auth.uid()
        )
    );
