import React, { useState, useEffect } from 'react';
import { useSystemModules } from '../../hooks/useSystemModules';
import { X, Save, Eye, EyeOff } from 'lucide-react';

interface VisibilityControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleKey: string;
  moduleName: string;
}

const VisibilityControlModal: React.FC<VisibilityControlModalProps> = ({ 
  isOpen, 
  onClose, 
  moduleKey, 
  moduleName 
}) => {
  const { toggleModuleVisibility, modules } = useSystemModules();
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (moduleKey && modules.length > 0) {
      const module = modules.find(m => m.key === moduleKey);
      if (module) {
        setIsVisible(module.is_active);
      }
    }
  }, [moduleKey, modules]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await toggleModuleVisibility(moduleKey, isVisible);
      // Success toast is handled in the hook
      onClose();
    } catch (error) {
      // Error toast is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Controle de Visibilidade</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">
            Gerencie a visibilidade do módulo <strong className="text-gray-800">{moduleName}</strong> no site público.
          </p>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isVisible ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Status no Frontend</span>
                <span className={`text-xs ${isVisible ? 'text-green-600' : 'text-gray-500'}`}>
                  {isVisible ? 'Visível publicamente' : 'Oculto para visitantes'}
                </span>
              </div>
            </div>

            {/* Custom Toggle Switch */}
            <button
              onClick={() => setIsVisible(!isVisible)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isVisible ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`${
                  isVisible ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisibilityControlModal;
