ALTER TABLE public.system_modules
  ALTER COLUMN is_sort_enabled SET DEFAULT false;

UPDATE public.system_modules
SET is_sort_enabled = false
WHERE is_sort_enabled IS DISTINCT FROM false;
