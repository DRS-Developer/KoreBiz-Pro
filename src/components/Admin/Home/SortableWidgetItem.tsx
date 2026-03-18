import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { HomeWidgetDto } from '../../../types/home-widgets';

interface SortableWidgetItemProps {
  widget: HomeWidgetDto;
  selected: boolean;
  onSelect: (widget: HomeWidgetDto) => void;
  onToggle: (widget: HomeWidgetDto) => void;
  onRemove: (widget: HomeWidgetDto) => void;
  customAction?: React.ReactNode;
}

const LABELS: Record<string, string> = {
  hero: 'Banner Principal',
  services: 'Serviços',
  projects: 'Projetos',
  about: 'Sobre Nós',
  partners: 'Parceiros',
  contact: 'Contato',
  cta: 'Chamada para Ação',
  gallery: 'Galeria de Destaques',
  grid: 'Grid de Conteúdo',
  'card-list': 'Lista de Cards',
  'form-embed': 'Formulário Embed',
  testimonials: 'Depoimentos',
  faq: 'FAQ Accordion',
  stats: 'Indicadores',
  process: 'Timeline de Processo',
  pricing: 'Tabela de Preços',
  comparison: 'Tabela Comparativa',
  'logos-wall': 'Mural de Logos',
  'case-highlights': 'Cases em Destaque',
  'before-after': 'Antes e Depois',
  'feature-tabs': 'Abas de Diferenciais',
  'team-cards': 'Cards de Time',
  'trust-badges': 'Selos de Confiança',
  'media-split': 'Media Split',
  'icon-features': 'Ícones de Diferenciais',
  'checklist-steps': 'Checklist de Etapas',
  'quote-highlight': 'Depoimento em Destaque',
  milestones: 'Marcos',
  'dual-cta-band': 'Faixa de Duplo CTA',
  'kpi-strip': 'Faixa de KPIs',
  'image-quote': 'Citação com Imagem',
  'benefit-grid': 'Grid de Benefícios',
  'mini-timeline': 'Mini Timeline',
  'value-cards': 'Cards de Valor',
  'quick-facts': 'Fatos Rápidos',
  'feature-bullets': 'Bullets de Diferenciais',
  'stat-banner': 'Banner de Estatística',
  'outcome-tiles': 'Tiles de Resultado',
  'highlight-list': 'Lista de Destaques',
};

const SortableWidgetItem: React.FC<SortableWidgetItemProps> = ({ widget, selected, onSelect, onToggle, onRemove, customAction }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.85 : 1,
  };

  const legacyId =
    widget.widgetType === 'legacy-section'
      ? (widget.settings?.legacySectionId as string | undefined)
      : undefined;
  const displayType = legacyId || widget.widgetType;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`widget-item-${widget.id}`}
      className={`
        flex items-center justify-between p-4 rounded-lg border
        ${isDragging ? 'border-blue-500 shadow-lg bg-white' : selected ? 'border-blue-400 shadow bg-blue-50' : 'border-gray-200 shadow-sm bg-white'}
        ${!widget.enabled ? 'opacity-70 bg-gray-50' : ''}
      `}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          data-testid={`widget-drag-${widget.id}`}
          className="cursor-grab hover:text-blue-600 text-gray-400"
        >
          <GripVertical size={20} />
        </div>
        <button
          type="button"
          onClick={() => onSelect(widget)}
          className="text-left"
          data-testid={`widget-select-${widget.id}`}
        >
          <h4 className="font-medium text-gray-900">{LABELS[displayType] || displayType}</h4>
          <div className="flex gap-2 text-xs text-gray-500 items-center mt-1">
            <span className="bg-gray-100 px-2 py-0.5 rounded">Tipo: {displayType}</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded">Variante: {widget.variant || 'default'}</span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {customAction}
        <button
          onClick={() => onToggle(widget)}
          data-testid={`widget-toggle-${widget.id}`}
          className={`p-2 rounded-full transition-colors ${
            widget.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-200'
          }`}
          title={widget.enabled ? 'Desabilitar elemento' : 'Habilitar elemento'}
        >
          {widget.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button
          onClick={() => onRemove(widget)}
          data-testid={`widget-remove-${widget.id}`}
          className="p-2 rounded-full transition-colors text-red-500 hover:bg-red-50"
          title="Remover elemento"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default SortableWidgetItem;
