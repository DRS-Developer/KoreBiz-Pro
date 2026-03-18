import React from 'react';

interface TrustBadge {
  title: string;
  description?: string;
  icon?: string;
}

interface TrustBadgesDefaultProps {
  title?: string;
  description?: string;
  columns?: number;
  badges?: TrustBadge[];
}

const DEFAULT_BADGES: TrustBadge[] = [
  { icon: '✅', title: 'Compliance', description: 'Processos alinhados a boas práticas e rastreabilidade.' },
  { icon: '🔒', title: 'Segurança', description: 'Tratamento responsável de dados e acessos.' },
  { icon: '📈', title: 'Resultados', description: 'Execução orientada por indicadores mensuráveis.' },
];

const TrustBadgesDefault: React.FC<TrustBadgesDefaultProps> = ({
  title = 'Sinais de Confiança',
  description = 'Compromissos que sustentam entregas consistentes e seguras.',
  columns = 3,
  badges,
}) => {
  const list = (badges && badges.length > 0 ? badges : DEFAULT_BADGES).filter((badge) => badge.title);
  const safeCols = [2, 3, 4].includes(Number(columns)) ? Number(columns) : 3;
  const gridCols = safeCols === 2 ? 'md:grid-cols-2' : safeCols === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3';

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
          {list.map((badge, index) => (
            <article key={`${badge.title}-${index}`} className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-2xl">{badge.icon || '⭐'}</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-2">{badge.title}</h3>
              {badge.description ? <p className="text-gray-700 mt-2">{badge.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesDefault;
