export const INSTALL_DATA_SQL = `
-- SEED: Portfolios --
INSERT INTO public.portfolios (slug, title, description, client, completion_date, category, image_url, location, gallery_images, published)
VALUES
(
    'retrofit-eletrico-comercial',
    'Retrofit Elétrico Edifício Comercial',
    '<h2>Sobre o Projeto</h2><p>Modernização completa do sistema elétrico de edifício com 20 andares. Este projeto representou um desafio significativo devido à complexidade das instalações existentes e a necessidade de manter o edifício em operação durante as obras.</p><h3>O Desafio</h3><p>O cliente necessitava de uma modernização completa para atender às novas demandas de carga elétrica e conformidade com as normas atuais.</p><h3>A Solução</h3><p>Implementamos um novo sistema de distribuição com quadros inteligentes, substituímos todo o cabeamento principal e instalamos sistemas de automação.</p><h3>Resultados</h3><p>O projeto foi entregue dentro do prazo estipulado e resultou em uma economia de energia de aproximadamente 30%.</p>',
    'Condomínio Edifício Horizon',
    '2023-11-15',
    'Comercial',
    NULL,
    'São Paulo, SP',
    '[]'::jsonb,
    true
),
(
    'instalacao-gerador-condominio',
    'Instalação de Gerador Condomínio',
    'Instalação de grupo gerador de 500kVA para atendimento às áreas comuns e elevadores. O sistema garante autonomia de 12 horas em caso de falha da concessionária.',
    'Condomínio Viva Vida',
    '2023-09-10',
    'Residencial',
    NULL,
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
    NULL,
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
    NULL,
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

-- SEED: Services --
INSERT INTO public.services (slug, title, category, short_description, full_description, icon, published)
VALUES
(
    'projeto-eletrico-residencial',
    'Projeto Elétrico Residencial',
    'Projetos',
    'Elaboração de projetos elétricos completos para residências, seguindo a norma NBR 5410.',
    '<h2>Sobre este serviço</h2><p>Nosso serviço de Projeto Elétrico Residencial é executado por profissionais altamente qualificados, seguindo rigorosos padrões de qualidade e segurança (NBR 5410). Utilizamos softwares de última geração para garantir a precisão e eficiência do projeto.</p><p>Seja para uma nova construção ou reforma, nossa equipe realiza um dimensionamento preciso para oferecer a melhor solução custo-benefício para sua necessidade, garantindo segurança contra sobrecargas e curtos-circuitos.</p><h3>Benefícios</h3><ul><li>Conformidade com normas técnicas</li><li>Garantia de segurança</li><li>Economia de energia</li><li>Valorização do imóvel</li></ul>',
    'FileText',
    true
),
(
    'manutencao-preventiva-industrial',
    'Manutenção Preventiva Industrial',
    'Manutenção',
    'Planos de manutenção programada para indústrias, visando reduzir paradas e custos.',
    '<h2>Sobre este serviço</h2><p>A Manutenção Preventiva Industrial é essencial para garantir a continuidade da produção e evitar paradas não programadas. Nossa equipe realiza inspeções termográficas, reaperto de conexões, limpeza de painéis e testes de funcionamento.</p><p>Oferecemos contratos personalizados de acordo com a necessidade da sua planta industrial.</p><h3>Benefícios</h3><ul><li>Redução de paradas não programadas</li><li>Aumento da vida útil dos equipamentos</li><li>Segurança operacional</li><li>Redução de custos com corretivas</li></ul>',
    'Settings',
    true
),
(
    'laudo-tecnico-spda',
    'Laudo Técnico SPDA',
    'Laudos',
    'Vistoria e emissão de laudo para Sistemas de Proteção contra Descargas Atmosféricas.',
    '<h2>Sobre este serviço</h2><p>Realizamos a inspeção completa do Sistema de Proteção contra Descargas Atmosféricas (Para-raios), verificando a integridade dos cabos, medição da resistência de aterramento e continuidade das descidas.</p><p>Emitimos laudo técnico com ART, apontando eventuais não conformidades e recomendações de adequação à norma NBR 5419.</p><h3>Benefícios</h3><ul><li>Regularização junto ao Corpo de Bombeiros</li><li>Segurança patrimonial e pessoal</li><li>Conformidade com seguradoras</li></ul>',
    'FileText',
    true
),
(
    'instalacao-ar-condicionado-split',
    'Instalação de Ar Condicionado Split',
    'Instalação',
    'Instalação profissional de aparelhos de ar condicionado split com garantia.',
    '<h2>Sobre este serviço</h2><p>Instalação de ar condicionado split Hi-Wall, Cassete e Piso Teto. Seguimos todas as recomendações dos fabricantes, utilizando tubulação de cobre, isolamento térmico adequado e bomba de vácuo para garantir a eficiência e durabilidade do equipamento.</p><p>Trabalhamos com todas as marcas e modelos do mercado.</p><h3>Benefícios</h3><ul><li>Instalação limpa e organizada</li><li>Garantia do serviço</li><li>Rendimento máximo do equipamento</li></ul>',
    'PenTool',
    true
),
(
    'adequacao-nr10',
    'Adequação NR-10',
    'Consultoria',
    'Adequação de instalações elétricas às normas de segurança da NR-10.',
    '<h2>Sobre este serviço</h2><p>Consultoria completa para adequação das instalações elétricas e do Prontuário das Instalações Elétricas (PIE) conforme a Norma Regulamentadora nº 10 (NR-10) do Ministério do Trabalho.</p><p>Realizamos diagnóstico, projetos de adequação, sinalização de segurança e treinamento de pessoal.</p><h3>Benefícios</h3><ul><li>Segurança jurídica e trabalhista</li><li>Proteção dos colaboradores</li><li>Organização e controle das instalações</li></ul>',
    'FileText',
    true
),
(
    'reforma-quadro-energia',
    'Reforma de Quadro de Energia',
    'Manutenção',
    'Modernização e organização de quadros de distribuição de energia.',
    '<h2>Sobre este serviço</h2><p>Substituição de quadros antigos (fusíveis ou disjuntores NEMA) por quadros modernos com disjuntores DIN e proteção DR (Diferencial Residual) e DPS (Dispositivo de Proteção contra Surtos).</p><p>Organização da fiação, identificação dos circuitos e balanceamento de cargas.</p><h3>Benefícios</h3><ul><li>Proteção contra choques elétricos (DR)</li><li>Proteção contra queima de aparelhos (DPS)</li><li>Facilidade de manutenção</li><li>Segurança contra incêndios</li></ul>',
    'Settings',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    icon = EXCLUDED.icon,
    published = EXCLUDED.published;

-- SEED: Pages --
INSERT INTO public.pages (slug, title, content, meta_title, meta_description, published)
VALUES (
  'empresa',
  'Sobre a Empresa',
  '{
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Nossa História" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Fundada em 2010, a ArsInstalações surgiu da necessidade de oferecer serviços técnicos especializados com um nível superior de qualidade e profissionalismo no mercado de São Paulo." }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Iniciamos nossas atividades focados em instalações elétricas residenciais, mas rapidamente expandimos nossa atuação para atender demandas corporativas e industriais, sempre mantendo o compromisso com a excelência técnica e a segurança." }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Hoje, somos referência em instalações e manutenção predial, contando com uma equipe multidisciplinar capaz de atender projetos de alta complexidade, desde a concepção até a execução e manutenção contínua." }]
      },
      {
        "type": "heading",
        "attrs": { "level": 3 },
        "content": [{ "type": "text", "text": "Missão" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Proporcionar soluções técnicas de excelência em instalações e manutenção, garantindo segurança, eficiência e tranquilidade para nossos clientes através de um atendimento humanizado e competente." }]
      },
      {
        "type": "heading",
        "attrs": { "level": 3 },
        "content": [{ "type": "text", "text": "Visão" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Ser reconhecida como a principal referência em qualidade e confiabilidade no setor de instalações e manutenção em todo o estado, expandindo nossa atuação com inovação e sustentabilidade." }]
      },
      {
        "type": "heading",
        "attrs": { "level": 3 },
        "content": [{ "type": "text", "text": "Valores" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Ética, Transparência, Comprometimento com prazos, Segurança em primeiro lugar, Respeito ao meio ambiente e Valorização humana." }]
      }
    ]
  }'::jsonb,
  'Sobre a ArsInstalações',
  'Conheça a trajetória da ArsInstalações e os valores que guiam nosso trabalho.',
  true
)
ON CONFLICT (slug) DO NOTHING;
`;
