import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { productSummaries, productCategories } from '../../data/productSummaries';
import { ProductCard } from '../common/ProductCard';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { StaggerContainer } from '../animation/StaggerContainer';
import { StaggerItem } from '../animation/StaggerItem';

export const FeaturedProducts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts = activeTab === 'all' 
    ? productSummaries.filter(p => p.isFeatured)
    : productSummaries.filter(p => p.categorySlug === activeTab);

  return (
    <SectionReveal className="py-20 bg-industrial-bg relative">
      <div className="industrial-container">
        {/* Section Header */}
        <Reveal direction="up" className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="section-tag">
              Featured Metrology Products
            </span>
            <h2 className="section-title mt-3">
              Precision Gauging & Multi-Gauging Systems
            </h2>
            <p className="section-subtitle">
              Every instrument and system is precision-manufactured to meet the rigorous quality requirements of OEM and automotive manufacturers.
            </p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-industrial-primary hover:text-industrial-hover self-start md:self-end group">
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {/* Filter Tabs with Mechanical Sliding layoutId Indicator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors z-10 ${
              activeTab === 'all'
                ? 'text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {activeTab === 'all' && (
              <motion.div
                layoutId="activeFeaturedTabPill"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-industrial-primary rounded-lg -z-10 shadow-sm"
              />
            )}
            <span>All Featured Systems</span>
          </button>
          {productCategories.filter(c => c.slug !== 'all').map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveTab(cat.slug)}
              className={`relative px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors z-10 ${
                activeTab === cat.slug
                  ? 'text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {activeTab === cat.slug && (
                <motion.div
                  layoutId="activeFeaturedTabPill"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-industrial-primary rounded-lg -z-10 shadow-sm"
                />
              )}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Editorial Product Cards Grid */}
        <StaggerContainer key={activeTab} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((prod) => (
            <StaggerItem key={prod.id}>
              <ProductCard product={prod} variant="featured" />
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </SectionReveal>
  );
};
