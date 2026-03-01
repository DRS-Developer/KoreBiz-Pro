import React, { useState, memo, useRef, useLayoutEffect, useEffect } from 'react';
import { clsx } from 'clsx';
import { ImageOff } from 'lucide-react';
import { resolveManagedImage, resolveDefaultImageByRole } from '../utils/imageManager';
import type { PageKey, ImageRole } from '../config/imageProfiles';

// Global cache to track loaded image URLs across component mounts
// This prevents the "fade-in" effect from re-running when the same image is displayed again
const globalImageCache = new Set<string>();

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  priority?: boolean;
  effect?: string; // Kept for compatibility but ignored
  pageKey?: PageKey;
  role?: ImageRole;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({ 
  className, 
  alt, 
  fallbackSrc, 
  src, 
  priority = false, 
  effect,
  pageKey,
  role,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Resolve image source logic
  const managed = pageKey && role ? resolveManagedImage(pageKey, role, src) : null;
  
  // Initialize with fallback/src
  let webpSrc = managed ? managed.webp : undefined;
  let originalSrc = managed ? managed.original : (src || '');

  // If NOT managed (i.e. just a direct src prop)
  if (!managed) {
    const r: ImageRole = role || 'card';
    
    // Check if we have a valid source
    if (src && src.length > 0) {
        // It's a valid URL (internal or external)
        originalSrc = src;
        // If it happens to be Supabase, we could generate WebP, but let's keep it simple for now
        // to avoid "Sem Imagem" flicker on external URLs.
    } else {
        // No source provided, use default placeholder
        const def = resolveDefaultImageByRole(r);
        webpSrc = def.webp;
        originalSrc = def.original;
    }
  }

  // Initialize loaded state based on global cache
  const [isLoaded, setIsLoaded] = useState(() => {
    return !!originalSrc && globalImageCache.has(originalSrc);
  });
  
  // We use a ref to track if we've already set loaded to true to avoid re-renders
  const hasLoadedRef = useRef(isLoaded);

  // Sync state with prop changes if needed
  useEffect(() => {
     setHasError(false); // Reset error state on src change
     
     if (originalSrc && globalImageCache.has(originalSrc)) {
         if (!isLoaded) {
             setIsLoaded(true);
             hasLoadedRef.current = true;
         }
     } else {
         // Reset only if not in cache and not currently loaded
         // (But if we just mounted, isLoaded covers it)
         if (isLoaded && !globalImageCache.has(originalSrc)) {
             setIsLoaded(false);
             hasLoadedRef.current = false;
         }
     }
  }, [originalSrc]);

  // Use layout effect to check cache status before paint (browser cache check)
  useLayoutEffect(() => {
    if (imgRef.current?.complete) {
      if (originalSrc) globalImageCache.add(originalSrc);
      setIsLoaded(true);
      hasLoadedRef.current = true;
    }
  }, [originalSrc]);

  const handleError = () => {
    setHasError(true);
  };

  const handleLoad = () => {
    if (originalSrc) globalImageCache.add(originalSrc);
    if (!hasLoadedRef.current) {
      setIsLoaded(true);
      hasLoadedRef.current = true;
    }
  };

  // If priority is true, we force loaded state visually immediately
  // If isLoaded is true (from global cache), we show immediately
  const shouldShow = isLoaded;
  
  // Disable transition if we detected it's already loaded (cache) or priority
  // hasLoadedRef.current is initialized from global cache, so this works on first render
  const enableTransition = !priority && !hasLoadedRef.current;

  if (hasError) {
    return (
      <div className={clsx("overflow-hidden bg-gray-100 flex items-center justify-center h-full w-full", className)}>
        {fallbackSrc ? (
           <img 
             src={fallbackSrc} 
             alt={alt} 
             className="w-full h-full object-cover"
             loading={priority ? "eager" : "lazy"}
             decoding={priority ? "sync" : "async"}
           />
        ) : (
           <div className="flex flex-col items-center justify-center text-gray-400 p-4 w-full h-full">
             <ImageOff size={32} className="mb-2" />
             <span className="text-xs text-center">Imagem indisponível</span>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className={clsx("overflow-hidden relative h-full w-full", className)}>
      {!shouldShow && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {webpSrc ? (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            ref={imgRef}
            src={originalSrc}
            alt={alt}
            className={clsx(
              "w-full h-full object-cover text-transparent", 
              enableTransition && "transition-opacity duration-300",
              shouldShow ? "opacity-100" : "opacity-0"
            )}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            onError={handleError}
            onLoad={handleLoad}
            {...props}
          />
        </picture>
      ) : (
        <img
          ref={imgRef}
          src={originalSrc}
          alt={alt}
          className={clsx(
            "w-full h-full object-cover text-transparent", 
            enableTransition && "transition-opacity duration-300",
            shouldShow ? "opacity-100" : "opacity-0"
          )}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
