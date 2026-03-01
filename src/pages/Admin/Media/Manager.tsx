import React from 'react';
import MediaManagerComponent from '../../../components/Admin/Media/MediaManager';

const MediaManagerPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciador de Mídia</h1>
        <p className="text-gray-600">Organize e gerencie todas as imagens do site.</p>
      </div>
      
      <div className="flex-1 min-h-0">
        <MediaManagerComponent className="h-full" />
      </div>
    </div>
  );
};

export default MediaManagerPage;
