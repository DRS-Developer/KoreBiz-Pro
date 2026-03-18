import React from 'react';

interface KpiItem {
  value: string;
  label: string;
}

interface KpiStripDefaultProps {
  title?: string;
  items?: KpiItem[];
}

const DEFAULT_ITEMS: KpiItem[] = [
  { value: '+120', label: 'Projetos Entregues' },
  { value: '98%', label: 'Satisfação Reportada' },
  { value: '24h', label: 'Tempo Médio de Resposta' },
  { value: '10+', label: 'Anos de Experiência' },
];

const KpiStripDefault: React.FC<KpiStripDefaultProps> = ({
  title = 'Indicadores de Performance',
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.value && item.label);

  if (list.length === 0) return null;

  return (
    <section className="py-10 bg-blue-900">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">{title}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {list.map((item, index) => (
            <article key={`${item.label}-${index}`} className="rounded-xl bg-blue-800 border border-blue-700 p-5 text-center">
              <p className="text-3xl font-bold text-white">{item.value}</p>
              <p className="text-blue-100 mt-1">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KpiStripDefault;
