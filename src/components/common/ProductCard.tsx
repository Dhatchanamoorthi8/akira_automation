import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, ArrowRight, ZoomIn } from 'lucide-react';
import { Button, Card, Chip } from '@heroui/react';
import { ProductSummary } from '../../types';
import { useEnquiry } from '../../context/EnquiryContext';
import { useImageViewer } from '../../context/ImageViewerContext';
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
  const { openImageViewer } = useImageViewer();
  const highlightCount = variant === 'featured' ? 2 : 3;
  const HeadingTag = variant === 'featured' ? 'h3' : 'h2';

  const handleImageClick = () => {
    openImageViewer({
      src: product.image,
      title: product.title,
      category: product.category,
      description: product.description,
      productSlug: product.slug,
      badge: "Factory Verified"
    });
  };

  return (
    <SpotlightCard className={`h-full ${className}`}>
      <Card
        variant="default"
        className="card-hover overflow-hidden flex flex-col justify-between h-full group border border-slate-200 bg-white rounded-xl shadow-sm hover:shadow-card hover:border-industrial-primary/40 transition-all duration-200"
      >
        <div className="flex flex-col flex-1">
          {/* Image Area with Click to View Option */}
          <div 
            onClick={handleImageClick}
            className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden flex items-center justify-center p-5 border-b border-slate-100 cursor-pointer group/img shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-industrial-primary"
            title="Click to view full-resolution image"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleImageClick();
              }
            }}
          >
            <img
              src={product.image}
              alt={product.title}
              decoding="async"
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/img:scale-105"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('akira-automation-logo')) {
                  target.src = '/assets/company/akira-automation-logo.jpeg';
                }
              }}
            />
            <div className="absolute top-3 left-3 z-10">
              <Chip
                variant="soft"
                color="default"
                size="sm"
                className="bg-white/95 text-industrial-dark shadow-subtle border border-slate-200 backdrop-blur-sm"
              >
                <Chip.Label className="text-xs font-bold uppercase tracking-wider font-mono">
                  {product.category}
                </Chip.Label>
              </Chip>
            </div>

            {/* Hover / Touch "Click to View" Pill Overlay */}
            <div className="absolute inset-0 bg-industrial-dark/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900/90 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700 transform translate-y-1 group-hover/img:translate-y-0 transition-transform">
                <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Click to View</span>
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 flex flex-col flex-1 space-y-3">
            <HeadingTag className="text-base font-bold text-slate-900 font-heading group-hover:text-industrial-primary transition-colors leading-snug min-h-[2.75rem] sm:min-h-[3rem] line-clamp-2">
              <Link to={`/products/${product.slug}`} className="line-clamp-2">
                {product.title}
              </Link>
            </HeadingTag>

            <Card.Description className="text-xs sm:text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {product.description}
            </Card.Description>

            {/* Highlights List */}
            <div className="pt-2.5 mt-auto space-y-1.5 border-t border-slate-100 min-h-[3.5rem] flex flex-col justify-center">
              {product.highlights.slice(0, highlightCount).map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-industrial-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <Card.Footer className="p-5 sm:p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
          <Link
            to={`/products/${product.slug}`}
            className="button button--ghost button--sm inline-flex items-center gap-1.5 text-xs font-bold text-industrial-primary hover:text-industrial-hover transition-colors group/link min-h-[44px] py-1 p-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Specifications</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-1" />
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => openEnquiry(product.title)}
            className="px-4 py-2 min-h-[44px] rounded-lg bg-slate-100 hover:bg-industrial-primary hover:text-white text-xs font-semibold text-industrial-dark transition-colors border border-slate-200/80 font-sans"
          >
            Enquire Now
          </Button>
        </Card.Footer>
      </Card>
    </SpotlightCard>
  );
};

