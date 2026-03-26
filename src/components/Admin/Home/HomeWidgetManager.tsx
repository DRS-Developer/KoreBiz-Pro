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
import { HOME_WIDGETS_PUBLIC_UNAVAILABLE_AT_KEY, HOME_WIDGETS_PUBLIC_UNAVAILABLE_KEY, homeWidgetService, revalidatePublicHomeWidgetsFlag } from '../../../services/homeWidgetService';
import { HomeWidgetDto } from '../../../types/home-widgets';
import SortableWidgetItem from './SortableWidgetItem';
import WidgetPaletteModal, { WidgetTemplate } from './WidgetPaletteModal';
import WidgetSettingsModal from './WidgetSettingsModal';
import { grantAdminDocsAccess } from '../../../utils/adminDocsAccess';

interface HomeWidgetManagerProps {
  widgets: HomeWidgetDto[];
  loading: boolean;
  onWidgetsChange: (widgets: HomeWidgetDto[]) => void;
  onConfigureHero?: (widget: HomeWidgetDto) => void;
  onConfigureAbout?: (widget: HomeWidgetDto) => void;
  onConfigureCta?: (widget: HomeWidgetDto) => void;
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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [publicUnavailableActive, setPublicUnavailableActive] = useState(false);
  const [publicUnavailableAt, setPublicUnavailableAt] = useState<string | null>(null);
  const [revalidatingPublicState, setRevalidatingPublicState] = useState(false);

  const sortedWidgets = useMemo(() => {
    return [...widgets].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [widgets]);
  const selectedWidget = sortedWidgets.find((item) => item.id === selectedWidgetId) || null;
  const publicUnavailableAtLabel = useMemo(() => {
    if (!publicUnavailableAt) return null;
    const date = new Date(publicUnavailableAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString('pt-BR');
  }, [publicUnavailableAt]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncFlag = () => {
      setPublicUnavailableActive(window.localStorage.getItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_KEY) === '1');
      setPublicUnavailableAt(window.localStorage.getItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_AT_KEY));
    };
    syncFlag();
    window.addEventListener('storage', syncFlag);
    return () => window.removeEventListener('storage', syncFlag);
  }, []);

  useEffect(() => {
    if (!selectedWidgetId && sortedWidgets.length > 0) {
      setSelectedWidgetId(sortedWidgets[0].id);
    }
    if (selectedWidgetId && !sortedWidgets.some((item) => item.id === selectedWidgetId)) {
      setSelectedWidgetId(sortedWidgets[0]?.id || null);
    }
  }, [selectedWidgetId, sortedWidgets]);

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

  const handleSaveSettings = async (widgetId: string, variant: string, enabled: boolean, settings: Record<string, unknown>) => {
    const widget = sortedWidgets.find((w) => w.id === widgetId);
    if (!widget) return;
    try {
      setSaving(true);
      const updated = await homeWidgetService.upsert({
        id: widget.id,
        pageKey: widget.pageKey,
        widgetType: widget.widgetType,
        variant,
        orderIndex: widget.orderIndex,
        enabled,
        settings,
        dataBinding: widget.dataBinding,
        version: widget.version,
      });
      updateWidgetInList(updated);
      toast.success('Configurações salvas.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar configurações do elemento.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevalidatePublicState = async () => {
    try {
      setRevalidatingPublicState(true);
      const available = await revalidatePublicHomeWidgetsFlag();
      const flagged = typeof window !== 'undefined' && window.localStorage.getItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_KEY) === '1';
      const flaggedAt = typeof window !== 'undefined' ? window.localStorage.getItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_AT_KEY) : null;
      setPublicUnavailableActive(flagged);
      setPublicUnavailableAt(flaggedAt);
      if (available) {
        toast.success('Revalidação concluída. A tabela home_widgets está disponível no público.');
      } else {
        toast.info('Revalidação concluída. A tabela home_widgets continua indisponível no público.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao revalidar disponibilidade pública.');
    } finally {
      setRevalidatingPublicState(false);
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
            onConfigureHero(widget);
          }}
          className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded hover:bg-purple-200 border border-purple-200 mr-1"
          title="Editar Conteúdo do Banner Principal"
        >
          Conteúdo
        </button>
      );
    }
    if (isAboutWidget(widget) && onConfigureAbout) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onConfigureAbout(widget);
          }}
          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 border border-blue-200 mr-1"
          title="Editar Conteúdo Sobre Nós"
        >
          Conteúdo
        </button>
      );
    }
    if (isCtaWidget(widget) && onConfigureCta) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onConfigureCta(widget);
          }}
          className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 border border-green-200 mr-1"
          title="Editar Conteúdo Chamada para Ação"
        >
          Conteúdo
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
      {publicUnavailableActive ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-amber-800">
              Home pública detectada em modo de fallback. A tabela home_widgets está indisponível no público.
            </p>
            {publicUnavailableAtLabel ? (
              <p className="text-xs text-amber-700">
                Última ocorrência: {publicUnavailableAtLabel}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleRevalidatePublicState}
              disabled={revalidatingPublicState}
              className="px-3 py-1.5 text-xs font-semibold rounded border border-amber-400 text-amber-900 hover:bg-amber-100 disabled:opacity-60"
            >
              {revalidatingPublicState ? 'Revalidando...' : 'Revalidar Agora'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window === 'undefined') return;
                window.localStorage.removeItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_KEY);
                window.localStorage.removeItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_AT_KEY);
                setPublicUnavailableActive(false);
                setPublicUnavailableAt(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded border border-amber-400 text-amber-900 hover:bg-amber-100"
            >
              Limpar Indicador
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        <div className="w-full">
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
                      onConfigure={(current) => {
                        setSelectedWidgetId(current.id);
                        setIsSettingsModalOpen(true);
                      }}
                      showConfigureButton={!isHeroWidget(widget) && !isAboutWidget(widget) && !isCtaWidget(widget)}
                      customAction={getCustomAction(widget)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

              </div>

      <WidgetSettingsModal
        widget={selectedWidget}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveSettings}
        saving={saving}
      />

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
