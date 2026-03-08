WITH latest_general_image AS (
  SELECT
    'https://vymiwxuizkcvtgrobgro.supabase.co/storage/v1/object/public/media/' || name AS public_url
  FROM storage.objects
  WHERE bucket_id = 'media'
    AND name LIKE 'geral/%'
  ORDER BY created_at DESC
  LIMIT 1
)
UPDATE public.home_content
SET
  content = jsonb_set(
    content,
    '{background_image}',
    to_jsonb((SELECT public_url FROM latest_general_image)),
    true
  ),
  updated_at = timezone('utc'::text, now())
WHERE section_key = 'hero'
  AND EXISTS (SELECT 1 FROM latest_general_image);
