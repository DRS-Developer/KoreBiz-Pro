ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS indexing_enabled BOOLEAN DEFAULT true;
