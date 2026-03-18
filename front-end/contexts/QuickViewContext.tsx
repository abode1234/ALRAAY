'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { type Product } from '@/lib/api';
import ProductQuickView from '@/components/ProductQuickView';

interface QuickViewContextType {
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeQuickView = () => {
    setIsOpen(false);
    setSelectedProduct(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  return (
    <QuickViewContext.Provider value={{ openQuickView, closeQuickView }}>
      {children}
      <ProductQuickView
        product={selectedProduct}
        isOpen={isOpen}
        onClose={closeQuickView}
      />
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (context === undefined) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}
