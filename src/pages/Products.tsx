import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  PackageCheck, 
  X, 
  ArrowRight, 
  Gauge, 
  ShieldCheck, 
  Cpu,
  ZoomIn 
} from 'lucide-react';
import { Button, Card, Chip } from '@heroui/react';
import { motion } from 'motion/react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { createBreadcrumbSchema } from '../config/seo';
import { productService } from '../services/productService';
import { useEnquiry } from '../context/EnquiryContext';
import { useImageViewer } from '../context/ImageViewerContext';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { ProductCard } from '../components/common/ProductCard';
import { Reveal } from '../components/animation/Reveal';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();

  // Keep state synchronized with URL search params (e.g., deep links, back/forward navigation)
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: slug });
    }
  };

  const allSummaries = productService.getProductSummaries();
  const productCategories = productService.getProductCategories();

  // Compute category counts for quick reference
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allSummaries.length };
    allSummaries.forEach((p) => {
      counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
    });
    return counts;
  }, [allSummaries]);

  const filteredProducts = useMemo(() => {
    return allSummaries.filter((prod) => {
      const matchesCategory = selectedCategory === 'all' || prod.categorySlug === selectedCategory;
      const matchesSearch = 
        prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allSummaries, selectedCategory, searchQuery]);

  return (
    <>
      <SEOHead
        title="Precision Gauging Product Catalogue"
        description="Comprehensive catalogue of air plug gauges, air ring gauges, electronic gauges, tri-colour digital display units, memory module units, and multigauging stations."
        keywords={`Air Plug Gauge, Air Ring Gauge, Digital Display Units, Tri-Colour Display, Memory Module Unit, Multigauging Station, ${company.name}`}
        canonicalPath="/products"
        structuredData={createBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' }
        ])}
      />

      {/* 1. Hero Section - Premium Industrial Engineering */}
      <section className="bg-industrial-dark text-white py-12 sm:py-16 lg:py-20 border-b border-slate-800 relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none overflow-hidden" />
        <div className="absolute -bottom-40 -left-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none overflow-hidden" />

        <div className="industrial-container relative z-10 w-full max-w-full">
          <Breadcrumb items={[{ label: 'Products' }]} />

          {/* 2-Column Hero Layout: Value Proposition + High-Tech Metrology Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mt-4">
            
            {/* Left Column: Heading & Value Proposition (7 cols) */}
            <Reveal direction="up" className="lg:col-span-7 space-y-4">
              <Chip
                variant="soft"
                color="accent"
                size="sm"
                className="bg-sky-950/80 text-sky-300 border border-sky-800/80 font-mono text-xs font-semibold uppercase tracking-wider mb-2"
              >
                <Chip.Label className="inline-flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Metrology Equipment & Tooling Portfolio</span>
                </Chip.Label>
              </Chip>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Precision Product <span className="text-[#00c2ff]">Catalogue</span>
              </h1>

              <p className="text-xl sm:text-2xl font-bold text-sky-300 font-heading">
                "Shop-Floor Rugged. Sub-Micron Accurate."
              </p>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Explore {company.name}'s complete line of precision air gauges, electronic gauges, tri-colour digital displays, memory data logging systems, and automated multi-gauging stations engineered for zero-defect machining.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => openEnquiry('Product Catalogue Consultation')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-950/40 transition-all font-sans cursor-pointer"
                >
                  <span>Request Custom Gauge Quote</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>

                <Link
                  to="/solutions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center"
                >
                  <span>Explore Turnkey Solutions</span>
                </Link>
              </div>
            </Reveal>

            {/* Right Column: High-Tech Industrial Metrology Visual Showcase (5 cols) */}
            <Reveal direction="left" delay={0.15} className="lg:col-span-5">
              <div 
                onClick={() => {
                  openImageViewer({
                    src: '/assets/products/products-hero-catalogue.webp',
                    title: 'Akira Precision Metrology Product Lineup & Displays',
                    category: 'Precision Metrology Equipment',
                    description: 'Precision air plug gauges, air ring gauges, tri-colour digital electronic column displays, and memory data logging modules for high-speed shop-floor dimensional verification.',
                    badge: 'Standard & Custom Tooling'
                  });
                }}
                className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 group cursor-pointer"
                role="button"
                tabIndex={0}
                title="Click to view full-resolution engineering photo"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openImageViewer({
                      src: '/assets/products/products-hero-catalogue.webp',
                      title: 'Akira Precision Metrology Product Lineup & Displays',
                      category: 'Precision Metrology Equipment',
                      description: 'Precision air plug gauges, air ring gauges, tri-colour digital electronic column displays, and memory data logging modules for high-speed shop-floor dimensional verification.',
                      badge: 'Standard & Custom Tooling'
                    });
                  }
                }}
              >
                <img
                  src="/assets/products/products-hero-catalogue.webp"
                  alt="Akira Precision Metrology Product Lineup & Displays"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('.jpg')) {
                      target.src = '/assets/products/products-hero-catalogue.jpg';
                    } else if (!target.src.includes('tri-colour-display-stand')) {
                      target.src = '/assets/products/tri-colour-display-stand.webp';
                    }
                  }}
                  className="w-full h-auto object-cover min-h-[260px] sm:min-h-[320px] max-h-[380px] transition-transform duration-500 group-hover:scale-105"
                />

                {/* Subtle Gradient & Status Badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                <div className="absolute top-3.5 left-3.5 z-10">
                  <Chip
                    variant="soft"
                    color="default"
                    size="sm"
                    className="bg-slate-900/90 text-white shadow-subtle border border-slate-700/90 backdrop-blur-sm"
                  >
                    <Chip.Label className="text-[10px] font-bold uppercase tracking-wider font-mono">
                      Shop-Floor Metrology Systems
                    </Chip.Label>
                  </Chip>
                </div>

                {/* Hover Click to Inspect Pill */}
                <div className="absolute inset-0 bg-industrial-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>Inspect Product Showcase</span>
                  </span>
                </div>

                {/* Bottom Information Overlay */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold font-mono truncate">
                      Air & Electronic Metrology Systems
                    </p>
                    <p className="text-slate-300 text-[10px] truncate">
                      Plugs, rings, snap gauges & electronic DROs
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/70 font-bold shrink-0">
                    Resolution: 0.1 µm
                  </span>
                </div>
              </div>
            </Reveal>

          </div>

          {/* Key Engineering Capability Metrics Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">16+ Gauges</p>
                <p className="text-xs text-slate-400">Turnkey Range</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">≤ 0.1 µm</p>
                <p className="text-xs text-slate-400">Sub-Micron Resolution</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">ISO/IEC 17025</p>
                <p className="text-xs text-slate-400">Traceable Masters</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">Direct SPC</p>
                <p className="text-xs text-slate-400">RS232 / USB Output</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Catalogue Filter & Search Bar - Sticky */}
      <section className="py-4 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-[80px] z-30 shadow-xs">
        <div className="industrial-container">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input Container */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, specs, ranges..."
                className="w-full pl-9.5 pr-9 py-2 text-xs font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-industrial-primary focus:border-transparent bg-slate-50 text-slate-900 placeholder:text-slate-400 min-h-[40px] transition-all"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-industrial-primary"
                  title="Clear search"
                  aria-label="Clear product search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar max-w-full">
              {productCategories.map((cat) => {
                const count = categoryCounts[cat.slug] || 0;
                const isActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[38px] inline-flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-industrial-primary text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-industrial-primary border border-slate-200/80'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white font-bold' 
                        : 'bg-slate-200 text-slate-600 font-medium'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* 3. Product Grid & Results */}
      <section className="py-16 sm:py-20 bg-industrial-bg border-b border-slate-200 min-h-[600px]">
        <div className="industrial-container">
          
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 font-medium">
            <p>
              Showing <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> of {allSummaries.length} products & systems
              {searchQuery && (
                <span className="ml-1 text-slate-500">
                  matching "<strong className="text-industrial-primary">{searchQuery}</strong>"
                </span>
              )}
            </p>

            {(selectedCategory !== 'all' || searchQuery) && (
              <Button 
                variant="ghost"
                size="sm"
                onPress={() => { setSearchQuery(''); handleCategoryChange('all'); }}
                className="text-industrial-primary font-bold hover:underline p-0 min-h-[32px] inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </Button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <Card variant="default" className="p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto rounded-2xl bg-white shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <Card.Title className="text-base font-bold text-slate-900 font-heading">
                No products found
              </Card.Title>
              <Card.Description className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                No matching systems for "{searchQuery}". Try a different search term or select another category filter.
              </Card.Description>
              <Button
                variant="primary"
                size="md"
                onPress={() => { setSearchQuery(''); handleCategoryChange('all'); }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white font-semibold text-xs tracking-wide shadow-xs transition-all mx-auto font-sans"
              >
                <span>Reset All Filters</span>
              </Button>
            </Card>
          ) : (
            <motion.div
              key={`${selectedCategory}-${searchQuery}`}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.04,
                    delayChildren: 0.02,
                  },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch"
            >
              {filteredProducts.map((prod) => (
                <motion.div
                  key={prod.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.28,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    },
                  }}
                  className="h-full"
                >
                  <ProductCard product={prod} variant="default" className="h-full" />
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>
      </section>

      {/* 4. Conversion CTA */}
      <EnquiryCTA />
    </>
  );
};
