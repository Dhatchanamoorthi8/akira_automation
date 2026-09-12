import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle2, Cpu, ZoomIn } from 'lucide-react';
import { useEnquiry } from '../../context/EnquiryContext';
import { useImageViewer } from '../../context/ImageViewerContext';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';

export const MultigaugingShowcase: React.FC = () => {
  const [activeStation, setActiveStation] = useState<'engine' | 'camshaft'>('engine');
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionReveal className="py-10 sm:py-16 lg:py-20 bg-industrial-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-industrial-primary/15 blur-3xl pointer-events-none" />

      <div className="industrial-container relative z-10">
        {/* Section Header */}
        <Reveal direction="up" className="max-w-3xl mb-5 sm:mb-10">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase bg-industrial-primary/20 text-sky-400 border border-sky-400/30">
            <Cpu className="w-3.5 h-3.5" />
            Specialized Automated Multi-Gauging
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white mt-3">
            Production-Line Multigauging Stations
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Engineered for high-volume automotive manufacturing lines. Simultaneous multi-point dimensional checking, instant tri-colour tolerance verdict, and automated serial data logging.
          </p>
        </Reveal>

        {/* Station Tabs with Mechanical Sliding layoutId Indicator */}
        <div className="flex border-b border-slate-700 mb-6 sm:mb-8 gap-2 overflow-x-auto no-scrollbar max-w-full w-full">
          <button
            onClick={() => setActiveStation('engine')}
            className={`relative px-4 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeStation === 'engine'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Engine Block Liner Bore Station</span>
            {activeStation === 'engine' && (
              <motion.div
                layoutId="activeStationTab"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400"
              />
            )}
          </button>
          <button
            onClick={() => setActiveStation('camshaft')}
            className={`relative px-4 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeStation === 'camshaft'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Camshaft Dia Multigauging Station</span>
            {activeStation === 'camshaft' && (
              <motion.div
                layoutId="activeStationTab"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400"
              />
            )}
          </button>
        </div>

        {/* Active Station Display */}
        <AnimatePresence mode="wait">
          {activeStation === 'engine' ? (
            <motion.div
              key="engine"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center"
            >
            {/* Left: Image with Subtle Scanning Laser Indicator */}
            <div className="lg:col-span-6 relative">
              <div 
                onClick={() => openImageViewer({
                  src: "/assets/multigauging/engine-block-liner-station.webp",
                  title: "Engine Block Liner Bore Multigauging Station",
                  category: "Automated Multi-Gauging",
                  description: "Complete turnkey metrology station for 6 Liner ID diameter measurements across X and Y axes at 3 levels.",
                  productSlug: "engine-block-liner-multigauging-station",
                  badge: "Turnkey Metrology Bench"
                })}
                className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 p-2 group cursor-pointer"
                title="Click to view full-resolution station"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openImageViewer({
                      src: "/assets/multigauging/engine-block-liner-station.webp",
                      title: "Engine Block Liner Bore Multigauging Station",
                      category: "Automated Multi-Gauging",
                      description: "Complete turnkey metrology station for 6 Liner ID diameter measurements across X and Y axes at 3 levels.",
                      productSlug: "engine-block-liner-multigauging-station",
                      badge: "Turnkey Metrology Bench"
                    });
                  }
                }}
              >
                <img
                  src="/assets/multigauging/engine-block-liner-station.webp"
                  alt="Engine Block Liner Bore Multigauging Station"
                  className="w-full h-auto object-contain rounded-xl max-h-[460px] transition-transform duration-500 group-hover:scale-[1.02]"
                />
                {!shouldReduceMotion && (
                  <motion.div
                    initial={{ top: '5%', opacity: 0 }}
                    animate={{
                      top: ['5%', '92%', '5%'],
                      opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="pointer-events-none absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.8)] z-10"
                    aria-hidden="true"
                  />
                )}
                <div className="absolute bottom-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/85 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700/80 group-hover:bg-industrial-primary transition-colors">
                    <ZoomIn className="w-3.5 h-3.5 text-sky-400 group-hover:text-white" />
                    <span>Click to Inspect</span>
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Suspended 12-Jet Special Air Plug Gauge</span>
                <span>Special 3-Level Setting Rings</span>
              </div>
            </div>

            {/* Right: Technical Specs & Features */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Turnkey Multi-Gauging Station
                </span>
                <h3 className="text-2xl font-bold font-heading text-white mt-2">
                  Engine Block Liner Bore Multigauging Station
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Complete turnkey metrology station for 6 Liner ID diameter measurements across X and Y axes at 3 levels (Top, Middle, Bottom) in a single ergonomic stroke.
                </p>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[11px] sm:text-xs bg-slate-800/60 p-3 sm:p-4 rounded-xl border border-slate-700">
                <div className="space-y-1">
                  <p className="text-slate-400">Display Units</p>
                  <p className="font-semibold text-white">Tri-Colour Six Digit Display</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Measurement Scope</p>
                  <p className="font-semibold text-white">6 Liner ID Dia (X & Y at 3 Levels)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Air Tooling</p>
                  <p className="font-semibold text-white">Suspended 12-Jet Air Plug</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Master Setting</p>
                  <p className="font-semibold text-white">Special 3-Level Setting Rings</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Measurement Mode</p>
                  <p className="font-semibold text-white">Absolute / Comparative</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Outputs</p>
                  <p className="font-semibold text-white">RS 232 & Optional 24V Relay</p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Auto calibration facility simplifies multi-level zeroing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Metric / Inch and Static / Dynamic measurement modes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Tri-colour LED indicates instantaneous component tolerance status</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
                <Link
                  to="/products/engine-block-liner-multigauging-station"
                  className="btn-primary bg-sky-500 hover:bg-sky-400 text-white w-full sm:w-auto text-center justify-center"
                >
                  <span>View Full Station Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => openEnquiry("Engine Block Liner Bore Multigauging Station")}
                  className="btn-secondary bg-transparent text-white border-slate-600 hover:bg-slate-800 w-full sm:w-auto text-center justify-center"
                >
                  Inquire About This Station
                </button>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="camshaft"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center"
          >
            {/* Left: Images (Station photo + CAD schematic) */}
            <div className="lg:col-span-6 space-y-4">
              <div 
                onClick={() => openImageViewer({
                  src: "/assets/multigauging/camshaft-multigauging-station.webp",
                  title: "Camshaft Dia Multigauging Station",
                  category: "Automated Multi-Gauging",
                  description: "Dedicated inspection bench for Camshaft OD diameter measurement across 6 bearing journals simultaneously.",
                  productSlug: "camshaft-multigauging-station",
                  badge: "6 OD Diameters Bench"
                })}
                className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 p-2 group cursor-pointer"
                title="Click to view full-resolution station"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openImageViewer({
                      src: "/assets/multigauging/camshaft-multigauging-station.webp",
                      title: "Camshaft Dia Multigauging Station",
                      category: "Automated Multi-Gauging",
                      description: "Dedicated inspection bench for Camshaft OD diameter measurement across 6 bearing journals simultaneously.",
                      productSlug: "camshaft-multigauging-station",
                      badge: "6 OD Diameters Bench"
                    });
                  }
                }}
              >
                <img
                  src="/assets/multigauging/camshaft-multigauging-station.webp"
                  alt="Camshaft Dia Multigauging Station"
                  className="w-full h-auto object-contain rounded-xl max-h-[380px] transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute bottom-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/85 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700/80 group-hover:bg-industrial-primary transition-colors">
                    <ZoomIn className="w-3.5 h-3.5 text-sky-400 group-hover:text-white" />
                    <span>Click to Inspect</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
                  <img
                    src="/assets/multigauging/camshaft-fixture-cad.webp"
                    alt="Camshaft Fixture CAD"
                    className="w-16 h-12 object-contain bg-white rounded p-1"
                  />
                  <div className="text-[11px]">
                    <p className="font-bold text-white">CAD Engineering</p>
                    <p className="text-slate-400">Precision Fixture Model</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-center text-[11px]">
                  <p className="font-bold text-sky-400">6 OD Diameters</p>
                  <p className="text-slate-400">Simultaneous Multi-Point</p>
                </div>
              </div>
            </div>

            {/* Right: Technical Specs & Features */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Dedicated Inspection Bench
                </span>
                <h3 className="text-2xl font-bold font-heading text-white mt-2">
                  Camshaft Dia Multigauging Station
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Dedicated inspection bench ideal for Camshaft OD diameter measurement across 6 bearing journals simultaneously, featuring tri-colour LED tolerance indication and auto-calibration.
                </p>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <div className="space-y-1">
                  <p className="text-slate-400">Display Readout</p>
                  <p className="font-semibold text-white">Tri-Color Six Digit Display</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Scope of Check</p>
                  <p className="font-semibold text-white">6 OD DIA Measurement</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Application</p>
                  <p className="font-semibold text-white">Ideal for Camshaft DIA Measurement</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Calibration Mode</p>
                  <p className="font-semibold text-white">Auto Calibration Facility</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Outputs</p>
                  <p className="font-semibold text-white">RS 232 Output / 24V Relay Optional</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Modes</p>
                  <p className="font-semibold text-white">Static / Dynamic & Metric / Inch</p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Simultaneous checking of all 6 journals eliminates operator handling wear</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Absolute / Comparative measurement with master setting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Tricolour LED for component tolerance status</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
                <Link
                  to="/products/camshaft-multigauging-station"
                  className="btn-primary bg-sky-500 hover:bg-sky-400 text-white w-full sm:w-auto text-center justify-center"
                >
                  <span>View Full Station Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => openEnquiry("Camshaft Dia Multigauging Station")}
                  className="btn-secondary bg-transparent text-white border-slate-600 hover:bg-slate-800 w-full sm:w-auto text-center justify-center"
                >
                  Inquire About This Station
                </button>
              </div>

            </div>
          </motion.div>
        )}
        </AnimatePresence>

      </div>
    </SectionReveal>
  );
};
