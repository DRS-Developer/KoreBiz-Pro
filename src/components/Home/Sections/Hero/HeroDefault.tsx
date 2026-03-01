import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from '../../../OptimizedImage';
import HtmlContent from '../../../HtmlContent';
import { useGlobalStore } from '../../../../stores/useGlobalStore';
import { useShallow } from 'zustand/react/shallow';
import { useSiteSettings } from '../../../../hooks/useSiteSettings';

const HeroDefault: React.FC = () => {
  const { homeHero } = useGlobalStore(useShallow((state) => ({ homeHero: state.homeHero })));
  const { settings } = useSiteSettings();
  
  const hero = homeHero;

  return (
    <section className="relative bg-blue-900 text-white py-16 md:py-20 min-h-[500px] md:min-h-[600px] flex items-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <OptimizedImage
          src={hero?.background_image || (settings?.image_settings as { banner_url?: string })?.banner_url} 
          alt="Banner Principal" 
          pageKey="home"
          role="hero"
          className="w-full h-full object-cover"
          priority={true}
          effect=""
        />
      </div>
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {hero?.title || settings?.site_name || 'Soluções Completas em Instalações e Manutenção'}
          </h1>
          <HtmlContent 
            content={hero?.description || settings?.site_description || 'Excelência técnica e compromisso com a qualidade para sua empresa e residência. Especialistas em elétrica, hidráulica e manutenção predial.'}
            className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to={hero?.primary_button_link || "/contato"} 
              className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-center inline-flex items-center justify-center"
            >
              {hero?.primary_button_text || "Solicitar Orçamento"}
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link 
              to={hero?.secondary_button_link || "/servicos"} 
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-center"
            >
              {hero?.secondary_button_text || "Nossos Serviços"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroDefault;
