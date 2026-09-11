import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, PackageCheck } from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { productService } from '../services/productService';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { ProductCard } from '../components/common/ProductCard';
import { Reveal } from '../components/animation/Reveal';
import { StaggerContainer } from '../components/animation/StaggerContainer';
import { StaggerItem } from '../components/animation/StaggerItem';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

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
      />

      {/* Page Header */}
      <section className="bg-industrial-dark text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="industrial-container relative z-10">
          <Breadcrumb items={[{ label: 'Products' }]} />
          <Reveal direction="up" className="max-w-3xl mt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-industrial-primary/30 text-sky-300 border border-sky-400/30">
              <PackageCheck className="w-3.5 h-3.5" />
              Metrology Equipment & Tooling
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mt-3">
              Precision Product Catalogue
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Explore {company.name}'s complete line of precision air gauges, electronic gauges, tri-colour digital displays, memory data logging systems, and multi-gauging stations.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Catalogue Filter & Search Bar */}
      <section className="py-8 bg-white border-b border-slate-200 sticky top-[80px] z-30 shadow-sm">
        <div className="industrial-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, specs, ranges..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-industrial-primary focus:border-transparent bg-slate-50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar max-w-full">
              {productCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-industrial-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 bg-industrial-bg border-b border-slate-200 min-h-[600px]">
        <div className="industrial-container">
          
          <div className="mb-6 flex items-center justify-between text-xs text-industrial-muted">
            <p>Showing <strong>{filteredProducts.length}</strong> products & systems</p>
            {selectedCategory !== 'all' && (
              <button 
                onClick={() => handleCategoryChange('all')}
                className="text-industrial-primary font-semibold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-industrial-dark font-heading">
                No products found
              </h3>
              <p className="text-xs text-industrial-muted">
                No matching systems for "{searchQuery}". Try a different search term or category filter.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="btn-primary text-xs py-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((prod) => (
                <StaggerItem key={prod.id}>
                  <ProductCard product={prod} variant="default" />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

        </div>
      </section>

      <EnquiryCTA />
    </>
  );
};
