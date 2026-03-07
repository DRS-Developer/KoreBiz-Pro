-- Add features column to site_settings for feature flags
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{"menu_sidebar_v2": false}'::jsonb;

-- Update RLS policies for site_settings to ensure safety (already present but reinforcing)
-- (Assuming policies exist from previous migration)
