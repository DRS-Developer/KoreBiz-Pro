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
  sizes?: string; // Allow custom sizes override
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
  sizes: customSizes,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Resolve image source logic
  const managed = pageKey && role ? resolveManagedImage(pageKey, role, src) : null;
  
  // Initialize with fallback/src
  let webpSrc = managed ? managed.webp : undefined;
  let avifSrc = managed ? managed.avif : undefined;
  let originalSrc = managed ? managed.original : (src || '');
  let srcsets = managed ? managed.srcset : undefined;

  // If NOT managed (i.e. just a direct src prop)
  if (!managed) {
    const r: ImageRole = role || 'card';
    
    // Check if we have a valid source
    if (src && src.length > 0) {
        // It's a valid URL (internal or external)
        originalSrc = src;
    } else {
        // No source provided, use default placeholder
        const def = resolveDefaultImageByRole(r);
        webpSrc = def.webp;
        avifSrc = def.avif;
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

  // Determine sizes dynamically or use fallback
  const fallbackSizes = role === 'hero' 
    ? '100vw' 
    : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  const effectiveSizes = customSizes || fallbackSizes;

  // Handle Preload injection for priority images
  useEffect(() => {
    if (priority && originalSrc && typeof document !== 'undefined') {
      // Create a unique identifier for this specific preload to avoid DOM duplication
      const preloadId = `preload-${btoa(originalSrc).replace(/[/+=]/g, '').substring(0, 16)}`;
      
      // Check if preload already exists by our ID or exact href
      const existingPreload = document.getElementById(preloadId) || 
                              document.querySelector(`link[rel="preload"][href="${originalSrc}"]`);
                              
      if (!existingPreload) {
        const link = document.createElement('link');
        link.id = preloadId;
        link.rel = 'preload';
        link.as = 'image';
        
        // Let the browser decide the format based on the srcset and Accept headers
        // Just provide the srcset variants. If CF is used, only 'original' exists and the CDN auto-formats.
        // If Supabase is used, we give preference to avif/webp if available in the srcset.
        if (srcsets?.avif) {
          link.setAttribute('imagesrcset', srcsets.avif);
          link.setAttribute('imagesizes', effectiveSizes);
        } else if (srcsets?.webp) {
          link.setAttribute('imagesrcset', srcsets.webp);
          link.setAttribute('imagesizes', effectiveSizes);
        } else if (srcsets?.original) {
          link.setAttribute('imagesrcset', srcsets.original);
          link.setAttribute('imagesizes', effectiveSizes);
        } else {
          // Fallback if no srcset is available
          link.href = originalSrc;
        }

        document.head.appendChild(link);
      }
    }
  }, [priority, originalSrc, srcsets, effectiveSizes]);

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

  // Render Low Quality Image Placeholder (LQIP) Blur if not loaded and not priority
  const blurStyle = !shouldShow && !priority && managed && originalSrc.includes('render/image')
    ? { backgroundImage: `url(${originalSrc}&blur=50)`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

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

  const renderImage = () => {
    const commonImgProps = {
      ref: imgRef,
      src: originalSrc,
      alt: alt,
      className: clsx(
        "w-full h-full object-cover text-transparent", 
        enableTransition && "transition-opacity duration-300",
        shouldShow ? "opacity-100" : "opacity-0"
      ),
      loading: priority ? "eager" : "lazy" as any,
      // 'async' is generally safer and recommended even for LCP in modern browsers,
      // as it prevents the main thread from blocking entirely while decoding large images,
      // avoiding TBT (Total Blocking Time) penalties, while eager/fetchpriority handle the network speed.
      decoding: priority ? "async" : "async" as any,
      // Tell browser this is a high priority resource (for HTTP/2+ prioritization)
      fetchPriority: priority ? "high" : "auto" as any,
      onError: handleError,
      onLoad: handleLoad,
      ...props
    };

    if (avifSrc || webpSrc || srcsets) {
      return (
        <picture>
          {srcsets?.avif && <source srcSet={srcsets.avif} sizes={effectiveSizes} type="image/avif" />}
          {avifSrc && !srcsets?.avif && <source srcSet={avifSrc} type="image/avif" />}
          
          {srcsets?.webp && <source srcSet={srcsets.webp} sizes={effectiveSizes} type="image/webp" />}
          {webpSrc && !srcsets?.webp && <source srcSet={webpSrc} type="image/webp" />}
          
          {srcsets?.original && <source srcSet={srcsets.original} sizes={effectiveSizes} />}
          
          <img {...commonImgProps} />
        </picture>
      );
    }

    return <img {...commonImgProps} />;
  };

  return (
    <div 
      className={clsx("overflow-hidden relative h-full w-full", className)}
      style={blurStyle}
    >
      {!shouldShow && !blurStyle && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {renderImage()}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
