import React from 'react';
import { useHomeConfig } from '../../../../hooks/useHomeConfig';
import { SectionManager } from '../../../../components/Admin/Home/SectionManager';
import ContentEditorTab from './ContentEditorTab';
import { SectionConfig } from '../../../../types/home-config';
import { Layout, Edit } from 'lucide-react';

const SectionsTab: React.FC = () => {
  const { config, loading, updateSection, reorderSections } = useHomeConfig();

  const handleToggle = (id: string, enabled: boolean) => {
    updateSection(id, { enabled });
  };

  const handleReorder = (newSections: SectionConfig[]) => {
    reorderSections(newSections);
  };

  const handleUpdate = (id: string, updates: Partial<SectionConfig>) => {
    updateSection(id, updates);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando configuração...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Structure Manager */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Layout size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Estrutura da Página</h3>
            <p className="text-sm text-gray-500">
              Arraste para reordenar, configure a exibição e use o olho para habilitar/desabilitar seções.
            </p>
          </div>
        </div>

        <SectionManager 
          sections={config.sections} 
          onReorder={handleReorder} 
          onToggle={handleToggle} 
          onUpdate={handleUpdate}
        />
      </div>

      {/* Content Editor (Legacy) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="bg-green-100 p-2 rounded-lg text-green-600">
            <Edit size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Editor de Conteúdo</h3>
            <p className="text-sm text-gray-500">
              Edite os textos e imagens das seções "Sobre Nós" e "CTA".
            </p>
          </div>
        </div>
        
        <ContentEditorTab />
      </div>
    </div>
  );
};

export default SectionsTab;
