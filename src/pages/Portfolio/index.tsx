import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Database } from '../../types/database.types';
import SEO from '../../components/SEO';
import OptimizedImage from '../../components/OptimizedImage';
import PageHeader from '../../components/PageHeader';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { useGlobalStore } from '../../stores/useGlobalStore';

type PortfolioItem = Database['public']['Tables']['portfolios']['Row'];

const categories = ['Todos', 'Comercial', 'Residencial', 'Industrial'];

const Portfolio: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');

  // New Architecture: Use Global Store (Memory Cache)
  const { portfolio: projectsData } = useGlobalStore();
  const loading = false;
  const error = null;

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

      {/* Error State */}
      {error && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-800 font-bold">Erro</h3>
              <p className="text-red-700">{error.message || 'Falha ao carregar os projetos.'}</p>
              <button 
                onClick={() => refetch()}
                className="mt-2 text-red-600 hover:text-red-800 font-medium underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {!error && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {!error && (
        <div className="container mx-auto px-4 pb-16">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum projeto encontrado nesta categoria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <Link 
                  key={project.id} 
                  to={`/portfolio/${project.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative h-64 overflow-hidden">
                    <OptimizedImage 
                      src={getOptimizedImageUrl(project.image_url, { width: 600, height: 400 }) || 'https://via.placeholder.com/800x600?text=Sem+Imagem'} 
                      alt={project.title} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      wrapperClassName="w-full h-full block"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-bold border-2 border-white px-4 py-2 rounded transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Ver Projeto
                      </span>
                    </div>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <div 
                      className="text-gray-600 mb-4 line-clamp-2 flex-grow"
                      dangerouslySetInnerHTML={{ __html: project.description?.substring(0, 150) + '...' || '' }}
                    />
                    <div className="flex items-center text-blue-600 font-medium mt-auto">
                      Detalhes do projeto <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
