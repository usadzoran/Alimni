-- Reduce privilege and policy overlap for the Alimni admin portal.
-- Keep visitor-facing access in the anon role; administrator mutations require an authenticated allowlisted account.

ALTER TABLE public.alimni_admin_allowlist
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_alimni_admin_allowlist_user_id
    ON public.alimni_admin_allowlist(user_id) WHERE user_id IS NOT NULL;

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

DROP POLICY IF EXISTS "Alimni admins view all child profiles" ON public.children;
CREATE POLICY "Alimni admins view all child profiles"
    ON public.children FOR SELECT TO authenticated
    USING ((SELECT public.is_alimni_admin()));

DROP POLICY IF EXISTS "Visitors record one session" ON public.site_visits;
CREATE POLICY "Visitors record one session"
    ON public.site_visits FOR INSERT TO anon
    WITH CHECK (length(path) BETWEEN 1 AND 240);
DROP POLICY IF EXISTS "Admins read site visits" ON public.site_visits;
CREATE POLICY "Admins read site visits"
    ON public.site_visits FOR SELECT TO authenticated
    USING ((SELECT public.is_alimni_admin()));

DROP POLICY IF EXISTS "Visitors submit inquiries" ON public.site_inquiries;
CREATE POLICY "Visitors submit inquiries"
    ON public.site_inquiries FOR INSERT TO anon
    WITH CHECK (
        status = 'new'
        AND length(trim(name)) BETWEEN 2 AND 100
        AND length(trim(message)) BETWEEN 5 AND 5000
        AND (email IS NULL OR length(email) <= 254)
    );
DROP POLICY IF EXISTS "Admins manage inquiries" ON public.site_inquiries;
CREATE POLICY "Admins manage inquiries"
    ON public.site_inquiries FOR ALL TO authenticated
    USING ((SELECT public.is_alimni_admin()))
    WITH CHECK ((SELECT public.is_alimni_admin()));

DROP POLICY IF EXISTS "Public reads published resources" ON public.site_documents;
CREATE POLICY "Public reads published resources"
    ON public.site_documents FOR SELECT TO anon
    USING (is_published = TRUE);
DROP POLICY IF EXISTS "Admins manage resources" ON public.site_documents;
CREATE POLICY "Admins manage resources"
    ON public.site_documents FOR ALL TO authenticated
    USING ((SELECT public.is_alimni_admin()))
    WITH CHECK ((SELECT public.is_alimni_admin()));

DROP POLICY IF EXISTS "Public reads active ads" ON public.site_ads;
CREATE POLICY "Public reads active ads"
    ON public.site_ads FOR SELECT TO anon
    USING (is_active = TRUE);
DROP POLICY IF EXISTS "Admins manage ads" ON public.site_ads;
CREATE POLICY "Admins manage ads"
    ON public.site_ads FOR ALL TO authenticated
    USING ((SELECT public.is_alimni_admin()))
    WITH CHECK ((SELECT public.is_alimni_admin()));

DROP POLICY IF EXISTS "Public reads published Alimni documents" ON storage.objects;
CREATE POLICY "Public reads published Alimni documents"
    ON storage.objects FOR SELECT TO anon
    USING (
        bucket_id = 'alimni-documents'
        AND EXISTS (
            SELECT 1 FROM public.site_documents AS document
            WHERE document.storage_path = storage.objects.name
              AND document.is_published = TRUE
        )
    );
DROP POLICY IF EXISTS "Admins read all Alimni documents" ON storage.objects;
CREATE POLICY "Admins read all Alimni documents"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'alimni-documents' AND (SELECT public.is_alimni_admin()));
DROP POLICY IF EXISTS "Admins upload Alimni documents" ON storage.objects;
CREATE POLICY "Admins upload Alimni documents"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'alimni-documents' AND (SELECT public.is_alimni_admin()));
DROP POLICY IF EXISTS "Admins update Alimni documents" ON storage.objects;
CREATE POLICY "Admins update Alimni documents"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'alimni-documents' AND (SELECT public.is_alimni_admin()))
    WITH CHECK (bucket_id = 'alimni-documents' AND (SELECT public.is_alimni_admin()));
DROP POLICY IF EXISTS "Admins delete Alimni documents" ON storage.objects;
CREATE POLICY "Admins delete Alimni documents"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'alimni-documents' AND (SELECT public.is_alimni_admin()));
