import React, { useState } from 'react';
import { LazyLoadImage, LazyLoadImageProps } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { clsx } from 'clsx';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps extends LazyLoadImageProps {
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ className, alt, fallbackSrc, src, priority, ...props }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={clsx("overflow-hidden bg-gray-100 flex items-center justify-center", className)}>
        {fallbackSrc ? (
           <img src={fallbackSrc} alt={alt} className="w-full h-full object-cover" />
        ) : (
           <div className="flex flex-col items-center justify-center text-gray-400 p-4">
             <ImageOff size={32} className="mb-2" />
             <span className="text-xs text-center">Imagem indisponível</span>
           </div>
        )}
      </div>
    );
  }

  if (priority) {
    return (
      <div className={clsx("overflow-hidden", className)}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={clsx("overflow-hidden", className)}>
      <LazyLoadImage
        alt={alt}
        src={src}
        effect="blur"
        className="w-full h-full object-cover"
        wrapperClassName="w-full h-full block"
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
