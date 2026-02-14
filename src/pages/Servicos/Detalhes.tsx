import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Shield, Award, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import SEO from '../../components/SEO';
import PageSkeleton from '../../components/Skeletons/PageSkeleton';
import OptimizedImage from '../../components/OptimizedImage';
import { useGlobalStore } from '../../stores/useGlobalStore';

type ServiceItem = Database['public']['Tables']['services']['Row'];

const ServicosDetalhes: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { services } = useGlobalStore();
  
  // Try to find in memory first
  const memoryService = services?.find(s => s.slug === slug);
  
  const [service, setService] = useState<ServiceItem | undefined>(memoryService);
  const [loading, setLoading] = useState(!memoryService);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If we have it in memory, we're good (maybe re-fetch background if needed, but for now it's ok)
    if (memoryService) {
        setService(memoryService);
        setLoading(false);
        return;
    }

    // Fallback: Fetch specific item if not in global list (e.g. direct link entry before global sync finishes)
    // But since AppLoader waits for global sync, this should be rare unless direct URL access
    const fetchService = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('slug', slug)
                .single();
                
            if (error) throw error;
            setService(data);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    if (slug) fetchService();
  }, [slug, memoryService]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Serviço não encontrado</h2>
        <p className="text-gray-600 mb-6 text-center">
          {error?.message || 'O serviço que você está procurando não existe ou foi removido.'}
        </p>
        <Link 
          to="/servicos" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center"
        >
          <ArrowLeft size={20} className="mr-2" /> Voltar para Serviços
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title={service.title} 
        description={service.short_description || `Saiba mais sobre ${service.title}`}
        image={service.image_url || undefined}
      />
      {/* Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/servicos" className="text-gray-400 hover:text-white flex items-center mb-4 transition-colors text-sm">
            <ArrowLeft size={16} className="mr-2" /> Voltar para Serviços
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{service.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Content */}
          <div className="lg:w-2/3">
            {service.image_url && (
              <OptimizedImage
                src={service.image_url}
                alt={service.title}
                className="w-full h-80 md:h-96 object-cover rounded-xl shadow-sm mb-8"
                priority={true} // LCP optimization
              />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
              {service.full_description ? (
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: service.full_description }}
                />
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre este serviço</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {service.short_description}
                  </p>
                </>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Como funciona nosso processo</h3>
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 bg-blue-200 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Solicitação e Agendamento</h4>
                    <p className="text-gray-600 text-sm">Você entra em contato e agendamos uma visita técnica.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 bg-blue-200 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Diagnóstico e Orçamento</h4>
                    <p className="text-gray-600 text-sm">Avaliamos a necessidade e enviamos um orçamento detalhado.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 bg-blue-200 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Execução</h4>
                    <p className="text-gray-600 text-sm">Após aprovação, executamos o serviço com segurança e limpeza.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 bg-blue-200 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">4</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Entrega e Garantia</h4>
                    <p className="text-gray-600 text-sm">Finalizamos o serviço e fornecemos a garantia contratual.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Solicite um Orçamento</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Interessado em {service.title}? Preencha o formulário abaixo e entraremos em contato rapidamente.
              </p>
              
              <Link 
                to="/contato" 
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center mb-4"
              >
                Falar no WhatsApp
              </Link>
              
              <Link 
                to="/contato" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
              >
                Preencher Formulário
              </Link>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center text-gray-600 mb-3">
                  <Clock size={18} className="mr-3 text-blue-500" />
                  <span className="text-sm">Atendimento Seg-Sex 8h às 18h</span>
                </div>
                <div className="flex items-center text-gray-600 mb-3">
                  <Shield size={18} className="mr-3 text-blue-500" />
                  <span className="text-sm">Garantia em todos os serviços</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Award size={18} className="mr-3 text-blue-500" />
                  <span className="text-sm">Profissionais certificados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicosDetalhes;
