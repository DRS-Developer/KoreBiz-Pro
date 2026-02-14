
-- Add location column to portfolios table
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS location TEXT;

-- Insert seed data into portfolios table
INSERT INTO public.portfolios (slug, title, description, client, completion_date, category, image_url, location, gallery_images, published)
VALUES
(
    'retrofit-eletrico-comercial',
    'Retrofit Elétrico Edifício Comercial',
    '<h2>Sobre o Projeto</h2><p>Modernização completa do sistema elétrico de edifício com 20 andares. Este projeto representou um desafio significativo devido à complexidade das instalações existentes e a necessidade de manter o edifício em operação durante as obras.</p><h3>O Desafio</h3><p>O cliente necessitava de uma modernização completa para atender às novas demandas de carga elétrica e conformidade com as normas atuais.</p><h3>A Solução</h3><p>Implementamos um novo sistema de distribuição com quadros inteligentes, substituímos todo o cabeamento principal e instalamos sistemas de automação.</p><h3>Resultados</h3><p>O projeto foi entregue dentro do prazo estipulado e resultou em uma economia de energia de aproximadamente 30%.</p>',
    'Condomínio Edifício Horizon',
    '2023-11-15',
    'Comercial',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
    'São Paulo, SP',
    '["https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop", "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2071&auto=format&fit=crop"]'::jsonb,
    true
),
(
    'instalacao-gerador-condominio',
    'Instalação de Gerador Condomínio',
    'Instalação de grupo gerador de 500kVA para atendimento às áreas comuns e elevadores. O sistema garante autonomia de 12 horas em caso de falha da concessionária.',
    'Condomínio Viva Vida',
    '2023-09-10',
    'Residencial',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    'Barueri, SP',
    '[]'::jsonb,
    true
),
(
    'manutencao-industrial-fabrica',
    'Manutenção Industrial Fábrica ABC',
    'Contrato de manutenção preventiva e corretiva de maquinário e infraestrutura elétrica e hidráulica.',
    'Fábrica ABC Ltda',
    '2024-01-05',
    'Industrial',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
    'Guarulhos, SP',
    '[]'::jsonb,
    true
),
(
    'automacao-residencial',
    'Automação Residencial Alto Padrão',
    'Projeto completo de automação de iluminação, persianas e climatização controlados por voz e aplicativo.',
    'Residência Privada',
    '2023-12-20',
    'Residencial',
    NULL,
    'Morumbi, SP',
    '[]'::jsonb,
    true
),
(
    'reforma-hidraulica-shopping',
    'Reforma Hidráulica Shopping Center',
    'Substituição de toda rede de água gelada do sistema de ar condicionado central durante o período noturno para não afetar o funcionamento.',
    'Shopping Center Osasco',
    '2023-08-15',
    'Comercial',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop',
    'Osasco, SP',
    '[]'::jsonb,
    true
),
(
    'adequacao-cabine-primaria',
    'Adequação de Cabine Primária',
    'Manutenção e adequação de cabine primária 13.8kV conforme normas da concessionária, incluindo troca de disjuntores e óleo isolante.',
    'Indústria Metalúrgica Jundiaí',
    '2023-10-30',
    'Industrial',
    NULL,
    'Jundiaí, SP',
    '[]'::jsonb,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    client = EXCLUDED.client,
    completion_date = EXCLUDED.completion_date,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url,
    location = EXCLUDED.location,
    gallery_images = EXCLUDED.gallery_images,
    published = EXCLUDED.published;
