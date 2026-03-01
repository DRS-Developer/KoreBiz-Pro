import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import OptimizedImage from '../../../OptimizedImage';
import HtmlContent from '../../../HtmlContent';
import { useGlobalStore } from '../../../../stores/useGlobalStore';

const AboutDefault: React.FC = () => {
  const { homeAbout } = useGlobalStore();
  const about = homeAbout;

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <OptimizedImage
              src={about?.image_url || undefined}
              alt="Sobre a ArsInstalações" 
              pageKey="home"
              role="card"
              className="rounded-lg shadow-xl"
              effect=""
              priority={true}
            />
          </div>
          <div className="md:w-1/2">
            <h4 className="text-blue-600 font-bold uppercase tracking-wide mb-2">
              {about?.subtitle || "Sobre Nós"}
            </h4>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {about?.title || "Compromisso com a Qualidade e Segurança"}
            </h2>
            <HtmlContent 
              content={about?.description || "A ArsInstalações nasceu com o propósito de oferecer serviços técnicos de alta qualidade, focando na segurança e satisfação total dos nossos clientes."}
              className="text-lg text-gray-600 mb-6"
            />
            
            {about?.features && about.features.length > 0 ? (
              <ul className="space-y-4 mb-8">
                {about.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="text-green-500 mr-3" size={24} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="text-green-500 mr-3" size={24} />
                  <span>Profissionais certificados e experientes</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="text-green-500 mr-3" size={24} />
                  <span>Atendimento personalizado e consultivo</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="text-green-500 mr-3" size={24} />
                  <span>Garantia em todos os serviços prestados</span>
                </li>
              </ul>
            )}

            <Link 
              to={about?.button_link || "/empresa"} 
              className="bg-blue-900 text-white font-bold py-3 px-8 rounded-lg inline-block"
            >
              {about?.button_text || "Conheça Nossa História"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutDefault;
