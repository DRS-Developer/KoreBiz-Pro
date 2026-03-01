
import React from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import SEO from '../components/SEO';
import HtmlContent from '../components/HtmlContent';
import PageHeader from '../components/PageHeader';

const TermsOfUse: React.FC = () => {
  const { settings } = useSiteSettings();

  const content = settings?.terms_of_use || '';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SEO title="Termos de Uso" description="Termos e Condições de Uso dos serviços da KoreBiz." />
      
      {/* Header */}
      <PageHeader 
        title="Termos de Uso" 
        description="Regras e diretrizes para utilização dos nossos serviços e plataforma."
      />

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-md border border-gray-100 min-h-[400px]">
          {content ? (
            <HtmlContent 
              className="prose prose-lg max-w-none text-gray-700 animate-fade-in"
              content={content} 
            />
          ) : (
             <div className="space-y-4 opacity-0">
               {/* Invisible content to hold layout space preventing layout shift */}
               <div className="h-10 bg-gray-100 w-1/3 mb-4 rounded"></div>
               <div className="h-4 bg-gray-100 w-full rounded"></div>
               <div className="h-4 bg-gray-100 w-full rounded"></div>
               <div className="h-4 bg-gray-100 w-3/4 rounded"></div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
