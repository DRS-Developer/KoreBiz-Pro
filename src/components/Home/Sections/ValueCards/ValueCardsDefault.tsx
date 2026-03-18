import React from 'react';

interface ValueCardItem {
  title: string;
  value: string;
  description?: string;
}

interface ValueCardsDefaultProps {
  title?: string;
  description?: string;
  columns?: number;
  items?: ValueCardItem[];
}

const DEFAULT_ITEMS: ValueCardItem[] = [
  { title: 'Eficiência', value: '32%', description: 'Redução média de retrabalho em operações estruturadas.' },
  { title: 'Velocidade', value: '24h', description: 'Tempo médio inicial de resposta após ativação.' },
  { title: 'Adoção', value: '89%', description: 'Taxa média de adesão aos novos fluxos definidos.' },
];

const ValueCardsDefault: React.FC<ValueCardsDefaultProps> = ({
  title = 'Indicadores de Valor',
  description = 'Números que representam impacto operacional e previsibilidade.',
  columns = 3,
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.title && item.value);
  const safeCols = [2, 3, 4].includes(Number(columns)) ? Number(columns) : 3;
  const gridCols = safeCols === 2 ? 'md:grid-cols-2' : safeCols === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3';

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
          {list.map((item, index) => (
            <article key={`${item.title}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-semibold text-blue-700">{item.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{item.value}</p>
              {item.description ? <p className="text-gray-700 mt-2">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueCardsDefault;
