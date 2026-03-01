import React from 'react';
import { clsx } from 'clsx';
import { THEME_COLORS, OPACITY } from '../constants/themeColors';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
}

// Helper para converter hex para rgba se necessário, mas aqui vamos construir a string
// baseada nos valores conhecidos para garantir fidelidade absoluta sem runtime overhead complexo
const getOverlayColor = () => {
  // THEME_COLORS.primary.blue900 is #1E3A8A -> rgb(30, 58, 138)
  // OPACITY.pageHeaderOverlay is 0.9
  return `rgba(30, 58, 138, ${OPACITY.pageHeaderOverlay})`;
};

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  className,
  backgroundImage,
  children
}) => {
  const overlayColor = getOverlayColor();

  return (
    <div 
      className={clsx(
        "bg-blue-900 text-white relative overflow-hidden flex flex-col justify-center min-h-[112px]", // Reduced min-height by 30% from 160px
        className
      )}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: THEME_COLORS.primary.blue900 // Fallback
      } : undefined}
    >
      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col justify-center">
        {children && (
          <div className="mb-4">
            {children}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-blue-100 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
