import React from 'react';

interface HighlightListDefaultProps {
  title?: string;
  description?: string;
  items?: string[];
}

const DEFAULT_ITEMS: string[] = [
  'Diagnóstico inicial com priorização executiva.',
  'Plano tático com responsáveis e prazos definidos.',
  'Acompanhamento semanal com ritos de melhoria.',
];

const HighlightListDefault: React.FC<HighlightListDefaultProps> = ({
  title = 'Pontos de Destaque',
  description = 'Resumo objetivo dos elementos mais relevantes da operação.',
  items,
}) => {
  const list = (Array.isArray(items) && items.length > 0 ? items : DEFAULT_ITEMS)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900">{title}</h2>
          <p className="text-lg text-gray-600 mt-3">{description}</p>
          <div className="mt-6 space-y-3">
            {list.map((item, index) => (
              <p key={`${item}-${index}`} className="text-gray-800">
                • {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HighlightListDefault;
