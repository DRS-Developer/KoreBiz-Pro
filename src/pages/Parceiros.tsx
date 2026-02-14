import React from 'react';
import PageHeader from '../components/PageHeader';

const partners = [
  { id: 1, name: 'Empresa Parceira 1', logo: 'https://placehold.co/200x100?text=Parceiro+1' },
  { id: 2, name: 'Empresa Parceira 2', logo: 'https://placehold.co/200x100?text=Parceiro+2' },
  { id: 3, name: 'Empresa Parceira 3', logo: 'https://placehold.co/200x100?text=Parceiro+3' },
  { id: 4, name: 'Empresa Parceira 4', logo: 'https://placehold.co/200x100?text=Parceiro+4' },
  { id: 5, name: 'Empresa Parceira 5', logo: 'https://placehold.co/200x100?text=Parceiro+5' },
  { id: 6, name: 'Empresa Parceira 6', logo: 'https://placehold.co/200x100?text=Parceiro+6' },
  { id: 7, name: 'Empresa Parceira 7', logo: 'https://placehold.co/200x100?text=Parceiro+7' },
  { id: 8, name: 'Empresa Parceira 8', logo: 'https://placehold.co/200x100?text=Parceiro+8' },
];

const Parceiros: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader 
        title="Nossos Parceiros" 
        description="Empresas e fornecedores que confiam no nosso trabalho e nos ajudam a entregar excelência." 
      />

      {/* Partners Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {partners.map((partner) => (
            <div 
              key={partner.id} 
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center border border-gray-100 h-40"
            >
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className="max-w-full max-h-full opacity-70 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0"
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block"
          >
            Entre em Contato
          </a>
        </div>
      </div>
    </div>
  );
};

export default Parceiros;
