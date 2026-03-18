import React from 'react';
import OptimizedImage from '../../../OptimizedImage';

interface CaseItem {
  title: string;
  result: string;
  imageUrl?: string;
  link?: string;
}

interface CaseHighlightsDefaultProps {
  title?: string;
  description?: string;
  maxItems?: number;
  cases?: CaseItem[];
}

const DEFAULT_CASES: CaseItem[] = [
  {
    title: 'Reestruturação de Atendimento',
    result: 'Redução de 32% no tempo médio de resposta',
  },
  {
    title: 'Otimização de Jornada',
    result: 'Aumento de 28% na conversão de oportunidades',
  },
];

const CaseHighlightsDefault: React.FC<CaseHighlightsDefaultProps> = ({
  title = 'Cases em Destaque',
  description = 'Resultados práticos obtidos em cenários reais de operação.',
  maxItems = 3,
  cases,
}) => {
  const list = (cases && cases.length > 0 ? cases : DEFAULT_CASES)
    .filter((item) => item.title && item.result)
    .slice(0, Math.max(1, Number(maxItems || 3)));

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((item, index) => (
            <article key={`${item.title}-${index}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {item.imageUrl ? (
                <OptimizedImage
                  src={item.imageUrl}
                  alt={item.title}
                  pageKey="home"
                  role="card"
                  className="w-full h-44 object-cover"
                  effect=""
                  priority={index < 2}
                />
              ) : null}
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-700">{item.result}</p>
                {item.link ? (
                  <a href={item.link} className="inline-flex text-blue-700 font-medium hover:text-blue-800">
                    Ver case
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseHighlightsDefault;
