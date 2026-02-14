
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import SEO from '../components/SEO';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  const { settings, loading } = useSiteSettings();

  const title = settings?.not_found_title || 'Página não encontrada';
  const message = settings?.not_found_message || 'Desculpe, a página que você está procurando não existe ou foi movida.';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <SEO title="Página não encontrada" description="Erro 404 - Página não encontrada" />
      
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full space-y-6">
        <div className="flex justify-center mb-4">
           <div className="bg-red-100 p-4 rounded-full">
             <AlertTriangle className="w-12 h-12 text-red-500" />
           </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
             <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{message}</p>
          </>
        )}

        <div className="pt-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <Home size={20} />
            Voltar para o Início
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-400">
        Erro 404
      </div>
    </div>
  );
};

export default NotFound;
