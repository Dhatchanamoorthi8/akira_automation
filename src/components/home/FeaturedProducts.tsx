import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, Chip, Tabs } from '@heroui/react';
import { productSummaries, productCategories } from '../../data/productSummaries';
import { ProductCard } from '../common/ProductCard';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { StaggerContainer } from '../animation/StaggerContainer';
import { StaggerItem } from '../animation/StaggerItem';

export const FeaturedProducts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showAllMobile, setShowAllMobile] = useState(false);

  const filteredProducts = activeTab === 'all' 
    ? productSummaries.filter(p => p.isFeatured)
    : productSummaries.filter(p => p.categorySlug === activeTab);

  return (
    <SectionReveal className="py-10 sm:py-16 lg:py-20 bg-industrial-bg relative overflow-hidden">
      <div className="industrial-container">
        {/* Section Header */}
        <Reveal direction="up" className="flex flex-col md:flex-row md:items-end justify-between mb-5 sm:mb-10 gap-6">
          <div>
            <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3">
              <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                Featured Metrology Products
              </Chip.Label>
            </Chip>
            <h2 className="section-title mt-2">
              Precision Gauging & Multi-Gauging Systems
            </h2>
            <p className="section-subtitle">
              Every instrument and system is precision-manufactured to meet the rigorous quality requirements of OEM and automotive manufacturers.
            </p>
          </div>
          <Link
            to="/products"
            className="button button--ghost button--sm inline-flex items-center gap-2 text-sm font-bold text-industrial-primary hover:text-industrial-hover self-start md:self-end group p-0 font-sans"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {/* Filter Tabs with HeroUI Tabs */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => {
            setActiveTab(String(key));
            setShowAllMobile(false);
          }}
          className="mb-6 sm:mb-8 w-full"
        >
          <div className="overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Tabs.List
              aria-label="Featured Product Categories"
              className="flex items-center gap-2 min-w-max p-1.5 bg-slate-200/70 rounded-xl border border-slate-300/80"
            >
              <Tabs.Tab
                id="all"
                className={`h-auto min-h-[38px] px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-industrial-primary text-white shadow-sm'
                    : 'bg-white/80 text-slate-700 hover:text-industrial-primary hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                All Featured Systems
              </Tabs.Tab>
              {productCategories.filter(c => c.slug !== 'all').map((cat) => (
                <Tabs.Tab
                  key={cat.slug}
                  id={cat.slug}
                  className={`h-auto min-h-[38px] px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === cat.slug
                      ? 'bg-industrial-primary text-white shadow-sm'
                      : 'bg-white/80 text-slate-700 hover:text-industrial-primary hover:bg-white border border-transparent hover:border-slate-200'
                  }`}
                >
                  {cat.name}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </div>
        </Tabs>

        {/* Editorial Product Cards Grid */}
        <StaggerContainer key={activeTab} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 items-stretch">
          {filteredProducts.map((prod, idx) => (
            <StaggerItem key={prod.id} className={`h-full ${idx >= 4 && !showAllMobile ? "hidden sm:block" : "block"}`}>
              <ProductCard product={prod} variant="featured" className="h-full" />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Mobile View More Products Button */}
        {!showAllMobile && filteredProducts.length > 4 && (
          <div className="mt-6 text-center sm:hidden">
            <Button
              variant="secondary"
              fullWidth
              onPress={() => setShowAllMobile(true)}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-industrial-primary font-bold text-xs border border-slate-200 transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm font-sans"
            >
              <span>View All {filteredProducts.length} Systems</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

      </div>
    </SectionReveal>
  );
};

