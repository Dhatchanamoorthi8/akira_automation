import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle2, Sliders, Gauge, ZoomIn } from 'lucide-react';
import { company } from '../../config/company';
import { useEnquiry } from '../../context/EnquiryContext';
import { useImageViewer } from '../../context/ImageViewerContext';
import { PrecisionText } from '../animation/PrecisionText';
import { PrecisionRuler } from '../animation/PrecisionRuler';
import { fadeUp, heroImageReveal } from '../../animations/variants';

export const Hero: React.FC = () => {
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();
  const shouldReduceMotion = useReducedMotion();

  const handleInspectImage = () => {
    openImageViewer({
      src: "/assets/hero/hero-lab-gauging.webp",
      title: "Multi-Gauging Laboratory & Production Inspection Station",
      category: "Turnkey Metrology Bench",
      description: "AKIRA AUTOMATION precision lab station featuring multi-channel air electronic columns, digital probe readouts, and custom part holding fixtures.",
      badge: "OEM Cleanroom Standard"
    });
  };

  return (
    <section className="relative bg-gradient-to-br from-industrial-dark via-[#0c2642] to-industrial-dark text-white overflow-hidden pt-2 sm:pt-8 pb-8 sm:pb-14 lg:py-20 border-b border-slate-800 w-full max-w-full">
      {/* Background Engineering Grids & Accents */}
      <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-industrial-highlight/15 blur-3xl pointer-events-none" />

      {/* Precision Caliper Ruler Graphic at top */}
      <div className="absolute top-0 left-0 right-0">
        <PrecisionRuler ticksCount={64} highlightInterval={8} className="opacity-60" />
      </div>

      {/* Mobile Hero Background Image (Robotic Automated Metrology Station) */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-[560px] sm:h-[620px] overflow-hidden pointer-events-none z-0">
        <img
          src="/assets/hero/mobile-hero-robotic-bg.webp"
          alt="Robotic Metrology Automation Station"
          className="w-full h-full object-cover object-[center_top] opacity-85 filter contrast-110 brightness-95"
        />
        {/* High-contrast gradient scrim: clear machine at top, darkening smoothly behind text for pristine WCAG contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06182c]/40 via-[#06182c]/90 via-35% to-industrial-dark" />
        <div className="absolute inset-0 bg-gradient-to-r from-industrial-dark/60 via-transparent to-industrial-dark/60" />
      </div>

      <div className="industrial-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-center">
          
          {/* Left Column: Typography, CTAs & Technical Value Points (7 cols) - Clean natural top alignment */}
          <div className="lg:col-span-7 flex flex-col space-y-2.5 sm:space-y-4 pt-1 sm:pt-2">
            
            {/* Tag / Badge - Exactly matching user reference mockup */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-sky-400/40 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.18)] text-[10.5px] sm:text-xs font-semibold tracking-wider text-slate-100 group self-start"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              <span>PRECISION • INNOVATION • SMART SOLUTIONS</span>
            </motion.div>

            {/* Main Hero Headline with PrecisionText */}
            <h1 className="text-[26px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-white leading-[1.18] sm:leading-[1.12] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
              <PrecisionText
                text="Precision Gauging Solutions for"
                highlightText="Modern Manufacturing"
                delay={0.15}
              />
            </h1>

            {/* Supporting Copy - Constrained Readable Width with High-Contrast Drop Shadow */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-[13px] sm:text-base text-slate-200 leading-relaxed max-w-[34rem] font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
            >
              {company.name} delivers high-quality precision instruments and automated multi-gauging systems for OEMs and automotive manufacturing, engineered for <strong className="text-white font-semibold">accuracy, productivity, and reliability</strong>.
            </motion.p>

            {/* Primary & Secondary CTAs - Matching user reference mockup */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1 w-full sm:w-auto"
            >
              <Link
                to="/solutions"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 min-h-[46px] sm:min-h-[48px] rounded-lg bg-industrial-primary text-white font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 hover:bg-sky-500 shadow-md shadow-blue-950/40 hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-400 group text-center"
              >
                <span>Explore Solutions</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
              </Link>
              <button
                type="button"
                onClick={() => openEnquiry()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 min-h-[46px] sm:min-h-[48px] rounded-lg bg-slate-900/70 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700/80 backdrop-blur-sm transition-all duration-200 hover:bg-slate-800/80 hover:text-white hover:border-slate-600 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-400 text-center"
              >
                <span>Request an Enquiry</span>
                <Sliders className="w-4 h-4 text-sky-400 shrink-0" />
              </button>
            </motion.div>

            {/* Technical Benefit Pills - Hidden on small mobile to keep hero minimalist and high-impact */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="hidden sm:flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5"
            >
              {[
                "Automated Multi-Gauging",
                "Compressed Air Technology",
                "Tailored Fixtures"
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/60 border border-sky-400/30 text-[11px] sm:text-xs font-medium text-slate-200 backdrop-blur-md shadow-[0_0_12px_rgba(56,189,248,0.1)]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>

            {/* Precision Telemetry Dock - Structured 2-Column Responsive Card Bar */}
            <div className="pt-2 sm:pt-3 border-t border-slate-800/80">
              <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs font-mono">
                <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/90 backdrop-blur-sm shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-sm bg-tolerance-green shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                  <div className="truncate">
                    <span className="text-slate-400 block text-[9.5px] leading-tight uppercase font-sans">Tolerance</span>
                    <span className="text-slate-100 font-semibold truncate">Tri-Colour Status</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/90 backdrop-blur-sm shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 shrink-0 shadow-[0_0_6px_rgba(56,189,248,0.9)]" />
                  <div className="truncate">
                    <span className="text-slate-400 block text-[9.5px] leading-tight uppercase font-sans">Resolution</span>
                    <span className="text-sky-300 font-semibold truncate">Up to 0.1 µm</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero High-Res Metrology Image (Desktop Only - lg:block) */}
          <motion.div
            variants={heroImageReveal}
            initial="hidden"
            animate="visible"
            className="hidden lg:block lg:col-span-5 relative"
          >
            <div 
              onClick={handleInspectImage}
              className="relative rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl bg-industrial-dark group cursor-pointer"
              title="Click to view full-resolution station"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleInspectImage();
                }
              }}
            >
              <img
                src="/assets/hero/hero-lab-gauging.webp"
                alt="AKIRA AUTOMATION Precision Metrology and Automated Gauging System"
                className="w-full h-auto object-cover max-h-[360px] sm:max-h-[460px] lg:max-h-[520px] transition-transform duration-700 group-hover:scale-103"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-industrial-dark via-transparent to-transparent opacity-60" />
              
              {/* Subtle Metrology Laser Scan Line */}
              {!shouldReduceMotion && (
                <motion.div
                  initial={{ top: '0%', opacity: 0 }}
                  animate={{
                    top: ['0%', '98%', '0%'],
                    opacity: [0.2, 0.7, 0.2],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="pointer-events-none absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/80 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.7)] z-10"
                  aria-hidden="true"
                />
              )}

              {/* Click to Inspect Overlay Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/85 text-white text-[11px] font-semibold shadow-md backdrop-blur-md border border-slate-700 group-hover:bg-industrial-primary transition-colors">
                  <ZoomIn className="w-3.5 h-3.5 text-sky-400 group-hover:text-white" />
                  <span>Click to Inspect</span>
                </span>
              </div>

              {/* Technical Overlay Badge */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-3.5 rounded-lg bg-industrial-dark/90 backdrop-blur-md border border-slate-700 text-xs text-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white font-heading text-[11px] sm:text-xs">Automated Multi-Gauging Systems</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">High-speed dimensional verification for OEM manufacturing</p>
                </div>
                <div className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-industrial-primary text-[9px] sm:text-[10px] font-mono text-white font-bold">
                  PRECISION
                </div>
              </div>
            </div>

            {/* Floating Established Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -top-4 -left-4 bg-white text-industrial-dark rounded-lg p-3 shadow-card border border-slate-200 hidden sm:flex items-center gap-3 z-20"
            >
              <div className="w-9 h-9 rounded-lg bg-industrial-accent text-industrial-primary flex items-center justify-center">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Established</p>
                <p className="text-base font-black font-heading text-industrial-dark">SINCE 2021</p>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};
