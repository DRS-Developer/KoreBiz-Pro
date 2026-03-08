WITH extracted AS (
  SELECT
    content->>'background_image' AS url
  FROM public.home_content
  WHERE section_key = 'hero'
  UNION ALL
  SELECT
    content->>'image_url' AS url
  FROM public.home_content
  WHERE section_key = 'about'
),
normalized AS (
  SELECT DISTINCT
    url,
    split_part(url, '/', array_length(string_to_array(url, '/'), 1)) AS filename
  FROM extracted
  WHERE url IS NOT NULL
    AND url <> ''
    AND url LIKE '%/storage/v1/object/public/media/%'
)
INSERT INTO public.media_files (filename, url, folder, mime_type)
SELECT
  filename,
  url,
  'general',
  CASE
    WHEN filename ILIKE '%.webp' THEN 'image/webp'
    WHEN filename ILIKE '%.png' THEN 'image/png'
    WHEN filename ILIKE '%.jpg' OR filename ILIKE '%.jpeg' THEN 'image/jpeg'
    WHEN filename ILIKE '%.gif' THEN 'image/gif'
    WHEN filename ILIKE '%.svg' THEN 'image/svg+xml'
    ELSE NULL
  END AS mime_type
FROM normalized
ON CONFLICT (url) DO NOTHING;
