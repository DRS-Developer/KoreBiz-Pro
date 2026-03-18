import React, { useEffect, useState } from 'react';
import { useHomeConfig } from '../../../../hooks/useHomeConfig';
import { SectionManager } from '../../../../components/Admin/Home/SectionManager';
import { SectionConfig } from '../../../../types/home-config';
import { Layout, Edit, Sparkles, X } from 'lucide-react';
import { useSiteSettings } from '../../../../hooks/useSiteSettings';
import { useHomeWidgets } from '../../../../hooks/useHomeWidgets';
import { HomeWidgetDto } from '../../../../types/home-widgets';
import HomeWidgetManager from '../../../../components/Admin/Home/HomeWidgetManager';
import HeroTab from './HeroTab';
import AboutTab from './AboutTab';
import CtaTab from './CtaTab';

const SectionsTab: React.FC = () => {
  const { config, loading, updateSection, reorderSections } = useHomeConfig();
  const { settings } = useSiteSettings();
  const layoutSettings = settings?.layout_settings as Record<string, unknown> | null;
  const useWidgetLayout = layoutSettings?.home_builder_v2_enabled === true;
  const { widgets, loading: loadingWidgets } = useHomeWidgets(useWidgetLayout);
  const [currentWidgets, setCurrentWidgets] = useState<HomeWidgetDto[]>([]);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [ctaModalOpen, setCtaModalOpen] = useState(false);

  useEffect(() => {
    setCurrentWidgets(widgets);
  }, [widgets]);

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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-start justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`${useWidgetLayout ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} p-2 rounded-lg`}>
              {useWidgetLayout ? <Sparkles size={24} /> : <Layout size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {useWidgetLayout ? 'Builder de Elementos (v2)' : 'Estrutura da Página'}
              </h3>
              {useWidgetLayout ? (
                <p className="text-sm text-gray-500">
                  Modo dinâmico ativo. Adicione blocos, reordene com drag-and-drop e publique com fallback automático.
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Arraste para reordenar, configure a exibição e use o olho para habilitar/desabilitar seções.
                </p>
              )}
            </div>
          </div>
          <span
            data-testid="home-builder-mode-badge"
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              useWidgetLayout ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {useWidgetLayout ? 'Builder v2 ON' : 'Builder v2 OFF'}
          </span>
        </div>
        {useWidgetLayout ? (
          <div className="space-y-6">
            <HomeWidgetManager
              widgets={currentWidgets}
              loading={loadingWidgets}
              onWidgetsChange={setCurrentWidgets}
              onConfigureHero={() => setHeroModalOpen(true)}
              onConfigureAbout={() => setAboutModalOpen(true)}
              onConfigureCta={() => setCtaModalOpen(true)}
            />
          </div>
        ) : (
          <SectionManager
            sections={config.sections}
            onReorder={handleReorder}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
          />
        )}
      </div>

      {useWidgetLayout ? null : (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <Edit size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Editor de Conteúdo</h3>
              <p className="text-sm text-gray-500">
                Edite os textos e imagens da seção "Chamada para Ação" (CTA).
              </p>
            </div>
          </div>
          
          <CtaTab />
        </div>
      )}
      {useWidgetLayout && heroModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" data-testid="v2-hero-modal-overlay">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Banner Principal</h3>
                <p className="text-sm text-gray-500">Edite o conteúdo e a imagem principal da Home.</p>
              </div>
              <button
                type="button"
                onClick={() => setHeroModalOpen(false)}
                data-testid="close-v2-hero-modal-button"
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <HeroTab />
            </div>
          </div>
        </div>
      ) : null}
      {useWidgetLayout && aboutModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" data-testid="v2-about-modal-overlay">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sobre Nós</h3>
                <p className="text-sm text-gray-500">Edite o conteúdo e a imagem da seção Sobre Nós.</p>
              </div>
              <button
                type="button"
                onClick={() => setAboutModalOpen(false)}
                data-testid="close-v2-about-modal-button"
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <AboutTab />
            </div>
          </div>
        </div>
      ) : null}
      {useWidgetLayout && ctaModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" data-testid="v2-cta-modal-overlay">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chamada para Ação (CTA)</h3>
                <p className="text-sm text-gray-500">Edite o conteúdo da seção CTA.</p>
              </div>
              <button
                type="button"
                onClick={() => setCtaModalOpen(false)}
                data-testid="close-v2-cta-modal-button"
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <CtaTab />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SectionsTab;
