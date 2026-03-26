const fs = require('fs');
const path = 'c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/components/Admin/Home/HomeWidgetManager.tsx';
let content = fs.readFileSync(path, 'utf8');

const startStr = '<div className="xl:col-span-1">';
const endStr = '<WidgetPaletteModal';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + '      </div>\n\n      <WidgetSettingsModal\n        widget={selectedWidget}\n        isOpen={isSettingsModalOpen}\n        onClose={() => setIsSettingsModalOpen(false)}\n        onSave={handleSaveSettings}\n        saving={saving}\n      />\n\n      ' + content.substring(endIndex);
  
  content = content.replace('className="grid grid-cols-1 xl:grid-cols-3 gap-6"', 'className="grid grid-cols-1 gap-6 max-w-4xl mx-auto"');
  content = content.replace('className="xl:col-span-2"', 'className="w-full"');
  fs.writeFileSync(path, content, 'utf8');
  console.log('Removed right column');
} else {
  console.log('Could not find right column');
}
