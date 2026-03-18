import React from 'react';

interface ChecklistItem {
  title: string;
  description?: string;
}

interface ChecklistStepsDefaultProps {
  title?: string;
  description?: string;
  items?: ChecklistItem[];
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { title: 'Diagnóstico inicial', description: 'Levantamento rápido do cenário e prioridades.' },
  { title: 'Plano de ação', description: 'Definição de etapas com objetivos claros.' },
  { title: 'Execução e revisão', description: 'Acompanhamento contínuo de resultados.' },
];

const ChecklistStepsDefault: React.FC<ChecklistStepsDefaultProps> = ({
  title = 'Checklist de Implementação',
  description = 'Etapas práticas para uma execução consistente.',
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.title);

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="max-w-4xl mx-auto space-y-4">
          {list.map((item, index) => (
            <article key={`${item.title}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-blue-700 text-white text-sm font-semibold">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  {item.description ? <p className="text-gray-700 mt-1">{item.description}</p> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChecklistStepsDefault;
