
-- Migration: Update Site Name to KoreBiz-Pro
-- Description: Updates the site_name, site_description and contact_email in the site_settings table

UPDATE public.site_settings
SET 
    site_name = 'KoreBiz-Pro',
    site_description = 'Soluções inteligentes em instalações e manutenção.',
    contact_email = 'contato@korebiz-pro.com.br'
WHERE id IS NOT NULL;
