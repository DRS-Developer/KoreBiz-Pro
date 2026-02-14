import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { X, Check, ZoomIn, Sun, Contrast, Droplet, RotateCw, Maximize, Minimize } from 'lucide-react';
import getCroppedImg from '../../utils/imageUtils';
import BackgroundControls, { BackgroundConfig } from './ImageEditor/BackgroundControls';

interface ImageEditorModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (blob: Blob) => void;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  imageSrc,
  onClose,
  onSave,
  aspectRatio = 16 / 9,
  minWidth = 800,
  minHeight = 600,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  // New States
  const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('cover');
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>({ 
    type: 'solid', 
    color: '#ffffff' 
  });

  // Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const [imageMetadata, setImageMetadata] = useState<{width: number, height: number, size?: number, format?: string} | null>(null);

  // Load image metadata and set initial zoom/fit to prevent stretching
  React.useEffect(() => {
    if (!imageSrc) return;
    
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        setImageMetadata({
            width: img.width,
            height: img.height,
        });

        // Smart fit logic:
        // If the image is smaller than the required dimensions, default to 'contain' (Ajustar) 
        // to prevent initial stretching/blurriness in 'cover' mode.
        if (img.width < minWidth || img.height < minHeight) {
            setObjectFit('contain');
        } else {
            // Otherwise default to cover for standard cropping experience
            setObjectFit('cover');
        }
    };
  }, [imageSrc, minWidth, minHeight]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      if (!croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        { horizontal: false, vertical: false },
        { brightness, contrast, saturation },
        backgroundConfig,
        objectFit
      );

      if (croppedImage) {
        onSave(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col md:flex-row">
      {/* Editor Area */}
      <div className="relative flex-1 h-64 md:h-full bg-black overflow-hidden">
        {/* Background Layer for Contain Mode Preview */}
        {objectFit === 'contain' && (
           <div 
             className="absolute inset-0 z-0 pointer-events-none"
             style={{ 
               backgroundColor: backgroundConfig.type === 'solid' ? backgroundConfig.color : '#000',
               // Center the "canvas" visually if needed, but easy-crop takes full space
             }} 
           />
        )}
        
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          objectFit={objectFit === 'contain' ? 'contain' : 'cover'} // Use easy-crop's objectFit
          style={{
            containerStyle: {
                backgroundColor: objectFit === 'contain' ? backgroundConfig.color : '#000000',
            },
            mediaStyle: {
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
            }
          }}
        />
      </div>

      {/* Controls Sidebar */}
      <div className="w-full md:w-80 bg-gray-900 p-6 text-white overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Editar Imagem</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Fit Mode Toggle */}
          <div className="flex bg-gray-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                  setObjectFit('cover');
                  setZoom(1); // Reset zoom usually helps
              }}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-colors ${
                objectFit === 'cover' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Maximize size={16} className="mr-2" /> Preencher
            </button>
            <button
              type="button"
              onClick={() => {
                  setObjectFit('contain');
                  setZoom(1);
              }}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-colors ${
                objectFit === 'contain' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Minimize size={16} className="mr-2" /> Ajustar
            </button>
          </div>

          {/* Background Controls (Only in Contain Mode) */}
          {objectFit === 'contain' && (
            <div className="bg-gray-800 p-4 rounded-lg">
                <BackgroundControls 
                    config={backgroundConfig} 
                    onChange={setBackgroundConfig} 
                />
            </div>
          )}

          {/* Zoom */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <ZoomIn size={16} className="mr-2" /> Zoom
            </label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Rotation */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <RotateCw size={16} className="mr-2" /> Rotação
            </label>
            <input
              type="range"
              value={rotation}
              min={0}
              max={360}
              step={1}
              aria-labelledby="Rotation"
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="border-t border-gray-800 my-4"></div>

          {/* Filters */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <Sun size={16} className="mr-2" /> Brilho ({brightness}%)
            </label>
            <input
              type="range"
              value={brightness}
              min={0}
              max={200}
              step={1}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <Contrast size={16} className="mr-2" /> Contraste ({contrast}%)
            </label>
            <input
              type="range"
              value={contrast}
              min={0}
              max={200}
              step={1}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <Droplet size={16} className="mr-2" /> Saturação ({saturation}%)
            </label>
            <input
              type="range"
              value={saturation}
              min={0}
              max={200}
              step={1}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="pt-4 space-y-3">
            <div className="bg-gray-800 p-3 rounded text-xs text-gray-400">
              <p className="font-semibold mb-1">Requisitos:</p>
              <p>Min: {minWidth} x {minHeight} px</p>
              <p>Proporção: {aspectRatio}:1</p>
              {imageMetadata && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="font-semibold mb-1">Original:</p>
                      <p>{imageMetadata.width} x {imageMetadata.height} px</p>
                      {imageMetadata.width < minWidth || imageMetadata.height < minHeight ? (
                          <p className="text-yellow-500 mt-1 flex items-center">
                              <span className="mr-1">⚠️</span> Baixa Resolução
                          </p>
                      ) : (
                         <p className="text-green-500 mt-1 flex items-center">
                              <span className="mr-1">✅</span> Alta Resolução
                          </p>
                      )}
                  </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              <Check size={20} className="mr-2" /> Confirmar e Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;
