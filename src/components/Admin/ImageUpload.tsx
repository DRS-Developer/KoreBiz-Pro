import React, { useState, useRef, useMemo } from 'react';
import { Upload, X, Loader2, Edit2, FolderOpen, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import MediaLibraryModal from './Media/MediaLibraryModal';
import { MediaFolder } from '../../types/media';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { resolveManagedImage } from '../../utils/imageManager';
import type { PageKey, ImageRole } from '../../config/imageProfiles';
import { uploadImage, deleteImage } from '../../services/storage/storageService';
import { mapMediaFolderToStorageFolder, resolveMediaFolderFromOrigin } from '../../services/storage/mediaFolderMapping';
import type { ImageValidationRules } from '../../services/storage/validations';

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

const DEFAULT_ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const FORMAT_TO_MIME: Record<string, string> = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  avif: 'image/avif',
};

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

  const resolvedMediaFolder: MediaFolder = resolveMediaFolderFromOrigin(folder);

  const outputFormats = useMemo(() => {
    const imageSettings = settings?.image_settings as any;
    const formats = imageSettings?.output_formats;
    if (!Array.isArray(formats) || !formats.length) return ['webp', 'jpeg'];
    return formats.map((item: string) => String(item).toLowerCase());
  }, [settings]);

  const allowedImageTypes = useMemo(() => {
    const mapped = outputFormats.map((format) => FORMAT_TO_MIME[format]).filter(Boolean);
    if (!mapped.length) return DEFAULT_ALLOWED_IMAGE_TYPES;
    return Array.from(new Set([...DEFAULT_ALLOWED_IMAGE_TYPES, ...mapped]));
  }, [outputFormats]);

  const maxUploadSizeMB = useMemo(() => {
    const imageSettings = settings?.image_settings as any;
    const configured = Number(imageSettings?.max_upload_size_mb);
    if (!Number.isFinite(configured) || configured <= 0) return 10;
    return configured;
  }, [settings]);

  // Calculate active resize config based on settings and folder context
  const activeResizeConfig = useMemo(() => {
    if (!settings?.image_settings) return null;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imgSettings = settings.image_settings as any;
    const context = resolvedMediaFolder;
    
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

  const activeValidationRules = useMemo<ImageValidationRules>(() => ({
    minWidth,
    minHeight,
    maxWidth: activeResizeConfig?.width,
    maxHeight: activeResizeConfig?.height,
    aspectRatio,
    minSizeMB: 0.01,
    maxSizeMB: maxUploadSizeMB,
    allowedTypes: allowedImageTypes,
  }), [activeResizeConfig, allowedImageTypes, aspectRatio, maxUploadSizeMB, minHeight, minWidth]);

  const handleEditExisting = async () => {
    if (!value) return;
    setSelectedImageSrc(value);
    setEditorOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!allowedImageTypes.includes(file.type)) {
      toast.error(`Formato inválido. Formatos aceitos: ${allowedImageTypes.map((type) => type.replace('image/', '')).join(', ')}.`);
      event.target.value = '';
      return;
    }

    if (file.size > maxUploadSizeMB * 1024 * 1024) {
      toast.error(`A imagem excede o limite de ${maxUploadSizeMB}MB.`);
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

  const getBlobDimensions = async (blob: Blob): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      img.src = objectUrl;
    });
  };

  const preferredOutputFormat = useMemo(() => {
    if (outputFormats.includes('webp')) return 'webp';
    if (outputFormats.includes('jpeg') || outputFormats.includes('jpg')) return 'jpeg';
    if (outputFormats.includes('png')) return 'png';
    if (outputFormats.includes('avif')) return 'avif';
    return 'webp';
  }, [outputFormats]);

  const preferredOutputMime = FORMAT_TO_MIME[preferredOutputFormat] || 'image/webp';

  const uploadImages = async (imageBlob: Blob) => {
    try {
      setUploading(true);
      
      let optimizedFile: File;
      let isOptimizationSkipped = false;
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      const fileName = `${timestamp}_${randomId}`;

      // Determine optimization parameters
      const quality = (activeResizeConfig?.quality || 80) / 100;
      const maxWidthOrHeight = activeResizeConfig ? Math.max(activeResizeConfig.width, activeResizeConfig.height) : 1920;
      const inputDimensions = await getBlobDimensions(imageBlob);

      // Check optimization criteria
      if (imageBlob.size <= 200 * 1024 && (imageBlob.type === 'image/webp' || imageBlob.type === 'image/jpeg')) {
          try {
              if (inputDimensions && inputDimensions.width <= maxWidthOrHeight && inputDimensions.height <= maxWidthOrHeight) {
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
            maxSizeMB: Math.max(0.2, Math.min(2, maxUploadSizeMB)),
            maxWidthOrHeight: maxWidthOrHeight,
            useWebWorker: true,
            fileType: preferredOutputMime as any,
            initialQuality: quality,
            preserveExif: (settings?.image_settings as any)?.metadata?.keep_exif || false,
          };
          
          try {
            const compressedBlob = await imageCompression(imageBlob as File, options);
            optimizedFile = new File([compressedBlob], `${fileName}.${preferredOutputFormat}`, { type: preferredOutputMime });
          } catch (error) {
            console.error('Optimization failed, falling back to original format', error);
            const extension = imageBlob.type.split('/')[1] || 'jpg';
            optimizedFile = new File([imageBlob], `${fileName}.${extension}`, { type: imageBlob.type });
          }
      }

      // --- NEW STORAGE SERVICE IMPLEMENTATION ---
      const targetFolder = mapMediaFolderToStorageFolder(resolvedMediaFolder);
      
      // Use the new storage service to upload (and handle old image deletion/backup)
      const result = await uploadImage(optimizedFile!, targetFolder, value || undefined, {
        validationRules: activeValidationRules,
        inputDimensions,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      const publicUrl = result.url;
      // ------------------------------------------

      onChange(publicUrl);
      toast.success(isOptimizationSkipped ? 'Imagem enviada!' : 'Imagem processada e enviada com sucesso!');

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Erro ao processar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (value) {
      // Opcional: Perguntar confirmação? 
      // Como é uma ação de UI rápida, melhor não bloquear, mas podemos deletar.
      // O usuário pediu "Delete: Quando uma imagem for excluída do sistema, ela deve ser automaticamente removida"
      
      try {
        setUploading(true);
        const success = await deleteImage(value);
        if (success) {
          toast.success('Imagem removida do armazenamento.');
        } else {
          // Se falhar (ex: já deletada), apenas loga e segue
          console.warn('Não foi possível remover o arquivo físico, ou ele não existia.');
        }
      } catch (e) {
        console.error('Erro ao tentar deletar imagem:', e);
      } finally {
        setUploading(false);
      }
    }
    onChange('');
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="flex gap-2 items-center">
             {activeResizeConfig && (
                 <span className="hidden sm:inline-flex text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 whitespace-nowrap" title={`Configuração ativa: ${activeResizeConfig.source}`}>
                    {activeResizeConfig.width}x{activeResizeConfig.height}px (Q{activeResizeConfig.quality})
                </span>
            )}
            <button
                type="button"
                onClick={() => setMediaModalOpen(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors font-medium"
            >
                <FolderOpen size={14} />
                Biblioteca
            </button>
        </div>
      </div>
      
      <div 
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 overflow-hidden group ${
            error 
            ? 'border-red-300 bg-red-50' 
            : value 
                ? 'border-indigo-200 bg-gray-50' 
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
      >
        {value ? (
          <div className="relative flex flex-col">
            <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={value} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
                
                {/* Actions Overlay - Always visible on mobile, hover on desktop */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={handleEditExisting}
                        className="flex flex-col items-center gap-2 text-white hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-2"
                        title="Editar Recorte e Filtros"
                        aria-label="Editar imagem atual"
                    >
                        <div className="bg-white/20 p-3 rounded-full hover:bg-blue-600 transition-colors shadow-lg">
                            <Edit2 size={20} />
                        </div>
                        <span className="text-xs font-semibold shadow-black/50 drop-shadow-md">Editar</span>
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-2 text-white hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-2"
                        title="Trocar Imagem por Upload"
                        aria-label="Fazer upload de nova imagem"
                    >
                        <div className="bg-white/20 p-3 rounded-full hover:bg-indigo-600 transition-colors shadow-lg">
                            <Upload size={20} />
                        </div>
                        <span className="text-xs font-semibold shadow-black/50 drop-shadow-md">Trocar</span>
                    </button>
                    
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="flex flex-col items-center gap-2 text-white hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-2"
                        title="Remover Imagem"
                        aria-label="Remover imagem atual"
                    >
                        <div className="bg-white/20 p-3 rounded-full hover:bg-red-600 transition-colors shadow-lg">
                            <X size={20} />
                        </div>
                        <span className="text-xs font-semibold shadow-black/50 drop-shadow-md">Remover</span>
                    </button>
                </div>
            </div>
            
            {/* Mobile Actions Bar (Visible only on small screens if needed, otherwise overlay works) */}
            {/* We can keep the overlay for consistency, but maybe add a permanent remove button on top right */}
            <button 
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-500 rounded-full shadow-sm hover:text-red-500 hover:bg-white md:hidden z-10"
            >
                <X size={16} />
            </button>
          </div>
        ) : defaultImageSrc ? (
           <div className="relative flex flex-col">
             <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded-full font-bold shadow-sm z-10 border border-amber-200 flex items-center gap-1">
               <ImageIcon size={12} />
               Padrão
             </div>
             
             <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden opacity-75 grayscale-[30%]">
                 <img 
                   src={defaultImageSrc} 
                   alt="Preview Padrão" 
                   className="w-full h-full object-contain"
                 />
                 
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] p-4 transition-all duration-300">
                 <div className="bg-white p-2 rounded-full shadow-md mb-3 ring-4 ring-white/50">
                    <ImageIcon size={24} className="text-gray-400" aria-hidden="true" />
                 </div>
                 <div className="flex gap-3 justify-center w-full max-w-[90%]">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl hover:scale-105 transition-all font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 flex-1 sm:flex-none"
                        title="Fazer upload de uma nova imagem"
                        aria-label="Fazer upload de imagem"
                    >
                        <Upload size={18} />
                        <span className="whitespace-nowrap">Upload</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMediaModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl hover:scale-105 transition-all font-semibold text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 flex-1 sm:flex-none"
                        title="Selecionar imagem da biblioteca existente"
                        aria-label="Selecionar da biblioteca"
                    >
                        <FolderOpen size={18} className="text-indigo-600" />
                        <span className="whitespace-nowrap">Biblioteca</span>
                    </button>
                 </div>
             </div>
             </div>
           </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center py-10 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="bg-indigo-50 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
                <Upload size={28} className="text-indigo-500" />
            </div>
            
            <p className="text-sm font-medium text-gray-700 mb-1 text-center">
                Clique para fazer upload ou arraste
            </p>
            <p className="text-xs text-gray-500 mb-4 text-center">
                {allowedImageTypes.map((type) => type.replace('image/', '').toUpperCase()).join(', ')} (máx. {maxUploadSizeMB}MB)
            </p>
            
            <div className="flex items-center gap-3 w-full max-w-xs">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">ou</span>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setMediaModalOpen(true);
                }}
                className="mt-4 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline"
            >
                <FolderOpen size={14} />
                Selecionar da biblioteca
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {uploading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 transition-opacity duration-300">
                <Loader2 className="text-indigo-600 mb-3 animate-spin" size={40} />
                <p className="text-sm font-medium text-gray-700">Processando imagem...</p>
                <p className="text-xs text-gray-500 mt-1">Otimizando e enviando</p>
            </div>
        )}
        
        {/* Footer Info */}
        <div className="bg-gray-50 border-t border-gray-100 px-3 py-2 flex justify-between items-center text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Recomendado: {minWidth}x{minHeight}px ({aspectRatio.toFixed(2)}:1)
            </span>
            {description && (
                <span className="hidden sm:block text-gray-400 truncate max-w-[50%]" title={description}>
                    {description}
                </span>
            )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={allowedImageTypes.join(',')}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 bg-red-50 px-3 py-2 rounded-md text-sm animate-in fade-in slide-in-from-top-1">
            <div className="min-w-[4px] h-4 bg-red-500 rounded-full"></div>
            {error}
        </div>
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
        initialFolder={resolvedMediaFolder}
      />
    </div>
  );
};

export default ImageUpload;
