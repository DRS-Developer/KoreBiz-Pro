import React from 'react';

interface FeatureBulletsDefaultProps {
  title?: string;
  description?: string;
  bullets?: string[];
}

const DEFAULT_BULLETS: string[] = [
  'Processo estruturado com priorização clara.',
  'Acompanhamento contínuo com indicadores.',
  'Ajustes rápidos com base em evidências.',
];

const FeatureBulletsDefault: React.FC<FeatureBulletsDefaultProps> = ({
  title = 'Principais Diferenciais',
  description = 'Pontos de suporte para execução previsível.',
  bullets,
}) => {
  const list = (Array.isArray(bullets) && bullets.length > 0 ? bullets : DEFAULT_BULLETS)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900">{title}</h2>
          <p className="text-lg text-gray-600 mt-3">{description}</p>
          <ul className="mt-6 space-y-3">
            {list.map((bullet, index) => (
              <li key={`${bullet}-${index}`} className="text-gray-800">
                • {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FeatureBulletsDefault;
