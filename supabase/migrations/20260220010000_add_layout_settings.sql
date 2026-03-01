-- Add layout_settings to site_settings table
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS layout_settings JSONB DEFAULT '{"topbar_enabled": true}';
