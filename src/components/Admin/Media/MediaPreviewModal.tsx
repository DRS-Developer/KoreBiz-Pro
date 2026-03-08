import React, { useState } from 'react';
import { X, Copy, Trash2, ExternalLink, Calendar, HardDrive, FileType, CheckCircle } from 'lucide-react';
import { MediaFile } from '../../../types/media';
import { MediaUsage } from '../../../utils/mediaUsage';
import { toast } from 'sonner';
import ConfirmationModal from '../ConfirmationModal';

interface MediaPreviewModalProps {
  file: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (file: MediaFile) => void;
  usage?: MediaUsage[];
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onDelete,
  usage
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen || !file) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(file.url);
    toast.success('URL copiada para a área de transferência');
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onDelete(file);
    setShowConfirmDelete(false);
    onClose();
  };

  const getDeleteMessage = () => {
    if (usage && usage.length > 0) {
      return `Esta imagem está sendo usada em ${usage.length} locais. Excluí-la pode quebrar o layout das páginas onde ela é utilizada. Tem certeza que deseja continuar?`;
    }
    return 'Tem certeza que deseja excluir esta imagem permanentemente? Esta ação não pode ser desfeita.';
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        
        {/* Close Button Mobile */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white md:hidden"
        >
          <X size={20} />
        </button>

        {/* Image Preview Area */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 relative min-h-[300px] md:min-h-full">
            <img 
              src={file.url} 
              alt={file.filename} 
              className="max-w-full max-h-[80vh] object-contain shadow-lg rounded"
            />
        </div>

        {/* Sidebar Info */}
        <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto">
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 break-all pr-4">{file.filename}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 hidden md:block">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1">
            {/* Quick Actions */}
            <div className="flex gap-3">
               <button 
                 type="button"
                 onClick={handleCopyUrl}
                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
               >
                 <Copy size={16} />
                 Copiar URL
               </button>
               <a 
                 href={file.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
               >
                 <ExternalLink size={16} />
                 Abrir
               </a>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <HardDrive size={14} />
                  <span className="text-xs font-medium">Tamanho</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatSize(file.size)}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <FileType size={14} />
                  <span className="text-xs font-medium">Tipo</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate" title={file.mime_type}>
                  {file.mime_type}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <div className="w-3.5 h-3.5 border-2 border-gray-400 rounded-sm" />
                  <span className="text-xs font-medium">Dimensões</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {file.width && file.height ? `${file.width} x ${file.height}` : '-'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar size={14} />
                  <span className="text-xs font-medium">Data</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Usage Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-500" />
                Uso em {usage?.length || 0} locais
              </h4>
              
              {usage && usage.length > 0 ? (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {usage.map((u, idx) => (
                    <div key={idx} className="flex flex-col text-sm">
                      <span className="font-medium text-blue-900">{u.title || 'Sem título'}</span>
                      <span className="text-xs text-blue-700 capitalize">
                        {u.type === 'service' && 'Serviço'}
                        {u.type === 'portfolio' && 'Portfólio'}
                        {u.type === 'page' && 'Página'}
                        {u.type === 'setting' && 'Configuração'}
                        {u.type === 'partner' && 'Parceiro'}
                        {u.type === 'profile' && 'Usuário'}
                        {u.type === 'home' && 'Home'}
                        {u.type === 'practice_area' && 'Área de Atuação'}
                        {u.type === 'area' && 'Área (legado)'}
                         {' • '} Campo: {u.field}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">Esta imagem não parece estar sendo usada.</p>
                 </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
             <button 
               type="button"
               onClick={handleDeleteClick}
               className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-medium"
             >
               <Trash2 size={16} />
               Excluir Permanentemente
             </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmationModal
      isOpen={showConfirmDelete}
      onConfirm={handleConfirmDelete}
      onCancel={() => setShowConfirmDelete(false)}
      title="Excluir Imagem"
      description={getDeleteMessage()}
      confirmText="Sim, excluir"
      cancelText="Cancelar"
      variant="danger"
    />
    </>
  );
};

export default MediaPreviewModal;
