import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { MediaFile, MediaFolder } from '../../../types/media';
import { Upload, Search, Folder, Image as ImageIcon, Grid, List as ListIcon, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import MediaPreviewModal from './MediaPreviewModal';
import { checkMediaUsage, MediaUsage, normalizeUrl } from '../../../utils/mediaUsage';
import { mediaRepository } from '../../../repositories/MediaRepository';

interface MediaManagerProps {
  onSelect?: (file: MediaFile) => void;
  initialFolder?: MediaFolder;
  className?: string;
}

const MediaManager: React.FC<MediaManagerProps> = ({ 
  onSelect, 
  initialFolder = 'all',
  className = ''
}) => {
  type UsageOriginFilter = 'all' | MediaUsage['type'];
  const [selectedFolder, setSelectedFolder] = useState<MediaFolder>(initialFolder);
  
  const [files, setFiles] = useState<MediaFile[]>([]);

  // State definitions that were missing
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnused, setFilterUnused] = useState(false);
  const [usageOrigin, setUsageOrigin] = useState<UsageOriginFilter>('all');
  const [usageMap, setUsageMap] = useState<Record<string, MediaUsage[]>>({});
  const [usageLoading, setUsageLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  // Fetch usage
  const fetchUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const map = await checkMediaUsage();
      setUsageMap(map);
    } catch (err) {
      console.error('Error fetching usage:', err);
    } finally {
      setUsageLoading(false);
    }
  }, []);

  // Fetch files using Repository Pattern
  const fetchFiles = useCallback(async () => {
    try {
      const { data, error } = await mediaRepository.getAll();

      if (error) throw error;
      
      if (data) {
        setFiles(data);
      }

    } catch (error) {
      console.error('Error loading media:', error);
      toast.error('Erro ao carregar mídia');
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Upload Logic
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      const folderToUse = selectedFolder === 'all' ? 'general' : selectedFolder;

      for (const file of acceptedFiles) {
        // Compress
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options);
        
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${folderToUse}/${fileName}`;
        
        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        // 2. Get Metadata (dimensions)
        const dimensions = await new Promise<{width: number, height: number}>((resolve) => {
           const img = new Image();
           img.onload = () => resolve({ width: img.width, height: img.height });
           img.src = URL.createObjectURL(compressedFile);
        });

        // 3. Insert into DB
        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            filename: file.name,
            url: publicUrl,
            size: compressedFile.size,
            width: dimensions.width,
            height: dimensions.height,
            mime_type: compressedFile.type,
            folder: folderToUse
          });

        if (dbError) throw dbError;
      }
      
      toast.success('Upload concluído!');
      fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
      await fetchUsage();
  }, [selectedFolder, fetchFiles, fetchUsage]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: uploading
  });

  // Delete
  const handleDelete = async (file: MediaFile) => {
    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      const path = (() => {
        const marker = '/storage/v1/object/public/media/';
        const idx = file.url.indexOf(marker);
        if (idx === -1) return `${file.folder}/${file.filename}`;
        return decodeURIComponent(file.url.substring(idx + marker.length));
      })();
      
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([path]);

      if (storageError) console.warn('Storage delete error:', storageError); // Non-blocking

      toast.success('Imagem excluída');
      
      // Update local state immediately
      const newFiles = files.filter(f => f.id !== file.id);
      setFiles(newFiles);
      await fetchUsage();
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erro ao excluir imagem');
    }
  };

  // Filter logic (Client-side is fast enough for < 1000 items)
  const filteredFiles = files.filter(file => {
    const usageEntries = usageMap[normalizeUrl(file.url)] || [];
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnused = filterUnused ? usageEntries.length === 0 : true;
    const matchesOrigin = usageOrigin === 'all'
      ? true
      : usageEntries.some((usage) => usage.type === usageOrigin);
    return matchesFolder && matchesSearch && matchesUnused && matchesOrigin;
  });

  const folders: { id: MediaFolder; label: string; icon: any }[] = [
    { id: 'all', label: 'Todas as Mídias', icon: Grid },
    { id: 'general', label: 'Geral', icon: Folder },
    { id: 'services', label: 'Serviços', icon: Folder },
    { id: 'portfolio', label: 'Portfólio', icon: Folder },
    { id: 'pages', label: 'Páginas', icon: Folder },
    { id: 'settings', label: 'Configurações', icon: Folder },
    { id: 'partners', label: 'Parceiros', icon: Folder },
  ];

  const usageOriginOptions: { value: UsageOriginFilter; label: string }[] = [
    { value: 'all', label: 'Todas as origens' },
    { value: 'service', label: 'Serviços' },
    { value: 'portfolio', label: 'Portfólio' },
    { value: 'page', label: 'Páginas' },
    { value: 'setting', label: 'Configurações' },
    { value: 'partner', label: 'Parceiros' },
    { value: 'profile', label: 'Usuários' },
    { value: 'home', label: 'Home' },
    { value: 'practice_area', label: 'Áreas de Atuação' },
    { value: 'area', label: 'Áreas (legado)' },
  ];

  return (
    <div className={`flex h-[calc(100vh-100px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      
      {/* Sidebar Folders */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">Biblioteca</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {folders.map(folder => (
            <button
              key={folder.id}
              type="button"
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                selectedFolder === folder.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <folder.icon size={18} />
              {folder.label}
              {/* Count bubble? Would need separate query or aggregation */}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-white">
           <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
             <input 
               type="checkbox" 
               checked={filterUnused}
               onChange={e => setFilterUnused(e.target.checked)}
               disabled={usageLoading}
               className="rounded text-blue-600 focus:ring-blue-500"
             />
             {usageLoading ? 'Verificando uso...' : 'Mostrar apenas não usadas'}
           </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar imagens..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={usageOrigin}
              onChange={(e) => setUsageOrigin(e.target.value as UsageOriginFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {usageOriginOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>

          <div {...getRootProps()} className="flex items-center">
            <input {...getInputProps()} />
            <button 
              type="button"
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              <Upload size={18} />
              Upload
            </button>
          </div>
        </div>

        {/* File Grid/List */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ImageIcon size={48} className="mb-4 text-gray-300" />
              <p>Nenhuma imagem encontrada</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredFiles.map(file => {
                const usageCount = usageMap[normalizeUrl(file.url)]?.length || 0;
                const isUsed = usageCount > 0;
                return (
                  <div  
                    key={file.id} 
                    className="group relative aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                    onClick={() => onSelect ? onSelect(file) : setPreviewFile(file)}
                  >
                    <img 
                      src={file.url} 
                      alt={file.filename} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Tags overlay */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className={`${isUsed ? 'bg-green-500/90 text-white' : 'bg-black/60 text-white'} text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm`}>
                        Usado: {usageCount}
                      </span>
                    </div>


                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Arquivo</th>
                    <th className="px-4 py-3 font-medium">Dimensões</th>
                    <th className="px-4 py-3 font-medium">Tamanho</th>
                    <th className="px-4 py-3 font-medium">Uso</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFiles.map(file => {
                    const usageCount = usageMap[normalizeUrl(file.url)]?.length || 0;
                    const isUsed = usageCount > 0;
                    return (
                      <tr key={file.id} className="hover:bg-gray-50 group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={file.url} alt="" className="w-10 h-10 rounded object-cover border border-gray-200" />
                            <span className="font-medium text-gray-900 truncate max-w-[200px]">{file.filename}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {file.width ? `${file.width} x ${file.height}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {(file.size / 1024).toFixed(1)} KB
                        </td>
                        <td className="px-4 py-3">
                          {isUsed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                              <Check size={12} />
                              Em uso ({usageCount})
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Usado: 0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(file.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                            {onSelect ? (
                              <button 
                                type="button"
                                onClick={() => onSelect(file)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Selecionar"
                              >
                                <Check size={16} />
                              </button>
                            ) : (
                                <button 
                                  type="button"
                                  onClick={() => setPreviewFile(file)}
                                  className="p-1.5 text-gray-500 rounded"
                                  title="Ver detalhes"
                                >
                                  <Search size={16} />
                                </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <MediaPreviewModal 
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onDelete={handleDelete}
        usage={previewFile ? usageMap[normalizeUrl(previewFile.url)] : undefined}
      />
    </div>
  );
};

export default MediaManager;
