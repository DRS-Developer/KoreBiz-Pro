const fs = require('fs');
const path = 'c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/components/Admin/Home/WidgetSettingsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const startStr = '        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">';
const endStr = '        <div className="p-6 overflow-y-auto space-y-6 flex-1">';

const hasContentTab = `  const hasContentTab = widget?.widgetType === 'hero' || widget?.widgetType === 'about' || widget?.widgetType === 'cta';\n\n`;

const replacement = startStr + `
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configurações do Elemento</h3>
            <p className="text-sm text-gray-500">Defina o comportamento e o visual deste widget.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-widget-settings-modal"
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        
        {hasContentTab && (
          <div className="flex border-b border-gray-200 px-6 mt-2">
            <button
              className={\`px-4 py-2 border-b-2 font-medium text-sm \${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
              onClick={() => setActiveTab('settings')}
            >
              Configurações
            </button>
            <button
              className={\`px-4 py-2 border-b-2 font-medium text-sm \${activeTab === 'content' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
              onClick={() => setActiveTab('content')}
            >
              Conteúdo
            </button>
          </div>
        )}
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'content' ? (
            <div>
              {widget.widgetType === 'hero' && <HeroTab />}
              {widget.widgetType === 'about' && <AboutTab />}
              {widget.widgetType === 'cta' && <CtaTab />}
            </div>
          ) : (
`;

const replaceIndex = content.indexOf(startStr);
const replaceEndIndex = content.indexOf(endStr) + endStr.length;

if (replaceIndex !== -1 && replaceEndIndex !== -1) {
  content = content.substring(0, content.indexOf('  return (')) + hasContentTab + content.substring(content.indexOf('  return ('), replaceIndex) + replacement + content.substring(replaceEndIndex);
  
  // also need to close the activeTab ternary at the end
  const footerStart = '        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">';
  content = content.replace(footerStart, '          )}\n        </div>\n        \n' + footerStart);
  
  fs.writeFileSync(path, content, 'utf8');
  console.log('Added tabs to WidgetSettingsModal');
} else {
  console.log('Could not find markers');
}
