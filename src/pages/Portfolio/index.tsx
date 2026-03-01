import { useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../../components/SEO';
import OptimizedImage from '../../components/OptimizedImage';
import PageHeader from '../../components/PageHeader';
import { useGlobalStore } from '../../stores/useGlobalStore';

import HtmlContent from '../../components/HtmlContent';

const categories = ['Todos', 'Comercial', 'Residencial', 'Industrial'];

const Portfolio: FC = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');

  // New Architecture: Use Global Store (Memory Cache)
  const { portfolio: projectsData } = useGlobalStore();

  // Filter only published
  const projects = projectsData?.filter(p => p.published) || [];

  const filteredProjects = activeCategory === 'Todos' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SEO 
        title="Portfólio" 
        description="Veja nossos projetos recentes e cases de sucesso em instalações elétricas, comerciais e residenciais."
        image={filteredProjects[0]?.image_url || undefined}
      />

      {/* Header */}
      <PageHeader 
        title="Portfólio" 
        description="Conheça alguns dos nossos principais projetos e cases de sucesso." 
      />

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 pb-16">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum projeto encontrado nesta categoria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <Link 
                key={project.id} 
                to={`/portfolio/${project.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 flex flex-col h-full"
              >
                <div className="relative h-64 overflow-hidden">
                  <OptimizedImage 
                    src={project.image_url || undefined}
                    pageKey="portfolio:list"
                    role="card"
                    alt={project.title}
                    className="w-full h-full object-cover"
                    effect=""
                    priority={index < 6}
                  />
                  {project.category && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {project.category}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  {project.location && (
                    <div className="text-sm text-gray-500 mb-2">{project.location}</div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {project.title}
                  </h3>
                  <HtmlContent 
                    content={project.description?.substring(0, 150) + '...' || ''}
                    className="text-gray-600 mb-4 line-clamp-2 flex-grow"
                  />
                  <div className="flex items-center text-blue-600 font-medium mt-auto">
                    Detalhes do projeto <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
