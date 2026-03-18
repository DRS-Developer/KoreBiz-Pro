
import React, { useEffect, useMemo, useState } from 'react';
import { LayoutTemplate, Image, Type } from 'lucide-react';
import HeroTab from './tabs/HeroTab';
import SectionsTab from './tabs/SectionsTab';
import VisualsTab from './tabs/VisualsTab';
import { useSiteSettings } from '../../../hooks/useSiteSettings';

const HomeSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const { settings } = useSiteSettings();
  const layoutSettings = settings?.layout_settings as Record<string, unknown> | null;
  const useWidgetLayout = layoutSettings?.home_builder_v2_enabled === true;

  useEffect(() => {
    if (useWidgetLayout && activeTab === 'hero') {
      setActiveTab('sections');
    }
  }, [useWidgetLayout, activeTab]);

  const tabs = useMemo(
    () =>
      [
        !useWidgetLayout ? { id: 'hero', label: 'Banner Principal', icon: Image } : null,
        { id: 'sections', label: 'Seções da Home', icon: LayoutTemplate },
        { id: 'visuals', label: 'Elementos Visuais', icon: Type },
      ].filter(Boolean) as Array<{ id: string; label: string; icon: React.ComponentType<{ size?: number }> }>,
    [useWidgetLayout]
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'hero':
        return <HeroTab />;
      case 'sections':
        return <SectionsTab />;
      case 'visuals':
        return <VisualsTab />;
      default:
        return <HeroTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Editor da Página Inicial</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' 
                      : 'text-gray-500'
                    }
                  `}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <div key={activeTab}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSettings;
