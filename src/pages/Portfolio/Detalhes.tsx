import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, Tag, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SEO from '../../components/SEO';
import PageSkeleton from '../../components/Skeletons/PageSkeleton';
import OptimizedImage from '../../components/OptimizedImage';
import { useGlobalStore } from '../../stores/useGlobalStore';

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

    const fetchProject = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('portfolios')
                .select('*')
                .eq('slug', slug)
                .single();
            
            if (error) throw error;
            setProject(data);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    if (slug) fetchProject();
  }, [slug, memoryProject]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Projeto não encontrado</h2>
        <p className="text-gray-600 mb-6 text-center">
          {error?.message || 'O projeto que você está procurando não existe ou foi removido.'}
        </p>
        <Link 
          to="/portfolio" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center"
        >
          <ArrowLeft size={20} className="mr-2" /> Voltar para Portfólio
        </Link>
      </div>
    );
  }

  // Safely cast gallery images
  const galleryImages = Array.isArray(project.gallery_images) 
    ? project.gallery_images as string[] 
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title={project.title} 
        description={project.description ? project.description.substring(0, 160) : `Detalhes do projeto ${project.title}`}
        image={project.image_url || undefined}
      />
      {/* Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/portfolio" className="text-gray-400 hover:text-white flex items-center mb-4 transition-colors text-sm">
            <ArrowLeft size={16} className="mr-2" /> Voltar para Portfólio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <OptimizedImage
              src={project.image_url || 'https://via.placeholder.com/1200x800?text=Sem+Imagem'} 
              alt={project.title} 
              className="w-full h-[500px] object-cover rounded-xl shadow-lg mb-8"
              priority={true} // LCP optimization
            />
            
            <div 
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: project.description || '' }}
            />

            {/* Gallery Grid */}
            {galleryImages.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Galeria de Fotos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galleryImages.map((imgUrl, index) => (
                    <OptimizedImage
                      key={index} 
                      src={imgUrl} 
                      className="rounded-lg h-64 object-cover w-full shadow-sm hover:shadow-md transition-shadow" 
                      alt={`${project.title} - Foto ${index + 1}`} 
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
                {project.client && (
                  <div className="flex items-start">
                    <User className="text-blue-600 mt-1 mr-4" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Cliente</h4>
                      <p className="text-gray-900 font-medium">{project.client}</p>
                    </div>
                  </div>
                )}

                {project.location && (
                  <div className="flex items-start">
                    <MapPin className="text-blue-600 mt-1 mr-4" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Localização</h4>
                      <p className="text-gray-900 font-medium">{project.location}</p>
                    </div>
                  </div>
                )}

                {project.completion_date && (
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

                {project.category && (
                  <div className="flex items-start">
                    <Tag className="text-blue-600 mt-1 mr-4" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Categoria</h4>
                      <p className="text-gray-900 font-medium">{project.category}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link 
                  to="/contato" 
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
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
