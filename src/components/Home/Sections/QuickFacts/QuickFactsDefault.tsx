import React from 'react';

interface QuickFactItem {
  label: string;
  value: string;
}

interface QuickFactsDefaultProps {
  title?: string;
  items?: QuickFactItem[];
}

const DEFAULT_ITEMS: QuickFactItem[] = [
  { label: 'Clientes ativos', value: '+50' },
  { label: 'NPS médio', value: '74' },
  { label: 'Projetos simultâneos', value: '12' },
  { label: 'Cobertura regional', value: 'Nacional' },
];

const QuickFactsDefault: React.FC<QuickFactsDefaultProps> = ({
  title = 'Fatos Rápidos',
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.label && item.value);

  if (list.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-900 text-center mb-6">{title}</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3">
          {list.map((item, index) => (
            <article key={`${item.label}-${index}`} className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{item.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickFactsDefault;
