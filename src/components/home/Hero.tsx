import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Globe, 
  Target, 
  ShieldCheck, 
  Mail, 
  Check, 
  Crosshair, 
  Cog, 
  Zap, 
  ZoomIn 
} from 'lucide-react';
import { company } from '../../config/company';
import { useEnquiry } from '../../context/EnquiryContext';
import { useImageViewer } from '../../context/ImageViewerContext';
import { PrecisionText } from '../animation/PrecisionText';
import { PrecisionRuler } from '../animation/PrecisionRuler';
import { fadeUp } from '../../animations/variants';

export const Hero: React.FC = () => {
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();

  const handleInspectImage = () => {
    openImageViewer({
      src: "/assets/hero/desktop-hero-precision-gauging.webp",
      title: "Automated Multi-Gauging & Metrology Inspection Station",
      category: "Turnkey Metrology System",
      description: "AKIRA AUTOMATION precision CNC station featuring automated touch-trigger probing, multi-channel electronic readouts, and sub-micron repeatability for OEM manufacturing.",
      badge: "OEM Cleanroom Standard"
    });
  };

  return (
    <section className="relative bg-[#040e1b] text-white overflow-hidden pt-2 sm:pt-6 lg:pt-10 pb-7 sm:pb-12 lg:pb-8 rounded-b-[24px] sm:rounded-b-none border-b border-slate-800/80 w-full max-w-full shadow-2xl">
      {/* Background Engineering Grids & Accents */}
      <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-industrial-highlight/15 blur-3xl pointer-events-none" />

      {/* Precision Caliper Ruler Graphic at top */}
      <div className="absolute top-0 left-0 right-0">
        <PrecisionRuler ticksCount={64} highlightInterval={8} className="opacity-60" />
      </div>

      {/* ── MOBILE HERO BACKGROUND (UNTOUCHED - ONLY ON < lg) ── */}
      <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src="/assets/hero/mobile-hero-precision-gauging.webp"
          alt="AKIRA AUTOMATION Precision Gauging Station"
          className="w-full h-full object-cover object-[right_top] opacity-90 filter contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040d1a] via-[#040d1a]/80 via-45% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040d1a]/40 via-transparent via-30% to-[#040d1a]" />
      </div>

      {/* ── DESKTOP HERO BACKGROUND (WIDESCREEN RIGHT-SIDE MACHINE) ── */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[58%] xl:w-[55%] 2xl:w-[52%] overflow-hidden pointer-events-none z-0">
        <img
          src="/assets/hero/desktop-hero-precision-gauging.webp"
          alt="AKIRA AUTOMATION Precision Gauging Station"
          className="w-full h-full object-cover object-[center_right] filter contrast-105"
        />
        {/* Seamless gradient fade into dark navy left space */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040e1b] via-[#040e1b]/70 via-20% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040e1b] via-transparent via-15% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040e1b]/40 via-transparent via-20% to-transparent" />
      </div>

      <div className="industrial-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">
          
          {/* Left Column: Typography, CTAs & Technical Value Points (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col space-y-2.5 sm:space-y-4 pt-1 sm:pt-2">
            
            {/* Tag / Badge - Matches reference mockup */}
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
            <h1 className="text-[28px] xs:text-[32px] sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[56px] font-extrabold font-heading tracking-tight text-white leading-[1.15] lg:leading-[1.12] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
              <PrecisionText
                text="Precision Gauging Solutions for"
                highlightText="Modern Manufacturing"
                highlightClassName="text-[#00c2ff] sm:text-transparent sm:bg-clip-text sm:bg-gradient-to-r sm:from-sky-400 sm:to-blue-200"
                delay={0.15}
              />
            </h1>

            {/* Supporting Copy */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-[12.5px] sm:text-base text-slate-200 leading-relaxed max-w-[34rem] font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
            >
              {company.name} delivers high-quality <strong className="text-white font-semibold">precision instruments</strong> and automated multi-gauging systems for OEMs and <strong className="text-white font-semibold">automotive</strong> manufacturing, engineered for <strong className="text-white font-semibold">accuracy, productivity, and reliability</strong>.
            </motion.p>

            {/* Primary & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:items-center sm:gap-3.5 pt-1 w-full sm:w-auto"
            >
              <Link
                to="/solutions"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-7 py-3 min-h-[46px] sm:min-h-[48px] rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-md shadow-blue-950/40 hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-400 group text-center whitespace-nowrap"
              >
                <span>Explore Solutions</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
              </Link>
              <button
                type="button"
                onClick={() => openEnquiry()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-7 py-3 min-h-[46px] sm:min-h-[48px] rounded-lg bg-[#0b1d33]/85 text-white font-semibold text-xs sm:text-sm border border-sky-500/80 backdrop-blur-sm transition-all duration-200 hover:bg-slate-800/90 hover:text-white hover:border-sky-400 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-400 text-center whitespace-nowrap"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span>Request an Enquiry</span>
              </button>
            </motion.div>

            {/* ── MOBILE TELEMETRY DOCK (UNTOUCHED - lg:hidden) ── */}
            <div className="lg:hidden pt-2 sm:pt-4 w-full">
              <div className="grid grid-cols-3 divide-x divide-slate-700/60 rounded-xl sm:rounded-2xl bg-[#06182c]/85 border border-sky-500/30 backdrop-blur-md px-1.5 sm:px-4 py-2.5 sm:py-3 shadow-lg">
                <div className="flex items-center gap-1.5 sm:gap-2.5 px-1 sm:px-2 justify-center sm:justify-start">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[8px] sm:text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Industry</span>
                    <span className="block text-[10px] sm:text-xs font-bold text-white tracking-tight leading-tight whitespace-nowrap">Trusted</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5 px-1 sm:px-2 justify-center sm:justify-start">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[8px] sm:text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Precision</span>
                    <span className="block text-[10px] sm:text-xs font-bold text-white tracking-tight leading-tight whitespace-nowrap">Up to 0.1 µm</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5 px-1 sm:px-2 justify-center sm:justify-start">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[8px] sm:text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Countries</span>
                    <span className="block text-[10px] sm:text-xs font-bold text-white tracking-tight leading-tight whitespace-nowrap">Serving Globally</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── DESKTOP RIGHT COLUMN: FLOATING GLASS BADGES OVER MACHINE ── */}
          <div className="hidden lg:block lg:col-span-5 relative min-h-[420px] xl:min-h-[480px]">
            {/* Click to inspect trigger */}
            <button
              type="button"
              onClick={handleInspectImage}
              className="absolute top-2 left-2 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-[11px] font-semibold shadow-md backdrop-blur-md border border-slate-700 hover:bg-industrial-primary transition-colors cursor-pointer"
              title="Click to view full-resolution station"
            >
              <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
              <span>Inspect Station</span>
            </button>

            {/* Badge 1: Top Right - Trusted Since 2021 */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1 xl:top-3 right-0 xl:right-2 p-3 sm:p-3.5 rounded-2xl bg-[#06182c]/85 border border-sky-400/40 backdrop-blur-md shadow-[0_0_25px_rgba(14,165,233,0.2)] flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-slate-300 leading-tight">Trusted Since</span>
                <span className="block text-xl font-black font-heading text-white tracking-wider leading-tight">2021</span>
              </div>
            </motion.div>

            {/* Badge 2: Center-Left - ±0.001 mm Accuracy (Holographic Laser Probe Position) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[48%] -left-4 xl:-left-8 px-3.5 py-2.5 rounded-xl bg-[#06182c]/85 border border-sky-400/40 backdrop-blur-md shadow-[0_0_25px_rgba(14,165,233,0.2)] flex items-center gap-2.5 z-20"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white font-mono tracking-tight leading-tight">±0.001 mm</span>
                <span className="block text-[10px] text-slate-300 font-semibold uppercase tracking-wider leading-tight">Accuracy</span>
              </div>
            </motion.div>

            {/* Badge 3: Center-Right - Higher Accuracy, Less Rejection, Better Efficiency */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[38%] right-0 xl:right-2 p-3.5 rounded-xl bg-[#06182c]/85 border border-sky-400/40 backdrop-blur-md shadow-[0_0_25px_rgba(14,165,233,0.2)] flex flex-col gap-2 z-20 min-w-[155px]"
            >
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Higher Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Less Rejection</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Better Efficiency</span>
              </div>
            </motion.div>
          </div>

        </div>

        {/* ── DESKTOP FULL-WIDTH TELEMETRY DOCK & SLOGAN STRIP ── */}
        <div className="hidden lg:flex items-center justify-between mt-8 xl:mt-10 pt-5 border-t border-slate-800/90 relative z-20">
          <div className="flex items-center divide-x divide-slate-800/90 gap-4 xl:gap-8">
            {/* 1. High Precision */}
            <div className="flex items-center gap-3 pr-4 xl:pr-8">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/25 flex items-center justify-center text-sky-400">
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight">High Precision</span>
                <span className="block text-[11px] text-slate-400 leading-tight">Accurate Measurements</span>
              </div>
            </div>

            {/* 2. Automated Systems */}
            <div className="flex items-center gap-3 px-4 xl:px-8">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/25 flex items-center justify-center text-sky-400">
                <Cog className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight">Automated Systems</span>
                <span className="block text-[11px] text-slate-400 leading-tight">Multi-Gauging Solutions</span>
              </div>
            </div>

            {/* 3. Built for Industry */}
            <div className="flex items-center gap-3 px-4 xl:px-8">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/25 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight">Built for Industry</span>
                <span className="block text-[11px] text-slate-400 leading-tight">OEM & Automotive</span>
              </div>
            </div>

            {/* 4. Better Productivity */}
            <div className="flex items-center gap-3 pl-4 xl:pl-8">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/25 flex items-center justify-center text-sky-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight">Better Productivity</span>
                <span className="block text-[11px] text-slate-400 leading-tight">Faster, Smarter, Reliable</span>
              </div>
            </div>
          </div>

          {/* Slogan with geometric accent */}
          <div className="hidden xl:flex items-center gap-3 pl-6 border-l border-sky-500/30">
            <div className="w-4 h-0.5 bg-sky-400" />
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Smart Measurement.</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">Stronger Manufacturing.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
