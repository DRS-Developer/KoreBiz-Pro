import React from 'react';

interface MilestoneItem {
  year: string;
  title: string;
  description?: string;
}

interface MilestonesDefaultProps {
  title?: string;
  description?: string;
  items?: MilestoneItem[];
}

const DEFAULT_ITEMS: MilestoneItem[] = [
  { year: '2022', title: 'Estruturação inicial', description: 'Consolidação do método de atendimento.' },
  { year: '2023', title: 'Escala operacional', description: 'Expansão da base com processos padronizados.' },
  { year: '2024', title: 'Otimização contínua', description: 'Evolução orientada por dados e indicadores.' },
];

const MilestonesDefault: React.FC<MilestonesDefaultProps> = ({
  title = 'Marcos de Evolução',
  description = 'Linha do tempo dos principais avanços da operação.',
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.year && item.title);

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
            <article key={`${item.year}-${item.title}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-semibold text-blue-700">{item.year}</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">{item.title}</h3>
              {item.description ? <p className="text-gray-700 mt-1">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MilestonesDefault;
