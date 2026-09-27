import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@heroui/react';
import { ArrowRight, ZoomIn } from 'lucide-react';
import { company } from '../../config/company';
import { useEnquiry } from '../../context/EnquiryContext';
import { useImageViewer } from '../../context/ImageViewerContext';
import { PrecisionRuler } from '../animation/PrecisionRuler';
import { fadeUp } from '../../animations/variants';

export const Hero: React.FC = () => {
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();
  const shouldReduceMotion = useReducedMotion();

  const handleInspectImage = () => {
    openImageViewer({
      src: "/assets/hero/desktop-hero-precision-gauging.webp",
      title: "Automated Multi-Gauging & Metrology Inspection Station",
      category: "Turnkey Metrology System",
      description: "Akira Precision Automation precision CNC station featuring automated touch-trigger probing, multi-channel electronic readouts, and sub-micron repeatability for OEM manufacturing.",
      badge: "OEM Cleanroom Standard"
    });
  };

  return (
    <section className="relative bg-industrial-dark text-white overflow-hidden border-b border-slate-800 w-full max-w-full">
      {/* Background Engineering Grids & Accents */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Precision Caliper Ruler Graphic at top */}
      <div className="hidden sm:block absolute top-0 left-0 right-0">
        <PrecisionRuler ticksCount={100} highlightInterval={10} className="opacity-30" />
      </div>

      {/* ── DESKTOP HERO BACKGROUND ── */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none z-0">
        <img
          src="/assets/hero/desktop-hero-precision-gauging.webp"
          alt="Akira Precision Automation Precision Gauging Station"
          className="w-full h-full object-cover object-[center_right] filter contrast-125 grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-industrial-dark via-industrial-dark/80 via-20% to-transparent" />
      </div>

      <div className="industrial-container relative z-10 pt-10 pb-12 lg:pt-20 lg:pb-24">
        
        {/* ══════════════════════════════════════════════════════════════════════
            MOBILE & DESKTOP HERO CONTENT
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-6 flex flex-col space-y-4 sm:space-y-5 pt-2">
            
            {/* Eyebrow */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 font-sans"
            >
              <span>ISO 9001 CERTIFIED</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-industrial-primary">PRECISION METROLOGY</span>
              <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block" />
              <span className="hidden sm:block">OEM / AUTOMOTIVE</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold font-heading tracking-tight text-white leading-[1.15]">
              Precision Gauging for Zero-Defect Manufacturing
            </h1>

            {/* Supporting Copy */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[15px] sm:text-[17px] text-slate-300 leading-relaxed font-normal max-w-lg"
            >
              {company.name} delivers high-accuracy automated multi-gauging stations, pneumatic air tooling, and custom fixtures engineered for automotive and OEM production lines.
            </motion.p>

            {/* Mobile Visual (inserted in DOM order for mobile flow) */}
            <div className="lg:hidden relative mt-2 mb-2 border border-slate-800 bg-slate-900 group cursor-pointer" onClick={handleInspectImage}>
              <img
                src="/assets/hero/desktop-hero-precision-gauging.webp"
                alt="Automated Multi-Gauging & Metrology Inspection Station"
                className="w-full h-[220px] sm:h-[320px] object-cover object-center filter grayscale-[10%] contrast-110 opacity-90"
              />
              <div className="absolute inset-0 bg-industrial-dark/20 pointer-events-none" />
              {/* Technical Annotations */}
              <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-industrial-primary" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white font-sans drop-shadow-md">IN-LINE METROLOGY</span>
                </div>
                <div className="w-8 h-px bg-industrial-primary ml-3.5" />
              </div>
              <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white font-mono drop-shadow-md">≤ 0.0005 mm</span>
                  <div className="w-1.5 h-1.5 bg-industrial-primary" />
                </div>
                <div className="w-8 h-px bg-industrial-primary mr-3.5" />
              </div>
            </div>

            {/* CTAs */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto"
            >
              <Link
                to="/solutions"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-sm bg-industrial-primary hover:bg-industrial-hover active:bg-industrial-primary/90 text-white font-semibold text-sm tracking-wide transition-colors font-sans w-full sm:w-auto"
              >
                <span>Explore Solutions</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <Button
                variant="bordered"
                size="lg"
                radius="sm"
                onPress={() => openEnquiry()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] border-slate-600 text-white font-semibold text-sm hover:border-slate-400 hover:bg-slate-800/50 transition-colors font-sans w-full sm:w-auto bg-transparent"
              >
                Request an Enquiry
              </Button>
            </motion.div>

            {/* Engineering Credibility Strip */}
            <motion.div 
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 mt-4 border-t border-slate-800/80"
            >
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans mb-1">Industry</span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-200 font-sans">TRUSTED BY OEMs</span>
              </div>
              <div className="flex flex-col border-l border-slate-800 pl-2 sm:pl-4">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans mb-1">Discipline</span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-200 font-sans">PRECISION ENGINEERING</span>
              </div>
              <div className="flex flex-col border-l border-slate-800 pl-2 sm:pl-4">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans mb-1">Standard</span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-200 font-sans">QUALITY CONTROL</span>
              </div>
            </motion.div>

          </div>

          {/* ── DESKTOP VISUAL OVERLAYS ── */}
          <div className="hidden lg:block lg:col-span-6 relative min-h-[500px]">
             {/* Technical Annotations */}
             <div className="absolute top-[20%] left-10 flex flex-col gap-1 z-20 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-industrial-primary" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-white font-sans drop-shadow-md">IN-LINE METROLOGY</span>
              </div>
              <div className="w-16 h-px bg-industrial-primary ml-4" />
            </div>
            
            <div className="absolute bottom-[30%] right-10 flex flex-col items-end gap-1 z-20 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest uppercase text-white font-mono drop-shadow-md">TOLERANCE ≤ 0.0005 mm</span>
                <div className="w-2 h-2 bg-industrial-primary" />
              </div>
              <div className="w-16 h-px bg-industrial-primary mr-4" />
            </div>

            <Button
              variant="flat"
              radius="sm"
              size="sm"
              onPress={handleInspectImage}
              className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-2 px-4 py-2 bg-slate-900/90 text-white text-xs font-semibold border border-slate-700 hover:bg-industrial-primary hover:border-industrial-primary hover:text-white transition-colors cursor-pointer font-sans rounded-sm"
            >
              <ZoomIn className="w-4 h-4 text-industrial-primary group-hover:text-white" />
              <span>Inspect Station</span>
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};
