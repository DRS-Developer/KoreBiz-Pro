
-- Add new columns for SEO, Legal Pages, and 404 Customization
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS privacy_policy text DEFAULT '<h2>Política de Privacidade</h2><p>Em construção...</p>',
ADD COLUMN IF NOT EXISTS terms_of_use text DEFAULT '<h2>Termos de Uso</h2><p>Em construção...</p>',
ADD COLUMN IF NOT EXISTS seo_keywords text DEFAULT 'instalações, elétrica, manutenção, residencial, industrial',
ADD COLUMN IF NOT EXISTS seo_title_suffix text DEFAULT '| KoreBiz-Pro',
ADD COLUMN IF NOT EXISTS not_found_title text DEFAULT 'Página não encontrada',
ADD COLUMN IF NOT EXISTS not_found_message text DEFAULT 'Desculpe, a página que você está procurando não existe ou foi movida.';
