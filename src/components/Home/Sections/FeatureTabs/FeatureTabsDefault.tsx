import React, { useMemo, useState } from 'react';

interface FeatureTab {
  label: string;
  title: string;
  description: string;
  bullets?: string[];
}

interface FeatureTabsDefaultProps {
  title?: string;
  description?: string;
  tabs?: FeatureTab[];
}

const DEFAULT_TABS: FeatureTab[] = [
  {
    label: 'Diagnóstico',
    title: 'Mapeamento inicial',
    description: 'Levantamento estruturado do cenário para definição de prioridades.',
    bullets: ['Análise de contexto', 'Riscos e gargalos', 'Objetivos de negócio'],
  },
  {
    label: 'Execução',
    title: 'Implementação orientada',
    description: 'Plano em ação com checkpoints de validação e transparência.',
    bullets: ['Sprint com entregas claras', 'Acompanhamento contínuo', 'Ajustes com métricas'],
  },
];

const FeatureTabsDefault: React.FC<FeatureTabsDefaultProps> = ({
  title = 'Etapas e Diferenciais',
  description = 'Navegue pelos pilares do nosso modelo de trabalho.',
  tabs,
}) => {
  const list = useMemo(
    () => (tabs && tabs.length > 0 ? tabs : DEFAULT_TABS).filter((tab) => tab.label && tab.title && tab.description),
    [tabs]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  if (list.length === 0) return null;

  const current = list[Math.min(activeIndex, list.length - 1)];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-5">
            {list.map((tab, index) => (
              <button
                key={`${tab.label}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`px-4 py-2 rounded-lg border ${
                  index === activeIndex ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <article className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-2xl font-semibold text-gray-900">{current.title}</h3>
            <p className="text-gray-700 mt-2">{current.description}</p>
            {current.bullets && current.bullets.length > 0 ? (
              <ul className="mt-4 space-y-2 text-gray-700">
                {current.bullets.map((bullet, index) => (
                  <li key={`${current.title}-bullet-${index}`}>• {bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
};

export default FeatureTabsDefault;
