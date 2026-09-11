import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn } from 'lucide-react';
import { useImageViewer } from '../../context/ImageViewerContext';

interface ProductGalleryProps {
  mainImage: string;
  title: string;
  secondaryImages?: string[];
  specsImage?: string;
  cadImage?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  mainImage,
  title,
  secondaryImages,
  specsImage,
  cadImage,
}) => {
  const [activeImage, setActiveImage] = useState<string>(mainImage);
  const { openImageViewer } = useImageViewer();

  useEffect(() => {
    setActiveImage(mainImage);
  }, [mainImage]);

  const hasMultipleMedia = !!(secondaryImages?.length || specsImage || cadImage);

  const handleOpenViewer = () => {
    openImageViewer({
      src: activeImage,
      title: title,
      category: "Technical Inspection",
      description: `High-resolution factory view of ${title}. Traceable dimensional accuracy and OEM build standards.`,
      badge: "Inspection Standard"
    });
  };

  return (
    <div className="space-y-4">
      {/* Primary Display */}
      <div 
        onClick={handleOpenViewer}
        className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex items-center justify-center min-h-[400px] shadow-sm relative group overflow-hidden cursor-pointer"
        title="Click to view full-resolution image"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenViewer();
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={title}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="max-h-[360px] max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </AnimatePresence>
        <div className="absolute top-4 left-4 z-10">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-industrial-dark text-white">
            Factory Verified
          </span>
        </div>

        {/* Hover / Touch Inspect Badge */}
        <div className="absolute bottom-4 right-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/85 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700/80 group-hover:bg-industrial-primary transition-colors">
            <ZoomIn className="w-3.5 h-3.5 text-sky-400 group-hover:text-white" />
            <span>Click to Inspect</span>
          </span>
        </div>
      </div>

      {/* Thumbnails Navigation */}
      {hasMultipleMedia && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2" role="region" aria-label="Product image thumbnails">
          <button
            type="button"
            onClick={() => setActiveImage(mainImage)}
            className={`relative w-16 h-16 rounded-xl border p-1 shrink-0 bg-slate-50 overflow-hidden transition-all ${
              activeImage === mainImage ? 'border-industrial-primary' : 'border-slate-200 hover:border-slate-400'
            }`}
            aria-label="Main view thumbnail"
          >
            <img src={mainImage} alt={`${title} main view`} className="w-full h-full object-contain" />
            {activeImage === mainImage && (
              <motion.div
                layoutId="activeThumbRing"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 rounded-xl ring-2 ring-industrial-primary pointer-events-none"
              />
            )}
          </button>

          {secondaryImages?.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImage(img)}
              className={`relative w-16 h-16 rounded-xl border p-1 shrink-0 bg-slate-50 overflow-hidden transition-all ${
                activeImage === img ? 'border-industrial-primary' : 'border-slate-200 hover:border-slate-400'
              }`}
              aria-label={`Secondary view ${i + 1}`}
            >
              <img src={img} alt={`${title} secondary view ${i + 1}`} className="w-full h-full object-contain" />
              {activeImage === img && (
                <motion.div
                  layoutId="activeThumbRing"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 rounded-xl ring-2 ring-industrial-primary pointer-events-none"
                />
              )}
            </button>
          ))}

          {cadImage && (
            <button
              type="button"
              onClick={() => setActiveImage(cadImage)}
              className={`relative w-16 h-16 rounded-xl border p-1 shrink-0 bg-white overflow-hidden transition-all ${
                activeImage === cadImage ? 'border-industrial-primary' : 'border-slate-200 hover:border-slate-400'
              }`}
              aria-label="CAD model thumbnail"
              title="CAD Model View"
            >
              <img src={cadImage} alt={`${title} CAD view`} className="w-full h-full object-contain" />
              {activeImage === cadImage && (
                <motion.div
                  layoutId="activeThumbRing"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 rounded-xl ring-2 ring-industrial-primary pointer-events-none"
                />
              )}
            </button>
          )}

          {specsImage && (
            <button
              type="button"
              onClick={() => setActiveImage(specsImage)}
              className={`relative w-16 h-16 rounded-xl border p-1 shrink-0 bg-white overflow-hidden transition-all ${
                activeImage === specsImage ? 'border-industrial-primary' : 'border-slate-200 hover:border-slate-400'
              }`}
              aria-label="Specifications chart thumbnail"
              title="PPT Specifications Chart"
            >
              <img src={specsImage} alt={`${title} specs chart`} className="w-full h-full object-contain" />
              {activeImage === specsImage && (
                <motion.div
                  layoutId="activeThumbRing"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 rounded-xl ring-2 ring-industrial-primary pointer-events-none"
                />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
