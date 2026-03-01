import React, { useCallback, useEffect, useState, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface CarouselProps {
  children: React.ReactNode;
  options?: any;
  className?: string;
  slideClassName?: string;
  slidesToShow?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
}

const DEFAULT_OPTIONS = { loop: true, align: 'start' };

const Carousel: React.FC<CarouselProps> = ({ 
  children, 
  options = DEFAULT_OPTIONS, 
  className,
  slideClassName,
  autoplay = true,
  autoplaySpeed = 4000
}) => {
  const plugins = useMemo(() => {
    const p = [];
    if (autoplay) {
      p.push(Autoplay({ delay: autoplaySpeed, stopOnInteraction: false }));
    }
    return p;
  }, [autoplay, autoplaySpeed]);

  // Merge options with default stable reference if needed, but if user passes options, they should be stable too.
  // Ideally, we trust the caller, but if they pass undefined, we use DEFAULT_OPTIONS.
  // However, useEmblaCarousel compares deeply so a new object with same content might be fine? 
  // Embla documentation says "Embla Carousel will re-initialize when the options or plugins change."
  // It does shallow comparison for options object reference? Or deep? 
  // It's safer to memoize it.
  
  const stableOptions = useMemo(() => options, [JSON.stringify(options)]);

  const [emblaRef, emblaApi] = useEmblaCarousel(stableOptions, plugins);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(true);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Calculate flex-basis based on slidesToShow
  // Default to 100% on mobile, 50% on tablet, and 100/slidesToShow% on desktop
  // This logic is usually handled by CSS classes passed to slideClassName, but we can help here
  
  return (
    <div className={clsx("relative group", className)}>
      <div className="overflow-hidden px-1" ref={emblaRef}>
        <div className="flex -ml-4 touch-pan-y py-4">
          {React.Children.map(children, (child) => (
            <div className={clsx("pl-4 flex-none", slideClassName)}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className={clsx(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 text-blue-900 transition-all opacity-0 group-hover:opacity-100 z-10 hover:bg-blue-50 focus:outline-none border border-gray-100",
          !prevBtnEnabled && "hidden"
        )}
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className={clsx(
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 text-blue-900 transition-all opacity-0 group-hover:opacity-100 z-10 hover:bg-blue-50 focus:outline-none border border-gray-100",
          !nextBtnEnabled && "hidden"
        )}
        onClick={scrollNext}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default Carousel;
