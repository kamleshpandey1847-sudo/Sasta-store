import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductImageSliderProps {
  images: string[];
  alt: string;
  className?: string;
  aspectRatio?: string;
  onImageClick?: (index: number) => void;
  showDots?: boolean;
  showBadge?: boolean;
  showArrows?: boolean;
  zoomOverlay?: boolean;
  badgeContent?: React.ReactNode;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80";

export const ProductImageSlider: React.FC<ProductImageSliderProps> = ({
  images,
  alt,
  className = "",
  aspectRatio = "aspect-square",
  onImageClick,
  showDots = true,
  showBadge = true,
  showArrows = true,
  zoomOverlay = false,
  badgeContent,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const imageList = Array.isArray(images) && images.length > 0 ? images : [FALLBACK_IMAGE];
  const totalImages = imageList.length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || e.changedTouches.length === 0) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        // Swipe left -> next image
        setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
      } else {
        // Swipe right -> prev image
        setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
      }
    }
    setTouchStartX(null);
  };

  const currentImage = imageList[currentIndex] || FALLBACK_IMAGE;

  return (
    <div
      className={`relative ${aspectRatio} w-full overflow-hidden bg-slate-100 dark:bg-slate-800 group/slider ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => onImageClick && onImageClick(currentIndex)}
    >
      {/* Main Image */}
      <img
        key={currentIndex}
        src={currentImage}
        alt={`${alt} - Image ${currentIndex + 1}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* Optional Zoom Overlay Icon */}
      {zoomOverlay && (
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs p-2 rounded-full shadow-md">
            <ZoomIn className="w-5 h-5 text-slate-800 dark:text-slate-100" />
          </div>
        </div>
      )}

      {/* Custom badge at top left */}
      {badgeContent && (
        <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
          {badgeContent}
        </div>
      )}

      {/* Navigation Arrows for Multiple Images */}
      {showArrows && totalImages > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 dark:bg-slate-800/80 hover:bg-slate-900 dark:hover:bg-slate-700 text-white cursor-pointer backdrop-blur-xs transition-all opacity-0 group-hover/slider:opacity-100 focus:opacity-100 z-20 shadow-md"
            aria-label="Previous image"
            title="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 dark:bg-slate-800/80 hover:bg-slate-900 dark:hover:bg-slate-700 text-white cursor-pointer backdrop-blur-xs transition-all opacity-0 group-hover/slider:opacity-100 focus:opacity-100 z-20 shadow-md"
            aria-label="Next image"
            title="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Image Counter Badge (e.g., 1 / 3) */}
      {showBadge && totalImages > 1 && (
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-900/70 text-white text-[10px] font-mono font-bold backdrop-blur-xs z-20 shadow-xs pointer-events-none">
          {currentIndex + 1}/{totalImages}
        </div>
      )}

      {/* Pagination Dots at Bottom Center */}
      {showDots && totalImages > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs px-2 py-1 rounded-full">
          {imageList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleDotClick(e, idx)}
              className={`transition-all rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-4 h-1.5 bg-emerald-400 dark:bg-emerald-400'
                  : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
