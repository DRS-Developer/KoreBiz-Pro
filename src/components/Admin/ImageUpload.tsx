import React, { useState, useRef, useMemo } from 'react';
import { Upload, X, Loader2, Edit2, FolderOpen, ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import MediaLibraryModal from './Media/MediaLibraryModal';
import { MediaFolder } from '../../types/media';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { resolveManagedImage } from '../../utils/imageManager';
import type { PageKey, ImageRole } from '../../config/imageProfiles';

interface ImageUploadProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  error?: string;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  description?: string; // Instructions for the user
  pageKey?: PageKey;
  role?: ImageRole;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Imagem',
  value,
  onChange,
  folder = 'media',
  error,
  aspectRatio = 16 / 9,
  minWidth = 800,
  minHeight = 450,
  description,
  pageKey,
  role
}) => {
  const { settings } = useSiteSettings();
  const [uploading, setUploading] = useState(false);
  
  // Get default image if no value is present
  const defaultImageSrc = useMemo(() => {
    if (value) return null;
    if (pageKey && role) {
      const managed = resolveManagedImage(pageKey, role, undefined);
      return managed.original;
    }
    return null;
  }, [value, pageKey, role]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (selectedImageSrc && selectedImageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImageSrc);
      }
    };
  }, [selectedImageSrc]);

  // Helper to determine the media folder context
  const getMediaFolder = (folderName: string): MediaFolder => {
    if (folderName.includes('services')) return 'services';
    if (folderName.includes('portfolio')) return 'portfolio';
    if (folderName.includes('pages')) return 'pages';
    if (folderName.includes('partners')) return 'partners';
    return 'general';
  };

  // Calculate active resize config based on settings and folder context
  const activeResizeConfig = useMemo(() => {
    if (!settings?.image_settings) return null;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imgSettings = settings.image_settings as any;
    const context = getMediaFolder(folder);
    
    // 1. Try context-specific config
    const contextConfig = imgSettings.contexts?.[context];
    if (contextConfig && contextConfig.enabled) {
        return {
            width: contextConfig.max_width,
            height: contextConfig.max_height,
            quality: imgSettings.global?.quality || 80,
            source: 'context'
        };
    }

    // 2. Try global config (new structure)
    if (imgSettings.global && imgSettings.global.enabled) {
        return {
            width: imgSettings.global.max_width,
            height: imgSettings.global.max_height,
            quality: imgSettings.global.quality || 80,
            source: 'global'
        };
    }

    // 3. Try legacy config
    if (imgSettings.resize && imgSettings.resize.enabled) {
        return {
            width: imgSettings.resize.max_width,
            height: imgSettings.resize.max_height,
            quality: imgSettings.compression_level || 80,
            source: 'legacy'
        };
    }

    return null;
  }, [settings, folder]);

  const handleEditExisting = async () => {
    if (!value) return;
    setSelectedImageSrc(value);
    setEditorOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Por favor, selecione um arquivo de imagem válido (JPEG, PNG, WebP, GIF ou AVIF).');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('A imagem é muito grande. O limite é de 10MB.');
      event.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedImageSrc(objectUrl);
    setEditorOpen(true);
    event.target.value = '';
  };

  const handleEditorSave = async (blob: Blob) => {
    try {
        setEditorOpen(false);
        setUploading(true);

        if (selectedImageSrc) {
            URL.revokeObjectURL(selectedImageSrc);
            setSelectedImageSrc(null);
        }
        
        await uploadImages(blob);
    } catch (err) {
        console.error("Failed to save edited image", err);
        toast.error("Falha ao salvar a imagem editada. Tente novamente.");
        setUploading(false);
    }
  };

  const handleEditorClose = () => {
    setEditorOpen(false);
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
      setSelectedImageSrc(null);
    }
  };

  // Add a small delay to ensure the component is loaded
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<any> | null>(null);
  const [isComponentLoaded, setIsComponentLoaded] = useState(false);
  
  React.useEffect(() => {
    let mounted = true;
    
    // Dynamically import the component to avoid reference errors
    const loadComponent = async () => {
        try {
            const module = await import('./ImageEditor/AdvancedImageEditorModal');
            if (mounted) {
                setEditorComponent(() => module.default);
                setIsComponentLoaded(true);
            }
        } catch (err) {
            console.error("Failed to load AdvancedImageEditorModal", err);
        }
    };
    
    loadComponent();

    return () => {
        mounted = false;
    };
  }, []);

  const uploadImages = async (imageBlob: Blob) => {
    try {
      setUploading(true);
      
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      const fileName = `${timestamp}_${randomId}`;
      let optimizedFile: File;
      let isOptimizationSkipped = false;

      // Determine optimization parameters
      const quality = (activeResizeConfig?.quality || 80) / 100;
      const maxWidthOrHeight = activeResizeConfig ? Math.max(activeResizeConfig.width, activeResizeConfig.height) : 1920;

      // Check optimization criteria
      if (imageBlob.size <= 200 * 1024 && (imageBlob.type === 'image/webp' || imageBlob.type === 'image/jpeg')) {
          // It's small enough, check dimensions
          try {
              const dimensions = await new Promise<{width: number, height: number}>((resolve, reject) => {
                  const img = new Image();
                  const objectUrl = URL.createObjectURL(imageBlob);
                  img.onload = () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve({ width: img.width, height: img.height });
                  };
                  img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Failed to load image for dimension check'));
                  };
                  img.src = objectUrl;
              });
              
              if (dimensions.width <= maxWidthOrHeight && dimensions.height <= maxWidthOrHeight) {
                  console.log('Image is already optimized. Skipping compression.');
                  isOptimizationSkipped = true;
                  optimizedFile = new File([imageBlob], `${fileName}.${imageBlob.type.split('/')[1]}`, { type: imageBlob.type });
              }
          } catch (e) {
              console.warn('Failed to check image dimensions, proceeding with optimization.', e);
          }
      }

      if (!isOptimizationSkipped) {
          // 1. Prepare Optimized Version (WebP)
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: maxWidthOrHeight,
            useWebWorker: true,
            fileType: 'image/webp' as any,
            initialQuality: quality,
            preserveExif: (settings?.image_settings as any)?.metadata?.keep_exif || false,
          };
          
          try {
            const compressedBlob = await imageCompression(imageBlob as File, options);
            optimizedFile = new File([compressedBlob], `${fileName}.webp`, { type: 'image/webp' });
          } catch (error) {
            console.error('Optimization failed, falling back to original format', error);
            const extension = imageBlob.type.split('/')[1] || 'jpg';
            optimizedFile = new File([imageBlob], `${fileName}.${extension}`, { type: imageBlob.type });
          }
      }

      const cleanFolder = folder.replace(/\/+$/, '').replace(/^\/+/, '');
      const extension = optimizedFile!.type.split('/')[1] || 'webp';
      const optimizedPath = `${cleanFolder}/${fileName}_opt.${extension}`;
      const highResPath = `${cleanFolder}/${fileName}_original.${imageBlob.type.split('/')[1] || 'jpg'}`;

      // Upload Optimized
      const { error: uploadErrorOpt } = await supabase.storage
        .from('media') 
        .upload(optimizedPath, optimizedFile!, {
          contentType: optimizedFile!.type,
          upsert: true
        }); 

      if (uploadErrorOpt) {
        console.error('Supabase upload error (optimized):', uploadErrorOpt);
        throw new Error(`Falha no upload da imagem otimizada: ${uploadErrorOpt.message}`);
      }

      // Upload High Res (Original Blob) - Always backup original
      const { error: uploadErrorHigh } = await supabase.storage
        .from('media') 
        .upload(highResPath, imageBlob, {
          contentType: imageBlob.type,
          upsert: true
        }); 

      if (uploadErrorHigh) {
        console.warn('Failed to upload high-res version', uploadErrorHigh);
      }

      // Get Public URL
      const { data } = supabase.storage
        .from('media') 
        .getPublicUrl(optimizedPath); 

      const publicUrl = data.publicUrl;

      // Register in Media Library
      try {
        const dimensions = await new Promise<{width: number, height: number}>((resolve) => {
           const img = new Image();
           const objectUrl = URL.createObjectURL(optimizedFile!);
           img.onload = () => {
             URL.revokeObjectURL(objectUrl);
             resolve({ width: img.width, height: img.height });
           };
           img.src = objectUrl;
        });

        const mediaData = {
          filename: optimizedFile!.name,
          url: publicUrl,
          size: optimizedFile!.size,
          width: dimensions.width,
          height: dimensions.height,
          mime_type: optimizedFile!.type,
          folder: getMediaFolder(folder)
        };

        const { error: dbError } = await supabase.from('media_files').insert(mediaData as any);

        if (dbError) throw dbError;
      } catch (err) {
        console.error('Failed to register in media library:', err);
        // We don't throw here to not block the main flow if only the library registration fails
      }

      onChange(publicUrl);
      toast.success(isOptimizationSkipped ? 'Imagem enviada!' : 'Imagem processada e enviada com sucesso!');

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Erro ao processar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="flex gap-2 items-center flex-wrap justify-end">
            {activeResizeConfig && (
                 <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 whitespace-nowrap" title={`Configuração ativa: ${activeResizeConfig.source}`}>
                    Redim: {activeResizeConfig.width}x{activeResizeConfig.height}px (Q{activeResizeConfig.quality})
                </span>
            )}
            {description && (
            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                {description}
            </span>
            )}
            <button
                type="button"
                onClick={() => setMediaModalOpen(true)}
                className="text-xs text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
            >
                <FolderOpen size={14} />
                Biblioteca
            </button>
        </div>
      </div>
      
      <div className={`border-2 border-dashed rounded-lg p-4 ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
      }`}>
        {value ? (
          <div className="relative group max-w-md mx-auto">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full max-h-64 object-contain rounded-md bg-white shadow-sm"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-md flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleEditExisting}
                className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                title="Editar imagem"
              >
                <Edit2 size={20} />
              </button>
              <button
                type="button"
                onClick={() => setMediaModalOpen(true)}
                className="bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                title="Trocar pela Biblioteca"
              >
                <FolderOpen size={20} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-600 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                title="Fazer Upload de Nova"
              >
                <Upload size={20} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                title="Remover imagem"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : defaultImageSrc ? (
          <div className="relative group max-w-md mx-auto">
             <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold shadow-sm z-10 border border-yellow-200 flex items-center gap-1">
               <ImageIcon size={12} />
               Padrão do Sistema
             </div>
             
             <img 
               src={defaultImageSrc} 
               alt="Preview Padrão" 
               className="w-full max-h-64 object-contain rounded-md bg-white shadow-sm opacity-80 grayscale-[30%]"
             />
             
             <div className="absolute inset-0 bg-black/5 hover:bg-black/10 transition-colors rounded-md flex flex-col items-center justify-center gap-4">
                 <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setMediaModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full shadow-md hover:bg-gray-50 transition-colors font-medium text-sm"
                        title="Selecionar da Biblioteca"
                    >
                        <FolderOpen size={18} className="text-indigo-600" />
                        Biblioteca
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition-colors font-medium text-sm"
                        title="Fazer Upload"
                    >
                        <Upload size={18} />
                        Upload
                    </button>
                 </div>
                 <p className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
                    {minWidth}x{minHeight}px (Proporção {aspectRatio}:1)
                 </p>
             </div>
             
             {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 rounded-md">
                     <div className="flex flex-col items-center">
                        <Loader2 className="text-blue-500 mb-2 animate-spin" size={32} />
                        <p className="text-sm text-gray-500 font-medium">Processando...</p>
                     </div>
                </div>
            )}
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-48 cursor-pointer relative"
          >
            <div className="flex gap-4 mb-4 z-10">
                <button
                    type="button"
                    onClick={() => setMediaModalOpen(true)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg text-gray-500"
                >
                    <FolderOpen size={24} />
                    <span className="text-xs font-medium">Biblioteca</span>
                </button>
                <div className="w-px bg-gray-300 h-12 self-center"></div>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg text-gray-500"
                >
                    <Upload size={24} />
                    <span className="text-xs font-medium">Upload</span>
                </button>
            </div>
            
            {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                     <div className="flex flex-col items-center">
                        <Loader2 className="text-blue-500 mb-2" size={32} />
                        <p className="text-sm text-gray-500 font-medium">Processando...</p>
                     </div>
                </div>
            )}
            
            <p className="text-xs text-gray-400 mt-2">
               {minWidth}x{minHeight}px (Proporção {aspectRatio}:1)
            </p>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {error && (
        <span className="text-red-500 text-sm mt-1">{error}</span>
      )}

      {editorOpen && selectedImageSrc && isComponentLoaded && EditorComponent && (
        <EditorComponent
          imageSrc={selectedImageSrc}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
          aspectRatio={aspectRatio}
          minWidth={minWidth}
          minHeight={minHeight}
        />
      )}
      
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(url) => {
            onChange(url);
            setMediaModalOpen(false);
        }}
        initialFolder={getMediaFolder(folder)}
      />
    </div>
  );
};

export default ImageUpload;
