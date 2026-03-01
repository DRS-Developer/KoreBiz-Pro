ALTER TABLE pages ADD COLUMN IF NOT EXISTS sections jsonb DEFAULT '{}'::jsonb;
