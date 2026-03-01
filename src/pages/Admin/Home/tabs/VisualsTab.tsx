
import React from 'react';
import { Settings } from 'lucide-react';

const VisualsTab: React.FC = () => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
        <Settings className="text-blue-600" size={32} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Personalização Visual</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Em breve você poderá personalizar as cores, fontes e espaçamentos globais da página inicial diretamente por aqui.
        Por enquanto, utilize as abas de conteúdo para alterar imagens e textos.
      </p>
    </div>
  );
};

export default VisualsTab;
