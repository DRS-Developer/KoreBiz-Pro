import React from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import OptimizedImage from '../../../OptimizedImage';
import { useGlobalStore } from '../../../../stores/useGlobalStore';
import { useShallow } from 'zustand/react/shallow';

interface GalleryDefaultProps {
  maxItems?: number;
}

const GalleryDefault: React.FC<GalleryDefaultProps> = ({ maxItems = 8 }) => {
  const { portfolio: allProjects } = useGlobalStore(useShallow((state) => ({ portfolio: state.portfolio })));
  const publishedProjects = (allProjects || []).filter((project) => project.published);

  const galleryItems = publishedProjects
    .flatMap((project) => {
      const images: Array<{ url: string; title: string; slug: string | null; projectId: string }> = [];
      if (project.image_url) {
        images.push({
          url: project.image_url,
          title: project.title || 'Projeto',
          slug: project.slug,
          projectId: project.id,
        });
      }
      const extras = Array.isArray(project.gallery_images) ? project.gallery_images : [];
      extras.forEach((entry) => {
        const url =
          typeof entry === 'string'
            ? entry
            : entry && typeof entry === 'object' && 'url' in entry
              ? String((entry as Record<string, unknown>).url || '')
              : '';
        if (!url) return;
        images.push({
          url,
          title: project.title || 'Projeto',
          slug: project.slug,
          projectId: project.id,
        });
      });
      return images;
    })
    .slice(0, Math.max(1, maxItems));

  if (galleryItems.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">Galeria de Destaques</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore imagens dos projetos recentes e veja nossos trabalhos em evidência.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryItems.map((item, index) => {
            const card = (
              <div className="group relative aspect-square rounded-xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <OptimizedImage
                  src={item.url}
                  alt={item.title}
                  pageKey="home"
                  role="card"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  effect=""
                  priority={index < 4}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-end">
                  <span className="text-white text-sm font-medium p-3 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                    {item.title}
                  </span>
                </div>
              </div>
            );

            if (item.slug) {
              return (
                <Link key={`${item.projectId}-${index}`} to={`/portfolio/${item.slug}`} className="block">
                  {card}
                </Link>
              );
            }

            return <div key={`${item.projectId}-${index}`}>{card}</div>;
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            <ImageIcon size={18} />
            Ver Portfólio Completo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GalleryDefault;
