import React from 'react';

interface FeatureItem {
  icon?: string;
  title: string;
  description?: string;
}

interface IconFeaturesDefaultProps {
  title?: string;
  description?: string;
  columns?: number;
  items?: FeatureItem[];
}

const DEFAULT_ITEMS: FeatureItem[] = [
  { icon: '⚙️', title: 'Processo', description: 'Fluxo operacional claro e previsível.' },
  { icon: '📊', title: 'Métricas', description: 'Acompanhamento por indicadores objetivos.' },
  { icon: '🤝', title: 'Parceria', description: 'Atendimento próximo em todas as etapas.' },
];

const IconFeaturesDefault: React.FC<IconFeaturesDefaultProps> = ({
  title = 'Diferenciais Operacionais',
  description = 'Pilares que sustentam entregas consistentes.',
  columns = 3,
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.title);
  const safeCols = [2, 3, 4].includes(Number(columns)) ? Number(columns) : 3;
  const gridCols = safeCols === 2 ? 'md:grid-cols-2' : safeCols === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3';

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
          {list.map((item, index) => (
            <article key={`${item.title}-${index}`} className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-2xl">{item.icon || '⭐'}</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-2">{item.title}</h3>
              {item.description ? <p className="text-gray-700 mt-2">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IconFeaturesDefault;
