import React from 'react';
import FilerobotImageEditor, { TABS, TOOLS } from 'react-filerobot-image-editor';

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
  aspectRatio = 1.6,
  minWidth = 800,
  minHeight = 500,
}) => {
  if (typeof window !== 'undefined') {
    (window as any).React = React;
  }

  const dataUrlToBlob = (dataUrl: string): Blob | null => {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch?.[1] || 'image/webp';
    const binary = atob(parts[1]);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  };

  const handleSave = async (savedImageData: any) => {
    if (savedImageData?.imageCanvas) {
      const blob = await new Promise<Blob | null>((resolve) => {
        savedImageData.imageCanvas.toBlob((value: Blob | null) => resolve(value), 'image/webp', 0.9);
      });
      if (blob) {
        onSave(blob);
        return;
      }
    }
    if (savedImageData?.imageBase64) {
      const blob = dataUrlToBlob(savedImageData.imageBase64);
      if (blob) onSave(blob);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-[1400px] max-h-[920px] bg-white rounded-xl overflow-hidden shadow-2xl">
        <FilerobotImageEditor
          source={imageSrc}
          onClose={onClose}
          onSave={handleSave}
          closeAfterSave
          language="pt"
          previewPixelRatio={window.devicePixelRatio || 1}
          savingPixelRatio={window.devicePixelRatio || 1}
          defaultSavedImageType="webp"
          defaultSavedImageQuality={0.9}
          defaultTabId={TABS.ADJUST}
          defaultToolId={TOOLS.CROP}
          tabsIds={[TABS.ADJUST, TABS.FILTERS, TABS.FINETUNE, TABS.RESIZE]}
          Crop={{
            ratio: aspectRatio,
            minWidth,
            minHeight,
            autoResize: true,
          }}
          Rotate={{
            angle: 90,
            componentType: 'buttons',
          }}
        />
      </div>
    </div>
  );
};

export default AdvancedImageEditorModal;
