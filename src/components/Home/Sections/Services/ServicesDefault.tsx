import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Zap, Building } from 'lucide-react';
import OptimizedImage from '../../../OptimizedImage';
import HtmlContent from '../../../HtmlContent';
import { useGlobalStore } from '../../../../stores/useGlobalStore';
import { useShallow } from 'zustand/react/shallow';
import Carousel from '../../../Carousel';

interface ServicesDefaultProps {
  slidesToShow?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
}

const ServicesDefault: React.FC<ServicesDefaultProps> = ({ slidesToShow = 3, autoplay = true, autoplaySpeed = 4000 }) => {
  const { practiceAreas, services: allServices } = useGlobalStore(
    useShallow((state) => ({
      practiceAreas: state.practiceAreas,
      services: state.services,
    }))
  );
  const services = (allServices || [])?.filter(s => s.published) || [];
  const safePracticeAreas = practiceAreas || [];

  // Helper to get icon based on service category (simple logic)
  const getServiceIcon = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('elétrica') || cat.includes('energia')) return <Zap size={32} />;
    if (cat.includes('predial') || cat.includes('manutenção')) return <Building size={32} />;
    return <Wrench size={32} />;
  };

  const getSlideClass = (slides: number) => {
    switch(slides) {
        case 1: return "w-full";
        case 2: return "w-full md:w-1/2";
        case 4: return "w-full md:w-1/2 lg:w-1/4";
        case 3: 
        default: return "w-full md:w-1/2 lg:w-1/3";
    }
  };

  const slideClass = getSlideClass(slidesToShow);

  if (safePracticeAreas.length > 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Áreas de Atuação</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conheça nossas principais especialidades.
            </p>
          </div>

          <Carousel slideClassName={slideClass} slidesToShow={slidesToShow} autoplay={autoplay} autoplaySpeed={autoplaySpeed}>
            {safePracticeAreas.map((area, index) => (
              <div 
                key={area.id} 
                className="bg-white p-8 rounded-xl shadow-md border-t-4 border-blue-600 h-full flex flex-col"
              >
                <div className="bg-blue-100 w-full h-32 flex items-center justify-center mb-6 overflow-hidden rounded-md shrink-0">
                  {area.image_url ? (
                     <OptimizedImage
                       src={area.image_url} 
                       alt={area.title} 
                       pageKey="areas:list"
                       role="card"
                       className="w-full h-full object-cover"
                       effect=""
                       priority={index < 4}
                     />
                  ) : (
                    <span className="text-blue-600">
                      <Wrench size={32} />
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{area.title}</h3>
                <HtmlContent 
                  content={area.description} 
                  className="text-gray-600 mb-4 line-clamp-3 flex-grow"
                />
                {area.link && (
                  <Link to={area.link} className="text-blue-600 font-medium inline-flex items-center mt-auto">
                    Saiba mais <ArrowRight size={16} className="ml-1" />
                  </Link>
                )}
              </div>
            ))}
          </Carousel>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Nossas Especialidades</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Oferecemos uma ampla gama de serviços técnicos com profissionais altamente qualificados.
          </p>
        </div>

        <Carousel slideClassName={slideClass} slidesToShow={slidesToShow} autoplay={autoplay} autoplaySpeed={autoplaySpeed}>
          {services.length > 0 ? (
            services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white p-8 rounded-xl shadow-md border-t-4 border-blue-600 h-full flex flex-col"
              >
                <div className="bg-blue-100 w-full h-32 flex items-center justify-center mb-6 overflow-hidden rounded-md shrink-0">
                  {service.image_url ? (
                     <OptimizedImage
                       src={service.image_url} 
                       alt={service.title} 
                       pageKey="servicos:list"
                       role="card"
                       className="w-full h-full object-cover"
                       effect=""
                       priority={true} // Prioridade para imagens do carrossel visível
                     />
                  ) : (
                    <span className="text-blue-600">
                      {getServiceIcon(service.category || '')}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <HtmlContent 
                  content={service.short_description || 'Serviço especializado com garantia de qualidade e segurança.'}
                  className="text-gray-600 mb-4 line-clamp-3 flex-grow"
                />
                <Link to={`/servicos/${service.slug}`} className="text-blue-600 font-medium inline-flex items-center mt-auto">
                  Saiba mais <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            ))
          ) : (
             <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-blue-600 h-full">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Zap className="text-blue-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Instalações Elétricas</h3>
                <p className="text-gray-600 mb-4">
                  Projetos, instalações e manutenção de redes elétricas residenciais, comerciais e industriais.
                </p>
              </div>
          )}
        </Carousel>
      </div>
    </section>
  );
};

export default ServicesDefault;
