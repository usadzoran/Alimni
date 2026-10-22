-- Support the primary 4th/5th grade track.
DO $$
DECLARE
  constraint_row RECORD;
BEGIN
  FOR constraint_row IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.children'::regclass
      AND contype = 'c'
      AND (pg_get_constraintdef(oid) LIKE '%age%' OR pg_get_constraintdef(oid) LIKE '%learning_track%' OR pg_get_constraintdef(oid) LIKE '%age_group%')
  LOOP
    EXECUTE format('ALTER TABLE public.children DROP CONSTRAINT IF EXISTS %I', constraint_row.conname);
  END LOOP;
END
$$;

ALTER TABLE public.children
  ADD CONSTRAINT children_age_check CHECK (age BETWEEN 2 AND 12),
  ADD CONSTRAINT children_age_group_check CHECK (age_group IN ('3-4', '5-6', '7-12')),
  ADD CONSTRAINT children_learning_track_check CHECK (learning_track IN ('2-4', '5-7', 'primary-4-5'));
