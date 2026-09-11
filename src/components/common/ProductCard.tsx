import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, ArrowRight } from 'lucide-react';
import { ProductSummary } from '../../types';
import { useEnquiry } from '../../context/EnquiryContext';
import { SpotlightCard } from '../animation/SpotlightCard';

interface ProductCardProps {
  product: ProductSummary;
  variant?: 'default' | 'featured';
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  className = '',
}) => {
  const { openEnquiry } = useEnquiry();
  const highlightCount = variant === 'featured' ? 2 : 3;
  const HeadingTag = variant === 'featured' ? 'h3' : 'h2';

  return (
    <SpotlightCard
      className={`card-base card-hover overflow-hidden flex flex-col justify-between group border-slate-200 bg-white ${className}`}
    >
      <div>
        {/* Image Area */}
        <div className="relative h-64 bg-slate-50 overflow-hidden flex items-center justify-center p-6 border-b border-slate-100">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-103"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white text-industrial-dark shadow-subtle border border-slate-200">
              {product.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <HeadingTag className="text-base font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors leading-snug">
            <Link to={`/products/${product.slug}`}>
              {product.title}
            </Link>
          </HeadingTag>

          <p className="text-xs text-industrial-muted line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Highlights Pill List */}
          <div className="pt-2 space-y-1.5 border-t border-slate-100">
            {product.highlights.slice(0, highlightCount).map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-industrial-primary shrink-0 mt-0.5" />
                <span className="line-clamp-1">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
        <Link
          to={`/products/${product.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-industrial-primary hover:text-industrial-hover transition-colors group/link"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Specifications</span>
          <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-1" />
        </Link>
        <button
          type="button"
          onClick={() => openEnquiry(product.title)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-industrial-primary hover:text-white text-xs font-semibold text-industrial-dark transition-colors active:scale-95"
        >
          Enquire Now
        </button>
      </div>
    </SpotlightCard>
  );
};
