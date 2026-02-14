
import React from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import SEO from '../components/SEO';
import { Loader2, ShieldCheck } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const { settings, loading } = useSiteSettings();

  const content = settings?.privacy_policy || '<p>Em construção...</p>';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SEO title="Política de Privacidade" description="Política de Privacidade e Proteção de Dados da ArsInstalações." />
      
      {/* Header */}
      <div className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <ShieldCheck className="w-10 h-10 text-blue-300" />
            <h1 className="text-4xl font-bold">Política de Privacidade</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl">
            Entenda como protegemos seus dados e garantimos sua segurança.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-md border border-gray-100 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <Loader2 className="w-8 h-8 animate-spin mb-2" />
               <p>Carregando política...</p>
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

export default PrivacyPolicy;
