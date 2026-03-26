import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useHomeWidgets } from '../../../../hooks/useHomeWidgets';
import { HomeWidgetDto } from '../../../../types/home-widgets';
import HomeWidgetManager from '../../../../components/Admin/Home/HomeWidgetManager';
import HeroTab from './HeroTab';
import AboutTab from './AboutTab';
import CtaTab from './CtaTab';

const SectionsTab: React.FC = () => {
  const { widgets, loading: loadingWidgets } = useHomeWidgets();
  const [currentWidgets, setCurrentWidgets] = useState<HomeWidgetDto[]>([]);
  const [heroWidget, setHeroWidget] = useState<HomeWidgetDto | null>(null);
  const [aboutWidget, setAboutWidget] = useState<HomeWidgetDto | null>(null);
  const [ctaWidget, setCtaWidget] = useState<HomeWidgetDto | null>(null);

  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [ctaModalOpen, setCtaModalOpen] = useState(false);

  useEffect(() => {
    setCurrentWidgets(widgets);
  }, [widgets]);

  const handleWidgetUpdated = (updatedWidget: HomeWidgetDto) => {
    setCurrentWidgets((prev) =>
      prev.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-start justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Builder de Elementos</h3>
              <p className="text-sm text-gray-500">
                Adicione blocos, reordene com drag-and-drop e configure o conteúdo pelos modais dos widgets.
              </p>
            </div>
          </div>
          <span
            data-testid="home-builder-mode-badge"
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200"
          >
            Builder v2
          </span>
        </div>
        <div className="space-y-6">
          <HomeWidgetManager
            widgets={currentWidgets}
            loading={loadingWidgets}
            onWidgetsChange={setCurrentWidgets}
            onConfigureHero={(w) => { setHeroWidget(w); setHeroModalOpen(true); }}
            onConfigureAbout={(w) => { setAboutWidget(w); setAboutModalOpen(true); }}
            onConfigureCta={(w) => { setCtaWidget(w); setCtaModalOpen(true); }}
          />
        </div>
      </div>
      {heroModalOpen ? (
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
              <HeroTab widget={heroWidget} onWidgetUpdated={handleWidgetUpdated} />
            </div>
          </div>
        </div>
      ) : null}
      {aboutModalOpen ? (
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
              <AboutTab widget={aboutWidget} onWidgetUpdated={handleWidgetUpdated} />
            </div>
          </div>
        </div>
      ) : null}
      {ctaModalOpen ? (
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
              <CtaTab widget={ctaWidget} onWidgetUpdated={handleWidgetUpdated} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SectionsTab;
