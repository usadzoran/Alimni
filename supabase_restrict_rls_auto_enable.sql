-- This database-level event-trigger helper is not used by the Alimni client.
-- Keep it available to its event trigger, but prevent direct RPC execution by API roles.
DO $$
BEGIN
    IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
        REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
    END IF;
END;
$$;
