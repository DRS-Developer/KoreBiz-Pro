import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { SectionConfig, HomeSectionId } from '../../../types/home-config';

interface SortableSectionItemProps {
  section: SectionConfig;
  onToggle: (id: string, enabled: boolean) => void;
  onUpdate: (id: string, updates: Partial<SectionConfig>) => void;
}

const SECTION_LABELS: Record<HomeSectionId, string> = {
  hero: "Banner Principal (Hero)",
  about: "Sobre Nós",
  valueProps: "Diferenciais",
  services: "Serviços / Áreas",
  projects: "Projetos / Portfólio",
  process: "Como Funciona",
  testimonials: "Depoimentos",
  partners: "Parceiros",
  stats: "Números",
  faq: "Perguntas Frequentes",
  cta: "Chamada para Ação (CTA)",
  contact: "Contato"
};

export const SortableSectionItem: React.FC<SortableSectionItemProps> = ({ section, onToggle, onUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  const handleSlidesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    onUpdate(section.id, { 
      props: { ...section.props, slidesToShow: value } 
    });
  };

  const handleAutoplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(section.id, { 
      props: { ...section.props, autoplay: e.target.checked } 
    });
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    onUpdate(section.id, { 
      props: { ...section.props, autoplaySpeed: value } 
    });
  };

  const showSlidesConfig = section.id === 'services' || section.id === 'projects';
  const showContactConfig = section.id === 'contact';

  const handleMapToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(section.id, { 
      props: { ...section.props, showMap: e.target.checked } 
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center justify-between p-4 bg-white rounded-lg border 
        ${isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200 shadow-sm'}
        ${!section.enabled ? 'opacity-70 bg-gray-50' : ''}
      `}
    >
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-blue-600 text-gray-400">
          <GripVertical size={20} />
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900">{SECTION_LABELS[section.id] || section.id}</h4>
          <div className="flex gap-2 text-xs text-gray-500 items-center">
            <span className="bg-gray-100 px-2 py-0.5 rounded">
              Variante: {section.variant || 'default'}
            </span>
            
            {showSlidesConfig && section.enabled && (
              <div className="flex flex-wrap items-center gap-2 ml-2">
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  <span className="text-blue-700">Itens:</span>
                  <select 
                    className="bg-transparent border-none p-0 text-blue-800 font-bold focus:ring-0 text-xs cursor-pointer"
                    value={section.props?.slidesToShow || 3}
                    onChange={handleSlidesChange}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 w-3 h-3 focus:ring-0"
                      checked={section.props?.autoplay !== false}
                      onChange={handleAutoplayChange}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                    <span className="text-gray-700">Autoplay</span>
                  </label>
                </div>

                {section.props?.autoplay !== false && (
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    <span className="text-gray-700">Velocidade:</span>
                    <select 
                      className="bg-transparent border-none p-0 text-gray-900 font-bold focus:ring-0 text-xs cursor-pointer"
                      value={section.props?.autoplaySpeed || 4000}
                      onChange={handleSpeedChange}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <option value="2000">2s</option>
                      <option value="3000">3s</option>
                      <option value="4000">4s</option>
                      <option value="5000">5s</option>
                      <option value="7000">7s</option>
                      <option value="10000">10s</option>
                    </select>
                  </div>
                )}
              </div>
            )}
            {showContactConfig && section.enabled && (
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 ml-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded text-blue-600 w-3 h-3 focus:ring-0"
                    checked={section.props?.showMap !== false}
                    onChange={handleMapToggle}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                  <span className="text-gray-700">Exibir Mapa</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(section.id, !section.enabled)}
          className={`p-2 rounded-full transition-colors ${section.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-200'}`}
          title={section.enabled ? "Desabilitar seção" : "Habilitar seção"}
        >
          {section.enabled ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
    </div>
  );
};
