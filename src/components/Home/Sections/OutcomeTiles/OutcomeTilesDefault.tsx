import React from 'react';

interface OutcomeItem {
  title: string;
  result: string;
  description?: string;
}

interface OutcomeTilesDefaultProps {
  title?: string;
  description?: string;
  items?: OutcomeItem[];
}

const DEFAULT_ITEMS: OutcomeItem[] = [
  { title: 'Produtividade', result: '+38%', description: 'Melhora média após padronização operacional.' },
  { title: 'Previsibilidade', result: '+52%', description: 'Evolução na consistência dos entregáveis.' },
  { title: 'Lead Time', result: '-27%', description: 'Redução no tempo de execução de etapas críticas.' },
];

const OutcomeTilesDefault: React.FC<OutcomeTilesDefaultProps> = ({
  title = 'Resultados Observados',
  description = 'Indicadores de impacto com foco em operação e entrega.',
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.title && item.result);

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {list.map((item, index) => (
            <article key={`${item.title}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-semibold text-blue-700">{item.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{item.result}</p>
              {item.description ? <p className="text-gray-700 mt-2">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutcomeTilesDefault;
