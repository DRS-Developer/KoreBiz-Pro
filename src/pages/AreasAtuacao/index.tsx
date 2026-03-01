import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useGlobalStore } from '../../stores/useGlobalStore';
import OptimizedImage from '../../components/OptimizedImage';
import SEO from '../../components/SEO';

const AreasAtuacao: React.FC = () => {
  const { practiceAreas, isHydrated } = useGlobalStore();
  const [sortedAreas, setSortedAreas] = useState(practiceAreas);

  useEffect(() => {
    if (practiceAreas.length > 0) {
      setSortedAreas([...practiceAreas].sort((a, b) => a.order_index - b.order_index));
    }
  }, [practiceAreas]);

  // Loading state if needed
  if (!isHydrated && practiceAreas.length === 0) {
     return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="h-64 bg-gray-200 animate-pulse"></div>
            <div className="container mx-auto px-4 py-16">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
                    ))}
                 </div>
            </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SEO 
        title="Áreas de Atuação" 
        description="Conheça as especialidades técnicas onde a ArsInstalações se destaca." 
      />
      {/* Header */}
      <PageHeader 
        title="Áreas de Atuação" 
        description="Conheça as especialidades técnicas onde a ArsInstalações se destaca." 
      />

      {/* Grid */}
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sortedAreas.map((area, index) => (
            <Link 
              key={area.id} 
              to={area.link || '#'}
              className="bg-white rounded-xl shadow-sm border border-gray-100 group flex flex-col md:flex-row h-full overflow-hidden"
            >
              <div className="h-64 md:h-auto md:w-2/5 relative overflow-hidden shrink-0">
                {area.image_url ? (
                  <OptimizedImage 
                    src={area.image_url} 
                    alt={area.title}
                    className="w-full h-full object-cover"
                    priority={index < 4}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    Sem imagem
                  </div>
                )}
                {/* Overlay only for mobile/when stacked */}
                <div className="md:hidden absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col flex-grow md:w-3/5 justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {area.title}
                </h3>
                
                <div className="w-12 h-1 bg-blue-600 rounded-full mb-4"></div>

                {/* Short description excerpt */}
                <div className="text-gray-600 mb-6 flex-grow line-clamp-3 leading-relaxed" 
                     dangerouslySetInnerHTML={{ 
                        __html: area.description ? area.description.replace(/<[^>]*>?/gm, '').substring(0, 140) + '...' : '' 
                     }} 
                />
                
                <div className="flex items-center text-blue-600 font-semibold mt-auto">
                  Ver detalhes <ArrowRight size={18} className="ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AreasAtuacao;
