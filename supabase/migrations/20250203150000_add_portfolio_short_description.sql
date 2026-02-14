-- Add short_description to portfolios table for SEO and list views
ALTER TABLE public.portfolios 
ADD COLUMN IF NOT EXISTS short_description text;
