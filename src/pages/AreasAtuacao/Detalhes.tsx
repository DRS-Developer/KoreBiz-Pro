import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import OptimizedImage from '../../components/OptimizedImage';

const AreasAtuacaoDetalhes: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Mock data - in a real app, fetch from Supabase based on slug
  const title = slug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/areas-de-atuacao" className="text-blue-200 hover:text-white flex items-center mb-6 transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Voltar para Áreas de Atuação
          </Link>
          <h1 className="text-4xl font-bold mb-4">{title || 'Detalhes da Área'}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <OptimizedImage
              src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop" 
              alt={title || 'Área de Atuação'} 
              className="w-full h-96 object-cover rounded-xl shadow-lg mb-8"
              priority={true}
            />
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição do Serviço</h2>
              <p className="mb-6">
                A ArsInstalações oferece soluções completas em {title}, garantindo qualidade técnica e conformidade com todas as normas de segurança vigentes. Nossa equipe é altamente qualificada para atender demandas de qualquer complexidade.
              </p>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">O que oferecemos:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                    <span>Serviço especializado item {item} relacionado a {title}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Metodologia de Trabalho</h3>
              <p>
                Trabalhamos com um processo estruturado que envolve diagnóstico técnico, planejamento detalhado, execução supervisionada e testes de qualidade antes da entrega final.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-gray-50 p-8 rounded-xl shadow-md sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Precisa deste serviço?</h3>
              <p className="text-gray-600 mb-6">
                Entre em contato com nossa equipe técnica para uma avaliação detalhada do seu projeto.
              </p>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input type="tel" id="phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  Solicitar Orçamento
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreasAtuacaoDetalhes;
