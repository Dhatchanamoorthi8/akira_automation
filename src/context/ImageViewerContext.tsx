import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ImageDetails {
  src: string;
  title: string;
  category?: string;
  description?: string;
  productSlug?: string;
  badge?: string;
}

interface ImageViewerContextType {
  isOpen: boolean;
  imageDetails: ImageDetails | null;
  openImageViewer: (details: ImageDetails) => void;
  closeImageViewer: () => void;
}

const ImageViewerContext = createContext<ImageViewerContextType | undefined>(undefined);

export const ImageViewerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);

  const openImageViewer = useCallback((details: ImageDetails) => {
    setImageDetails(details);
    setIsOpen(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ImageViewerContext.Provider value={{ isOpen, imageDetails, openImageViewer, closeImageViewer }}>
      {children}
    </ImageViewerContext.Provider>
  );
};

export const useImageViewer = () => {
  const context = useContext(ImageViewerContext);
  if (!context) {
    throw new Error('useImageViewer must be used within an ImageViewerProvider');
  }
  return context;
};
