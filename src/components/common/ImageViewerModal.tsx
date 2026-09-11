import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, ArrowRight, Sliders, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useImageViewer } from '../../context/ImageViewerContext';
import { useEnquiry } from '../../context/EnquiryContext';

export const ImageViewerModal: React.FC = () => {
  const { isOpen, imageDetails, closeImageViewer } = useImageViewer();
  const { openEnquiry } = useEnquiry();
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset zoom state when modal opens/closes or image changes
  useEffect(() => {
    setIsZoomed(false);
  }, [imageDetails, isOpen]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeImageViewer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeImageViewer]);

  if (!isOpen || !imageDetails) return null;

  const handleEnquiry = () => {
    closeImageViewer();
    openEnquiry(imageDetails.title);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[70] flex flex-col justify-between overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`Image preview: ${imageDetails.title}`}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
          onClick={closeImageViewer}
          aria-hidden="true"
        />

        {/* Top Header Bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full px-4 sm:px-6 py-3.5 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {imageDetails.category && (
              <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-industrial-primary/30 text-sky-300 border border-sky-400/30 shrink-0">
                {imageDetails.category}
              </span>
            )}
            <h3 className="text-xs sm:text-sm font-bold text-white truncate font-heading">
              {imageDetails.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Zoom Toggle Button */}
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 text-xs flex items-center gap-1.5"
              title={isZoomed ? "Reset zoom (100%)" : "Zoom in (150%)"}
              aria-label={isZoomed ? "Reset zoom" : "Zoom in"}
            >
              {isZoomed ? (
                <>
                  <ZoomOut className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline font-mono text-[11px]">100%</span>
                </>
              ) : (
                <>
                  <ZoomIn className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline font-mono text-[11px]">150%</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeImageViewer}
              className="p-2 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white hover:bg-rose-500/80 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
              title="Close viewer (Esc)"
              aria-label="Close image viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.header>

        {/* Center Image Canvas */}
        <div 
          className="relative z-10 flex-1 w-full flex items-center justify-center p-4 sm:p-8 overflow-auto cursor-zoom-in"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: isZoomed ? 1.45 : 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`relative flex items-center justify-center transition-transform duration-300 ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
          >
            <img
              src={imageDetails.src}
              alt={imageDetails.title}
              className="max-h-[58vh] sm:max-h-[68vh] max-w-[92vw] sm:max-w-[80vw] object-contain rounded-xl border border-slate-700/60 shadow-2xl select-none"
              loading="eager"
            />
            
            {imageDetails.badge && (
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700 backdrop-blur-md text-[10px] font-mono text-sky-300 flex items-center gap-1.5 shadow-md pointer-events-none">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>{imageDetails.badge}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Action Drawer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full px-4 sm:px-6 py-3.5 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <div className="text-center sm:text-left min-w-0 flex-1">
            {imageDetails.description ? (
              <p className="text-xs text-slate-300 line-clamp-2 max-w-2xl leading-relaxed">
                {imageDetails.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                High-precision metrology tooling engineered strictly to automotive OEM standards.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-center">
            {imageDetails.productSlug && (
              <Link
                to={`/products/${imageDetails.productSlug}`}
                onClick={closeImageViewer}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-all"
              >
                <span>Full Specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              type="button"
              onClick={handleEnquiry}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-industrial-primary hover:bg-sky-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-200" />
              <span>Request Enquiry</span>
            </button>
          </div>
        </motion.footer>
      </div>
    </AnimatePresence>
  );
};
