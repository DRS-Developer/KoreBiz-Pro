-- Enable menu_sidebar_v2 feature flag
UPDATE public.site_settings 
SET features = jsonb_set(COALESCE(features, '{}'::jsonb), '{menu_sidebar_v2}', 'true');
