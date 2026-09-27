import React, { useEffect, useState } from 'react';
import { Modal, Button, Chip } from '@heroui/react';
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

  if (!isOpen || !imageDetails) return null;

  const handleEnquiry = () => {
    closeImageViewer();
    openEnquiry(imageDetails.title);
  };

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeImageViewer();
        }
      }}
      variant="blur"
      isDismissable
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <Modal.Container size="cover" scroll="inside" className="w-full h-full max-h-screen p-0 m-0">
        <Modal.Dialog
          className="bg-slate-950/95 border border-slate-800 text-white w-full h-full flex flex-col justify-between p-0 shadow-2xl overflow-hidden focus:outline-none rounded-none"
          aria-label={`Image preview: ${imageDetails.title}`}
          aria-labelledby="image-viewer-title"
        >
          {/* Top Header Bar */}
          <Modal.Header className="relative z-10 w-full px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {imageDetails.category && (
                <Chip
                  variant="secondary"
                  size="sm"
                  className="px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-industrial-primary/30 text-sky-300 border border-sky-400/30 shrink-0"
                >
                  {imageDetails.category}
                </Chip>
              )}
              <Modal.Heading
                id="image-viewer-title"
                className="text-xs sm:text-sm font-bold text-white truncate font-heading"
              >
                {imageDetails.title}
              </Modal.Heading>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Zoom Toggle Button using HeroUI Button */}
              <Button
                variant="secondary"
                size="sm"
                onPress={() => setIsZoomed(!isZoomed)}
                className="p-2 min-h-[36px] rounded-lg bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 text-xs flex items-center gap-1.5 border border-slate-700/60 cursor-pointer"
                aria-label={isZoomed ? 'Reset zoom' : 'Zoom in'}
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
              </Button>

              {/* Close Button using HeroUI Modal.CloseTrigger */}
              <Modal.CloseTrigger
                onPress={closeImageViewer}
                className="p-2 min-h-[36px] rounded-lg bg-slate-800/90 text-slate-300 hover:text-white hover:bg-rose-500/80 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 border border-slate-700/60 cursor-pointer inline-flex items-center justify-center"
                aria-label="Close image viewer"
              >
                <X className="w-5 h-5" />
              </Modal.CloseTrigger>
            </div>
          </Modal.Header>

          {/* Center Image Canvas */}
          <Modal.Body
            className={`relative z-10 flex-1 w-full flex items-center justify-center p-4 sm:p-8 overflow-auto ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => {
              if (isZoomed) {
                setIsZoomed(false);
              }
            }}
          >
            <div
              className={`relative flex items-center justify-center transition-transform duration-300 ${
                isZoomed ? 'scale-125 sm:scale-150' : 'scale-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsZoomed(!isZoomed);
                }
              }}
              title={isZoomed ? 'Click to reset zoom (100%)' : 'Click to zoom in (150%)'}
              aria-label={isZoomed ? 'Zoomed image. Click to zoom out.' : 'Image preview. Click to zoom in.'}
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
            </div>
          </Modal.Body>

          {/* Bottom Action Drawer using HeroUI Modal.Footer */}
          <Modal.Footer className="relative z-10 w-full px-4 sm:px-6 py-3.5 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
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

              <Button
                variant="primary"
                onPress={handleEnquiry}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-industrial-primary hover:bg-sky-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-200" />
                <span>Request Enquiry</span>
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
