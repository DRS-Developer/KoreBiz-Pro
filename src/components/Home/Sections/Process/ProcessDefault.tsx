import React from 'react';

interface ProcessItem {
  title: string;
  description: string;
}

interface ProcessDefaultProps {
  title?: string;
  description?: string;
  items?: ProcessItem[];
}

const DEFAULT_ITEMS: ProcessItem[] = [
  { title: 'Diagnóstico', description: 'Entendimento do cenário e objetivos prioritários do projeto.' },
  { title: 'Planejamento', description: 'Definição do plano de execução, marcos e validações.' },
  { title: 'Execução', description: 'Implementação com acompanhamento contínuo e transparência.' },
  { title: 'Evolução', description: 'Ajustes orientados por métricas e ganhos incrementais.' },
];

const ProcessDefault: React.FC<ProcessDefaultProps> = ({
  title = 'Como Funciona',
  description = 'Fluxo de trabalho estruturado para previsibilidade e resultados.',
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).filter((item) => item.title && item.description);

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
            <article key={`${item.title}-${index}`} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-700 mt-1">{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessDefault;
