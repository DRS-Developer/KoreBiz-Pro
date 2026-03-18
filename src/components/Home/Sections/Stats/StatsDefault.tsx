import React from 'react';

interface StatsItem {
  label: string;
  value: string;
  suffix?: string;
}

interface StatsDefaultProps {
  title?: string;
  description?: string;
  columns?: number;
  items?: StatsItem[];
}

const DEFAULT_ITEMS: StatsItem[] = [
  { label: 'Clientes atendidos', value: '250', suffix: '+' },
  { label: 'Projetos concluídos', value: '120', suffix: '+' },
  { label: 'Anos de experiência', value: '12', suffix: '+' },
  { label: 'Índice de satisfação', value: '98', suffix: '%' },
];

const StatsDefault: React.FC<StatsDefaultProps> = ({
  title = 'Nossos Números',
  description = 'Indicadores que refletem resultados consistentes e operação confiável.',
  columns = 4,
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.label && item.value);
  const safeCols = [2, 3, 4].includes(Number(columns)) ? Number(columns) : 4;
  const gridCols =
    safeCols === 2 ? 'md:grid-cols-2' : safeCols === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4';

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
          {list.map((item, index) => (
            <article key={`${item.label}-${index}`} className="bg-blue-800/60 border border-blue-700 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold">
                {item.value}
                {item.suffix || ''}
              </p>
              <p className="text-blue-100 mt-1">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsDefault;
