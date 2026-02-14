import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Upload, X, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface MediaUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
  className?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  onUploadComplete, 
  multiple = false,
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compressImage = async (file: File) => {
    // Default options
    let options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp'
    };

    try {
      // Fetch global image settings
      const { data } = await supabase
        .from('site_settings')
        .select('image_settings')
        .single();

      if (data && data.image_settings) {
        const settings = data.image_settings as any;
        options = {
          maxSizeMB: (settings.target_size_kb || 500) / 1024,
          maxWidthOrHeight: settings.resize?.enabled ? Math.max(settings.resize.max_width, settings.resize.max_height) : undefined,
          useWebWorker: true,
          fileType: settings.output_formats?.[0] ? `image/${settings.output_formats[0]}` : 'image/webp'
        };
      }

      const compressedFile = await imageCompression(file, options);
      
      // Determine file extension based on MIME type
      let extension = file.name.split('.').pop();
      if (options.fileType === 'image/webp') extension = 'webp';
      else if (options.fileType === 'image/jpeg') extension = 'jpg';
      else if (options.fileType === 'image/png') extension = 'png';

      const newFileName = file.name.replace(/\.[^/.]+$/, "") + "." + extension;
      return new File([compressedFile], newFileName, { type: options.fileType });
    } catch (error) {
      console.error("Compression failed or settings fetch failed:", error);
      return file; // Fallback to original if compression fails
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setError(null);
    const uploadedUrls: string[] = [];

    try {
      for (const file of acceptedFiles) {
        // Compress image before upload
        const compressedFile = await compressImage(file);
        
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, compressedFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      onUploadComplete(uploadedUrls);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple,
    disabled: uploading
  });

  return (
    <div className={className}>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-gray-500">Otimizando e enviando...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-700 font-medium">
              {isDragActive ? 'Solte os arquivos aqui' : 'Clique ou arraste imagens aqui'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, WebP (Max 5MB)
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <X className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
