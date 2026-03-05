-- Seed 'empresa' page
insert into public.pages (slug, title, content, meta_title, meta_description, published)
values (
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
        "content": [{ "type": "text", "text": "Fundada em 2010, a KoreBiz-Pro surgiu da necessidade de oferecer serviços técnicos especializados com um nível superior de qualidade e profissionalismo no mercado de São Paulo." }]
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
  'Sobre a KoreBiz-Pro',
  'Conheça a trajetória da KoreBiz-Pro e os valores que guiam nosso trabalho.',
  true
);
