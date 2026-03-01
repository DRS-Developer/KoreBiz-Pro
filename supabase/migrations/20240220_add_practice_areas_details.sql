
-- Migration to add what_we_offer and methodology columns to practice_areas table

ALTER TABLE practice_areas 
ADD COLUMN IF NOT EXISTS what_we_offer text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS methodology text DEFAULT '';

-- Update existing rows with empty defaults if needed (optional)
-- UPDATE practice_areas SET what_we_offer = '{}' WHERE what_we_offer IS NULL;
-- UPDATE practice_areas SET methodology = '' WHERE methodology IS NULL;
