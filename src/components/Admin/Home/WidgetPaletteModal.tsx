import React, { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';

export interface WidgetTemplate {
  key: string;
  title: string;
  description: string;
  category: 'Estrutura' | 'Conteúdo' | 'Conversão';
  widgetType: string;
  variant?: string;
  settings?: Record<string, unknown>;
  available?: boolean;
  badge?: string;
}

interface WidgetPaletteModalProps {
  open: boolean;
  templates: WidgetTemplate[];
  onClose: () => void;
  onSelect: (template: WidgetTemplate) => void;
}

const WidgetPaletteModal: React.FC<WidgetPaletteModalProps> = ({
  open,
  templates,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'Todos' | WidgetTemplate['category']>('Todos');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return templates.filter((item) => {
      const matchCategory = category === 'Todos' || item.category === category;
      if (!matchCategory) return false;
      if (!term) return true;
      return (
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    });
  }, [category, search, templates]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="widget-palette-modal">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-4xl max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Adicionar Elemento</h3>
            <p className="text-sm text-gray-500">Escolha um tipo de bloco para inserir na Home.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 text-gray-600" data-testid="widget-palette-close">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="widget-palette-search"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar elemento..."
              />
            </div>

            <div className="flex gap-2">
              {(['Todos', 'Estrutura', 'Conteúdo', 'Conversão'] as const).map((label) => (
                <button
                  key={label}
                  onClick={() => setCategory(label)}
                  data-testid={`widget-palette-category-${label.toLowerCase()}`}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    category === label ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <button
                key={item.key}
                onClick={() => onSelect(item)}
                disabled={item.available === false}
                data-testid={`widget-template-${item.key}`}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  item.available === false
                    ? 'border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-block text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                        {item.category}
                      </span>
                      {item.badge && (
                        <span className="inline-block text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <Plus size={18} className={`${item.available === false ? 'text-gray-400' : 'text-blue-600'} shrink-0`} />
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">Nenhum elemento encontrado com esse filtro.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetPaletteModal;
