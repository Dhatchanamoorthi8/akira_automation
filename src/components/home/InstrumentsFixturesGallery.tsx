import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEnquiry } from '../../context/EnquiryContext';
import { useImageViewer } from '../../context/ImageViewerContext';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { SpotlightCard } from '../animation/SpotlightCard';

interface GalleryItem {
  id: string;
  name: string;
  category: 'instruments' | 'fixtures';
  categoryLabel: string;
  image: string;
  description: string;
}

const items: GalleryItem[] = [
  {
    id: "coating-thickness",
    name: "Digital Coating Thickness Gauge",
    category: "instruments",
    categoryLabel: "Measuring Instruments",
    image: "/assets/instruments/coating-thickness-gauge.webp",
    description: "Accuracy ±2%, measures up to 9mm (355 mils), 60-140 rdg/min, IP54, 100,000 memory with USB & Bluetooth."
  },
  {
    id: "hardness-tester",
    name: "Portable Leeb Hardness Tester",
    category: "instruments",
    categoryLabel: "Measuring Instruments",
    image: "/assets/instruments/hardness-tester.webp",
    description: "LCD display, calibrated Leeb Hardness Test Block (791 HLD), multi-scale testing for steel and cast steel."
  },
  {
    id: "precision-scale",
    name: "Precision Analytical / Industrial Scale",
    category: "instruments",
    categoryLabel: "Measuring Instruments",
    image: "/assets/instruments/precision-scale.webp",
    description: "Digital weighing scale with tare, print, level indicator, and high-resolution load cell."
  },
  {
    id: "vernier-caliper",
    name: "Absolute Digimatic Electronic Calipers",
    category: "instruments",
    categoryLabel: "Measuring Instruments",
    image: "/assets/instruments/digital-vernier-caliper.webp",
    description: "IP67 dust and coolant proof digital vernier calipers for shop-floor dimensional checks."
  },
  {
    id: "slip-gauge",
    name: "Metric Slip Gauge Block Set",
    category: "instruments",
    categoryLabel: "Standards & Calibration",
    image: "/assets/instruments/slip-gauge-set.webp",
    description: "High-accuracy hardened steel slip gauge sets in fitted wooden case for standards calibration."
  },
  {
    id: "pin-gauge",
    name: "Cylindrical Pin Gauge Set",
    category: "instruments",
    categoryLabel: "Standards & Calibration",
    image: "/assets/instruments/pin-gauge-set.webp",
    description: "Graduated precision cylindrical pin gauges in fitted wooden cabinet for internal hole verification."
  },
  {
    id: "magnetic-stand",
    name: "Magnetic Stands with Articulated Fine Adjustment",
    category: "instruments",
    categoryLabel: "Metrology Accessories",
    image: "/assets/instruments/magnetic-stand-blue.webp",
    description: "Heavy-duty switchable magnetic bases with multi-axis articulated arms for dial indicators and lever gauges."
  },
  {
    id: "multi-pin-fixture",
    name: "Multi-Pin Special Gauging Fixture",
    category: "fixtures",
    categoryLabel: "Special Gauges & Fixtures",
    image: "/assets/fixtures/multi-pin-gauging-fixture.webp",
    description: "Custom multi-datum checking fixture with multiple precision locator pins and dial indicator mounts."
  },
  {
    id: "workholding-fixture",
    name: "Machined Casting Work-holding & Inspection Fixture",
    category: "fixtures",
    categoryLabel: "Special Gauges & Fixtures",
    image: "/assets/fixtures/workholding-inspection-fixture.webp",
    description: "Custom dedicated inspection fixture engineered for complex machined automotive casting components."
  }
];

export const InstrumentsFixturesGallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'instruments' | 'fixtures'>('all');
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <SectionReveal className="py-10 sm:py-16 lg:py-20 bg-white border-b border-slate-200 overflow-hidden">
      <div className="industrial-container">
        {/* Header */}
        <Reveal direction="up" className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10 gap-6">
          <div>
            <span className="section-tag">
              Precision Tooling & Fixtures
            </span>
            <h2 className="section-title mt-3">
              Measuring Instruments, Special Gauges & Fixtures
            </h2>
            <p className="section-subtitle">
              "All type of Instruments, coating thickness, Slip gauge, magnetic stands etc." and "All type of special gauges & Fixtures" — engineered for precision shop floors.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-end">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-industrial-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilter('instruments')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'instruments'
                  ? 'bg-industrial-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Instruments
            </button>
            <button
              onClick={() => setFilter('fixtures')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'fixtures'
                  ? 'bg-industrial-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Special Fixtures
            </button>
          </div>
        </Reveal>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={idx >= 4 ? "hidden sm:block h-full" : "h-full"}
              >
                <SpotlightCard
                  spotlightColor="rgba(14, 116, 144, 0.08)"
                  className="card-base card-hover overflow-hidden flex flex-col justify-between group border-slate-200 bg-white h-full"
                >
                  <div>
                    <div 
                      onClick={() => openImageViewer({
                        src: item.image,
                        title: item.name,
                        category: item.categoryLabel,
                        description: item.description,
                        badge: "Workshop Tested"
                      })}
                      className="relative h-56 bg-slate-50 overflow-hidden flex items-center justify-center p-4 border-b border-slate-100 cursor-pointer group/img"
                      title="Click to view full-resolution image"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openImageViewer({
                            src: item.image,
                            title: item.name,
                            category: item.categoryLabel,
                            description: item.description,
                            badge: "Workshop Tested"
                          });
                        }
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/img:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 text-industrial-dark backdrop-blur-sm border border-slate-200">
                          {item.categoryLabel}
                        </span>
                      </div>

                      {/* Hover / Touch Pill Overlay */}
                      <div className="absolute inset-0 bg-industrial-dark/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 text-white text-[11px] font-mono font-medium shadow-lg backdrop-blur-md border border-white/20 transform translate-y-1 group-hover/img:translate-y-0 transition-transform">
                          <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
                          <span>Click to View</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-industrial-muted line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                    <button
                      onClick={() => openEnquiry(item.name)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-industrial-primary hover:text-industrial-hover group/btn"
                    >
                      <span>Discuss Your Requirement</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Mobile View Complete Tooling Catalogue Link */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/products"
            className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-industrial-primary font-bold text-xs border border-slate-200/80 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <span>Explore Complete Tooling & Fixtures ({items.length} Items)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </SectionReveal>
  );
};
