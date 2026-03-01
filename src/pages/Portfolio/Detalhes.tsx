import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, Tag, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SEO from '../../components/SEO';
import OptimizedImage from '../../components/OptimizedImage';
import { useGlobalStore } from '../../stores/useGlobalStore';
import PageHeader from '../../components/PageHeader';

import HtmlContent from '../../components/HtmlContent';

type PortfolioItem = Database['public']['Tables']['portfolios']['Row'];

const PortfolioDetalhes: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { portfolio } = useGlobalStore();
  
  // Memory First
  const memoryProject = portfolio?.find(p => p.slug === slug);

  const [project, setProject] = useState<PortfolioItem | undefined>(memoryProject);
  const [loading, setLoading] = useState(!memoryProject);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (memoryProject) {
        setProject(memoryProject);
        setLoading(false);
        return;
    }

    const fetchProject = async (slugValue: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('portfolios')
                .select('*')
                .eq('slug', slugValue)
                .single();
            
            if (error) throw error;
            setProject(data);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    if (slug) fetchProject(slug);
  }, [slug, memoryProject]);

  if (!loading && (error || !project)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Projeto não encontrado</h2>
        <p className="text-gray-600 mb-6 text-center">
          {error?.message || 'O projeto que você está procurando não existe ou foi removido.'}
        </p>
        <Link 
          to="/portfolio" 
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center"
        >
          <ArrowLeft size={20} className="mr-2" /> Voltar para Portfólio
        </Link>
      </div>
    );
  }

  // Safely cast gallery images
  const galleryImages = (project && Array.isArray(project.gallery_images))
    ? project.gallery_images as string[] 
    : [];
    
  // Safe title for header/SEO during loading
  const pageTitle = project?.title || 'Carregando...';

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title={pageTitle} 
        description={project?.description ? project.description.substring(0, 160) : `Detalhes do projeto ${pageTitle}`}
        image={project?.image_url || undefined}
      />
      {/* Header */}
      <PageHeader title={pageTitle}>
        <Link to="/portfolio" className="text-blue-100 flex items-center mb-0 text-sm hover:text-white transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Voltar para Portfólio
        </Link>
      </PageHeader>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <OptimizedImage
              src={project?.image_url || undefined}
              alt={project?.title || 'Projeto'} 
              pageKey="portfolio:detail"
              role="hero"
              className="w-full h-[500px] object-cover rounded-xl shadow-lg mb-8"
              priority={true} // LCP optimization
            />
            
            {project ? (
              <HtmlContent 
                className="prose prose-lg max-w-none text-gray-700"
                content={project.description || ''}
              />
            ) : (
              <div className="space-y-4 mb-8">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
            )}

            {/* Gallery Grid */}
            {galleryImages.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Galeria de Fotos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galleryImages.map((imgUrl, index) => (
                    <OptimizedImage
                      key={index} 
                      src={imgUrl} 
                      pageKey="portfolio:detail"
                      role="card"
                      className="rounded-lg h-64 object-cover w-full shadow-sm" 
                      alt={`${project?.title} - Foto ${index + 1}`}
                      effect=""
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-gray-50 p-8 rounded-xl shadow-md sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Informações do Projeto</h3>
              
              <div className="space-y-6">
                {project?.client && (
                  <div className="flex items-start">
                    <User className="text-blue-600 mt-1 mr-4" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Cliente</h4>
                      <p className="text-gray-900 font-medium">{project.client}</p>
                    </div>
                  </div>
                )}

                {project?.location && (
                  <div className="flex items-start">
                    <MapPin className="text-blue-600 mt-1 mr-4" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Localização</h4>
                      <p className="text-gray-900 font-medium">{project.location}</p>
                    </div>
                  </div>
                )}

                {project?.completion_date && (
                  <div className="flex items-start">
                    <Calendar className="text-blue-600 mt-1 mr-4" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Conclusão</h4>
                      <p className="text-gray-900 font-medium">
                        {format(new Date(project.completion_date), "MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}

                {project?.category && (
                  <div className="flex items-start">
                    <Tag className="text-blue-600 mt-1 mr-4" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Categoria</h4>
                      <p className="text-gray-900 font-medium">{project.category}</p>
                    </div>
                  </div>
                )}
                
                {!project && (
                   <div className="animate-pulse space-y-6">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="flex items-start">
                         <div className="w-5 h-5 bg-gray-200 rounded-full mr-4"></div>
                         <div className="flex-1">
                           <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                           <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                         </div>
                       </div>
                     ))}
                   </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link 
                  to="/contato" 
                  className="block w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-center"
                >
                  Solicitar Projeto Similar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetalhes;
