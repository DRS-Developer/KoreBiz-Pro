import React from 'react';
import { Link } from 'react-router-dom';
import { List, ArrowRight } from 'lucide-react';
import OptimizedImage from '../../../OptimizedImage';
import HtmlContent from '../../../HtmlContent';
import { useGlobalStore } from '../../../../stores/useGlobalStore';
import { useShallow } from 'zustand/react/shallow';

interface CardListDefaultProps {
  source?: 'services' | 'portfolio';
  maxItems?: number;
  title?: string;
  description?: string;
}

const CardListDefault: React.FC<CardListDefaultProps> = ({
  source = 'services',
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

  const limit = Math.max(1, maxItems || 6);
  const isPortfolio = source === 'portfolio';

  const items = isPortfolio
    ? (portfolio || [])
        .filter((item) => item.published)
        .slice(0, limit)
        .map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category || 'Projeto',
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
          category: item.category || 'Serviço',
          description: item.short_description || 'Serviço especializado com foco em resultado.',
          imageUrl: item.image_url,
          link: item.slug ? `/servicos/${item.slug}` : '/servicos',
          pageKey: 'servicos:list' as const,
        }));

  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
            {title || (isPortfolio ? 'Lista de Projetos' : 'Lista de Serviços')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description ||
              (isPortfolio
                ? 'Navegue por projetos em formato de lista detalhada.'
                : 'Acesse rapidamente as principais especialidades em formato de lista.')}
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <Link key={item.id} to={item.link} className="block">
              <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 md:p-5">
                <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                  <div className="w-full md:w-56 shrink-0">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      {item.imageUrl ? (
                        <OptimizedImage
                          src={item.imageUrl}
                          alt={item.title}
                          pageKey={item.pageKey}
                          role="card"
                          className="w-full h-full object-cover"
                          effect=""
                          priority={index < 3}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <List size={30} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{item.category}</span>
                    <h3 className="mt-1 text-xl font-bold text-gray-900 line-clamp-2">{item.title}</h3>
                    <HtmlContent content={item.description} className="mt-2 text-gray-600 line-clamp-3" />
                    <span className="mt-4 inline-flex items-center text-blue-700 font-medium">
                      Ver detalhes <ArrowRight size={16} className="ml-1" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardListDefault;
