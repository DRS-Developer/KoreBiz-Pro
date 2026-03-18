import React from 'react';

interface TimelineItem {
  step: string;
  title: string;
  description?: string;
}

interface MiniTimelineDefaultProps {
  title?: string;
  description?: string;
  items?: TimelineItem[];
}

const DEFAULT_ITEMS: TimelineItem[] = [
  { step: '01', title: 'Briefing', description: 'Levantamento inicial de contexto.' },
  { step: '02', title: 'Execução', description: 'Implementação acompanhada por indicadores.' },
  { step: '03', title: 'Otimização', description: 'Ajustes contínuos orientados por resultado.' },
];

const MiniTimelineDefault: React.FC<MiniTimelineDefaultProps> = ({
  title = 'Timeline Resumida',
  description = 'Visão rápida das principais etapas de trabalho.',
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.step && item.title);

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {list.map((item, index) => (
            <article key={`${item.step}-${item.title}-${index}`} className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-blue-700">{item.step}</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">{item.title}</h3>
              {item.description ? <p className="text-gray-700 mt-2">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MiniTimelineDefault;
