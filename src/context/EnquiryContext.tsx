import React, { createContext, useContext, useState } from 'react';

interface EnquiryContextType {
  isOpen: boolean;
  selectedProduct: string;
  openEnquiry: (productName?: string) => void;
  closeEnquiry: () => void;
}

const EnquiryContext = createContext<EnquiryContextType | undefined>(undefined);

export const EnquiryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');

  const openEnquiry = (productName?: string) => {
    setSelectedProduct(productName || '');
    setIsOpen(true);
  };

  const closeEnquiry = () => {
    setIsOpen(false);
  };

  return (
    <EnquiryContext.Provider value={{ isOpen, selectedProduct, openEnquiry, closeEnquiry }}>
      {children}
    </EnquiryContext.Provider>
  );
};

export const useEnquiry = () => {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error('useEnquiry must be used within an EnquiryProvider');
  }
  return context;
};
