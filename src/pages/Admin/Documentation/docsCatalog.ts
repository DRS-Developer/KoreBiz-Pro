export interface WidgetFieldDoc {
  key: string;
  tipo: string;
  obrigatorio: string;
  instrucoes: string;
}

export interface DocumentationItem {
  id: string;
  nome: string;
  objetivo: string;
  preenchimento: string[];
  campos: WidgetFieldDoc[];
  configuracoes: string[];
}

export interface DocumentationCategory {
  id: string;
  titulo: string;
  descricao: string;
  itens: DocumentationItem[];
}

export const DOC_CATEGORIES: DocumentationCategory[] = [
  {
    id: 'widgets',
    titulo: 'Widgets',
    descricao: 'Documentação técnica dos widgets do builder da Home.',
    itens: [
      {
        id: 'legacy-section',
        nome: 'Widget Legacy Section',
        objetivo: 'Reutilizar seções clássicas da Home com controle de ordem e visibilidade.',
        preenchimento: [
          'Adicionar elemento e escolher uma seção legada em "Seção Legada".',
          'Ajustar variante para separar experimentos visuais.',
          'Para Serviços/Projetos, configurar autoplay e velocidade em milissegundos.',
          'Para Contato, definir se o mapa deve ser exibido.',
        ],
        campos: [
          { key: 'legacySectionId', tipo: 'select', obrigatorio: 'Sim', instrucoes: 'Escolha entre hero, services, projects, about, partners, contact.' },
          { key: 'autoplay', tipo: 'checkbox', obrigatorio: 'Condicional', instrucoes: 'Disponível quando legacySectionId for services ou projects.' },
          { key: 'autoplaySpeed', tipo: 'number', obrigatorio: 'Condicional', instrucoes: 'Use valores acima de 1000 para evitar transição muito rápida.' },
          { key: 'showMap', tipo: 'checkbox', obrigatorio: 'Condicional', instrucoes: 'Disponível quando legacySectionId for contact.' },
        ],
        configuracoes: [
          'O conteúdo e imagens são gerenciados nas áreas originais do admin.',
          'Use este widget para migrar gradualmente da estrutura antiga para o builder v2.',
        ],
      },
      {
        id: 'gallery',
        nome: 'Widget Gallery',
        objetivo: 'Exibir galeria de itens visuais em destaque com limite controlado.',
        preenchimento: [
          'Adicionar o widget e definir o limite de itens.',
          'Garantir que imagens de origem estejam cadastradas no módulo correspondente.',
          'Salvar e validar no preview da Home.',
        ],
        campos: [
          { key: 'maxItems', tipo: 'number', obrigatorio: 'Sim', instrucoes: 'Quantidade máxima exibida na galeria.' },
        ],
        configuracoes: [
          'Use imagens já publicadas para evitar cards vazios.',
          'Ajuste maxItems para equilibrar performance e conteúdo.',
        ],
      },
      {
        id: 'cta',
        nome: 'Widget CTA',
        objetivo: 'Converter visitantes com chamada principal e chamada secundária.',
        preenchimento: [
          'Preencher título e descrição de valor.',
          'Definir texto e link do botão principal.',
          'Definir texto e link do botão secundário.',
          'Salvar e validar os links no frontend.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Mensagem principal do bloco CTA.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Sim', instrucoes: 'Complementa a promessa da ação principal.' },
          { key: 'primary_button_text', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Texto curto e objetivo para ação principal.' },
          { key: 'primary_button_link', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Use rota interna como /contato ou URL externa HTTPS.' },
          { key: 'secondary_button_text', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Ação alternativa com menor prioridade.' },
          { key: 'secondary_button_link', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Link alternativo para navegação complementar.' },
        ],
        configuracoes: [
          'Prefira verbos de ação no botão principal.',
          'Se não houver botão secundário, mantenha texto e link vazios.',
        ],
      },
      {
        id: 'grid',
        nome: 'Widget Grid',
        objetivo: 'Exibir cards em grid responsivo de serviços ou portfólio.',
        preenchimento: [
          'Escolher fonte de dados entre services e portfolio.',
          'Definir número de colunas e limite de itens.',
          'Opcionalmente personalizar título e descrição do bloco.',
          'Garantir que os itens de origem estejam publicados.',
        ],
        campos: [
          { key: 'source', tipo: 'select', obrigatorio: 'Sim', instrucoes: 'Escolha services ou portfolio.' },
          { key: 'columns', tipo: 'select', obrigatorio: 'Sim', instrucoes: 'Valores suportados: 2, 3 ou 4.' },
          { key: 'maxItems', tipo: 'number', obrigatorio: 'Sim', instrucoes: 'Quantidade máxima de cards renderizados.' },
          { key: 'title', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Sobrescreve o título padrão do widget.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto de apoio exibido abaixo do título.' },
        ],
        configuracoes: [
          'Para melhorar carregamento, mantenha maxItems alinhado ao volume real de conteúdo.',
          'Use 2 ou 3 colunas para páginas com muito texto.',
        ],
      },
      {
        id: 'card-list',
        nome: 'Widget Card List',
        objetivo: 'Exibir lista vertical de cards com resumo e navegação rápida.',
        preenchimento: [
          'Escolher fonte de dados entre services e portfolio.',
          'Definir quantidade máxima de cartões.',
          'Ajustar título e descrição conforme contexto da campanha.',
          'Validar se os itens possuem imagem e descrição curta.',
        ],
        campos: [
          { key: 'source', tipo: 'select', obrigatorio: 'Sim', instrucoes: 'Escolha services ou portfolio.' },
          { key: 'maxItems', tipo: 'number', obrigatorio: 'Sim', instrucoes: 'Controla o total de cartões na lista.' },
          { key: 'title', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Título visível no topo da seção.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Resumo explicando o conteúdo listado.' },
        ],
        configuracoes: [
          'Ideal para navegação por catálogo.',
          'Use textos curtos para evitar truncamento excessivo.',
        ],
      },
      {
        id: 'form-embed',
        nome: 'Widget Form Embed',
        objetivo: 'Incorporar formulário externo com segurança e fallback de abertura em nova aba.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Informar URL HTTPS do formulário embutido.',
          'Definir altura do iframe conforme conteúdo do formulário.',
          'Configurar CTA externo para fallback de abertura em nova aba.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal da seção de captura.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Sim', instrucoes: 'Contextualiza o objetivo do formulário.' },
          { key: 'formUrl', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Use URL HTTPS de domínio permitido na allowlist de embed.' },
          { key: 'height', tipo: 'number', obrigatorio: 'Sim', instrucoes: 'Altura mínima recomendada: 480.' },
          { key: 'ctaText', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Texto do botão de fallback.' },
          { key: 'ctaUrl', tipo: 'text', obrigatorio: 'Não', instrucoes: 'URL alternativa para abrir formulário fora do iframe.' },
        ],
        configuracoes: [
          'Domínios permitidos podem ser configurados em VITE_EMBED_ALLOWED_HOSTS.',
          'Se formUrl for inválida, apenas o CTA de fallback será exibido quando disponível.',
        ],
      },
      {
        id: 'testimonials',
        nome: 'Widget Testimonials',
        objetivo: 'Exibir prova social com depoimentos, cargo e avatar opcional.',
        preenchimento: [
          'Definir título e descrição da seção de depoimentos.',
          'Configurar quantidade máxima de itens exibidos.',
          'Preencher campo Itens (JSON) com name, role, quote e avatarUrl.',
          'Para fotos, subir imagem na mídia e usar URL em avatarUrl.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal da seção.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto de apoio para contextualizar os depoimentos.' },
          { key: 'maxItems', tipo: 'number', obrigatorio: 'Sim', instrucoes: 'Limita quantidade de cards renderizados.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com objetos contendo name e quote obrigatórios; role e avatarUrl opcionais.' },
          { key: 'avatarUrl', tipo: 'image-url', obrigatorio: 'Não', instrucoes: 'URL da imagem do cliente, preferencialmente via gerenciador de mídia.' },
        ],
        configuracoes: [
          'Mantenha textos objetivos para melhor legibilidade dos cards.',
          'Quando não houver avatar, o widget usa fallback visual automaticamente.',
        ],
      },
      {
        id: 'faq',
        nome: 'Widget FAQ Accordion',
        objetivo: 'Organizar dúvidas frequentes em formato expansível com foco em clareza.',
        preenchimento: [
          'Definir título e descrição introdutória da seção.',
          'Preencher campo Itens (JSON) com question e answer.',
          'Garantir que cada pergunta tenha resposta direta e objetiva.',
          'Salvar e validar expansão/colapso no frontend.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título da seção de FAQ.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto complementar exibido abaixo do título.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com objetos contendo question e answer obrigatórios.' },
        ],
        configuracoes: [
          'Evite respostas longas demais para manter a leitura fluida.',
          'Use ordem de perguntas da mais frequente para a menos frequente.',
        ],
      },
      {
        id: 'stats',
        nome: 'Widget Stats',
        objetivo: 'Apresentar indicadores em cards numéricos para reforçar credibilidade.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Selecionar quantidade de colunas entre 2, 3 ou 4.',
          'Preencher campo Itens (JSON) com label, value e suffix opcional.',
          'Validar legibilidade dos números no desktop e mobile.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal do bloco de indicadores.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto de apoio para contextualizar os números.' },
          { key: 'columns', tipo: 'select', obrigatorio: 'Sim', instrucoes: 'Use 2, 3 ou 4 colunas conforme densidade visual desejada.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com objetos contendo label e value obrigatórios; suffix opcional.' },
        ],
        configuracoes: [
          'Priorize métricas verificáveis e atuais.',
          'Evite excesso de itens para manter leitura rápida.',
        ],
      },
      {
        id: 'process',
        nome: 'Widget Timeline de Processo',
        objetivo: 'Explicar etapas de atendimento em sequência para aumentar clareza do fluxo.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Preencher campo Itens (JSON) com title e description para cada etapa.',
          'Organizar as etapas na ordem real de execução.',
          'Salvar e revisar leitura completa no frontend.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título da seção de processo.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Resumo geral do método de trabalho.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com objetos contendo title e description obrigatórios.' },
        ],
        configuracoes: [
          'Mantenha no máximo 6 etapas para evitar fadiga de leitura.',
          'Use textos objetivos para cada fase.',
        ],
      },
      {
        id: 'pricing',
        nome: 'Widget Pricing',
        objetivo: 'Exibir planos com preço, benefícios e CTA para conversão.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Preencher campo Planos (JSON) com name, price, period e features.',
          'Opcionalmente definir ctaText, ctaLink e highlighted por plano.',
          'Validar visual dos cards no desktop e no mobile.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título da seção de planos.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Resumo para orientar a comparação dos planos.' },
          { key: 'plans', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com name e price obrigatórios; features em lista; demais campos opcionais.' },
          { key: 'ctaLink', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Rota interna ou URL HTTPS para ação de contratação.' },
        ],
        configuracoes: [
          'Use até 3 planos para manter foco e legibilidade.',
          'Plano destacado deve representar a oferta recomendada.',
        ],
      },
      {
        id: 'comparison',
        nome: 'Widget Comparison',
        objetivo: 'Exibir comparação clara entre proposta da empresa e alternativas.',
        preenchimento: [
          'Definir título e descrição da seção comparativa.',
          'Preencher campo Linhas (JSON) com criterion, ours e others.',
          'Organizar os critérios mais relevantes nas primeiras linhas.',
          'Revisar consistência de linguagem antes de publicar.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal do comparativo.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto introdutório da tabela comparativa.' },
          { key: 'rows', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com criterion, ours e others obrigatórios.' },
        ],
        configuracoes: [
          'Evite afirmações vagas; priorize critérios objetivos.',
          'Mantenha quantidade enxuta de linhas para leitura rápida.',
        ],
      },
      {
        id: 'logos-wall',
        nome: 'Widget Logos Wall',
        objetivo: 'Exibir mural de logos com links opcionais para reforço de prova institucional.',
        preenchimento: [
          'Definir título e descrição da seção de logos.',
          'Selecionar quantidade de colunas entre 2, 3, 4 ou 5.',
          'Preencher campo Logos (JSON) com name, logoUrl e link opcional.',
          'Validar proporção e legibilidade das marcas no desktop e mobile.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal do mural de logos.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto introdutório da seção.' },
          { key: 'columns', tipo: 'select', obrigatorio: 'Sim', instrucoes: 'Valores suportados: 2, 3, 4 ou 5.' },
          { key: 'logos', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com name e logoUrl obrigatórios; link opcional.' },
        ],
        configuracoes: [
          'Padronize altura visual das marcas para melhor consistência.',
          'Use links externos apenas quando houver destino oficial validado.',
        ],
      },
      {
        id: 'case-highlights',
        nome: 'Widget Case Highlights',
        objetivo: 'Destacar casos de sucesso com resultado principal, mídia opcional e link.',
        preenchimento: [
          'Definir título e descrição da seção de cases.',
          'Definir máximo de itens a serem exibidos.',
          'Preencher campo Cases (JSON) com title, result, imageUrl opcional e link opcional.',
          'Revisar se os resultados estão claros, mensuráveis e atualizados.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título da seção de cases.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Resumo contextual dos cases apresentados.' },
          { key: 'maxItems', tipo: 'number', obrigatorio: 'Sim', instrucoes: 'Limita quantidade de cards renderizados.' },
          { key: 'cases', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com title e result obrigatórios; imageUrl e link opcionais.' },
        ],
        configuracoes: [
          'Destaque resultados numéricos e verificáveis.',
          'Evite excesso de texto para manter leitura objetiva.',
        ],
      },
      {
        id: 'before-after',
        nome: 'Widget Before/After',
        objetivo: 'Comparar visualmente cenário inicial e cenário evoluído em pares de imagem.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Definir quantidade máxima de pares exibidos.',
          'Preencher Itens (JSON) com title, beforeImageUrl e afterImageUrl.',
          'Opcionalmente ajustar rótulos beforeLabel e afterLabel.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal da seção de comparação.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Resumo do contexto do antes e depois.' },
          { key: 'maxItems', tipo: 'number', obrigatorio: 'Sim', instrucoes: 'Limita quantidade de comparativos renderizados.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com title, beforeImageUrl e afterImageUrl obrigatórios; labels opcionais.' },
        ],
        configuracoes: [
          'Use imagens com enquadramento equivalente para melhor comparação.',
          'Prefira no máximo 3 comparativos por seção.',
        ],
      },
      {
        id: 'feature-tabs',
        nome: 'Widget Feature Tabs',
        objetivo: 'Organizar diferenciais e etapas em abas para leitura segmentada.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Preencher Abas (JSON) com label, title e description.',
          'Opcionalmente incluir bullets por aba.',
          'Validar alternância das abas no frontend.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal da seção de abas.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto de apoio introdutório.' },
          { key: 'tabs', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com label, title e description obrigatórios; bullets opcional.' },
        ],
        configuracoes: [
          'Mantenha labels curtos para evitar quebra visual.',
          'Use no máximo 5 abas para manter usabilidade.',
        ],
      },
      {
        id: 'team-cards',
        nome: 'Widget Team Cards',
        objetivo: 'Apresentar membros do time com função e contexto resumido.',
        preenchimento: [
          'Definir título e descrição da seção de time.',
          'Definir máximo de itens para exibição.',
          'Preencher Membros (JSON) com name, role, bio opcional e imageUrl opcional.',
          'Validar legibilidade dos cards no desktop e no mobile.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título da seção de equipe.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto introdutório do bloco.' },
          { key: 'maxItems', tipo: 'number', obrigatorio: 'Sim', instrucoes: 'Limita quantidade de membros renderizados.' },
          { key: 'members', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com name e role obrigatórios; bio e imageUrl opcionais.' },
        ],
        configuracoes: [
          'Use fotos com recorte semelhante para padrão visual.',
          'Mantenha bios curtas para evitar cards longos.',
        ],
      },
      {
        id: 'trust-badges',
        nome: 'Widget Trust Badges',
        objetivo: 'Exibir selos de confiança com mensagens curtas de credibilidade.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Selecionar colunas entre 2, 3 ou 4.',
          'Preencher Selos (JSON) com title obrigatório, icon e description opcionais.',
          'Revisar consistência da linguagem entre os selos.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal do bloco de confiança.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto de apoio da seção.' },
          { key: 'columns', tipo: 'select', obrigatorio: 'Sim', instrucoes: 'Valores suportados: 2, 3 ou 4.' },
          { key: 'badges', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com title obrigatório; icon e description opcionais.' },
        ],
        configuracoes: [
          'Use mensagens objetivas e verificáveis.',
          'Evite excesso de selos para preservar impacto visual.',
        ],
      },
      {
        id: 'media-split',
        nome: 'Widget Media Split',
        objetivo: 'Combinar conteúdo textual e imagem em layout dividido com CTA opcional.',
        preenchimento: [
          'Definir título e descrição principal do bloco.',
          'Preencher Bullets (JSON) com itens de destaque.',
          'Configurar imageUrl e imageAlt da mídia.',
          'Opcionalmente habilitar reverse e preencher CTA.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal da seção.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto explicativo do bloco.' },
          { key: 'bullets', tipo: 'json', obrigatorio: 'Não', instrucoes: 'Array de strings com diferenciais.' },
          { key: 'imageUrl', tipo: 'image-url', obrigatorio: 'Sim', instrucoes: 'URL da imagem principal do bloco.' },
          { key: 'reverse', tipo: 'checkbox', obrigatorio: 'Não', instrucoes: 'Inverte lado da imagem e do conteúdo textual.' },
          { key: 'ctaLink', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Rota interna ou URL HTTPS do botão CTA.' },
        ],
        configuracoes: [
          'Use imagens horizontais com boa resolução.',
          'Prefira 3 a 5 bullets para leitura rápida.',
        ],
      },
      {
        id: 'icon-features',
        nome: 'Widget Icon Features',
        objetivo: 'Exibir diferenciais em cards com ícone, título e descrição.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Selecionar colunas entre 2, 3 ou 4.',
          'Preencher Itens (JSON) com title obrigatório.',
          'Opcionalmente definir icon e description por item.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal do bloco.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto de apoio da seção.' },
          { key: 'columns', tipo: 'select', obrigatorio: 'Sim', instrucoes: 'Valores suportados: 2, 3 ou 4.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com title obrigatório; icon e description opcionais.' },
        ],
        configuracoes: [
          'Use títulos curtos para manter alinhamento visual.',
          'Evite mais de 6 cards na mesma seção.',
        ],
      },
      {
        id: 'checklist-steps',
        nome: 'Widget Checklist Steps',
        objetivo: 'Organizar etapas sequenciais com títulos e descrições opcionais.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Preencher Itens (JSON) com title obrigatório.',
          'Opcionalmente preencher description por item.',
          'Revisar ordem lógica das etapas antes de publicar.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal da seção checklist.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Resumo introdutório da seção.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com title obrigatório e description opcional.' },
        ],
        configuracoes: [
          'Use títulos curtos e verbos de ação.',
          'Prefira de 3 a 6 etapas para manter clareza.',
        ],
      },
      {
        id: 'quote-highlight',
        nome: 'Widget Quote Highlight',
        objetivo: 'Destacar uma citação de cliente com autoria e cargo.',
        preenchimento: [
          'Preencher campo de citação com mensagem principal.',
          'Informar autor do depoimento.',
          'Opcionalmente informar cargo ou contexto.',
          'Validar ortografia e consistência do texto.',
        ],
        campos: [
          { key: 'quote', tipo: 'textarea', obrigatorio: 'Sim', instrucoes: 'Texto da citação em destaque.' },
          { key: 'author', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Nome da pessoa ou organização autora.' },
          { key: 'role', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Cargo, função ou contexto do autor.' },
        ],
        configuracoes: [
          'Use citação objetiva e verificável.',
          'Evite textos longos para preservar impacto visual.',
        ],
      },
      {
        id: 'milestones',
        nome: 'Widget Milestones',
        objetivo: 'Exibir marcos em sequência temporal com ano e título.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Preencher Itens (JSON) com year e title obrigatórios.',
          'Opcionalmente incluir description em cada marco.',
          'Revisar ordem cronológica antes de publicar.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal da linha de marcos.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Resumo contextual da evolução.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com year e title obrigatórios; description opcional.' },
        ],
        configuracoes: [
          'Mantenha anos e títulos curtos para leitura rápida.',
          'Priorize marcos com impacto comprovável.',
        ],
      },
      {
        id: 'dual-cta-band',
        nome: 'Widget Dual CTA Band',
        objetivo: 'Apresentar faixa de conversão com dois caminhos de ação.',
        preenchimento: [
          'Definir título e descrição da faixa.',
          'Configurar texto e link do CTA primário.',
          'Configurar texto e link do CTA secundário.',
          'Validar comportamento dos botões no desktop e mobile.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Título principal da faixa.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Mensagem de apoio ao CTA.' },
          { key: 'primaryLink', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Rota interna ou URL HTTPS do botão principal.' },
          { key: 'secondaryLink', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Rota interna ou URL HTTPS do botão secundário.' },
        ],
        configuracoes: [
          'Use mensagens diretas com verbo de ação.',
          'Evite links externos sem validação prévia.',
        ],
      },
      {
        id: 'kpi-strip',
        nome: 'Widget KPI Strip',
        objetivo: 'Apresentar indicadores-chave em formato de faixa de destaque.',
        preenchimento: [
          'Definir título da seção de KPIs.',
          'Preencher Itens (JSON) com value e label obrigatórios.',
          'Revisar consistência de unidades e percentuais.',
          'Validar legibilidade dos valores no mobile.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Título principal da faixa de indicadores.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com value e label obrigatórios.' },
        ],
        configuracoes: [
          'Use no máximo 4 indicadores por seção.',
          'Prefira valores curtos para melhor leitura.',
        ],
      },
      {
        id: 'image-quote',
        nome: 'Widget Image Quote',
        objetivo: 'Combinar citação em destaque com imagem de apoio.',
        preenchimento: [
          'Preencher citação principal do depoimento.',
          'Informar autor e cargo/contexto.',
          'Configurar imageUrl e imageAlt da imagem.',
          'Validar equilíbrio visual entre imagem e texto.',
        ],
        campos: [
          { key: 'quote', tipo: 'textarea', obrigatorio: 'Sim', instrucoes: 'Texto da citação principal.' },
          { key: 'author', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Nome do autor da citação.' },
          { key: 'role', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Cargo ou contexto do autor.' },
          { key: 'imageUrl', tipo: 'image-url', obrigatorio: 'Não', instrucoes: 'URL da imagem associada ao depoimento.' },
        ],
        configuracoes: [
          'Use imagem com boa resolução e enquadramento limpo.',
          'Evite citações excessivamente longas.',
        ],
      },
      {
        id: 'benefit-grid',
        nome: 'Widget Benefit Grid',
        objetivo: 'Exibir benefícios em grade com título e descrição por item.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Selecionar colunas entre 2, 3 ou 4.',
          'Preencher Itens (JSON) com title obrigatório.',
          'Opcionalmente incluir description em cada item.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Título principal da seção de benefícios.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Resumo introdutório da seção.' },
          { key: 'columns', tipo: 'select', obrigatorio: 'Sim', instrucoes: 'Valores suportados: 2, 3 ou 4.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com title obrigatório; description opcional.' },
        ],
        configuracoes: [
          'Mantenha títulos curtos para equilíbrio visual.',
          'Evite excesso de texto em cada card.',
        ],
      },
      {
        id: 'mini-timeline',
        nome: 'Widget Mini Timeline',
        objetivo: 'Representar etapas em timeline compacta com step e title.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Preencher Itens (JSON) com step e title obrigatórios.',
          'Opcionalmente incluir description por etapa.',
          'Validar sequência lógica das etapas.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Título da timeline resumida.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto de apoio da seção.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com step e title obrigatórios; description opcional.' },
        ],
        configuracoes: [
          'Use steps curtos como 01, 02, 03.',
          'Evite mais de 5 etapas na versão compacta.',
        ],
      },
      {
        id: 'value-cards',
        nome: 'Widget Value Cards',
        objetivo: 'Exibir cards de valor com título, número e descrição opcional.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Selecionar colunas entre 2, 3 ou 4.',
          'Preencher Itens (JSON) com title e value obrigatórios.',
          'Opcionalmente incluir description por item.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Título principal da seção.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto de apoio contextual.' },
          { key: 'columns', tipo: 'select', obrigatorio: 'Sim', instrucoes: 'Valores suportados: 2, 3 ou 4.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com title e value obrigatórios; description opcional.' },
        ],
        configuracoes: [
          'Use valores curtos para manter destaque visual.',
          'Priorize métricas relevantes para decisão.',
        ],
      },
      {
        id: 'quick-facts',
        nome: 'Widget Quick Facts',
        objetivo: 'Mostrar fatos rápidos com pares de label e value.',
        preenchimento: [
          'Definir título opcional da seção.',
          'Preencher Itens (JSON) com label e value obrigatórios.',
          'Revisar padronização de unidades e formatos.',
          'Validar leitura em telas pequenas.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Título da seção de fatos rápidos.' },
          { key: 'items', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array com label e value obrigatórios.' },
        ],
        configuracoes: [
          'Use no máximo 4 fatos por bloco.',
          'Evite frases longas nos labels.',
        ],
      },
      {
        id: 'feature-bullets',
        nome: 'Widget Feature Bullets',
        objetivo: 'Listar bullets de diferenciais com texto objetivo.',
        preenchimento: [
          'Definir título e descrição da seção.',
          'Preencher Bullets (JSON) com array de strings.',
          'Revisar clareza e objetividade de cada bullet.',
          'Validar espaçamento e legibilidade no mobile.',
        ],
        campos: [
          { key: 'title', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Título principal da seção de bullets.' },
          { key: 'description', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Texto de apoio introdutório.' },
          { key: 'bullets', tipo: 'json', obrigatorio: 'Sim', instrucoes: 'Array de strings com os diferenciais.' },
        ],
        configuracoes: [
          'Prefira frases curtas com verbo de ação.',
          'Use de 3 a 6 bullets para manter foco.',
        ],
      },
      {
        id: 'stat-banner',
        nome: 'Widget Stat Banner',
        objetivo: 'Destacar uma estatística principal em banner de alto contraste.',
        preenchimento: [
          'Definir value e label principais.',
          'Opcionalmente preencher supportingText.',
          'Verificar consistência de unidade e contexto.',
          'Validar destaque visual no desktop e mobile.',
        ],
        campos: [
          { key: 'value', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Valor principal da estatística (ex.: +250%).' },
          { key: 'label', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Descrição curta do indicador exibido.' },
          { key: 'supportingText', tipo: 'textarea', obrigatorio: 'Não', instrucoes: 'Contexto adicional da métrica.' },
        ],
        configuracoes: [
          'Use apenas uma métrica central por banner.',
          'Evite textos longos para preservar impacto.',
        ],
      },
    ],
  },
  {
    id: 'integracoes',
    titulo: 'Integrações',
    descricao: 'Documentação técnica para integrações externas, segurança e operação contínua.',
    itens: [
      {
        id: 'integracao-embed',
        nome: 'Integração de Embed Externo',
        objetivo: 'Padronizar a inclusão de conteúdo externo incorporado sem comprometer segurança.',
        preenchimento: [
          'Validar se a URL usa HTTPS e pertence a domínio aprovado.',
          'Definir altura do iframe conforme conteúdo real.',
          'Incluir link de fallback para abertura em nova aba.',
          'Testar carregamento e bloqueio para URL inválida.',
        ],
        campos: [
          { key: 'VITE_EMBED_ALLOWED_HOSTS', tipo: 'env', obrigatorio: 'Recomendado', instrucoes: 'Lista CSV de domínios autorizados para embed.' },
          { key: 'formUrl', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'URL HTTPS de origem permitida.' },
          { key: 'ctaUrl', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Fallback para abrir o formulário fora do iframe.' },
          { key: 'height', tipo: 'number', obrigatorio: 'Sim', instrucoes: 'Altura mínima sugerida de 480 pixels.' },
        ],
        configuracoes: [
          'A validação usa allowlist em runtime para reduzir superfície de ataque.',
          'Evite iframes de origem desconhecida mesmo em ambiente interno.',
        ],
      },
      {
        id: 'integracao-realtime',
        nome: 'Integração Realtime e Sincronização',
        objetivo: 'Garantir atualização de dados em tempo real sem degradar experiência do editor.',
        preenchimento: [
          'Confirmar hidratação inicial completa da aplicação.',
          'Verificar ciclos de sincronização sem erros de rede persistentes.',
          'Ajustar fallback para modo local quando backend estiver indisponível.',
          'Validar consistência de ordenação e estado após reconexão.',
        ],
        campos: [
          { key: 'enabled', tipo: 'boolean', obrigatorio: 'Sim', instrucoes: 'Ativa ou desativa sincronização por contexto.' },
          { key: 'transportMode', tipo: 'runtime', obrigatorio: 'Automático', instrucoes: 'Transição entre function, table e local.' },
          { key: 'pageKey', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Identificador lógico da página sincronizada.' },
        ],
        configuracoes: [
          'Priorize consistência visual no editor durante quedas de conectividade.',
          'Mantenha telemetria de erros de rede para diagnóstico operacional.',
        ],
      },
      {
        id: 'integracao-qualidade',
        nome: 'Integração de Qualidade e Validação',
        objetivo: 'Padronizar validação técnica para mudanças em widgets e documentação.',
        preenchimento: [
          'Executar checagem de tipos após alterações estruturais.',
          'Gerar build de produção e revisar alertas críticos.',
          'Executar E2E do Home Builder para prevenir regressões.',
          'Registrar resultado da validação no fluxo de entrega.',
        ],
        campos: [
          { key: 'npm run check', tipo: 'comando', obrigatorio: 'Sim', instrucoes: 'Valida tipagem TypeScript.' },
          { key: 'npm run build', tipo: 'comando', obrigatorio: 'Sim', instrucoes: 'Valida empacotamento de produção.' },
          { key: 'npm run test:e2e:home-builder', tipo: 'comando', obrigatorio: 'Sim', instrucoes: 'Valida fluxo principal do editor da Home.' },
        ],
        configuracoes: [
          'Mudanças de documentação técnica devem manter rastreabilidade de validação.',
          'Não promover alterações sem ciclo completo de checagem e build.',
        ],
      },
    ],
  },
  {
    id: 'operacao',
    titulo: 'Operação',
    descricao: 'Runbooks operacionais, resposta a incidentes e checklist de publicação.',
    itens: [
      {
        id: 'operacao-incidente-home',
        nome: 'Runbook de Incidente da Home',
        objetivo: 'Restabelecer rapidamente a Home quando houver falha de renderização, dados ou integração.',
        preenchimento: [
          'Identificar escopo: falha visual, falha de dados ou falha de integração externa.',
          'Verificar logs de frontend e erros de rede para isolar causa principal.',
          'Aplicar fallback seguro já disponível no sistema sempre que possível.',
          'Validar recuperação com check funcional no editor e no frontend público.',
        ],
        campos: [
          { key: 'Sintoma', tipo: 'texto', obrigatorio: 'Sim', instrucoes: 'Descreva o comportamento observado pelo usuário.' },
          { key: 'Impacto', tipo: 'texto', obrigatorio: 'Sim', instrucoes: 'Informe quais páginas ou blocos foram afetados.' },
          { key: 'Mitigação aplicada', tipo: 'texto', obrigatorio: 'Sim', instrucoes: 'Registre fallback ou ajuste temporário aplicado.' },
          { key: 'Status final', tipo: 'texto', obrigatorio: 'Sim', instrucoes: 'Indique se o incidente foi resolvido ou permanece monitorado.' },
        ],
        configuracoes: [
          'Priorize restaurar disponibilidade antes de otimizações secundárias.',
          'Sempre registrar causa raiz após estabilização.',
        ],
      },
      {
        id: 'operacao-rollback',
        nome: 'Runbook de Rollback de Widget',
        objetivo: 'Reverter mudanças de widget com segurança quando houver regressão funcional.',
        preenchimento: [
          'Desabilitar temporariamente widget afetado no editor para conter impacto.',
          'Retornar configurações para valores estáveis documentados.',
          'Validar ordem, visibilidade e renderização após reversão.',
          'Reexecutar validações técnicas obrigatórias para confirmar estabilidade.',
        ],
        campos: [
          { key: 'Widget afetado', tipo: 'texto', obrigatorio: 'Sim', instrucoes: 'Informe o widget e variante envolvidos.' },
          { key: 'Versão alvo', tipo: 'texto', obrigatorio: 'Sim', instrucoes: 'Defina referência estável para reversão.' },
          { key: 'Plano de verificação', tipo: 'lista', obrigatorio: 'Sim', instrucoes: 'Inclua checagem de UI, dados e interação.' },
          { key: 'Critério de reabertura', tipo: 'texto', obrigatorio: 'Não', instrucoes: 'Condição para retomar evolução do widget.' },
        ],
        configuracoes: [
          'Rollback deve preservar dados de configuração sempre que possível.',
          'Evite mudanças adicionais durante reversão para reduzir risco.',
        ],
      },
      {
        id: 'operacao-publicacao',
        nome: 'Checklist de Publicação',
        objetivo: 'Padronizar liberação de mudanças de documentação e widgets em produção.',
        preenchimento: [
          'Conferir aderência da implementação ao que está documentado na categoria correspondente.',
          'Executar check de tipos e build de produção sem erros.',
          'Executar E2E principal do Home Builder para prevenir regressão.',
          'Registrar evidências de validação e aprovar publicação.',
        ],
        campos: [
          { key: 'Conformidade da documentação', tipo: 'checkbox', obrigatorio: 'Sim', instrucoes: 'Confirmar alinhamento entre docs e comportamento real.' },
          { key: 'Type check', tipo: 'checkbox', obrigatorio: 'Sim', instrucoes: 'Resultado de npm run check aprovado.' },
          { key: 'Build produção', tipo: 'checkbox', obrigatorio: 'Sim', instrucoes: 'Resultado de npm run build aprovado.' },
          { key: 'E2E Home Builder', tipo: 'checkbox', obrigatorio: 'Sim', instrucoes: 'Resultado de npm run test:e2e:home-builder aprovado.' },
        ],
        configuracoes: [
          'Publicação só deve seguir com checklist completo e evidências registradas.',
          'Quando houver risco alto, aplicar janela controlada e monitoramento pós-release.',
        ],
      },
    ],
  },
  {
    id: 'seguranca',
    titulo: 'Segurança',
    descricao: 'Diretrizes de hardening, governança de embed e auditoria técnica.',
    itens: [
      {
        id: 'seguranca-embed-allowlist',
        nome: 'Hardening de Embed por Allowlist',
        objetivo: 'Restringir embeds a domínios confiáveis para reduzir risco de conteúdo malicioso.',
        preenchimento: [
          'Manter apenas domínios necessários em VITE_EMBED_ALLOWED_HOSTS.',
          'Validar se URLs novas usam HTTPS e pertencem à allowlist.',
          'Testar bloqueio de domínio não autorizado antes do deploy.',
          'Registrar justificativa para cada domínio adicionado.',
        ],
        campos: [
          { key: 'VITE_EMBED_ALLOWED_HOSTS', tipo: 'env', obrigatorio: 'Sim', instrucoes: 'Lista CSV de domínios autorizados para iframe.' },
          { key: 'formUrl', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'URL válida e aprovada em allowlist.' },
          { key: 'ctaUrl', tipo: 'text', obrigatorio: 'Não', instrucoes: 'Fallback externo sujeito às mesmas regras de domínio.' },
        ],
        configuracoes: [
          'Evite curingas amplos para não ampliar superfície de ataque.',
          'Toda mudança de allowlist deve passar por revisão técnica.',
        ],
      },
      {
        id: 'seguranca-auditoria-alteracoes',
        nome: 'Auditoria de Alterações de Widget',
        objetivo: 'Manter rastreabilidade de alterações de configuração com foco em segurança operacional.',
        preenchimento: [
          'Registrar widget alterado, contexto e motivo da mudança.',
          'Validar impacto em renderização e links externos.',
          'Executar check e build após qualquer ajuste sensível.',
          'Anexar evidências de teste no fluxo de entrega.',
        ],
        campos: [
          { key: 'Widget alvo', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Identifique widget e variante impactados.' },
          { key: 'Mudança aplicada', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Descreva o que foi alterado.' },
          { key: 'Validação executada', tipo: 'lista', obrigatorio: 'Sim', instrucoes: 'Liste check, build e testes funcionais executados.' },
        ],
        configuracoes: [
          'Mudanças em URLs externas exigem dupla validação.',
          'Se houver dúvida de segurança, manter rollback pronto.',
        ],
      },
      {
        id: 'seguranca-governanca-conteudo',
        nome: 'Governança de Conteúdo e Mídia',
        objetivo: 'Garantir que mídia e conteúdo exibidos em widgets sigam padrões seguros e auditáveis.',
        preenchimento: [
          'Publicar imagens apenas por canais aprovados do admin.',
          'Revisar links e textos antes de habilitar widget em produção.',
          'Confirmar que conteúdos sensíveis não foram expostos.',
          'Registrar data e responsável pela revisão final.',
        ],
        campos: [
          { key: 'Origem da mídia', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Identifique módulo ou origem oficial do arquivo.' },
          { key: 'Revisão de links', tipo: 'checkbox', obrigatorio: 'Sim', instrucoes: 'Confirmar integridade e destino dos links.' },
          { key: 'Aprovação final', tipo: 'text', obrigatorio: 'Sim', instrucoes: 'Nome do responsável técnico pela liberação.' },
        ],
        configuracoes: [
          'Nunca publicar conteúdo sem revisão final de segurança.',
          'Priorizar princípio do menor privilégio em acessos administrativos.',
        ],
      },
    ],
  },
];
