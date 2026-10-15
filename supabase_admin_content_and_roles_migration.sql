-- Alimni admin content management, scoped moderator permissions, and public visitor content.
-- Apply after supabase_admin_portal_migration.sql and its security hardening migration.

ALTER TABLE public.alimni_admin_allowlist
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'owner',
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.alimni_admin_allowlist
  DROP CONSTRAINT IF EXISTS alimni_admin_allowlist_role_check;
ALTER TABLE public.alimni_admin_allowlist
  ADD CONSTRAINT alimni_admin_allowlist_role_check
  CHECK (role IN ('owner', 'admin', 'moderator'));

CREATE OR REPLACE FUNCTION public.is_alimni_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.alimni_admin_allowlist AS allowed
    WHERE allowed.user_id = (SELECT auth.uid()) AND allowed.is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.has_alimni_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.alimni_admin_allowlist AS allowed
    WHERE allowed.user_id = (SELECT auth.uid())
      AND allowed.is_active = TRUE
      AND (
        allowed.role IN ('owner', 'admin')
        OR COALESCE((allowed.permissions ->> p_permission)::boolean, FALSE) = TRUE
      )
  );
$$;
REVOKE ALL ON FUNCTION public.has_alimni_permission(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_alimni_permission(TEXT) TO authenticated;

CREATE TABLE IF NOT EXISTS public.alimni_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT 'عام',
  age_group TEXT NOT NULL DEFAULT 'all' CHECK (age_group IN ('all', '2-4', '5-7')),
  content TEXT NOT NULL,
  duration_minutes SMALLINT NOT NULL DEFAULT 10 CHECK (duration_minutes BETWEEN 1 AND 120),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT alimni_lessons_title_length CHECK (length(trim(title)) BETWEEN 2 AND 160),
  CONSTRAINT alimni_lessons_description_length CHECK (length(description) <= 1000),
  CONSTRAINT alimni_lessons_content_length CHECK (length(trim(content)) BETWEEN 10 AND 30000)
);

CREATE TABLE IF NOT EXISTS public.alimni_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT 'عام',
  age_group TEXT NOT NULL DEFAULT 'all' CHECK (age_group IN ('all', '2-4', '5-7')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  points SMALLINT NOT NULL DEFAULT 1 CHECK (points BETWEEN 1 AND 100),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT alimni_challenges_title_length CHECK (length(trim(title)) BETWEEN 2 AND 160),
  CONSTRAINT alimni_challenges_instructions_length CHECK (length(instructions) <= 2000),
  CONSTRAINT alimni_challenges_questions_array CHECK (jsonb_typeof(questions) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_alimni_lessons_published ON public.alimni_lessons(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alimni_challenges_published ON public.alimni_challenges(is_published, created_at DESC);

ALTER TABLE public.alimni_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alimni_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads published Alimni lessons" ON public.alimni_lessons;
CREATE POLICY "Public reads published Alimni lessons" ON public.alimni_lessons
  FOR SELECT TO anon USING (is_published = TRUE);
DROP POLICY IF EXISTS "Authenticated reads published Alimni lessons" ON public.alimni_lessons;
CREATE POLICY "Authenticated reads published Alimni lessons" ON public.alimni_lessons
  FOR SELECT TO authenticated USING (is_published = TRUE OR public.has_alimni_permission('content.lessons'));
DROP POLICY IF EXISTS "Editors manage Alimni lessons" ON public.alimni_lessons;
CREATE POLICY "Editors manage Alimni lessons" ON public.alimni_lessons
  FOR ALL TO authenticated
  USING (public.has_alimni_permission('content.lessons'))
  WITH CHECK (public.has_alimni_permission('content.lessons'));

DROP POLICY IF EXISTS "Public reads published Alimni challenges" ON public.alimni_challenges;
CREATE POLICY "Public reads published Alimni challenges" ON public.alimni_challenges
  FOR SELECT TO anon USING (is_published = TRUE);
DROP POLICY IF EXISTS "Authenticated reads published Alimni challenges" ON public.alimni_challenges;
CREATE POLICY "Authenticated reads published Alimni challenges" ON public.alimni_challenges
  FOR SELECT TO authenticated USING (is_published = TRUE OR public.has_alimni_permission('content.challenges'));
DROP POLICY IF EXISTS "Editors manage Alimni challenges" ON public.alimni_challenges;
CREATE POLICY "Editors manage Alimni challenges" ON public.alimni_challenges
  FOR ALL TO authenticated
  USING (public.has_alimni_permission('content.challenges'))
  WITH CHECK (public.has_alimni_permission('content.challenges'));

-- Team management is only exposed through security-definer functions; clients cannot write the allowlist directly.
CREATE OR REPLACE FUNCTION public.list_alimni_team()
RETURNS TABLE (email TEXT, user_id UUID, role TEXT, permissions JSONB, is_active BOOLEAN, created_at TIMESTAMPTZ)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_alimni_permission('team.manage') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  RETURN QUERY SELECT a.email, a.user_id, a.role, a.permissions, a.is_active, a.created_at
  FROM public.alimni_admin_allowlist a ORDER BY a.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_alimni_moderator(
  p_email TEXT, p_user_id UUID, p_role TEXT DEFAULT 'moderator', p_permissions JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_alimni_permission('team.manage') THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF p_role NOT IN ('admin', 'moderator') THEN RAISE EXCEPTION 'invalid role'; END IF;
  IF p_email IS NULL OR lower(trim(p_email)) <> p_email THEN RAISE EXCEPTION 'email must be lowercase'; END IF;
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'user id is required'; END IF;
  INSERT INTO public.alimni_admin_allowlist(email, user_id, role, permissions, is_active)
  VALUES (lower(trim(p_email)), p_user_id, p_role, COALESCE(p_permissions, '{}'::jsonb), TRUE)
  ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id, role = EXCLUDED.role,
    permissions = EXCLUDED.permissions, is_active = TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_alimni_member_active(p_user_id UUID, p_is_active BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_alimni_permission('team.manage') THEN RAISE EXCEPTION 'not authorized'; END IF;
  UPDATE public.alimni_admin_allowlist SET is_active = p_is_active WHERE user_id = p_user_id AND role <> 'owner';
END;
$$;

REVOKE ALL ON FUNCTION public.list_alimni_team() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_alimni_moderator(TEXT, UUID, TEXT, JSONB) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_alimni_member_active(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_alimni_team() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_alimni_moderator(TEXT, UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_alimni_member_active(UUID, BOOLEAN) TO authenticated;

-- Replace broad admin policies with permission-aware policies for existing resources.
DROP POLICY IF EXISTS "Admins manage ads" ON public.site_ads;
CREATE POLICY "Admins manage ads by permission" ON public.site_ads FOR ALL TO authenticated
  USING (public.has_alimni_permission('ads.manage')) WITH CHECK (public.has_alimni_permission('ads.manage'));
DROP POLICY IF EXISTS "Admins manage resources" ON public.site_documents;
CREATE POLICY "Admins manage resources by permission" ON public.site_documents FOR ALL TO authenticated
  USING (public.has_alimni_permission('documents.manage')) WITH CHECK (public.has_alimni_permission('documents.manage'));
DROP POLICY IF EXISTS "Admins manage inquiries" ON public.site_inquiries;
CREATE POLICY "Admins manage inquiries by permission" ON public.site_inquiries FOR ALL TO authenticated
  USING (public.has_alimni_permission('inquiries.manage')) WITH CHECK (public.has_alimni_permission('inquiries.manage'));
DROP POLICY IF EXISTS "Alimni admins view all child profiles" ON public.children;
CREATE POLICY "Admins view students by permission" ON public.children FOR SELECT TO authenticated
  USING (public.has_alimni_permission('students.view'));
DROP POLICY IF EXISTS "Admins read site visits" ON public.site_visits;
CREATE POLICY "Admins read site visits by permission" ON public.site_visits FOR SELECT TO authenticated
  USING (public.has_alimni_permission('analytics.view'));

DROP POLICY IF EXISTS "Admins read all Alimni documents" ON storage.objects;
CREATE POLICY "Editors read Alimni documents" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'alimni-documents' AND public.has_alimni_permission('documents.manage'));
DROP POLICY IF EXISTS "Admins upload Alimni documents" ON storage.objects;
CREATE POLICY "Editors upload Alimni documents" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'alimni-documents' AND public.has_alimni_permission('documents.manage'));
DROP POLICY IF EXISTS "Admins update Alimni documents" ON storage.objects;
CREATE POLICY "Editors update Alimni documents" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'alimni-documents' AND public.has_alimni_permission('documents.manage'))
  WITH CHECK (bucket_id = 'alimni-documents' AND public.has_alimni_permission('documents.manage'));
DROP POLICY IF EXISTS "Admins delete Alimni documents" ON storage.objects;
CREATE POLICY "Editors delete Alimni documents" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'alimni-documents' AND public.has_alimni_permission('documents.manage'));
