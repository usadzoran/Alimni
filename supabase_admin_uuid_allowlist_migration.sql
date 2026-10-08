-- Bind Alimni administrator privileges to an explicitly provisioned Supabase Auth user ID.
-- Email/password confirmation settings are unchanged; child anonymous sessions remain unaffected.

ALTER TABLE public.alimni_admin_allowlist
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_alimni_admin_allowlist_user_id
    ON public.alimni_admin_allowlist(user_id)
    WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.is_alimni_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.alimni_admin_allowlist AS allowed
        WHERE allowed.user_id = (SELECT auth.uid())
    );
$$;

REVOKE ALL ON FUNCTION public.is_alimni_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_alimni_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins read their own allowlist entry" ON public.alimni_admin_allowlist;
CREATE POLICY "Admins read their own allowlist entry"
    ON public.alimni_admin_allowlist FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));
