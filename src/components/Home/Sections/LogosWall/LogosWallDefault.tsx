import React from 'react';
import OptimizedImage from '../../../OptimizedImage';

interface LogoItem {
  name: string;
  logoUrl: string;
  link?: string;
}

interface LogosWallDefaultProps {
  title?: string;
  description?: string;
  columns?: number;
  logos?: LogoItem[];
}

const DEFAULT_LOGOS: LogoItem[] = [
  { name: 'Parceiro A', logoUrl: '/images/placeholder.png' },
  { name: 'Parceiro B', logoUrl: '/images/placeholder.png' },
  { name: 'Parceiro C', logoUrl: '/images/placeholder.png' },
  { name: 'Parceiro D', logoUrl: '/images/placeholder.png' },
];

const LogosWallDefault: React.FC<LogosWallDefaultProps> = ({
  title = 'Empresas que confiam no nosso trabalho',
  description = 'Marcas atendidas com projetos orientados a resultado.',
  columns = 4,
  logos,
}) => {
  const list = (logos && logos.length > 0 ? logos : DEFAULT_LOGOS).filter((item) => item.name && item.logoUrl);
  const safeCols = [2, 3, 4, 5].includes(Number(columns)) ? Number(columns) : 4;
  const gridCols =
    safeCols === 2
      ? 'md:grid-cols-2'
      : safeCols === 3
        ? 'md:grid-cols-3'
        : safeCols === 5
          ? 'md:grid-cols-3 lg:grid-cols-5'
          : 'md:grid-cols-2 lg:grid-cols-4';

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className={`grid grid-cols-2 ${gridCols} gap-4`}>
          {list.map((item, index) => {
            const content = (
              <div className="h-24 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center p-4">
                <OptimizedImage
                  src={item.logoUrl}
                  alt={item.name}
                  pageKey="home"
                  role="logo"
                  className="max-h-12 w-auto object-contain"
                  effect=""
                  priority={index < 6}
                />
              </div>
            );
            if (!item.link) return <article key={`${item.name}-${index}`}>{content}</article>;
            return (
              <a
                key={`${item.name}-${index}`}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="block hover:opacity-90 transition-opacity"
              >
                {content}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LogosWallDefault;
