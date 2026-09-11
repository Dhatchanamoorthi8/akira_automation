import React from 'react';
import { ProductSummary } from '../../types';
import { ProductCard } from '../common/ProductCard';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { StaggerContainer } from '../animation/StaggerContainer';
import { StaggerItem } from '../animation/StaggerItem';

interface RelatedProductsProps {
  products: ProductSummary[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  if (products.length === 0) return null;

  return (
    <SectionReveal className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="industrial-container">
        <Reveal direction="up" className="mb-8">
          <span className="section-tag">
            Complementary Metrology Systems
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-industrial-dark mt-2">
            Related Precision Gauges & Displays
          </h2>
          <p className="text-xs text-industrial-muted mt-1">
            Engineered to partner with this system for complete shop-floor quality inspection.
          </p>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} variant="default" />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </SectionReveal>
  );
};
