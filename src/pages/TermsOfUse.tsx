
import React from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import SEO from '../components/SEO';
import { Loader2, FileText } from 'lucide-react';

const TermsOfUse: React.FC = () => {
  const { settings, loading } = useSiteSettings();

  const content = settings?.terms_of_use || '<p>Em construção...</p>';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SEO title="Termos de Uso" description="Termos e Condições de Uso dos serviços da ArsInstalações." />
      
      {/* Header */}
      <div className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-10 h-10 text-blue-300" />
            <h1 className="text-4xl font-bold">Termos de Uso</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl">
            Regras e diretrizes para utilização dos nossos serviços e plataforma.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-md border border-gray-100 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <Loader2 className="w-8 h-8 animate-spin mb-2" />
               <p>Carregando termos...</p>
            </div>
          ) : (
            <div 
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
