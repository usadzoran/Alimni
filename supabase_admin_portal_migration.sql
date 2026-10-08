-- Alimni admin portal, visitor analytics, inquiries, public resources, and isolated ad snippets.
-- The administrator allowlist is intentionally empty in this file; seed the owner email privately
-- in Supabase after applying the schema migration. Never place admin emails or passwords in the public repository.

CREATE TABLE IF NOT EXISTS public.alimni_admin_allowlist (
    email TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT alimni_admin_allowlist_lowercase_email CHECK (email = lower(email)),
    CONSTRAINT alimni_admin_allowlist_email_format CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

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

CREATE TABLE IF NOT EXISTS public.site_visits (
    session_id UUID PRIMARY KEY,
    path TEXT NOT NULL DEFAULT '/',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT site_visits_path_length CHECK (length(path) BETWEEN 1 AND 240)
);

CREATE TABLE IF NOT EXISTS public.site_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT site_inquiries_name_length CHECK (length(trim(name)) BETWEEN 2 AND 100),
    CONSTRAINT site_inquiries_email_length CHECK (email IS NULL OR length(email) <= 254),
    CONSTRAINT site_inquiries_email_format CHECK (email IS NULL OR email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
    CONSTRAINT site_inquiries_message_length CHECK (length(trim(message)) BETWEEN 5 AND 5000)
);

CREATE TABLE IF NOT EXISTS public.site_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT site_documents_title_length CHECK (length(trim(title)) BETWEEN 2 AND 140),
    CONSTRAINT site_documents_description_length CHECK (length(description) <= 1000),
    CONSTRAINT site_documents_file_size CHECK (file_size BETWEEN 1 AND 10485760),
    CONSTRAINT site_documents_mime_type CHECK (mime_type IN (
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ))
);

CREATE TABLE IF NOT EXISTS public.site_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    html_content TEXT NOT NULL,
    placements TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT site_ads_title_length CHECK (length(trim(title)) BETWEEN 2 AND 120),
    CONSTRAINT site_ads_html_length CHECK (length(html_content) BETWEEN 1 AND 30000),
    CONSTRAINT site_ads_placements CHECK (
        cardinality(placements) BETWEEN 1 AND 4
        AND placements <@ ARRAY['home-banner', 'learning-footer', 'public-library', 'site-footer']::TEXT[]
    )
);

CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_inquiries_status_created_at ON public.site_inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_documents_published_created_at ON public.site_documents(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_ads_placements ON public.site_ads USING GIN(placements);
CREATE UNIQUE INDEX IF NOT EXISTS idx_alimni_admin_allowlist_user_id
    ON public.alimni_admin_allowlist(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.alimni_admin_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_ads ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.alimni_admin_allowlist TO authenticated;
GRANT INSERT ON public.site_visits TO anon;
GRANT SELECT ON public.site_visits TO authenticated;
GRANT INSERT ON public.site_inquiries TO anon;
GRANT SELECT, UPDATE, DELETE ON public.site_inquiries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_ads TO authenticated;
GRANT SELECT ON public.site_documents, public.site_ads TO anon;
GRANT SELECT ON public.children TO authenticated;

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

-- Private bucket: only published objects can be read by the public; drafts remain private.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'alimni-documents',
    'alimni-documents',
    FALSE,
    10485760,
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::TEXT[]
)
ON CONFLICT (id) DO NOTHING;

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
