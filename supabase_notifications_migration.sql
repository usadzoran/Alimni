-- Alimni realtime in-app notifications.
-- Apply after supabase_admin_content_and_roles_migration.sql.

CREATE TABLE IF NOT EXISTS public.site_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('announcement', 'lesson', 'challenge')),
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  target_age_group TEXT NOT NULL DEFAULT 'all' CHECK (target_age_group IN ('all', '2-4', '5-7')),
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_notifications_title_length CHECK (length(trim(title)) BETWEEN 2 AND 180),
  CONSTRAINT site_notifications_message_length CHECK (length(message) <= 1000)
);

CREATE INDEX IF NOT EXISTS idx_site_notifications_created_at ON public.site_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_notifications_target_age ON public.site_notifications(target_age_group, created_at DESC);
ALTER TABLE public.site_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads site notifications" ON public.site_notifications;
CREATE POLICY "Public reads site notifications" ON public.site_notifications
  FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Authenticated reads site notifications" ON public.site_notifications;
CREATE POLICY "Authenticated reads site notifications" ON public.site_notifications
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.site_notifications TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_alimni_publish_notification()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  target TEXT := 'all';
  item_type TEXT := TG_ARGV[0];
  item_title TEXT := NEW.title;
  item_message TEXT := '';
BEGIN
  IF item_type = 'lesson' THEN
    target := COALESCE(NEW.age_group, 'all');
    item_message := COALESCE(NULLIF(NEW.description, ''), 'تم نشر درس جديد يمكنك استكشافه الآن.');
  ELSIF item_type = 'challenge' THEN
    target := COALESCE(NEW.age_group, 'all');
    item_message := COALESCE(NULLIF(NEW.instructions, ''), 'تم نشر تحدٍّ جديد. جرّبه واربح نقاطًا.');
  ELSE
    item_message := 'تم نشر إعلان جديد في عَلِّمني.';
  END IF;

  IF NEW.is_published = TRUE AND (TG_OP = 'INSERT' OR COALESCE(OLD.is_published, FALSE) = FALSE) THEN
    INSERT INTO public.site_notifications(notification_type, title, message, target_age_group, link)
    VALUES (CASE WHEN item_type = 'ad' THEN 'announcement' ELSE item_type END,
            CASE WHEN item_type = 'ad' THEN 'إعلان جديد: ' || item_title ELSE item_title END,
            left(item_message, 1000), target, NULL);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS alimni_lesson_publish_notification ON public.alimni_lessons;
CREATE TRIGGER alimni_lesson_publish_notification
  AFTER INSERT OR UPDATE OF is_published ON public.alimni_lessons
  FOR EACH ROW EXECUTE FUNCTION public.create_alimni_publish_notification('lesson');
DROP TRIGGER IF EXISTS alimni_challenge_publish_notification ON public.alimni_challenges;
CREATE TRIGGER alimni_challenge_publish_notification
  AFTER INSERT OR UPDATE OF is_published ON public.alimni_challenges
  FOR EACH ROW EXECUTE FUNCTION public.create_alimni_publish_notification('challenge');
DROP TRIGGER IF EXISTS alimni_ad_publish_notification ON public.site_ads;
CREATE TRIGGER alimni_ad_publish_notification
  AFTER INSERT OR UPDATE OF is_active ON public.site_ads
  FOR EACH ROW EXECUTE FUNCTION public.create_alimni_publish_notification('ad');

-- Make INSERT events available to the browser Realtime client.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'site_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_notifications;
  END IF;
END;
$$;
