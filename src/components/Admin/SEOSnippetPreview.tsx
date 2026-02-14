import React from 'react';

interface SEOSnippetPreviewProps {
  title: string;
  description: string;
  slug: string;
}

const SEOSnippetPreview: React.FC<SEOSnippetPreviewProps> = ({ title, description, slug }) => {
  const baseUrl = 'https://arsinstalacoes.com.br';
  // Clean slug to remove leading slash if present
  const cleanSlug = slug?.replace(/^\//, '') || 'pagina';
  const displayUrl = `${baseUrl} › ${cleanSlug}`;
  
  // Google recommended limits
  const titleLimit = 60;
  const descLimit = 160;

  const truncatedTitle = title?.length > titleLimit ? title.substring(0, titleLimit) + '...' : title;
  const truncatedDesc = description?.length > descLimit ? description.substring(0, descLimit) + '...' : description;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm max-w-[600px] mt-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Pré-visualização no Google</h3>
      <div className="font-sans">
        <div className="flex items-center mb-1">
          <div className="bg-gray-100 rounded-full w-7 h-7 mr-2 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
          <div className="leading-tight">
            <div className="text-sm text-gray-800">ArsInstalações</div>
            <div className="text-xs text-gray-500">{displayUrl}</div>
          </div>
        </div>
        <div className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer mb-1 truncate">
          {truncatedTitle || 'Título da Página'}
        </div>
        <div className="text-sm text-[#4d5156] leading-snug break-words">
          {truncatedDesc || 'A descrição da página aparecerá aqui nos resultados de busca. Certifique-se de incluir palavras-chave relevantes.'}
        </div>
      </div>
    </div>
  );
};

export default SEOSnippetPreview;
