import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import OptimizedImage from '../../../OptimizedImage';
import HtmlContent from '../../../HtmlContent';
import { useGlobalStore } from '../../../../stores/useGlobalStore';
import { useShallow } from 'zustand/react/shallow';

interface GridDefaultProps {
  source?: 'services' | 'portfolio';
  columns?: 2 | 3 | 4;
  maxItems?: number;
  title?: string;
  description?: string;
}

const getGridColumns = (columns: 2 | 3 | 4) => {
  if (columns === 2) return 'grid-cols-1 md:grid-cols-2';
  if (columns === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
};

const GridDefault: React.FC<GridDefaultProps> = ({
  source = 'services',
  columns = 3,
  maxItems = 6,
  title,
  description,
}) => {
  const { services, portfolio } = useGlobalStore(
    useShallow((state) => ({
      services: state.services,
      portfolio: state.portfolio,
    }))
  );

  const safeColumns: 2 | 3 | 4 = columns === 2 || columns === 4 ? columns : 3;
  const limit = Math.max(1, maxItems || 6);
  const isPortfolio = source === 'portfolio';

  const items = isPortfolio
    ? (portfolio || [])
        .filter((item) => item.published)
        .slice(0, limit)
        .map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || 'Projeto em destaque do nosso portfólio.',
          imageUrl: item.image_url,
          link: item.slug ? `/portfolio/${item.slug}` : '/portfolio',
          pageKey: 'portfolio:list' as const,
        }))
    : (services || [])
        .filter((item) => item.published)
        .slice(0, limit)
        .map((item) => ({
          id: item.id,
          title: item.title,
          description: item.short_description || 'Serviço especializado com foco em resultado.',
          imageUrl: item.image_url,
          link: item.slug ? `/servicos/${item.slug}` : '/servicos',
          pageKey: 'servicos:list' as const,
        }));

  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
            {title || (isPortfolio ? 'Grid de Projetos' : 'Grid de Serviços')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description ||
              (isPortfolio
                ? 'Explore nossos projetos em um layout modular e organizado.'
                : 'Visualize nossas especialidades em um layout de cards responsivo.')}
          </p>
        </div>

        <div className={`grid ${getGridColumns(safeColumns)} gap-5`}>
          {items.map((item, index) => (
            <Link key={item.id} to={item.link} className="block h-full">
              <div className="h-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100">
                  {item.imageUrl ? (
                    <OptimizedImage
                      src={item.imageUrl}
                      alt={item.title}
                      pageKey={item.pageKey}
                      role="card"
                      className="w-full h-full object-cover"
                      effect=""
                      priority={index < safeColumns}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <LayoutGrid size={36} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{item.title}</h3>
                  <HtmlContent content={item.description} className="mt-2 text-gray-600 line-clamp-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GridDefault;
