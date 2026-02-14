import React from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface UnsavedChangesBarProps {
  visible: boolean;
  onSave: () => void;
  onReset: () => void;
  loading?: boolean;
}

const UnsavedChangesBar: React.FC<UnsavedChangesBarProps> = ({
  visible,
  onSave,
  onReset,
  loading = false,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 transform transition-transform duration-300 ease-in-out md:pl-64">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="font-medium">Você tem alterações não salvas</span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onReset}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Descartar
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <Save size={16} />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesBar;
