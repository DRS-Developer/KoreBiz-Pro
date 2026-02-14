import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, FileText, PenTool, Search, AlertCircle } from 'lucide-react';
import { Database } from '../../types/database.types';
import SEO from '../../components/SEO';
import OptimizedImage from '../../components/OptimizedImage';
import PageHeader from '../../components/PageHeader';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { useGlobalStore } from '../../stores/useGlobalStore';

type ServiceItem = Database['public']['Tables']['services']['Row'];

const categories = ['Todos', 'Projetos', 'Manutenção', 'Instalação', 'Laudos', 'Consultoria'];

const Servicos: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Consume directly from Zustand (Memory)
  // AppLoader guarantees hydration, so we treat it as synchronous data
  const { services: servicesData } = useGlobalStore();
  const loading = false; // Always false after AppLoader
  const error = null;

  // Filter only published services for public view
  const services = servicesData?.filter(s => s.published) || [];

  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Settings': return <Settings size={24} />;
      case 'FileText': return <FileText size={24} />;
      case 'PenTool': return <PenTool size={24} />;
      default: return <FileText size={24} />;
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = activeCategory === 'Todos' || service.category === activeCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (service.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SEO 
        title="Nossos Serviços" 
        description="Confira nossa lista completa de serviços em instalações elétricas, manutenção predial, laudos técnicos e consultoria especializada."
        image={filteredServices[0]?.image_url || undefined}
      />
      {/* Header */}
      <PageHeader 
        title="Nossos Serviços" 
        description="Soluções personalizadas para atender às necessidades específicas do seu negócio." 
      />

      {/* Filters & Search */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Categories */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Link 
                key={service.id} 
                to={`/servicos/${service.slug}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col h-full group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-50 w-full h-40 rounded-lg text-blue-600 flex items-center justify-center overflow-hidden mb-2">
                    {service.image_url ? (
                      <OptimizedImage 
                        src={getOptimizedImageUrl(service.image_url, { width: 400, height: 300 })} 
                        alt={service.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        wrapperClassName="w-full h-full block"
                      />
                    ) : (
                      getIcon(service.icon)
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                   {service.category && (
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {service.category}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                  {service.short_description}
                </p>
                <div className="text-blue-600 text-sm font-medium hover:underline mt-auto">
                  Saiba mais &rarr;
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">Nenhum serviço encontrado para sua busca.</p>
            <button 
              onClick={() => {setActiveCategory('Todos'); setSearchTerm('');}}
              className="mt-4 text-blue-600 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Servicos;
