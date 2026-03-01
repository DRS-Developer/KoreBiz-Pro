
-- Fix partners table schema to match application code

-- Add description column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'description') THEN
        ALTER TABLE public.partners ADD COLUMN description TEXT;
    END IF;
END $$;

-- Rename order to order_index if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'order') THEN
        ALTER TABLE public.partners RENAME COLUMN "order" TO order_index;
    END IF;
END $$;

-- Rename published to is_active if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'published') THEN
        ALTER TABLE public.partners RENAME COLUMN published TO is_active;
    END IF;
END $$;

-- Set default for is_active
ALTER TABLE public.partners ALTER COLUMN is_active SET DEFAULT true;

-- Ensure order_index is not null (optional, but good practice)
UPDATE public.partners SET order_index = 0 WHERE order_index IS NULL;
