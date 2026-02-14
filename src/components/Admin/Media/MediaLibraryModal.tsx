import React from 'react';
import { X } from 'lucide-react';
import MediaManager from './MediaManager';
import { MediaFile, MediaFolder } from '../../../types/media';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  initialFolder?: MediaFolder;
}

const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialFolder = 'all'
}) => {
  if (!isOpen) return null;

  const handleSelect = (file: MediaFile) => {
    onSelect(file.url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">Biblioteca de Mídia</h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <MediaManager 
            onSelect={handleSelect} 
            initialFolder={initialFolder}
            className="h-full border-0 rounded-none shadow-none"
          />
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryModal;
