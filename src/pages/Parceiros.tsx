import React from 'react';
import PageHeader from '../components/PageHeader';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

const partners = [
  { id: 1, name: 'Empresa Parceira 1', logo: '' },
  { id: 2, name: 'Empresa Parceira 2', logo: '' },
  { id: 3, name: 'Empresa Parceira 3', logo: '' },
  { id: 4, name: 'Empresa Parceira 4', logo: '' },
  { id: 5, name: 'Empresa Parceira 5', logo: '' },
  { id: 6, name: 'Empresa Parceira 6', logo: '' },
  { id: 7, name: 'Empresa Parceira 7', logo: '' },
  { id: 8, name: 'Empresa Parceira 8', logo: '' },
];

const Parceiros: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SEO 
        title="Nossos Parceiros" 
        description="Empresas e fornecedores que confiam no nosso trabalho e nos ajudam a entregar excelência." 
      />
      {/* Header */}
      <PageHeader 
        title="Nossos Parceiros" 
        description="Empresas e fornecedores que confiam no nosso trabalho e nos ajudam a entregar excelência." 
      />

      {/* Partners Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {partners.map((partner, index) => (
            <div 
              key={partner.id} 
              className="bg-white p-8 rounded-xl shadow-sm flex items-center justify-center border border-gray-100 h-40"
            >
              <OptimizedImage 
                src={partner.logo} 
                alt={partner.name} 
                pageKey="parceiros"
                role="card"
                className="max-w-full max-h-full object-contain"
                priority={index < 8}
              />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 bg-white p-12 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Seja nosso parceiro</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Estamos sempre em busca de novas parcerias para ampliar nossa rede de atendimento e oferecer as melhores soluções aos nossos clientes.
          </p>
          <a 
            href="/contato" 
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg inline-block"
          >
            Entre em Contato
          </a>
        </div>
      </div>
    </div>
  );
};

export default Parceiros;
