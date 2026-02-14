
-- Insert seed data into services table
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
