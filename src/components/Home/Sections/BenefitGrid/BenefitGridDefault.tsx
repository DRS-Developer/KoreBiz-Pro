import React from 'react';

interface BenefitItem {
  title: string;
  description?: string;
}

interface BenefitGridDefaultProps {
  title?: string;
  description?: string;
  columns?: number;
  items?: BenefitItem[];
}

const DEFAULT_ITEMS: BenefitItem[] = [
  { title: 'Planejamento claro', description: 'Etapas definidas com critérios objetivos.' },
  { title: 'Execução contínua', description: 'Acompanhamento ativo em todo o ciclo.' },
  { title: 'Decisão orientada', description: 'Ajustes baseados em indicadores reais.' },
];

const BenefitGridDefault: React.FC<BenefitGridDefaultProps> = ({
  title = 'Benefícios do Modelo',
  description = 'Elementos que sustentam previsibilidade e evolução contínua.',
  columns = 3,
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.title);
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
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              {item.description ? <p className="text-gray-700 mt-2">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitGridDefault;
