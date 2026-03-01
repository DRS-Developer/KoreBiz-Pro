import React from 'react';
import OptimizedImage from '../../../OptimizedImage';
import { useGlobalStore } from '../../../../stores/useGlobalStore';
import { useShallow } from 'zustand/react/shallow';

const PartnersDefault: React.FC = () => {
  const { partners } = useGlobalStore(useShallow((state) => ({ partners: state.partners })));

  if (partners.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-gray-800">Nossos Parceiros</h3>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-12">
          {partners.map((partner, index) => (
            <div key={partner.id}>
              {partner.logo_url ? (
                <OptimizedImage
                  src={partner.logo_url} 
                  alt={partner.name} 
                  pageKey="parceiros"
                  role="logo"
                  className="h-16 w-auto object-contain grayscale"
                  effect=""
                  priority={index < 6}
                />
              ) : (
                <span className="text-xl font-bold text-gray-500">{partner.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersDefault;
