import React, { useState, useRef } from 'react';
import { Cropper, CropperRef } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { Check, Smartphone, Monitor, Sliders, RotateCw } from 'lucide-react';
import { THEME_COLORS } from '../../../constants/themeColors';

interface AdvancedImageEditorModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (blob: Blob) => void;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
}

const AdvancedImageEditorModal: React.FC<AdvancedImageEditorModalProps> = ({
  imageSrc,
  onClose,
  onSave,
  aspectRatio = 1.6, // Default 1.6 (800x500)
  minWidth = 800,
  minHeight = 500,
}) => {
  const cropperRef = useRef<CropperRef>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters to canvas before saving
  const onSaveClick = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas({
        width: minWidth,
        height: minHeight,
      });

      if (canvas) {
        // Create a new canvas to apply filters
        const filterCanvas = document.createElement('canvas');
        filterCanvas.width = canvas.width;
        filterCanvas.height = canvas.height;
        const ctx = filterCanvas.getContext('2d');

        if (ctx) {
          // Apply filters
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
          
          // Draw the cropped image onto the new canvas with filters
          ctx.drawImage(canvas, 0, 0);

          filterCanvas.toBlob((blob) => {
            if (blob) {
              onSave(blob);
            }
          }, 'image/webp', 0.9); // Save as WebP 90%
        }
      }
    }
  };

  const rotateImage = () => {
     setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
      {/* Toolbar Superior */}
      <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-bold text-lg">Editor Avançado</h3>
          <div className="h-6 w-px bg-gray-700 mx-2"></div>
          
          {/* Device Toggles */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded ${
                previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
              title="Preview Desktop (Corte Original)"
            >
              <Monitor size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded ${
                previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
              title="Simular Mobile (Safe Zone Central)"
            >
              <Smartphone size={18} />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-700 mx-2"></div>

          {/* Tools */}
           <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded ${
                showFilters ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
              title="Ajustes de Imagem"
            >
              <Sliders size={18} />
            </button>
             <button
              type="button"
              onClick={rotateImage}
              className="p-2 rounded text-gray-400"
              title="Rotacionar 90°"
            >
              <RotateCw size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSaveClick}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            <Check size={18} />
            Salvar Corte
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Área do Cropper */}
        <div className="flex-1 relative bg-black flex items-center justify-center p-8">
            <Cropper
            ref={cropperRef}
            src={imageSrc}
            className={'cropper-editor'}
            stencilProps={{
                aspectRatio: aspectRatio,
                grid: true,
            }}
            backgroundWrapperProps={{
                scaleImage: false,
                moveImage: true,
            }}
            transformImage={{
                adjustStencil: true,
            }}
            // @ts-ignore
            rotate={rotation}
            style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
            }}
            // Rotate needs to be handled via props if supported or external CSS transform on container? 
            // react-advanced-cropper supports rotation via prop
            />
            {/* We need to use the prop for rotation to ensure crop logic works */}
        
            {/* Mobile Safe Zone Overlay (Simulada) */}
            {previewMode === 'mobile' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div 
                className="border-2 border-yellow-400 border-opacity-50 bg-yellow-400 bg-opacity-10"
                style={{
                    width: '30%', // Simula que apenas o centro 30-50% será visto no mobile vertical
                    height: '100%'
                }}
                >
                <div className="absolute top-2 left-2 text-yellow-400 text-xs font-bold bg-black bg-opacity-50 px-1 rounded">
                    Mobile Safe Zone
                </div>
                </div>
            </div>
            )}
        </div>

        {/* Sidebar de Filtros */}
        {showFilters && (
            <div className="w-64 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Sliders size={16} /> Ajustes
                </h4>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs text-gray-400">Brilho</label>
                            <span className="text-xs text-gray-500">{brightness}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="200" 
                            value={brightness} 
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                         <div className="flex justify-between mb-1">
                            <label className="text-xs text-gray-400">Contraste</label>
                            <span className="text-xs text-gray-500">{contrast}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="200" 
                            value={contrast} 
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                         <div className="flex justify-between mb-1">
                            <label className="text-xs text-gray-400">Saturação</label>
                            <span className="text-xs text-gray-500">{saturation}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="200" 
                            value={saturation} 
                            onChange={(e) => setSaturation(Number(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                        <button 
                            type="button"
                            onClick={() => {
                                setBrightness(100);
                                setContrast(100);
                                setSaturation(100);
                                setRotation(0);
                            }}
                            className="w-full py-2 text-xs text-red-400 border border-red-900/50 rounded"
                        >
                            Resetar Ajustes
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="h-10 bg-gray-900 border-t border-gray-800 flex items-center justify-center text-xs text-gray-500">
        Resolução Alvo: {minWidth}x{minHeight}px (Ratio: {aspectRatio.toFixed(3)})
      </div>

      <style>{`
        .cropper-editor {
          height: 100%;
          width: 100%;
        }
        /* Apply filters to the image inside cropper via CSS class if simpler, 
           but inline style on Cropper wrapper or specific image class is better */
        .cropper-editor .advanced-cropper-image {
             filter: brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%);
             /* transform is handled by the library's rotate prop usually, 
                but we are managing it manually or need to pass it to the lib */
        }
        .advanced-cropper-stencil-grid {
          opacity: 0.6;
        }
        /* Custom Range Slider Styling */
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: ${THEME_COLORS.primary.blue500};
            cursor: pointer;
            margin-top: -4px;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: ${THEME_COLORS.gray.sliderTrack};
            border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default AdvancedImageEditorModal;
