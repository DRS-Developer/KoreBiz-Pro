import React, { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CircleHelp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { homeWidgetService } from '../../../services/homeWidgetService';
import { HomeWidgetDto } from '../../../types/home-widgets';
import SortableWidgetItem from './SortableWidgetItem';
import WidgetPaletteModal, { WidgetTemplate } from './WidgetPaletteModal';
import { grantAdminDocsAccess } from '../../../utils/adminDocsAccess';
import { sanitizeEmbedUrl } from '../../../utils/embedManager';

interface HomeWidgetManagerProps {
  widgets: HomeWidgetDto[];
  loading: boolean;
  onWidgetsChange: (widgets: HomeWidgetDto[]) => void;
  onConfigureHero?: () => void;
  onConfigureAbout?: () => void;
  onConfigureCta?: () => void;
}

const TEMPLATES: WidgetTemplate[] = [
  {
    key: 'hero',
    title: 'Banner Principal',
    description: 'Bloco principal de abertura da página inicial.',
    category: 'Estrutura',
    widgetType: 'legacy-section',
    settings: { legacySectionId: 'hero' },
  },
  {
    key: 'services',
    title: 'Serviços',
    description: 'Grade de serviços/áreas com destaque para atuação.',
    category: 'Conteúdo',
    widgetType: 'legacy-section',
    settings: { legacySectionId: 'services', autoplay: true, autoplaySpeed: 4000 },
  },
  {
    key: 'projects',
    title: 'Projetos',
    description: 'Lista de projetos e portfólio com navegação.',
    category: 'Conteúdo',
    widgetType: 'legacy-section',
    settings: { legacySectionId: 'projects', autoplay: true, autoplaySpeed: 4000 },
  },
  {
    key: 'about',
    title: 'Sobre Nós',
    description: 'Bloco institucional para apresentar empresa e diferenciais.',
    category: 'Conteúdo',
    widgetType: 'legacy-section',
    settings: { legacySectionId: 'about' },
  },
  {
    key: 'partners',
    title: 'Parceiros',
    description: 'Exibição de marcas e parceiros estratégicos.',
    category: 'Conteúdo',
    widgetType: 'legacy-section',
    settings: { legacySectionId: 'partners' },
  },
  {
    key: 'contact',
    title: 'Contato',
    description: 'Bloco de contato com endereço, telefone e mapa.',
    category: 'Conversão',
    widgetType: 'legacy-section',
    settings: { legacySectionId: 'contact', showMap: true },
  },
  {
    key: 'widget-grid',
    title: 'Widget Grid',
    description: 'Layout de grid modular para cards e blocos customizados.',
    category: 'Estrutura',
    widgetType: 'grid',
    settings: {
      source: 'services',
      columns: 3,
      maxItems: 6,
      title: 'Grid de Serviços',
      description: 'Visualize nossas especialidades em um layout de cards responsivo.',
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-card-list',
    title: 'Widget Card List',
    description: 'Lista de cartões com suporte a múltiplas variações visuais.',
    category: 'Conteúdo',
    widgetType: 'card-list',
    settings: {
      source: 'services',
      maxItems: 6,
      title: 'Lista de Serviços',
      description: 'Acesse rapidamente as principais especialidades em formato de lista.',
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-gallery',
    title: 'Widget Gallery',
    description: 'Galeria de mídia para exposição de imagens e destaques.',
    category: 'Conteúdo',
    widgetType: 'gallery',
    settings: { maxItems: 8 },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-form-embed',
    title: 'Widget Form Embed',
    description: 'Bloco de captura para incorporar formulários externos.',
    category: 'Conversão',
    widgetType: 'form-embed',
    settings: {
      title: 'Formulário de Atendimento',
      description: 'Preencha seus dados e nossa equipe entrará em contato.',
      formUrl: 'https://docs.google.com/forms/d/e/SEU_FORM_ID/viewform?embedded=true',
      ctaText: 'Abrir formulário em nova aba',
      ctaUrl: 'https://docs.google.com/forms/d/e/SEU_FORM_ID/viewform',
      height: 760,
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-testimonials',
    title: 'Widget Testimonials',
    description: 'Depoimentos de clientes com nome, cargo e foto opcional.',
    category: 'Conteúdo',
    widgetType: 'testimonials',
    settings: {
      title: 'Depoimentos',
      description: 'Resultados reais de clientes que confiaram no nosso trabalho.',
      maxItems: 6,
      items: [
        {
          name: 'Cliente Exemplo',
          role: 'Diretoria',
          quote: 'Equipe técnica muito eficiente e atendimento consultivo em todas as etapas.',
          avatarUrl: '',
        },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-faq',
    title: 'Widget FAQ Accordion',
    description: 'Perguntas e respostas em formato expansível.',
    category: 'Conteúdo',
    widgetType: 'faq',
    settings: {
      title: 'Perguntas Frequentes',
      description: 'Principais dúvidas sobre nossos processos, prazos e atendimento.',
      items: [
        {
          question: 'Como funciona o atendimento inicial?',
          answer: 'Realizamos um diagnóstico inicial e apresentamos a melhor estratégia de execução para o seu contexto.',
        },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-stats',
    title: 'Widget Stats',
    description: 'Bloco de indicadores numéricos em grid responsivo.',
    category: 'Conteúdo',
    widgetType: 'stats',
    settings: {
      title: 'Nossos Números',
      description: 'Indicadores que refletem resultados consistentes e operação confiável.',
      columns: 4,
      items: [
        { label: 'Clientes atendidos', value: '250', suffix: '+' },
        { label: 'Projetos concluídos', value: '120', suffix: '+' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-process',
    title: 'Widget Timeline de Processo',
    description: 'Etapas do fluxo de atendimento em timeline vertical.',
    category: 'Conteúdo',
    widgetType: 'process',
    settings: {
      title: 'Como Funciona',
      description: 'Fluxo de trabalho estruturado para previsibilidade e resultados.',
      items: [
        { title: 'Diagnóstico', description: 'Entendimento do cenário e objetivos prioritários do projeto.' },
        { title: 'Planejamento', description: 'Definição do plano de execução, marcos e validações.' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-pricing',
    title: 'Widget Pricing',
    description: 'Tabela de planos com preços, benefícios e CTA.',
    category: 'Conteúdo',
    widgetType: 'pricing',
    settings: {
      title: 'Planos e Investimento',
      description: 'Escolha o formato de atendimento mais adequado ao seu estágio atual.',
      plans: [
        {
          name: 'Essencial',
          price: 'R$ 990',
          period: '/mês',
          features: ['Diagnóstico inicial', 'Suporte comercial', 'Acompanhamento mensal'],
          ctaText: 'Escolher Essencial',
          ctaLink: '/contato',
          highlighted: false,
        },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-comparison',
    title: 'Widget Comparison',
    description: 'Tabela comparativa entre diferenciais do serviço.',
    category: 'Conteúdo',
    widgetType: 'comparison',
    settings: {
      title: 'Comparativo de Atendimento',
      description: 'Resumo objetivo das diferenças do nosso modelo de execução.',
      rows: [
        { criterion: 'Tempo de resposta', ours: 'Até 24h', others: 'Variável' },
        { criterion: 'Acompanhamento', ours: 'Contínuo e estruturado', others: 'Pontual' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-logos-wall',
    title: 'Widget Logos Wall',
    description: 'Mural de logos com links opcionais para parceiros e clientes.',
    category: 'Conteúdo',
    widgetType: 'logos-wall',
    settings: {
      title: 'Empresas que confiam no nosso trabalho',
      description: 'Marcas atendidas com projetos orientados a resultado.',
      columns: 4,
      logos: [
        { name: 'Parceiro A', logoUrl: '/images/placeholder.png', link: '' },
        { name: 'Parceiro B', logoUrl: '/images/placeholder.png', link: '' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-case-highlights',
    title: 'Widget Case Highlights',
    description: 'Cards de casos com resultado, imagem opcional e link.',
    category: 'Conteúdo',
    widgetType: 'case-highlights',
    settings: {
      title: 'Cases em Destaque',
      description: 'Resultados práticos obtidos em cenários reais de operação.',
      maxItems: 3,
      cases: [
        {
          title: 'Reestruturação de Atendimento',
          result: 'Redução de 32% no tempo médio de resposta',
          imageUrl: '',
          link: '',
        },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-before-after',
    title: 'Widget Before/After',
    description: 'Comparativo visual com estado antes e depois.',
    category: 'Conteúdo',
    widgetType: 'before-after',
    settings: {
      title: 'Antes e Depois',
      description: 'Evolução visual e estrutural dos cenários transformados.',
      maxItems: 2,
      items: [
        {
          title: 'Fluxo Comercial',
          beforeLabel: 'Antes',
          afterLabel: 'Depois',
          beforeImageUrl: '/images/placeholder.png',
          afterImageUrl: '/images/placeholder.png',
        },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-feature-tabs',
    title: 'Widget Feature Tabs',
    description: 'Abas com conteúdos de diferenciais e etapas.',
    category: 'Conteúdo',
    widgetType: 'feature-tabs',
    settings: {
      title: 'Etapas e Diferenciais',
      description: 'Navegue pelos pilares do nosso modelo de trabalho.',
      tabs: [
        {
          label: 'Diagnóstico',
          title: 'Mapeamento inicial',
          description: 'Levantamento estruturado do cenário para definição de prioridades.',
          bullets: ['Análise de contexto', 'Riscos e gargalos', 'Objetivos de negócio'],
        },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-team-cards',
    title: 'Widget Team Cards',
    description: 'Cards de membros do time com papel e bio opcional.',
    category: 'Conteúdo',
    widgetType: 'team-cards',
    settings: {
      title: 'Time Especialista',
      description: 'Profissionais responsáveis por conduzir o projeto do diagnóstico à execução.',
      maxItems: 4,
      members: [
        {
          name: 'Especialista Exemplo',
          role: 'Estratégia',
          bio: 'Atuação consultiva com foco em execução.',
          imageUrl: '',
        },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-trust-badges',
    title: 'Widget Trust Badges',
    description: 'Selos de confiança com ícone, título e descrição.',
    category: 'Conteúdo',
    widgetType: 'trust-badges',
    settings: {
      title: 'Sinais de Confiança',
      description: 'Compromissos que sustentam entregas consistentes e seguras.',
      columns: 3,
      badges: [
        { icon: '✅', title: 'Compliance', description: 'Processos alinhados a boas práticas e rastreabilidade.' },
        { icon: '🔒', title: 'Segurança', description: 'Tratamento responsável de dados e acessos.' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-media-split',
    title: 'Widget Media Split',
    description: 'Bloco dividido com conteúdo textual e imagem.',
    category: 'Conteúdo',
    widgetType: 'media-split',
    settings: {
      title: 'Atendimento consultivo com foco em execução',
      description: 'Unimos estratégia, operação e acompanhamento para acelerar resultados consistentes.',
      bullets: ['Diagnóstico estruturado', 'Plano acionável', 'Monitoramento contínuo'],
      imageUrl: '/images/placeholder.png',
      imageAlt: 'Equipe em reunião',
      reverse: false,
      ctaText: 'Falar com especialista',
      ctaLink: '/contato',
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-icon-features',
    title: 'Widget Icon Features',
    description: 'Lista de diferenciais com ícone, título e descrição.',
    category: 'Conteúdo',
    widgetType: 'icon-features',
    settings: {
      title: 'Diferenciais Operacionais',
      description: 'Pilares que sustentam entregas consistentes.',
      columns: 3,
      items: [
        { icon: '⚙️', title: 'Processo', description: 'Fluxo operacional claro e previsível.' },
        { icon: '📊', title: 'Métricas', description: 'Acompanhamento por indicadores objetivos.' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-checklist-steps',
    title: 'Widget Checklist Steps',
    description: 'Lista de etapas com título e descrição opcional.',
    category: 'Conteúdo',
    widgetType: 'checklist-steps',
    settings: {
      title: 'Checklist de Implementação',
      description: 'Etapas práticas para uma execução consistente.',
      items: [
        { title: 'Diagnóstico inicial', description: 'Levantamento rápido do cenário e prioridades.' },
        { title: 'Plano de ação', description: 'Definição de etapas com objetivos claros.' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-quote-highlight',
    title: 'Widget Quote Highlight',
    description: 'Depoimento em destaque com autor e cargo.',
    category: 'Conteúdo',
    widgetType: 'quote-highlight',
    settings: {
      quote: 'A previsibilidade da execução foi decisiva para acelerar nossos resultados.',
      author: 'Cliente Exemplo',
      role: 'Diretoria Comercial',
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-milestones',
    title: 'Widget Milestones',
    description: 'Linha de marcos com ano, título e descrição.',
    category: 'Conteúdo',
    widgetType: 'milestones',
    settings: {
      title: 'Marcos de Evolução',
      description: 'Linha do tempo dos principais avanços da operação.',
      items: [
        { year: '2022', title: 'Estruturação inicial', description: 'Consolidação do método de atendimento.' },
        { year: '2023', title: 'Escala operacional', description: 'Expansão da base com processos padronizados.' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-dual-cta-band',
    title: 'Widget Dual CTA Band',
    description: 'Faixa de conversão com dois botões de ação.',
    category: 'Conversão',
    widgetType: 'dual-cta-band',
    settings: {
      title: 'Pronto para avançar com mais previsibilidade?',
      description: 'Fale com nosso time e entenda o melhor caminho para o seu cenário.',
      primaryText: 'Solicitar Diagnóstico',
      primaryLink: '/contato',
      secondaryText: 'Ver Serviços',
      secondaryLink: '/servicos',
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-kpi-strip',
    title: 'Widget KPI Strip',
    description: 'Faixa de indicadores com valor e rótulo.',
    category: 'Conteúdo',
    widgetType: 'kpi-strip',
    settings: {
      title: 'Indicadores de Performance',
      items: [
        { value: '+120', label: 'Projetos Entregues' },
        { value: '98%', label: 'Satisfação Reportada' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-image-quote',
    title: 'Widget Image Quote',
    description: 'Depoimento com imagem de apoio.',
    category: 'Conteúdo',
    widgetType: 'image-quote',
    settings: {
      quote: 'A combinação de método e acompanhamento nos deu segurança para avançar com consistência.',
      author: 'Cliente Exemplo',
      role: 'CEO',
      imageUrl: '/images/placeholder.png',
      imageAlt: 'Cliente satisfeito',
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-benefit-grid',
    title: 'Widget Benefit Grid',
    description: 'Grade de benefícios com título e descrição.',
    category: 'Conteúdo',
    widgetType: 'benefit-grid',
    settings: {
      title: 'Benefícios do Modelo',
      description: 'Elementos que sustentam previsibilidade e evolução contínua.',
      columns: 3,
      items: [
        { title: 'Planejamento claro', description: 'Etapas definidas com critérios objetivos.' },
        { title: 'Execução contínua', description: 'Acompanhamento ativo em todo o ciclo.' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-mini-timeline',
    title: 'Widget Mini Timeline',
    description: 'Timeline resumida com etapas sequenciais.',
    category: 'Conteúdo',
    widgetType: 'mini-timeline',
    settings: {
      title: 'Timeline Resumida',
      description: 'Visão rápida das principais etapas de trabalho.',
      items: [
        { step: '01', title: 'Briefing', description: 'Levantamento inicial de contexto.' },
        { step: '02', title: 'Execução', description: 'Implementação acompanhada por indicadores.' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-value-cards',
    title: 'Widget Value Cards',
    description: 'Cards com título, valor e descrição opcional.',
    category: 'Conteúdo',
    widgetType: 'value-cards',
    settings: {
      title: 'Indicadores de Valor',
      description: 'Números que representam impacto operacional e previsibilidade.',
      columns: 3,
      items: [
        { title: 'Eficiência', value: '32%', description: 'Redução média de retrabalho.' },
        { title: 'Velocidade', value: '24h', description: 'Tempo médio inicial de resposta.' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-quick-facts',
    title: 'Widget Quick Facts',
    description: 'Fatos rápidos com label e valor.',
    category: 'Conteúdo',
    widgetType: 'quick-facts',
    settings: {
      title: 'Fatos Rápidos',
      items: [
        { label: 'Clientes ativos', value: '+50' },
        { label: 'NPS médio', value: '74' },
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-feature-bullets',
    title: 'Widget Feature Bullets',
    description: 'Lista de bullets de diferenciais.',
    category: 'Conteúdo',
    widgetType: 'feature-bullets',
    settings: {
      title: 'Principais Diferenciais',
      description: 'Pontos de suporte para execução previsível.',
      bullets: [
        'Processo estruturado com priorização clara.',
        'Acompanhamento contínuo com indicadores.',
      ],
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-stat-banner',
    title: 'Widget Stat Banner',
    description: 'Banner com estatística principal em destaque.',
    category: 'Conteúdo',
    widgetType: 'stat-banner',
    settings: {
      value: '+250%',
      label: 'Evolução média de previsibilidade operacional',
      supportingText: 'Resultado consolidado em projetos com metodologia aplicada de ponta a ponta.',
    },
    available: true,
    badge: 'Novo',
  },
  {
    key: 'widget-cta',
    title: 'Widget CTA',
    description: 'Chamada para ação avançada com múltiplos estilos.',
    category: 'Conversão',
    widgetType: 'cta',
    settings: {
      title: 'Fale com nossa equipe',
      description: 'Estamos prontos para entender seu cenário e apresentar a melhor estratégia para seu caso.',
      primary_button_text: 'Solicitar Atendimento',
      primary_button_link: '/contato',
      secondary_button_text: 'Ver Serviços',
      secondary_button_link: '/servicos',
    },
    available: true,
    badge: 'Novo',
  },
];

const HomeWidgetManager: React.FC<HomeWidgetManagerProps> = ({ widgets, loading, onWidgetsChange, onConfigureHero, onConfigureAbout, onConfigureCta }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [openPalette, setOpenPalette] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [draftVariant, setDraftVariant] = useState('default');
  const [draftEnabled, setDraftEnabled] = useState(true);
  const [draftLegacySectionId, setDraftLegacySectionId] = useState('hero');
  const [draftAutoplay, setDraftAutoplay] = useState(true);
  const [draftAutoplaySpeed, setDraftAutoplaySpeed] = useState(4000);
  const [draftShowMap, setDraftShowMap] = useState(true);
  const [draftGridSource, setDraftGridSource] = useState<'services' | 'portfolio'>('services');
  const [draftGridColumns, setDraftGridColumns] = useState(3);
  const [draftGridMaxItems, setDraftGridMaxItems] = useState(6);
  const [draftGridTitle, setDraftGridTitle] = useState('');
  const [draftGridDescription, setDraftGridDescription] = useState('');
  const [draftCardListSource, setDraftCardListSource] = useState<'services' | 'portfolio'>('services');
  const [draftCardListMaxItems, setDraftCardListMaxItems] = useState(6);
  const [draftCardListTitle, setDraftCardListTitle] = useState('');
  const [draftCardListDescription, setDraftCardListDescription] = useState('');
  const [draftGalleryMaxItems, setDraftGalleryMaxItems] = useState(8);
  const [draftCtaTitle, setDraftCtaTitle] = useState('');
  const [draftCtaDescription, setDraftCtaDescription] = useState('');
  const [draftPrimaryButtonText, setDraftPrimaryButtonText] = useState('');
  const [draftPrimaryButtonLink, setDraftPrimaryButtonLink] = useState('');
  const [draftSecondaryButtonText, setDraftSecondaryButtonText] = useState('');
  const [draftSecondaryButtonLink, setDraftSecondaryButtonLink] = useState('');
  const [draftFormTitle, setDraftFormTitle] = useState('');
  const [draftFormDescription, setDraftFormDescription] = useState('');
  const [draftFormUrl, setDraftFormUrl] = useState('');
  const [draftFormCtaText, setDraftFormCtaText] = useState('');
  const [draftFormCtaUrl, setDraftFormCtaUrl] = useState('');
  const [draftFormHeight, setDraftFormHeight] = useState(760);
  const [draftTestimonialsTitle, setDraftTestimonialsTitle] = useState('');
  const [draftTestimonialsDescription, setDraftTestimonialsDescription] = useState('');
  const [draftTestimonialsMaxItems, setDraftTestimonialsMaxItems] = useState(6);
  const [draftTestimonialsItemsJson, setDraftTestimonialsItemsJson] = useState('');
  const [draftFaqTitle, setDraftFaqTitle] = useState('');
  const [draftFaqDescription, setDraftFaqDescription] = useState('');
  const [draftFaqItemsJson, setDraftFaqItemsJson] = useState('');
  const [draftStatsTitle, setDraftStatsTitle] = useState('');
  const [draftStatsDescription, setDraftStatsDescription] = useState('');
  const [draftStatsColumns, setDraftStatsColumns] = useState(4);
  const [draftStatsItemsJson, setDraftStatsItemsJson] = useState('');
  const [draftProcessTitle, setDraftProcessTitle] = useState('');
  const [draftProcessDescription, setDraftProcessDescription] = useState('');
  const [draftProcessItemsJson, setDraftProcessItemsJson] = useState('');
  const [draftPricingTitle, setDraftPricingTitle] = useState('');
  const [draftPricingDescription, setDraftPricingDescription] = useState('');
  const [draftPricingPlansJson, setDraftPricingPlansJson] = useState('');
  const [draftComparisonTitle, setDraftComparisonTitle] = useState('');
  const [draftComparisonDescription, setDraftComparisonDescription] = useState('');
  const [draftComparisonRowsJson, setDraftComparisonRowsJson] = useState('');
  const [draftLogosWallTitle, setDraftLogosWallTitle] = useState('');
  const [draftLogosWallDescription, setDraftLogosWallDescription] = useState('');
  const [draftLogosWallColumns, setDraftLogosWallColumns] = useState(4);
  const [draftLogosWallItemsJson, setDraftLogosWallItemsJson] = useState('');
  const [draftCaseHighlightsTitle, setDraftCaseHighlightsTitle] = useState('');
  const [draftCaseHighlightsDescription, setDraftCaseHighlightsDescription] = useState('');
  const [draftCaseHighlightsMaxItems, setDraftCaseHighlightsMaxItems] = useState(3);
  const [draftCaseHighlightsItemsJson, setDraftCaseHighlightsItemsJson] = useState('');
  const [draftBeforeAfterTitle, setDraftBeforeAfterTitle] = useState('');
  const [draftBeforeAfterDescription, setDraftBeforeAfterDescription] = useState('');
  const [draftBeforeAfterMaxItems, setDraftBeforeAfterMaxItems] = useState(2);
  const [draftBeforeAfterItemsJson, setDraftBeforeAfterItemsJson] = useState('');
  const [draftFeatureTabsTitle, setDraftFeatureTabsTitle] = useState('');
  const [draftFeatureTabsDescription, setDraftFeatureTabsDescription] = useState('');
  const [draftFeatureTabsItemsJson, setDraftFeatureTabsItemsJson] = useState('');
  const [draftTeamCardsTitle, setDraftTeamCardsTitle] = useState('');
  const [draftTeamCardsDescription, setDraftTeamCardsDescription] = useState('');
  const [draftTeamCardsMaxItems, setDraftTeamCardsMaxItems] = useState(4);
  const [draftTeamCardsItemsJson, setDraftTeamCardsItemsJson] = useState('');
  const [draftTrustBadgesTitle, setDraftTrustBadgesTitle] = useState('');
  const [draftTrustBadgesDescription, setDraftTrustBadgesDescription] = useState('');
  const [draftTrustBadgesColumns, setDraftTrustBadgesColumns] = useState(3);
  const [draftTrustBadgesItemsJson, setDraftTrustBadgesItemsJson] = useState('');
  const [draftMediaSplitTitle, setDraftMediaSplitTitle] = useState('');
  const [draftMediaSplitDescription, setDraftMediaSplitDescription] = useState('');
  const [draftMediaSplitBulletsJson, setDraftMediaSplitBulletsJson] = useState('');
  const [draftMediaSplitImageUrl, setDraftMediaSplitImageUrl] = useState('');
  const [draftMediaSplitImageAlt, setDraftMediaSplitImageAlt] = useState('');
  const [draftMediaSplitReverse, setDraftMediaSplitReverse] = useState(false);
  const [draftMediaSplitCtaText, setDraftMediaSplitCtaText] = useState('');
  const [draftMediaSplitCtaLink, setDraftMediaSplitCtaLink] = useState('');
  const [draftIconFeaturesTitle, setDraftIconFeaturesTitle] = useState('');
  const [draftIconFeaturesDescription, setDraftIconFeaturesDescription] = useState('');
  const [draftIconFeaturesColumns, setDraftIconFeaturesColumns] = useState(3);
  const [draftIconFeaturesItemsJson, setDraftIconFeaturesItemsJson] = useState('');
  const [draftChecklistStepsTitle, setDraftChecklistStepsTitle] = useState('');
  const [draftChecklistStepsDescription, setDraftChecklistStepsDescription] = useState('');
  const [draftChecklistStepsItemsJson, setDraftChecklistStepsItemsJson] = useState('');
  const [draftQuoteHighlightQuote, setDraftQuoteHighlightQuote] = useState('');
  const [draftQuoteHighlightAuthor, setDraftQuoteHighlightAuthor] = useState('');
  const [draftQuoteHighlightRole, setDraftQuoteHighlightRole] = useState('');
  const [draftMilestonesTitle, setDraftMilestonesTitle] = useState('');
  const [draftMilestonesDescription, setDraftMilestonesDescription] = useState('');
  const [draftMilestonesItemsJson, setDraftMilestonesItemsJson] = useState('');
  const [draftDualCtaBandTitle, setDraftDualCtaBandTitle] = useState('');
  const [draftDualCtaBandDescription, setDraftDualCtaBandDescription] = useState('');
  const [draftDualCtaBandPrimaryText, setDraftDualCtaBandPrimaryText] = useState('');
  const [draftDualCtaBandPrimaryLink, setDraftDualCtaBandPrimaryLink] = useState('');
  const [draftDualCtaBandSecondaryText, setDraftDualCtaBandSecondaryText] = useState('');
  const [draftDualCtaBandSecondaryLink, setDraftDualCtaBandSecondaryLink] = useState('');
  const [draftKpiStripTitle, setDraftKpiStripTitle] = useState('');
  const [draftKpiStripItemsJson, setDraftKpiStripItemsJson] = useState('');
  const [draftImageQuoteQuote, setDraftImageQuoteQuote] = useState('');
  const [draftImageQuoteAuthor, setDraftImageQuoteAuthor] = useState('');
  const [draftImageQuoteRole, setDraftImageQuoteRole] = useState('');
  const [draftImageQuoteImageUrl, setDraftImageQuoteImageUrl] = useState('');
  const [draftImageQuoteImageAlt, setDraftImageQuoteImageAlt] = useState('');
  const [draftBenefitGridTitle, setDraftBenefitGridTitle] = useState('');
  const [draftBenefitGridDescription, setDraftBenefitGridDescription] = useState('');
  const [draftBenefitGridColumns, setDraftBenefitGridColumns] = useState(3);
  const [draftBenefitGridItemsJson, setDraftBenefitGridItemsJson] = useState('');
  const [draftMiniTimelineTitle, setDraftMiniTimelineTitle] = useState('');
  const [draftMiniTimelineDescription, setDraftMiniTimelineDescription] = useState('');
  const [draftMiniTimelineItemsJson, setDraftMiniTimelineItemsJson] = useState('');
  const [draftValueCardsTitle, setDraftValueCardsTitle] = useState('');
  const [draftValueCardsDescription, setDraftValueCardsDescription] = useState('');
  const [draftValueCardsColumns, setDraftValueCardsColumns] = useState(3);
  const [draftValueCardsItemsJson, setDraftValueCardsItemsJson] = useState('');
  const [draftQuickFactsTitle, setDraftQuickFactsTitle] = useState('');
  const [draftQuickFactsItemsJson, setDraftQuickFactsItemsJson] = useState('');
  const [draftFeatureBulletsTitle, setDraftFeatureBulletsTitle] = useState('');
  const [draftFeatureBulletsDescription, setDraftFeatureBulletsDescription] = useState('');
  const [draftFeatureBulletsItemsJson, setDraftFeatureBulletsItemsJson] = useState('');
  const [draftStatBannerValue, setDraftStatBannerValue] = useState('');
  const [draftStatBannerLabel, setDraftStatBannerLabel] = useState('');
  const [draftStatBannerSupportingText, setDraftStatBannerSupportingText] = useState('');

  const sortedWidgets = useMemo(() => {
    return [...widgets].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [widgets]);
  const selectedWidget = sortedWidgets.find((item) => item.id === selectedWidgetId) || null;
  useEffect(() => {
    if (!selectedWidgetId && sortedWidgets.length > 0) {
      setSelectedWidgetId(sortedWidgets[0].id);
    }
    if (selectedWidgetId && !sortedWidgets.some((item) => item.id === selectedWidgetId)) {
      setSelectedWidgetId(sortedWidgets[0]?.id || null);
    }
  }, [selectedWidgetId, sortedWidgets]);

  useEffect(() => {
    if (!selectedWidget) return;
    const settings = selectedWidget.settings || {};
    setDraftVariant(selectedWidget.variant || 'default');
    setDraftEnabled(selectedWidget.enabled);
    setDraftLegacySectionId((settings.legacySectionId as string | undefined) || 'hero');
    setDraftAutoplay(Boolean(settings.autoplay ?? true));
    setDraftAutoplaySpeed(Number(settings.autoplaySpeed ?? 4000));
    setDraftShowMap(Boolean(settings.showMap ?? true));
    setDraftGridSource((settings.source as 'services' | 'portfolio') || 'services');
    setDraftGridColumns(Number(settings.columns ?? 3));
    setDraftGridMaxItems(Number(settings.maxItems ?? 6));
    setDraftGridTitle((settings.title as string | undefined) || '');
    setDraftGridDescription((settings.description as string | undefined) || '');
    setDraftCardListSource((settings.source as 'services' | 'portfolio') || 'services');
    setDraftCardListMaxItems(Number(settings.maxItems ?? 6));
    setDraftCardListTitle((settings.title as string | undefined) || '');
    setDraftCardListDescription((settings.description as string | undefined) || '');
    setDraftGalleryMaxItems(Number(settings.maxItems ?? 8));
    setDraftCtaTitle((settings.title as string | undefined) || '');
    setDraftCtaDescription((settings.description as string | undefined) || '');
    setDraftPrimaryButtonText((settings.primary_button_text as string | undefined) || '');
    setDraftPrimaryButtonLink((settings.primary_button_link as string | undefined) || '');
    setDraftSecondaryButtonText((settings.secondary_button_text as string | undefined) || '');
    setDraftSecondaryButtonLink((settings.secondary_button_link as string | undefined) || '');
    setDraftFormTitle((settings.title as string | undefined) || '');
    setDraftFormDescription((settings.description as string | undefined) || '');
    setDraftFormUrl((settings.formUrl as string | undefined) || '');
    setDraftFormCtaText((settings.ctaText as string | undefined) || '');
    setDraftFormCtaUrl((settings.ctaUrl as string | undefined) || '');
    setDraftFormHeight(Number(settings.height ?? 760));
    setDraftTestimonialsTitle((settings.title as string | undefined) || '');
    setDraftTestimonialsDescription((settings.description as string | undefined) || '');
    setDraftTestimonialsMaxItems(Number(settings.maxItems ?? 6));
    setDraftTestimonialsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftFaqTitle((settings.title as string | undefined) || '');
    setDraftFaqDescription((settings.description as string | undefined) || '');
    setDraftFaqItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftStatsTitle((settings.title as string | undefined) || '');
    setDraftStatsDescription((settings.description as string | undefined) || '');
    setDraftStatsColumns(Number(settings.columns ?? 4));
    setDraftStatsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftProcessTitle((settings.title as string | undefined) || '');
    setDraftProcessDescription((settings.description as string | undefined) || '');
    setDraftProcessItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftPricingTitle((settings.title as string | undefined) || '');
    setDraftPricingDescription((settings.description as string | undefined) || '');
    setDraftPricingPlansJson(JSON.stringify(settings.plans || [], null, 2));
    setDraftComparisonTitle((settings.title as string | undefined) || '');
    setDraftComparisonDescription((settings.description as string | undefined) || '');
    setDraftComparisonRowsJson(JSON.stringify(settings.rows || [], null, 2));
    setDraftLogosWallTitle((settings.title as string | undefined) || '');
    setDraftLogosWallDescription((settings.description as string | undefined) || '');
    setDraftLogosWallColumns(Number(settings.columns ?? 4));
    setDraftLogosWallItemsJson(JSON.stringify(settings.logos || [], null, 2));
    setDraftCaseHighlightsTitle((settings.title as string | undefined) || '');
    setDraftCaseHighlightsDescription((settings.description as string | undefined) || '');
    setDraftCaseHighlightsMaxItems(Number(settings.maxItems ?? 3));
    setDraftCaseHighlightsItemsJson(JSON.stringify(settings.cases || [], null, 2));
    setDraftBeforeAfterTitle((settings.title as string | undefined) || '');
    setDraftBeforeAfterDescription((settings.description as string | undefined) || '');
    setDraftBeforeAfterMaxItems(Number(settings.maxItems ?? 2));
    setDraftBeforeAfterItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftFeatureTabsTitle((settings.title as string | undefined) || '');
    setDraftFeatureTabsDescription((settings.description as string | undefined) || '');
    setDraftFeatureTabsItemsJson(JSON.stringify(settings.tabs || [], null, 2));
    setDraftTeamCardsTitle((settings.title as string | undefined) || '');
    setDraftTeamCardsDescription((settings.description as string | undefined) || '');
    setDraftTeamCardsMaxItems(Number(settings.maxItems ?? 4));
    setDraftTeamCardsItemsJson(JSON.stringify(settings.members || [], null, 2));
    setDraftTrustBadgesTitle((settings.title as string | undefined) || '');
    setDraftTrustBadgesDescription((settings.description as string | undefined) || '');
    setDraftTrustBadgesColumns(Number(settings.columns ?? 3));
    setDraftTrustBadgesItemsJson(JSON.stringify(settings.badges || [], null, 2));
    setDraftMediaSplitTitle((settings.title as string | undefined) || '');
    setDraftMediaSplitDescription((settings.description as string | undefined) || '');
    setDraftMediaSplitBulletsJson(JSON.stringify(settings.bullets || [], null, 2));
    setDraftMediaSplitImageUrl((settings.imageUrl as string | undefined) || '');
    setDraftMediaSplitImageAlt((settings.imageAlt as string | undefined) || '');
    setDraftMediaSplitReverse(Boolean(settings.reverse ?? false));
    setDraftMediaSplitCtaText((settings.ctaText as string | undefined) || '');
    setDraftMediaSplitCtaLink((settings.ctaLink as string | undefined) || '');
    setDraftIconFeaturesTitle((settings.title as string | undefined) || '');
    setDraftIconFeaturesDescription((settings.description as string | undefined) || '');
    setDraftIconFeaturesColumns(Number(settings.columns ?? 3));
    setDraftIconFeaturesItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftChecklistStepsTitle((settings.title as string | undefined) || '');
    setDraftChecklistStepsDescription((settings.description as string | undefined) || '');
    setDraftChecklistStepsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftQuoteHighlightQuote((settings.quote as string | undefined) || '');
    setDraftQuoteHighlightAuthor((settings.author as string | undefined) || '');
    setDraftQuoteHighlightRole((settings.role as string | undefined) || '');
    setDraftMilestonesTitle((settings.title as string | undefined) || '');
    setDraftMilestonesDescription((settings.description as string | undefined) || '');
    setDraftMilestonesItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftDualCtaBandTitle((settings.title as string | undefined) || '');
    setDraftDualCtaBandDescription((settings.description as string | undefined) || '');
    setDraftDualCtaBandPrimaryText((settings.primaryText as string | undefined) || '');
    setDraftDualCtaBandPrimaryLink((settings.primaryLink as string | undefined) || '');
    setDraftDualCtaBandSecondaryText((settings.secondaryText as string | undefined) || '');
    setDraftDualCtaBandSecondaryLink((settings.secondaryLink as string | undefined) || '');
    setDraftKpiStripTitle((settings.title as string | undefined) || '');
    setDraftKpiStripItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftImageQuoteQuote((settings.quote as string | undefined) || '');
    setDraftImageQuoteAuthor((settings.author as string | undefined) || '');
    setDraftImageQuoteRole((settings.role as string | undefined) || '');
    setDraftImageQuoteImageUrl((settings.imageUrl as string | undefined) || '');
    setDraftImageQuoteImageAlt((settings.imageAlt as string | undefined) || '');
    setDraftBenefitGridTitle((settings.title as string | undefined) || '');
    setDraftBenefitGridDescription((settings.description as string | undefined) || '');
    setDraftBenefitGridColumns(Number(settings.columns ?? 3));
    setDraftBenefitGridItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftMiniTimelineTitle((settings.title as string | undefined) || '');
    setDraftMiniTimelineDescription((settings.description as string | undefined) || '');
    setDraftMiniTimelineItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftValueCardsTitle((settings.title as string | undefined) || '');
    setDraftValueCardsDescription((settings.description as string | undefined) || '');
    setDraftValueCardsColumns(Number(settings.columns ?? 3));
    setDraftValueCardsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftQuickFactsTitle((settings.title as string | undefined) || '');
    setDraftQuickFactsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftFeatureBulletsTitle((settings.title as string | undefined) || '');
    setDraftFeatureBulletsDescription((settings.description as string | undefined) || '');
    setDraftFeatureBulletsItemsJson(JSON.stringify(settings.bullets || [], null, 2));
    setDraftStatBannerValue((settings.value as string | undefined) || '');
    setDraftStatBannerLabel((settings.label as string | undefined) || '');
    setDraftStatBannerSupportingText((settings.supportingText as string | undefined) || '');
  }, [selectedWidget]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const persistOrder = async (ordered: HomeWidgetDto[]) => {
    const ids = ordered.map((item) => item.id);
    const saved = await homeWidgetService.reorder(ids);
    onWidgetsChange(saved);
  };

  const updateWidgetInList = (updated: HomeWidgetDto) => {
    const next = sortedWidgets.map((item) => (item.id === updated.id ? updated : item));
    onWidgetsChange(next);
  };

  const getNextOrderIndex = (items: HomeWidgetDto[]) => {
    if (items.length === 0) return 0;
    return items.reduce((max, item) => Math.max(max, item.orderIndex), -1) + 1;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedWidgets.findIndex((item) => item.id === active.id);
    const newIndex = sortedWidgets.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(sortedWidgets, oldIndex, newIndex).map((item, index) => ({
      ...item,
      orderIndex: index,
    }));

    onWidgetsChange(reordered);

    try {
      setSaving(true);
      await persistOrder(reordered);
      toast.success('Ordem dos elementos atualizada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao reordenar elementos.');
      onWidgetsChange(sortedWidgets);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTemplate = async (template: WidgetTemplate) => {
    if (template.available === false) {
      toast.info('Este widget estará disponível em breve.');
      return;
    }
    try {
      setSaving(true);
      const nextOrderIndex = getNextOrderIndex(sortedWidgets);
      let created = await homeWidgetService.upsert({
        widgetType: template.widgetType,
        variant: template.variant || 'default',
        orderIndex: nextOrderIndex,
        enabled: true,
        settings: template.settings || {},
      });
      if (!created) {
        throw new Error('Falha ao criar elemento.');
      }
      onWidgetsChange([...sortedWidgets, created]);
      setSelectedWidgetId(created.id);
      setOpenPalette(false);
      toast.success('Elemento adicionado com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao adicionar elemento.';
      const duplicateOrderError =
        message.includes('idx_home_widgets_page_order') || message.toLowerCase().includes('duplicate key');
      if (duplicateOrderError) {
        try {
          const fresh = await homeWidgetService.list();
          const retryOrderIndex = getNextOrderIndex(fresh);
          const retryCreated = await homeWidgetService.upsert({
            widgetType: template.widgetType,
            variant: template.variant || 'default',
            orderIndex: retryOrderIndex,
            enabled: true,
            settings: template.settings || {},
          });
          onWidgetsChange([...fresh, retryCreated].sort((a, b) => a.orderIndex - b.orderIndex));
          setSelectedWidgetId(retryCreated.id);
          setOpenPalette(false);
          toast.success('Elemento adicionado com sucesso.');
          return;
        } catch (retryError) {
          toast.error(retryError instanceof Error ? retryError.message : 'Falha ao adicionar elemento.');
          return;
        }
      }
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (widget: HomeWidgetDto) => {
    const previous = [...sortedWidgets];
    const next = sortedWidgets.map((item) => (item.id === widget.id ? { ...item, enabled: !item.enabled } : item));
    onWidgetsChange(next);
    try {
      const updated = await homeWidgetService.upsert({
        id: widget.id,
        pageKey: widget.pageKey,
        widgetType: widget.widgetType,
        variant: widget.variant,
        orderIndex: widget.orderIndex,
        enabled: !widget.enabled,
        settings: widget.settings,
        dataBinding: widget.dataBinding,
        version: widget.version,
      });
      updateWidgetInList(updated);
      toast.success('Elemento atualizado.');
    } catch (error) {
      onWidgetsChange(previous);
      toast.error(error instanceof Error ? error.message : 'Falha ao atualizar elemento.');
    }
  };

  const handleRemove = async (widget: HomeWidgetDto) => {
    const previous = [...sortedWidgets];
    const remaining = sortedWidgets.filter((item) => item.id !== widget.id).map((item, index) => ({ ...item, orderIndex: index }));
    onWidgetsChange(remaining);
    try {
      await homeWidgetService.remove(widget.id);
      if (remaining.length > 0) {
        await persistOrder(remaining);
      }
      toast.success('Elemento removido.');
    } catch (error) {
      onWidgetsChange(previous);
      toast.error(error instanceof Error ? error.message : 'Falha ao remover elemento.');
    }
  };

  const handleSaveSelected = async () => {
    if (!selectedWidget) return;
    const legacySectionId = selectedWidget.widgetType === 'legacy-section' ? draftLegacySectionId : undefined;
    const baseSettings = { ...(selectedWidget.settings || {}) };
    if (legacySectionId) {
      baseSettings.legacySectionId = legacySectionId;
      if (legacySectionId === 'services' || legacySectionId === 'projects') {
        baseSettings.autoplay = draftAutoplay;
        baseSettings.autoplaySpeed = Math.max(1000, Number(draftAutoplaySpeed || 4000));
      }
      if (legacySectionId === 'contact') {
        baseSettings.showMap = draftShowMap;
      }
    }
    if (selectedWidget.widgetType === 'gallery') {
      baseSettings.maxItems = Math.max(1, Number(draftGalleryMaxItems || 8));
    }
    if (selectedWidget.widgetType === 'grid') {
      baseSettings.source = draftGridSource;
      baseSettings.columns = [2, 3, 4].includes(Number(draftGridColumns)) ? Number(draftGridColumns) : 3;
      baseSettings.maxItems = Math.max(1, Number(draftGridMaxItems || 6));
      baseSettings.title = draftGridTitle;
      baseSettings.description = draftGridDescription;
    }
    if (selectedWidget.widgetType === 'card-list') {
      baseSettings.source = draftCardListSource;
      baseSettings.maxItems = Math.max(1, Number(draftCardListMaxItems || 6));
      baseSettings.title = draftCardListTitle;
      baseSettings.description = draftCardListDescription;
    }
    if (selectedWidget.widgetType === 'cta') {
      baseSettings.title = draftCtaTitle;
      baseSettings.description = draftCtaDescription;
      baseSettings.primary_button_text = draftPrimaryButtonText;
      baseSettings.primary_button_link = draftPrimaryButtonLink;
      baseSettings.secondary_button_text = draftSecondaryButtonText;
      baseSettings.secondary_button_link = draftSecondaryButtonLink;
    }
    if (selectedWidget.widgetType === 'form-embed') {
      const safeFormUrl = sanitizeEmbedUrl(draftFormUrl);
      if (!safeFormUrl) {
        toast.error('URL do formulário inválida ou domínio não permitido.');
        return;
      }
      const safeCtaUrl = draftFormCtaUrl ? sanitizeEmbedUrl(draftFormCtaUrl) : null;
      if (draftFormCtaUrl && !safeCtaUrl) {
        toast.error('URL do CTA inválida ou domínio não permitido.');
        return;
      }
      baseSettings.title = draftFormTitle;
      baseSettings.description = draftFormDescription;
      baseSettings.formUrl = safeFormUrl;
      baseSettings.ctaText = draftFormCtaText;
      baseSettings.ctaUrl = safeCtaUrl || '';
      baseSettings.height = Math.max(480, Number(draftFormHeight || 760));
    }
    if (selectedWidget.widgetType === 'testimonials') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftTestimonialsItemsJson || '[]');
      } catch {
        toast.error('JSON de depoimentos inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de depoimentos deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          name: String(item?.name || '').trim(),
          role: String(item?.role || '').trim(),
          quote: String(item?.quote || '').trim(),
          avatarUrl: String(item?.avatarUrl || '').trim(),
        }))
        .filter((item) => item.name && item.quote);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um depoimento com name e quote.');
        return;
      }
      baseSettings.title = draftTestimonialsTitle;
      baseSettings.description = draftTestimonialsDescription;
      baseSettings.maxItems = Math.max(1, Number(draftTestimonialsMaxItems || 6));
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'faq') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftFaqItemsJson || '[]');
      } catch {
        toast.error('JSON de FAQ inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de FAQ deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          question: String(item?.question || '').trim(),
          answer: String(item?.answer || '').trim(),
        }))
        .filter((item) => item.question && item.answer);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um item com question e answer.');
        return;
      }
      baseSettings.title = draftFaqTitle;
      baseSettings.description = draftFaqDescription;
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'stats') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftStatsItemsJson || '[]');
      } catch {
        toast.error('JSON de indicadores inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de indicadores deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          label: String(item?.label || '').trim(),
          value: String(item?.value || '').trim(),
          suffix: String(item?.suffix || '').trim(),
        }))
        .filter((item) => item.label && item.value);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um indicador com label e value.');
        return;
      }
      baseSettings.title = draftStatsTitle;
      baseSettings.description = draftStatsDescription;
      baseSettings.columns = [2, 3, 4].includes(Number(draftStatsColumns)) ? Number(draftStatsColumns) : 4;
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'process') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftProcessItemsJson || '[]');
      } catch {
        toast.error('JSON da timeline inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista da timeline deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
        }))
        .filter((item) => item.title && item.description);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos uma etapa com title e description.');
        return;
      }
      baseSettings.title = draftProcessTitle;
      baseSettings.description = draftProcessDescription;
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'pricing') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftPricingPlansJson || '[]');
      } catch {
        toast.error('JSON de planos inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de planos deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          name: String(item?.name || '').trim(),
          price: String(item?.price || '').trim(),
          period: String(item?.period || '').trim(),
          features: Array.isArray(item?.features)
            ? item.features.map((feature: unknown) => String(feature || '').trim()).filter(Boolean)
            : [],
          ctaText: String(item?.ctaText || '').trim(),
          ctaLink: String(item?.ctaLink || '').trim(),
          highlighted: Boolean(item?.highlighted),
        }))
        .filter((item) => item.name && item.price);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um plano com name e price.');
        return;
      }
      baseSettings.title = draftPricingTitle;
      baseSettings.description = draftPricingDescription;
      baseSettings.plans = normalized;
    }
    if (selectedWidget.widgetType === 'comparison') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftComparisonRowsJson || '[]');
      } catch {
        toast.error('JSON de comparação inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de comparação deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          criterion: String(item?.criterion || '').trim(),
          ours: String(item?.ours || '').trim(),
          others: String(item?.others || '').trim(),
        }))
        .filter((item) => item.criterion && item.ours && item.others);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos uma linha com criterion, ours e others.');
        return;
      }
      baseSettings.title = draftComparisonTitle;
      baseSettings.description = draftComparisonDescription;
      baseSettings.rows = normalized;
    }
    if (selectedWidget.widgetType === 'logos-wall') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftLogosWallItemsJson || '[]');
      } catch {
        toast.error('JSON de logos inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de logos deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          name: String(item?.name || '').trim(),
          logoUrl: String(item?.logoUrl || '').trim(),
          link: String(item?.link || '').trim(),
        }))
        .filter((item) => item.name && item.logoUrl);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um logo com name e logoUrl.');
        return;
      }
      baseSettings.title = draftLogosWallTitle;
      baseSettings.description = draftLogosWallDescription;
      baseSettings.columns = [2, 3, 4, 5].includes(Number(draftLogosWallColumns)) ? Number(draftLogosWallColumns) : 4;
      baseSettings.logos = normalized;
    }
    if (selectedWidget.widgetType === 'case-highlights') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftCaseHighlightsItemsJson || '[]');
      } catch {
        toast.error('JSON de cases inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de cases deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          title: String(item?.title || '').trim(),
          result: String(item?.result || '').trim(),
          imageUrl: String(item?.imageUrl || '').trim(),
          link: String(item?.link || '').trim(),
        }))
        .filter((item) => item.title && item.result);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um case com title e result.');
        return;
      }
      baseSettings.title = draftCaseHighlightsTitle;
      baseSettings.description = draftCaseHighlightsDescription;
      baseSettings.maxItems = Math.max(1, Number(draftCaseHighlightsMaxItems || 3));
      baseSettings.cases = normalized;
    }
    if (selectedWidget.widgetType === 'before-after') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftBeforeAfterItemsJson || '[]');
      } catch {
        toast.error('JSON de before/after inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de before/after deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          title: String(item?.title || '').trim(),
          beforeLabel: String(item?.beforeLabel || '').trim(),
          afterLabel: String(item?.afterLabel || '').trim(),
          beforeImageUrl: String(item?.beforeImageUrl || '').trim(),
          afterImageUrl: String(item?.afterImageUrl || '').trim(),
        }))
        .filter((item) => item.title && item.beforeImageUrl && item.afterImageUrl);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um item com title, beforeImageUrl e afterImageUrl.');
        return;
      }
      baseSettings.title = draftBeforeAfterTitle;
      baseSettings.description = draftBeforeAfterDescription;
      baseSettings.maxItems = Math.max(1, Number(draftBeforeAfterMaxItems || 2));
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'feature-tabs') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftFeatureTabsItemsJson || '[]');
      } catch {
        toast.error('JSON de feature tabs inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de feature tabs deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          label: String(item?.label || '').trim(),
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
          bullets: Array.isArray(item?.bullets)
            ? item.bullets.map((bullet: unknown) => String(bullet || '').trim()).filter(Boolean)
            : [],
        }))
        .filter((item) => item.label && item.title && item.description);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos uma aba com label, title e description.');
        return;
      }
      baseSettings.title = draftFeatureTabsTitle;
      baseSettings.description = draftFeatureTabsDescription;
      baseSettings.tabs = normalized;
    }
    if (selectedWidget.widgetType === 'team-cards') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftTeamCardsItemsJson || '[]');
      } catch {
        toast.error('JSON de team cards inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de team cards deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          name: String(item?.name || '').trim(),
          role: String(item?.role || '').trim(),
          bio: String(item?.bio || '').trim(),
          imageUrl: String(item?.imageUrl || '').trim(),
        }))
        .filter((item) => item.name && item.role);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um membro com name e role.');
        return;
      }
      baseSettings.title = draftTeamCardsTitle;
      baseSettings.description = draftTeamCardsDescription;
      baseSettings.maxItems = Math.max(1, Number(draftTeamCardsMaxItems || 4));
      baseSettings.members = normalized;
    }
    if (selectedWidget.widgetType === 'trust-badges') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftTrustBadgesItemsJson || '[]');
      } catch {
        toast.error('JSON de trust badges inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de trust badges deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          icon: String(item?.icon || '').trim(),
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
        }))
        .filter((item) => item.title);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um selo com title.');
        return;
      }
      baseSettings.title = draftTrustBadgesTitle;
      baseSettings.description = draftTrustBadgesDescription;
      baseSettings.columns = [2, 3, 4].includes(Number(draftTrustBadgesColumns)) ? Number(draftTrustBadgesColumns) : 3;
      baseSettings.badges = normalized;
    }
    if (selectedWidget.widgetType === 'media-split') {
      let parsedBullets: any[] = [];
      try {
        parsedBullets = JSON.parse(draftMediaSplitBulletsJson || '[]');
      } catch {
        toast.error('JSON de bullets inválido.');
        return;
      }
      if (!Array.isArray(parsedBullets)) {
        toast.error('A lista de bullets deve ser um array JSON.');
        return;
      }
      const normalizedBullets = parsedBullets.map((item) => String(item || '').trim()).filter(Boolean);
      baseSettings.title = draftMediaSplitTitle;
      baseSettings.description = draftMediaSplitDescription;
      baseSettings.bullets = normalizedBullets;
      baseSettings.imageUrl = String(draftMediaSplitImageUrl || '').trim();
      baseSettings.imageAlt = String(draftMediaSplitImageAlt || '').trim();
      baseSettings.reverse = Boolean(draftMediaSplitReverse);
      baseSettings.ctaText = String(draftMediaSplitCtaText || '').trim();
      baseSettings.ctaLink = String(draftMediaSplitCtaLink || '').trim();
    }
    if (selectedWidget.widgetType === 'icon-features') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftIconFeaturesItemsJson || '[]');
      } catch {
        toast.error('JSON de icon features inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de icon features deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          icon: String(item?.icon || '').trim(),
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
        }))
        .filter((item) => item.title);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um item com title.');
        return;
      }
      baseSettings.title = draftIconFeaturesTitle;
      baseSettings.description = draftIconFeaturesDescription;
      baseSettings.columns = [2, 3, 4].includes(Number(draftIconFeaturesColumns)) ? Number(draftIconFeaturesColumns) : 3;
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'checklist-steps') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftChecklistStepsItemsJson || '[]');
      } catch {
        toast.error('JSON de checklist inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de checklist deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
        }))
        .filter((item) => item.title);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um item com title.');
        return;
      }
      baseSettings.title = draftChecklistStepsTitle;
      baseSettings.description = draftChecklistStepsDescription;
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'quote-highlight') {
      const quote = String(draftQuoteHighlightQuote || '').trim();
      if (!quote) {
        toast.error('Informe a citação.');
        return;
      }
      baseSettings.quote = quote;
      baseSettings.author = String(draftQuoteHighlightAuthor || '').trim();
      baseSettings.role = String(draftQuoteHighlightRole || '').trim();
    }
    if (selectedWidget.widgetType === 'milestones') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftMilestonesItemsJson || '[]');
      } catch {
        toast.error('JSON de milestones inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de milestones deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          year: String(item?.year || '').trim(),
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
        }))
        .filter((item) => item.year && item.title);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um item com year e title.');
        return;
      }
      baseSettings.title = draftMilestonesTitle;
      baseSettings.description = draftMilestonesDescription;
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'dual-cta-band') {
      baseSettings.title = String(draftDualCtaBandTitle || '').trim();
      baseSettings.description = String(draftDualCtaBandDescription || '').trim();
      baseSettings.primaryText = String(draftDualCtaBandPrimaryText || '').trim();
      baseSettings.primaryLink = String(draftDualCtaBandPrimaryLink || '').trim();
      baseSettings.secondaryText = String(draftDualCtaBandSecondaryText || '').trim();
      baseSettings.secondaryLink = String(draftDualCtaBandSecondaryLink || '').trim();
    }
    if (selectedWidget.widgetType === 'kpi-strip') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftKpiStripItemsJson || '[]');
      } catch {
        toast.error('JSON de KPI inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de KPIs deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          value: String(item?.value || '').trim(),
          label: String(item?.label || '').trim(),
        }))
        .filter((item) => item.value && item.label);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um item com value e label.');
        return;
      }
      baseSettings.title = String(draftKpiStripTitle || '').trim();
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'image-quote') {
      const quote = String(draftImageQuoteQuote || '').trim();
      if (!quote) {
        toast.error('Informe a citação.');
        return;
      }
      baseSettings.quote = quote;
      baseSettings.author = String(draftImageQuoteAuthor || '').trim();
      baseSettings.role = String(draftImageQuoteRole || '').trim();
      baseSettings.imageUrl = String(draftImageQuoteImageUrl || '').trim();
      baseSettings.imageAlt = String(draftImageQuoteImageAlt || '').trim();
    }
    if (selectedWidget.widgetType === 'benefit-grid') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftBenefitGridItemsJson || '[]');
      } catch {
        toast.error('JSON de benefit grid inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de benefit grid deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
        }))
        .filter((item) => item.title);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um item com title.');
        return;
      }
      baseSettings.title = String(draftBenefitGridTitle || '').trim();
      baseSettings.description = String(draftBenefitGridDescription || '').trim();
      baseSettings.columns = [2, 3, 4].includes(Number(draftBenefitGridColumns)) ? Number(draftBenefitGridColumns) : 3;
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'mini-timeline') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftMiniTimelineItemsJson || '[]');
      } catch {
        toast.error('JSON de mini timeline inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de mini timeline deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          step: String(item?.step || '').trim(),
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
        }))
        .filter((item) => item.step && item.title);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um item com step e title.');
        return;
      }
      baseSettings.title = String(draftMiniTimelineTitle || '').trim();
      baseSettings.description = String(draftMiniTimelineDescription || '').trim();
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'value-cards') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftValueCardsItemsJson || '[]');
      } catch {
        toast.error('JSON de value cards inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de value cards deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          title: String(item?.title || '').trim(),
          value: String(item?.value || '').trim(),
          description: String(item?.description || '').trim(),
        }))
        .filter((item) => item.title && item.value);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um item com title e value.');
        return;
      }
      baseSettings.title = String(draftValueCardsTitle || '').trim();
      baseSettings.description = String(draftValueCardsDescription || '').trim();
      baseSettings.columns = [2, 3, 4].includes(Number(draftValueCardsColumns)) ? Number(draftValueCardsColumns) : 3;
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'quick-facts') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftQuickFactsItemsJson || '[]');
      } catch {
        toast.error('JSON de quick facts inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de quick facts deve ser um array JSON.');
        return;
      }
      const normalized = parsed
        .map((item) => ({
          label: String(item?.label || '').trim(),
          value: String(item?.value || '').trim(),
        }))
        .filter((item) => item.label && item.value);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um item com label e value.');
        return;
      }
      baseSettings.title = String(draftQuickFactsTitle || '').trim();
      baseSettings.items = normalized;
    }
    if (selectedWidget.widgetType === 'feature-bullets') {
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(draftFeatureBulletsItemsJson || '[]');
      } catch {
        toast.error('JSON de feature bullets inválido.');
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error('A lista de feature bullets deve ser um array JSON.');
        return;
      }
      const normalized = parsed.map((item) => String(item || '').trim()).filter(Boolean);
      if (normalized.length === 0) {
        toast.error('Inclua ao menos um bullet.');
        return;
      }
      baseSettings.title = String(draftFeatureBulletsTitle || '').trim();
      baseSettings.description = String(draftFeatureBulletsDescription || '').trim();
      baseSettings.bullets = normalized;
    }
    if (selectedWidget.widgetType === 'stat-banner') {
      const value = String(draftStatBannerValue || '').trim();
      const label = String(draftStatBannerLabel || '').trim();
      if (!value || !label) {
        toast.error('Informe value e label do banner.');
        return;
      }
      baseSettings.value = value;
      baseSettings.label = label;
      baseSettings.supportingText = String(draftStatBannerSupportingText || '').trim();
    }

    try {
      setSaving(true);
      const updated = await homeWidgetService.upsert({
        id: selectedWidget.id,
        pageKey: selectedWidget.pageKey,
        widgetType: selectedWidget.widgetType,
        variant: draftVariant || 'default',
        orderIndex: selectedWidget.orderIndex,
        enabled: draftEnabled,
        settings: baseSettings,
        dataBinding: selectedWidget.dataBinding,
        version: selectedWidget.version,
      });
      updateWidgetInList(updated);
      toast.success('Configurações salvas.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar configurações do elemento.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando elementos...</div>;
  }

  const isHeroWidget = (widget: HomeWidgetDto) => 
    widget.widgetType === 'hero' || 
    (widget.widgetType === 'legacy-section' && widget.settings?.legacySectionId === 'hero');

  const isAboutWidget = (widget: HomeWidgetDto) =>
    widget.widgetType === 'about' ||
    (widget.widgetType === 'legacy-section' && widget.settings?.legacySectionId === 'about');

  const isCtaWidget = (widget: HomeWidgetDto) =>
    widget.widgetType === 'cta' ||
    (widget.widgetType === 'legacy-section' && widget.settings?.legacySectionId === 'cta');

  const getCustomAction = (widget: HomeWidgetDto) => {
    if (isHeroWidget(widget) && onConfigureHero) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onConfigureHero();
          }}
          className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded hover:bg-purple-200 border border-purple-200 mr-1"
          title="Configurar Banner Principal"
        >
          Configurar
        </button>
      );
    }
    if (isAboutWidget(widget) && onConfigureAbout) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onConfigureAbout();
          }}
          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 border border-blue-200 mr-1"
          title="Configurar Sobre Nós"
        >
          Configurar
        </button>
      );
    }
    if (isCtaWidget(widget) && onConfigureCta) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onConfigureCta();
          }}
          className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 border border-green-200 mr-1"
          title="Configurar Chamada para Ação"
        >
          Configurar
        </button>
      );
    }
    return undefined;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-800">Canvas de Elementos</h4>
          <p className="text-sm text-gray-500">Arraste para reordenar, oculte, remova e adicione novos blocos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              grantAdminDocsAccess();
              navigate('/admin/documentacao/widgets');
            }}
            type="button"
            title="Ajuda técnica de widgets (acesso temporário)"
            aria-label="Ajuda técnica de widgets"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
            data-testid="widget-docs-help-button"
          >
            <CircleHelp size={18} />
          </button>
          <button
            onClick={() => setOpenPalette(true)}
            disabled={saving}
            data-testid="add-widget-button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            <Plus size={16} />
            Adicionar Elemento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {sortedWidgets.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-gray-300 text-gray-500">
              Nenhum elemento configurado. Clique em "Adicionar Elemento" para começar.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortedWidgets.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3" data-testid="widget-list">
                  {sortedWidgets.map((widget) => (
                    <SortableWidgetItem
                      key={widget.id}
                      widget={widget}
                      selected={widget.id === selectedWidgetId}
                      onSelect={(current) => setSelectedWidgetId(current.id)}
                      onToggle={handleToggle}
                      onRemove={handleRemove}
                      customAction={getCustomAction(widget)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="xl:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4" data-testid="widget-settings-panel">
            <h5 className="font-semibold text-gray-800">Configurações do Elemento</h5>
            {!selectedWidget ? (
              <p className="text-sm text-gray-500">Selecione um elemento para configurar.</p>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variante</label>
                  <input
                    value={draftVariant}
                    onChange={(e) => setDraftVariant(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-variant-input"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="widget-enabled"
                    type="checkbox"
                    checked={draftEnabled}
                    onChange={(e) => setDraftEnabled(e.target.checked)}
                    data-testid="widget-enabled-input"
                  />
                  <label htmlFor="widget-enabled" className="text-sm text-gray-700">
                    Elemento habilitado
                  </label>
                </div>

                {selectedWidget.widgetType === 'legacy-section' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seção Legada</label>
                      <select
                        value={draftLegacySectionId}
                        onChange={(e) => setDraftLegacySectionId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-legacy-section-select"
                      >
                        <option value="hero">Banner Principal</option>
                        <option value="services">Serviços</option>
                        <option value="projects">Projetos</option>
                        <option value="about">Sobre Nós</option>
                        <option value="partners">Parceiros</option>
                        <option value="contact">Contato</option>
                      </select>
                    </div>

                    {(draftLegacySectionId === 'services' || draftLegacySectionId === 'projects') && (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            id="widget-autoplay"
                            type="checkbox"
                            checked={draftAutoplay}
                            onChange={(e) => setDraftAutoplay(e.target.checked)}
                            data-testid="widget-autoplay-input"
                          />
                          <label htmlFor="widget-autoplay" className="text-sm text-gray-700">
                            Autoplay
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Velocidade do autoplay (ms)</label>
                          <input
                            type="number"
                            value={draftAutoplaySpeed}
                            onChange={(e) => setDraftAutoplaySpeed(Number(e.target.value || 4000))}
                            min={1000}
                            step={500}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-testid="widget-autoplay-speed-input"
                          />
                        </div>
                      </>
                    )}

                    {draftLegacySectionId === 'contact' && (
                      <div className="flex items-center gap-2">
                        <input
                          id="widget-show-map"
                          type="checkbox"
                          checked={draftShowMap}
                          onChange={(e) => setDraftShowMap(e.target.checked)}
                          data-testid="widget-show-map-input"
                        />
                        <label htmlFor="widget-show-map" className="text-sm text-gray-700">
                          Exibir mapa
                        </label>
                      </div>
                    )}
                  </>
                )}

                {selectedWidget.widgetType === 'gallery' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                    <input
                      type="number"
                      min={1}
                      value={draftGalleryMaxItems}
                      onChange={(e) => setDraftGalleryMaxItems(Number(e.target.value || 8))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="widget-gallery-max-items-input"
                    />
                  </div>
                )}

                {selectedWidget.widgetType === 'grid' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fonte dos dados</label>
                      <select
                        value={draftGridSource}
                        onChange={(e) => setDraftGridSource(e.target.value as 'services' | 'portfolio')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-grid-source-input"
                      >
                        <option value="services">Services</option>
                        <option value="portfolio">Portfolio</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                      <select
                        value={draftGridColumns}
                        onChange={(e) => setDraftGridColumns(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-grid-columns-input"
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                      <input
                        type="number"
                        min={1}
                        value={draftGridMaxItems}
                        onChange={(e) => setDraftGridMaxItems(Number(e.target.value || 6))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-grid-max-items-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftGridTitle}
                        onChange={(e) => setDraftGridTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-grid-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftGridDescription}
                        onChange={(e) => setDraftGridDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-grid-description-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'card-list' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fonte dos dados</label>
                      <select
                        value={draftCardListSource}
                        onChange={(e) => setDraftCardListSource(e.target.value as 'services' | 'portfolio')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-card-list-source-input"
                      >
                        <option value="services">Services</option>
                        <option value="portfolio">Portfolio</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                      <input
                        type="number"
                        min={1}
                        value={draftCardListMaxItems}
                        onChange={(e) => setDraftCardListMaxItems(Number(e.target.value || 6))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-card-list-max-items-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftCardListTitle}
                        onChange={(e) => setDraftCardListTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-card-list-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftCardListDescription}
                        onChange={(e) => setDraftCardListDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-card-list-description-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'cta' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftCtaTitle}
                        onChange={(e) => setDraftCtaTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-cta-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftCtaDescription}
                        onChange={(e) => setDraftCtaDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-cta-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texto botão principal</label>
                      <input
                        type="text"
                        value={draftPrimaryButtonText}
                        onChange={(e) => setDraftPrimaryButtonText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-cta-primary-text-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link botão principal</label>
                      <input
                        type="text"
                        value={draftPrimaryButtonLink}
                        onChange={(e) => setDraftPrimaryButtonLink(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-cta-primary-link-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texto botão secundário</label>
                      <input
                        type="text"
                        value={draftSecondaryButtonText}
                        onChange={(e) => setDraftSecondaryButtonText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-cta-secondary-text-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link botão secundário</label>
                      <input
                        type="text"
                        value={draftSecondaryButtonLink}
                        onChange={(e) => setDraftSecondaryButtonLink(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-cta-secondary-link-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'form-embed' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftFormTitle}
                        onChange={(e) => setDraftFormTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-form-embed-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftFormDescription}
                        onChange={(e) => setDraftFormDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-form-embed-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL do formulário</label>
                      <input
                        type="text"
                        value={draftFormUrl}
                        onChange={(e) => setDraftFormUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-form-embed-url-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texto do CTA</label>
                      <input
                        type="text"
                        value={draftFormCtaText}
                        onChange={(e) => setDraftFormCtaText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-form-embed-cta-text-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL do CTA</label>
                      <input
                        type="text"
                        value={draftFormCtaUrl}
                        onChange={(e) => setDraftFormCtaUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-form-embed-cta-url-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Altura (px)</label>
                      <input
                        type="number"
                        min={480}
                        value={draftFormHeight}
                        onChange={(e) => setDraftFormHeight(Number(e.target.value || 760))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-form-embed-height-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'testimonials' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftTestimonialsTitle}
                        onChange={(e) => setDraftTestimonialsTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-testimonials-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftTestimonialsDescription}
                        onChange={(e) => setDraftTestimonialsDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-testimonials-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                      <input
                        type="number"
                        min={1}
                        value={draftTestimonialsMaxItems}
                        onChange={(e) => setDraftTestimonialsMaxItems(Number(e.target.value || 6))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-testimonials-max-items-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftTestimonialsItemsJson}
                        onChange={(e) => setDraftTestimonialsItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-testimonials-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'faq' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftFaqTitle}
                        onChange={(e) => setDraftFaqTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-faq-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftFaqDescription}
                        onChange={(e) => setDraftFaqDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-faq-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftFaqItemsJson}
                        onChange={(e) => setDraftFaqItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-faq-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'stats' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftStatsTitle}
                        onChange={(e) => setDraftStatsTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-stats-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftStatsDescription}
                        onChange={(e) => setDraftStatsDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-stats-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                      <select
                        value={draftStatsColumns}
                        onChange={(e) => setDraftStatsColumns(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-stats-columns-input"
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftStatsItemsJson}
                        onChange={(e) => setDraftStatsItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-stats-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'process' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftProcessTitle}
                        onChange={(e) => setDraftProcessTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-process-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftProcessDescription}
                        onChange={(e) => setDraftProcessDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-process-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftProcessItemsJson}
                        onChange={(e) => setDraftProcessItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-process-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'pricing' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftPricingTitle}
                        onChange={(e) => setDraftPricingTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-pricing-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftPricingDescription}
                        onChange={(e) => setDraftPricingDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-pricing-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Planos (JSON)</label>
                      <textarea
                        value={draftPricingPlansJson}
                        onChange={(e) => setDraftPricingPlansJson(e.target.value)}
                        rows={9}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-pricing-plans-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'comparison' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftComparisonTitle}
                        onChange={(e) => setDraftComparisonTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-comparison-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftComparisonDescription}
                        onChange={(e) => setDraftComparisonDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-comparison-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Linhas (JSON)</label>
                      <textarea
                        value={draftComparisonRowsJson}
                        onChange={(e) => setDraftComparisonRowsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-comparison-rows-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'logos-wall' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftLogosWallTitle}
                        onChange={(e) => setDraftLogosWallTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-logos-wall-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftLogosWallDescription}
                        onChange={(e) => setDraftLogosWallDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-logos-wall-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                      <select
                        value={draftLogosWallColumns}
                        onChange={(e) => setDraftLogosWallColumns(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-logos-wall-columns-input"
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logos (JSON)</label>
                      <textarea
                        value={draftLogosWallItemsJson}
                        onChange={(e) => setDraftLogosWallItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-logos-wall-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'case-highlights' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftCaseHighlightsTitle}
                        onChange={(e) => setDraftCaseHighlightsTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-case-highlights-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftCaseHighlightsDescription}
                        onChange={(e) => setDraftCaseHighlightsDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-case-highlights-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                      <input
                        type="number"
                        min={1}
                        value={draftCaseHighlightsMaxItems}
                        onChange={(e) => setDraftCaseHighlightsMaxItems(Number(e.target.value || 3))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-case-highlights-max-items-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cases (JSON)</label>
                      <textarea
                        value={draftCaseHighlightsItemsJson}
                        onChange={(e) => setDraftCaseHighlightsItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-case-highlights-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'before-after' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftBeforeAfterTitle}
                        onChange={(e) => setDraftBeforeAfterTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-before-after-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftBeforeAfterDescription}
                        onChange={(e) => setDraftBeforeAfterDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-before-after-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                      <input
                        type="number"
                        min={1}
                        value={draftBeforeAfterMaxItems}
                        onChange={(e) => setDraftBeforeAfterMaxItems(Number(e.target.value || 2))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-before-after-max-items-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftBeforeAfterItemsJson}
                        onChange={(e) => setDraftBeforeAfterItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-before-after-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'feature-tabs' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftFeatureTabsTitle}
                        onChange={(e) => setDraftFeatureTabsTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-feature-tabs-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftFeatureTabsDescription}
                        onChange={(e) => setDraftFeatureTabsDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-feature-tabs-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Abas (JSON)</label>
                      <textarea
                        value={draftFeatureTabsItemsJson}
                        onChange={(e) => setDraftFeatureTabsItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-feature-tabs-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'team-cards' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftTeamCardsTitle}
                        onChange={(e) => setDraftTeamCardsTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-team-cards-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftTeamCardsDescription}
                        onChange={(e) => setDraftTeamCardsDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-team-cards-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                      <input
                        type="number"
                        min={1}
                        value={draftTeamCardsMaxItems}
                        onChange={(e) => setDraftTeamCardsMaxItems(Number(e.target.value || 4))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-team-cards-max-items-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Membros (JSON)</label>
                      <textarea
                        value={draftTeamCardsItemsJson}
                        onChange={(e) => setDraftTeamCardsItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-team-cards-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'trust-badges' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftTrustBadgesTitle}
                        onChange={(e) => setDraftTrustBadgesTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-trust-badges-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftTrustBadgesDescription}
                        onChange={(e) => setDraftTrustBadgesDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-trust-badges-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                      <select
                        value={draftTrustBadgesColumns}
                        onChange={(e) => setDraftTrustBadgesColumns(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-trust-badges-columns-input"
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selos (JSON)</label>
                      <textarea
                        value={draftTrustBadgesItemsJson}
                        onChange={(e) => setDraftTrustBadgesItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-trust-badges-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'media-split' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftMediaSplitTitle}
                        onChange={(e) => setDraftMediaSplitTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-media-split-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftMediaSplitDescription}
                        onChange={(e) => setDraftMediaSplitDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-media-split-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bullets (JSON)</label>
                      <textarea
                        value={draftMediaSplitBulletsJson}
                        onChange={(e) => setDraftMediaSplitBulletsJson(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-media-split-bullets-json-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagem URL</label>
                      <input
                        type="text"
                        value={draftMediaSplitImageUrl}
                        onChange={(e) => setDraftMediaSplitImageUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-media-split-image-url-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Alt</label>
                      <input
                        type="text"
                        value={draftMediaSplitImageAlt}
                        onChange={(e) => setDraftMediaSplitImageAlt(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-media-split-image-alt-input"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="widget-media-split-reverse"
                        type="checkbox"
                        checked={draftMediaSplitReverse}
                        onChange={(e) => setDraftMediaSplitReverse(e.target.checked)}
                        data-testid="widget-media-split-reverse-input"
                      />
                      <label htmlFor="widget-media-split-reverse" className="text-sm text-gray-700">
                        Inverter ordem visual
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Texto</label>
                      <input
                        type="text"
                        value={draftMediaSplitCtaText}
                        onChange={(e) => setDraftMediaSplitCtaText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-media-split-cta-text-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                      <input
                        type="text"
                        value={draftMediaSplitCtaLink}
                        onChange={(e) => setDraftMediaSplitCtaLink(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-media-split-cta-link-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'icon-features' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftIconFeaturesTitle}
                        onChange={(e) => setDraftIconFeaturesTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-icon-features-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftIconFeaturesDescription}
                        onChange={(e) => setDraftIconFeaturesDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-icon-features-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                      <select
                        value={draftIconFeaturesColumns}
                        onChange={(e) => setDraftIconFeaturesColumns(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-icon-features-columns-input"
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftIconFeaturesItemsJson}
                        onChange={(e) => setDraftIconFeaturesItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-icon-features-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'checklist-steps' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftChecklistStepsTitle}
                        onChange={(e) => setDraftChecklistStepsTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-checklist-steps-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftChecklistStepsDescription}
                        onChange={(e) => setDraftChecklistStepsDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-checklist-steps-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftChecklistStepsItemsJson}
                        onChange={(e) => setDraftChecklistStepsItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-checklist-steps-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'quote-highlight' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Citação</label>
                      <textarea
                        value={draftQuoteHighlightQuote}
                        onChange={(e) => setDraftQuoteHighlightQuote(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-quote-highlight-quote-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                      <input
                        type="text"
                        value={draftQuoteHighlightAuthor}
                        onChange={(e) => setDraftQuoteHighlightAuthor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-quote-highlight-author-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                      <input
                        type="text"
                        value={draftQuoteHighlightRole}
                        onChange={(e) => setDraftQuoteHighlightRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-quote-highlight-role-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'milestones' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftMilestonesTitle}
                        onChange={(e) => setDraftMilestonesTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-milestones-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftMilestonesDescription}
                        onChange={(e) => setDraftMilestonesDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-milestones-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftMilestonesItemsJson}
                        onChange={(e) => setDraftMilestonesItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-milestones-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'dual-cta-band' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftDualCtaBandTitle}
                        onChange={(e) => setDraftDualCtaBandTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-dual-cta-band-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftDualCtaBandDescription}
                        onChange={(e) => setDraftDualCtaBandDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-dual-cta-band-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Primário Texto</label>
                      <input
                        type="text"
                        value={draftDualCtaBandPrimaryText}
                        onChange={(e) => setDraftDualCtaBandPrimaryText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-dual-cta-band-primary-text-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Primário Link</label>
                      <input
                        type="text"
                        value={draftDualCtaBandPrimaryLink}
                        onChange={(e) => setDraftDualCtaBandPrimaryLink(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-dual-cta-band-primary-link-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Secundário Texto</label>
                      <input
                        type="text"
                        value={draftDualCtaBandSecondaryText}
                        onChange={(e) => setDraftDualCtaBandSecondaryText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-dual-cta-band-secondary-text-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Secundário Link</label>
                      <input
                        type="text"
                        value={draftDualCtaBandSecondaryLink}
                        onChange={(e) => setDraftDualCtaBandSecondaryLink(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-dual-cta-band-secondary-link-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'kpi-strip' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftKpiStripTitle}
                        onChange={(e) => setDraftKpiStripTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-kpi-strip-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftKpiStripItemsJson}
                        onChange={(e) => setDraftKpiStripItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-kpi-strip-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'image-quote' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Citação</label>
                      <textarea
                        value={draftImageQuoteQuote}
                        onChange={(e) => setDraftImageQuoteQuote(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-image-quote-quote-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                      <input
                        type="text"
                        value={draftImageQuoteAuthor}
                        onChange={(e) => setDraftImageQuoteAuthor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-image-quote-author-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                      <input
                        type="text"
                        value={draftImageQuoteRole}
                        onChange={(e) => setDraftImageQuoteRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-image-quote-role-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagem URL</label>
                      <input
                        type="text"
                        value={draftImageQuoteImageUrl}
                        onChange={(e) => setDraftImageQuoteImageUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-image-quote-image-url-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Alt</label>
                      <input
                        type="text"
                        value={draftImageQuoteImageAlt}
                        onChange={(e) => setDraftImageQuoteImageAlt(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-image-quote-image-alt-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'benefit-grid' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftBenefitGridTitle}
                        onChange={(e) => setDraftBenefitGridTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-benefit-grid-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftBenefitGridDescription}
                        onChange={(e) => setDraftBenefitGridDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-benefit-grid-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                      <select
                        value={draftBenefitGridColumns}
                        onChange={(e) => setDraftBenefitGridColumns(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-benefit-grid-columns-input"
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftBenefitGridItemsJson}
                        onChange={(e) => setDraftBenefitGridItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-benefit-grid-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'mini-timeline' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftMiniTimelineTitle}
                        onChange={(e) => setDraftMiniTimelineTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-mini-timeline-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftMiniTimelineDescription}
                        onChange={(e) => setDraftMiniTimelineDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-mini-timeline-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftMiniTimelineItemsJson}
                        onChange={(e) => setDraftMiniTimelineItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-mini-timeline-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'value-cards' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftValueCardsTitle}
                        onChange={(e) => setDraftValueCardsTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-value-cards-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftValueCardsDescription}
                        onChange={(e) => setDraftValueCardsDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-value-cards-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                      <select
                        value={draftValueCardsColumns}
                        onChange={(e) => setDraftValueCardsColumns(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-value-cards-columns-input"
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftValueCardsItemsJson}
                        onChange={(e) => setDraftValueCardsItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-value-cards-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'quick-facts' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftQuickFactsTitle}
                        onChange={(e) => setDraftQuickFactsTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-quick-facts-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                      <textarea
                        value={draftQuickFactsItemsJson}
                        onChange={(e) => setDraftQuickFactsItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-quick-facts-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'feature-bullets' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={draftFeatureBulletsTitle}
                        onChange={(e) => setDraftFeatureBulletsTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-feature-bullets-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={draftFeatureBulletsDescription}
                        onChange={(e) => setDraftFeatureBulletsDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-feature-bullets-description-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bullets (JSON)</label>
                      <textarea
                        value={draftFeatureBulletsItemsJson}
                        onChange={(e) => setDraftFeatureBulletsItemsJson(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-feature-bullets-items-json-input"
                      />
                    </div>
                  </>
                )}

                {selectedWidget.widgetType === 'stat-banner' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                      <input
                        type="text"
                        value={draftStatBannerValue}
                        onChange={(e) => setDraftStatBannerValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-stat-banner-value-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                      <input
                        type="text"
                        value={draftStatBannerLabel}
                        onChange={(e) => setDraftStatBannerLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-stat-banner-label-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texto de apoio</label>
                      <textarea
                        value={draftStatBannerSupportingText}
                        onChange={(e) => setDraftStatBannerSupportingText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-stat-banner-supporting-text-input"
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={handleSaveSelected}
                  disabled={saving}
                  className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                  data-testid="widget-save-button"
                >
                  Salvar Configurações
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <WidgetPaletteModal
        open={openPalette}
        templates={TEMPLATES}
        onClose={() => setOpenPalette(false)}
        onSelect={handleAddTemplate}
      />
    </div>
  );
};

export default HomeWidgetManager;
