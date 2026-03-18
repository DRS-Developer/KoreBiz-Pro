CREATE TABLE IF NOT EXISTS public.form_image_crop_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  aspect_width INTEGER NOT NULL CHECK (aspect_width > 0),
  aspect_height INTEGER NOT NULL CHECK (aspect_height > 0),
  min_width INTEGER NOT NULL CHECK (min_width > 0),
  min_height INTEGER NOT NULL CHECK (min_height > 0),
  max_width INTEGER NOT NULL CHECK (max_width > 0),
  max_height INTEGER NOT NULL CHECK (max_height > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT form_image_crop_configs_minmax_width CHECK (min_width <= max_width),
  CONSTRAINT form_image_crop_configs_minmax_height CHECK (min_height <= max_height)
);

CREATE INDEX IF NOT EXISTS idx_form_image_crop_configs_form_key
  ON public.form_image_crop_configs(form_key);

ALTER TABLE public.form_image_crop_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and Editors can read form image crop configs" ON public.form_image_crop_configs;
CREATE POLICY "Admins and Editors can read form image crop configs"
ON public.form_image_crop_configs
FOR SELECT
USING (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can insert form image crop configs" ON public.form_image_crop_configs;
CREATE POLICY "Admins and Editors can insert form image crop configs"
ON public.form_image_crop_configs
FOR INSERT
WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can update form image crop configs" ON public.form_image_crop_configs;
CREATE POLICY "Admins and Editors can update form image crop configs"
ON public.form_image_crop_configs
FOR UPDATE
USING (public.is_admin_or_editor())
WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can delete form image crop configs" ON public.form_image_crop_configs;
CREATE POLICY "Admins and Editors can delete form image crop configs"
ON public.form_image_crop_configs
FOR DELETE
USING (public.is_admin_or_editor());

INSERT INTO public.form_image_crop_configs (
  form_key,
  label,
  description,
  aspect_width,
  aspect_height,
  min_width,
  min_height,
  max_width,
  max_height,
  is_active
) VALUES
  ('services.featured', 'Serviços · Imagem destacada', 'Imagem principal dos cards e listagem de serviços.', 4, 3, 800, 600, 1920, 1440, true),
  ('portfolio.cover', 'Portfólio · Capa do projeto', 'Imagem de destaque da página de detalhe do projeto.', 84, 50, 840, 500, 2520, 1500, true),
  ('portfolio.gallery', 'Portfólio · Galeria', 'Imagens adicionais da galeria de cada projeto.', 4, 3, 800, 600, 1920, 1440, true),
  ('pages.featured', 'Páginas · Imagem destacada', 'Imagem principal para páginas institucionais.', 84, 50, 840, 500, 2520, 1500, true),
  ('partners.logo', 'Parceiros · Logotipo', 'Logo exibido na seção de parceiros.', 2, 1, 240, 120, 1200, 600, true),
  ('practice-areas.image', 'Áreas de Atuação · Imagem', 'Imagem ou ícone dos cards de áreas de atuação.', 4, 3, 800, 600, 1920, 1440, true),
  ('home.hero', 'Home · Hero', 'Imagem de fundo do banner principal da home.', 16, 9, 1920, 1080, 3840, 2160, true),
  ('home.about', 'Home · Sobre nós', 'Imagem ilustrativa da seção Sobre Nós.', 4, 3, 800, 600, 1920, 1440, true),
  ('settings.logo', 'Configurações · Logo do site', 'Logo institucional usado no cabeçalho e branding.', 16, 9, 320, 180, 1920, 1080, true),
  ('settings.og', 'Configurações · OG Image', 'Imagem para compartilhamento social e SEO.', 1200, 630, 1200, 630, 2400, 1260, true)
ON CONFLICT (form_key) DO UPDATE
SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  aspect_width = EXCLUDED.aspect_width,
  aspect_height = EXCLUDED.aspect_height,
  min_width = EXCLUDED.min_width,
  min_height = EXCLUDED.min_height,
  max_width = EXCLUDED.max_width,
  max_height = EXCLUDED.max_height,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());
