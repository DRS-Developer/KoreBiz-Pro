import React from 'react';
import { createPortal } from 'react-dom';
import { Save, X, AlertTriangle, Trash2 } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
}) => {
  if (!isOpen) return null;

  // Ensure document.body exists (SSR safety check, though this is CSR)
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      style={{ pointerEvents: 'auto' }} // Ensure clicks are captured
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 text-amber-600 mb-4">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Alterações não salvas</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Você tem alterações não salvas neste formulário. Se sair agora, todas as modificações serão perdidas. O que deseja fazer?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onSave}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Save size={18} />
              Salvar Alterações
            </button>
            
            <button
              onClick={onDiscard}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              Descartar e Sair
            </button>
            
            <button
              onClick={onCancel}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <X size={18} />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UnsavedChangesModal;
