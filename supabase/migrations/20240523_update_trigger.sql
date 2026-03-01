-- Create a function to update the global site_settings timestamp
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.site_settings
  SET updated_at = NOW()
  WHERE id = (SELECT id FROM public.site_settings LIMIT 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all relevant tables
-- Services
DROP TRIGGER IF EXISTS trigger_update_timestamp_services ON public.services;
CREATE TRIGGER trigger_update_timestamp_services
AFTER INSERT OR UPDATE OR DELETE ON public.services
FOR EACH ROW EXECUTE FUNCTION update_site_settings_timestamp();

-- Portfolios
DROP TRIGGER IF EXISTS trigger_update_timestamp_portfolios ON public.portfolios;
CREATE TRIGGER trigger_update_timestamp_portfolios
AFTER INSERT OR UPDATE OR DELETE ON public.portfolios
FOR EACH ROW EXECUTE FUNCTION update_site_settings_timestamp();

-- Pages
DROP TRIGGER IF EXISTS trigger_update_timestamp_pages ON public.pages;
CREATE TRIGGER trigger_update_timestamp_pages
AFTER INSERT OR UPDATE OR DELETE ON public.pages
FOR EACH ROW EXECUTE FUNCTION update_site_settings_timestamp();

-- Profiles
DROP TRIGGER IF EXISTS trigger_update_timestamp_profiles ON public.profiles;
CREATE TRIGGER trigger_update_timestamp_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_site_settings_timestamp();

-- Practice Areas
DROP TRIGGER IF EXISTS trigger_update_timestamp_practice_areas ON public.practice_areas;
CREATE TRIGGER trigger_update_timestamp_practice_areas
AFTER INSERT OR UPDATE OR DELETE ON public.practice_areas
FOR EACH ROW EXECUTE FUNCTION update_site_settings_timestamp();

-- Partners
DROP TRIGGER IF EXISTS trigger_update_timestamp_partners ON public.partners;
CREATE TRIGGER trigger_update_timestamp_partners
AFTER INSERT OR UPDATE OR DELETE ON public.partners
FOR EACH ROW EXECUTE FUNCTION update_site_settings_timestamp();

-- Home Content (JSON config)
DROP TRIGGER IF EXISTS trigger_update_timestamp_home_content ON public.home_content;
CREATE TRIGGER trigger_update_timestamp_home_content
AFTER INSERT OR UPDATE OR DELETE ON public.home_content
FOR EACH ROW EXECUTE FUNCTION update_site_settings_timestamp();
