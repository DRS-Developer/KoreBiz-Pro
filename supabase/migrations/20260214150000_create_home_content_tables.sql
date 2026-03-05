
-- Create home_content table
CREATE TABLE IF NOT EXISTS public.home_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL UNIQUE,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create practice_areas table
CREATE TABLE IF NOT EXISTS public.practice_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies for home_content
CREATE POLICY "Allow public read access on home_content"
    ON public.home_content FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow authenticated update access on home_content"
    ON public.home_content FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access on home_content"
    ON public.home_content FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policies for practice_areas
CREATE POLICY "Allow public read access on practice_areas"
    ON public.practice_areas FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow authenticated full access on practice_areas"
    ON public.practice_areas FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policies for partners
CREATE POLICY "Allow public read access on partners"
    ON public.partners FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow authenticated full access on partners"
    ON public.partners FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert initial data for home_content (Hero Section)
INSERT INTO public.home_content (section_key, content)
VALUES (
    'hero',
    '{
        "title": "Soluções Completas em Instalações e Manutenção",
        "description": "Excelência técnica e compromisso com a qualidade para sua empresa e residência. Especialistas em elétrica, hidráulica e manutenção predial.",
        "primary_button_text": "Solicitar Orçamento",
        "primary_button_link": "/contato",
        "secondary_button_text": "Nossos Serviços",
        "secondary_button_link": "/servicos",
        "background_image": ""
    }'::jsonb
) ON CONFLICT (section_key) DO NOTHING;

-- Insert initial data for home_content (About Section)
INSERT INTO public.home_content (section_key, content)
VALUES (
    'about',
    '{
        "title": "Compromisso com a Qualidade e Segurança",
        "subtitle": "Sobre Nós",
        "description": "A KoreBiz-Pro nasceu com o propósito de oferecer serviços técnicos de alta qualidade, focando na segurança e satisfação total dos nossos clientes.",
        "image_url": "",
        "button_text": "Conheça Nossa História",
        "button_link": "/empresa",
        "features": [
            "Profissionais certificados e experientes",
            "Atendimento personalizado e consultivo",
            "Garantia em todos os serviços prestados"
        ]
    }'::jsonb
) ON CONFLICT (section_key) DO NOTHING;

-- Insert initial data for home_content (CTA Section)
INSERT INTO public.home_content (section_key, content)
VALUES (
    'cta',
    '{
        "title": "Pronto para começar seu projeto?",
        "description": "Entre em contato conosco hoje mesmo e solicite um orçamento sem compromisso. Nossa equipe está pronta para atender você.",
        "primary_button_text": "Falar com um Especialista",
        "primary_button_link": "/contato",
        "secondary_button_text": "WhatsApp",
        "secondary_button_link": "https://wa.me/5511967753400"
    }'::jsonb
) ON CONFLICT (section_key) DO NOTHING;

