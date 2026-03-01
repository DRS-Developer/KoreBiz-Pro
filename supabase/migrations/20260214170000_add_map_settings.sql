ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS map_settings jsonb DEFAULT '{"lat": -23.55052, "lng": -46.633308, "zoom": 15}'::jsonb;
