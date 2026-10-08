-- Alimni: anonymous browser session + private child profiles and learning data.
-- Run once with Supabase migrations. Anonymous users are real Auth users; RLS binds every row to auth.uid().

CREATE TABLE IF NOT EXISTS public.parent_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL DEFAULT 'ولي الأمر',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('letter', 'number', 'game', 'level_exam')),
    title TEXT NOT NULL,
    total_questions INT NOT NULL CHECK (total_questions >= 0),
    correct_answers INT NOT NULL CHECK (correct_answers >= 0),
    score_percent INT NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_children_parent_id ON public.children(parent_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_child_id ON public.quiz_attempts(child_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON public.quiz_attempts(created_at DESC);

ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO authenticated;
REVOKE ALL ON public.parent_profiles, public.children, public.quiz_attempts FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.parent_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.children TO authenticated;
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;

DROP POLICY IF EXISTS "Owner manages own anonymous profile" ON public.parent_profiles;
CREATE POLICY "Owner manages own anonymous profile"
    ON public.parent_profiles FOR ALL TO authenticated
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Owner manages own children" ON public.children;
CREATE POLICY "Owner manages own children"
    ON public.children FOR ALL TO authenticated
    USING (parent_id = (SELECT auth.uid()))
    WITH CHECK (parent_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Owner reads own children's quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Owner reads own children's quiz attempts"
    ON public.quiz_attempts FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.children
        WHERE children.id = quiz_attempts.child_id
          AND children.parent_id = (SELECT auth.uid())
    ));

DROP POLICY IF EXISTS "Owner records own children's quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Owner records own children's quiz attempts"
    ON public.quiz_attempts FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.children
        WHERE children.id = quiz_attempts.child_id
          AND children.parent_id = (SELECT auth.uid())
    ));
