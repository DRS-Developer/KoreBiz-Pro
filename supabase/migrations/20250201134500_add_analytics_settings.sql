ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS analytics_settings JSONB DEFAULT '{}'::jsonb;
