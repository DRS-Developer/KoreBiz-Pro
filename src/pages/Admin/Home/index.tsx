
import React, { useMemo, useState } from 'react';
import { LayoutTemplate, Type } from 'lucide-react';
import SectionsTab from './tabs/SectionsTab';
import VisualsTab from './tabs/VisualsTab';

const HomeSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sections');

  const tabs = useMemo(
    () =>
      [
        { id: 'sections', label: 'Seções da Home', icon: LayoutTemplate },
        { id: 'visuals', label: 'Elementos Visuais', icon: Type },
      ] as Array<{ id: string; label: string; icon: React.ComponentType<{ size?: number }> }>,
    []
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sections':
        return <SectionsTab />;
      case 'visuals':
        return <VisualsTab />;
      default:
        return <SectionsTab />;
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
