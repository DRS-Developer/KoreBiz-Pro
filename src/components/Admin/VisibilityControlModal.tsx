import React, { useState, useEffect } from 'react';
import { useSystemModules } from '../../hooks/useSystemModules';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

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
  const { updateModuleConfig, modules, canDisableModule } = useSystemModules();
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const currentModule = modules.find(m => m.key === moduleKey) ?? null;

  useEffect(() => {
    if (moduleKey && modules.length > 0) {
      const module = modules.find(m => m.key === moduleKey);
      if (module) {
        setIsVisible(module.is_active);
      }
    }
  }, [moduleKey, modules]);

  const handleSave = async () => {
    if (!currentModule) {
      toast.error('Módulo não encontrado para atualização');
      return;
    }

    if (!isVisible && !canDisableModule(moduleKey)) {
      toast.error('Ao menos um botão configurável deve permanecer ativo');
      return;
    }

    setLoading(true);
    try {
      await updateModuleConfig(moduleKey, isVisible, currentModule.is_sort_enabled);
      onClose();
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
          <h3 className="text-lg font-bold text-gray-900">Configuração do Botão</h3>
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
            Gerencie visibilidade e estado do botão <strong className="text-gray-800">{moduleName}</strong>.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isVisible ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                  {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Exibição no FrontEnd</span>
                  <span className={`text-xs ${isVisible ? 'text-green-600' : 'text-gray-500'}`}>
                    {isVisible ? 'Ativo para visitantes' : 'Inativo para visitantes'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsVisible(!isVisible)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isVisible ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label="Alternar exibição no frontend"
              >
                <span
                  className={`${
                    isVisible ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm`}
                />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Estado Atual dos Botões Configuráveis</h4>
              <div className="space-y-2">
                {modules.map((module) => (
                  <div key={module.key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{module.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        module.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                      )}>
                        {module.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        module.is_sort_enabled ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                      )}>
                        {module.is_sort_enabled ? 'Ordenação ON' : 'Ordenação OFF'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        #{module.order_position}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
