import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Button, Chip, Card } from '@heroui/react';
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
    <section className="relative bg-industrial-dark text-white overflow-hidden pt-8 sm:pt-12 lg:pt-16 pb-10 sm:pb-14 lg:pb-12 border-b border-slate-800/80 w-full max-w-full shadow-elevated">
      {/* Background Engineering Grids & Accents (Blurs restricted to desktop) */}
      <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
      <div className="hidden lg:block absolute -top-32 -right-32 w-96 h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-industrial-highlight/15 blur-3xl pointer-events-none" />

      {/* Precision Caliper Ruler Graphic at top - only on sm+ */}
      <div className="hidden sm:block absolute top-0 left-0 right-0">
        <PrecisionRuler ticksCount={64} highlightInterval={8} className="opacity-60" />
      </div>

      {/* ── DESKTOP HERO BACKGROUND (WIDESCREEN RIGHT-SIDE MACHINE) ── */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[58%] xl:w-[55%] 2xl:w-[52%] overflow-hidden pointer-events-none z-0">
        <img
          src="/assets/hero/desktop-hero-precision-gauging.webp"
          alt="Akira Precision Automation Precision Gauging Station"
          className="w-full h-full object-cover object-[center_right] filter contrast-105"
        />
        {/* Seamless gradient fade into dark navy left space */}
        <div className="absolute inset-0 bg-gradient-to-r from-industrial-dark via-industrial-dark/70 via-20% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-industrial-dark via-transparent via-15% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-industrial-dark/40 via-transparent via-20% to-transparent" />
      </div>

      <div className="industrial-container relative z-10">
        
        {/* ══════════════════════════════════════════════════════════════════════
            MOBILE HERO (lg:hidden) - Lightweight, 60fps Smooth
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col space-y-3.5 pt-1 pb-1">
          {/* 1. Status Pill & Tag */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-slate-100 shadow-subtle">
              <span className="text-xs font-semibold tracking-wider text-slate-200 font-sans uppercase">
                ISO 9001 • Sub-Micron Precision
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-sky-400 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800">
              OEM Ready
            </span>
          </div>

          {/* 2. Main Headline */}
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white leading-[1.2]">
            Precision Gauging for{' '}
            <span className="text-sky-400">
              Zero-Defect Manufacturing
            </span>
          </h1>

          {/* 3. Concise Subtext */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {company.name} delivers high-accuracy automated multi-gauging stations, pneumatic air tooling, and custom fixtures engineered for automotive and OEM production lines.
          </p>

          {/* 4. Dedicated Hero Card */}
          <div
            onClick={handleInspectImage}
            role="button"
            tabIndex={0}
            title="Tap to inspect full-resolution metrology station"
            aria-label="Tap to inspect full-resolution metrology station"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleInspectImage();
              }
            }}
            className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-card group cursor-pointer my-1 active:scale-[0.99] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-industrial-primary"
          >
            <img
              src="/assets/hero/desktop-hero-precision-gauging.webp"
              alt="Automated Multi-Gauging & Metrology Inspection Station"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width="480"
              height="220"
              className="w-full h-[180px] sm:h-[210px] object-cover object-center"
            />

            {/* Gradient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-industrial-dark via-industrial-dark/40 to-transparent pointer-events-none" />

            {/* Top Left Badge: In-Line Metrology Cell */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-700 text-slate-100 text-xs font-semibold tracking-wide shadow-subtle">
                <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                <span>In-Line Metrology Cell</span>
              </span>
            </div>

            {/* Top Right Sub-Micron Pill (Standardized 2:1 number/unit ratio) */}
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-700 text-slate-100 text-xs shadow-subtle">
                <span className="text-slate-400 font-mono text-xs">≤</span>
                <span className="font-mono font-bold text-xs text-white">0.0005</span>
                <span className="text-xs text-slate-400 font-mono">mm</span>
              </span>
            </div>

            {/* Bottom Overlay Information Strip */}
            <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
              <div className="min-w-0 pr-2">
                <p className="text-white text-xs font-bold font-mono truncate">
                  Automated Multi-Gauging Station
                </p>
                <p className="text-slate-300 text-xs truncate">
                  Touch-Trigger & Multi-Channel Electronic DRO
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-bold bg-slate-950/90 border border-slate-700 px-2.5 py-1 rounded-lg shrink-0">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Inspect</span>
              </span>
            </div>
          </div>

          {/* 5. Thumb-Friendly CTAs */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5 w-full">
            <Link
              to="/solutions"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[46px] rounded-lg bg-industrial-primary hover:bg-industrial-hover active:bg-industrial-dark text-white font-bold text-xs tracking-wide shadow-subtle transition-colors text-center whitespace-nowrap font-sans"
            >
              <span>Explore Solutions</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
            <Button
              variant="outline"
              size="lg"
              onPress={() => openEnquiry()}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[46px] rounded-lg bg-slate-900/80 text-white font-semibold text-xs border border-slate-700 hover:bg-slate-800 active:bg-slate-900 text-center whitespace-nowrap font-sans cursor-pointer transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Request an Enquiry</span>
            </Button>
          </div>

          {/* 6. Refined Telemetry Dock */}
          <div className="pt-1 w-full">
            <div className="grid grid-cols-3 divide-x divide-slate-800 rounded-xl bg-slate-900/90 border border-slate-800 px-2 py-2.5 shadow-subtle">
              <div className="flex flex-col items-center text-center px-1">
                <div className="flex items-center gap-1 text-sky-400 mb-0.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold text-slate-400 uppercase font-sans">Industry</span>
                </div>
                <span className="text-xs font-bold text-white leading-tight font-sans">Trusted OEM</span>
              </div>
              <div className="flex flex-col items-center text-center px-1">
                <div className="flex items-center gap-1 text-sky-400 mb-0.5">
                  <Target className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold text-slate-400 uppercase font-sans">Precision</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-slate-400 text-xs">≤</span>
                  <span className="text-xs font-bold text-white leading-tight tabular-nums font-sans">0.1</span>
                  <span className="text-xs text-slate-400 font-medium font-sans">µm</span>
                </div>
              </div>
              <div className="flex flex-col items-center text-center px-1">
                <div className="flex items-center gap-1 text-sky-400 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold text-slate-400 uppercase font-sans">Audit</span>
                </div>
                <span className="text-xs font-bold text-white leading-tight font-sans">100% Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            DESKTOP HERO (hidden lg:grid) - Widescreen Layout & Floating Badges
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">
          
          {/* Left Column: Typography, CTAs & Technical Value Points (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col space-y-2.5 sm:space-y-4 pt-1 sm:pt-2">
            
            {/* Tag / Badge - HeroUI Chip */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="self-start"
            >
              <Chip
                variant="soft"
                color="accent"
                size="sm"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 shadow-subtle text-slate-100 font-sans tracking-wider"
              >
                <Chip.Label className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  PRECISION • INNOVATION • SMART SOLUTIONS
                </Chip.Label>
              </Chip>
            </motion.div>

            {/* Main Hero Headline with PrecisionText */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-white leading-[1.15] lg:leading-[1.12]">
              <PrecisionText
                text="Precision Gauging Solutions for"
                highlightText="Modern Manufacturing"
                highlightClassName="text-sky-400 sm:text-transparent sm:bg-clip-text sm:bg-gradient-to-r sm:from-sky-400 sm:to-blue-200"
                delay={0.15}
              />
            </h1>

            {/* Supporting Copy */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-[34rem] font-normal"
            >
              {company.name} delivers high-quality <strong className="text-white font-semibold">precision instruments</strong> and automated multi-gauging systems for OEMs and <strong className="text-white font-semibold">automotive</strong> manufacturing, engineered for <strong className="text-white font-semibold">accuracy, productivity, and reliability</strong>.
            </motion.p>

            {/* Primary & Secondary CTAs */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-row items-center gap-3.5 pt-1 w-auto"
            >
              <Link
                to="/solutions"
                className="button button--primary button--lg w-auto inline-flex items-center justify-center gap-2 px-7 py-3 min-h-[46px] rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-card group text-center whitespace-nowrap font-sans"
              >
                <span>Explore Solutions</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
              </Link>
              <Button
                variant="outline"
                size="lg"
                onPress={() => openEnquiry()}
                className="w-auto inline-flex items-center justify-center gap-2 px-7 py-3 min-h-[46px] rounded-lg bg-slate-900/80 text-white font-semibold text-sm border border-slate-700 backdrop-blur-sm transition-all duration-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 text-center whitespace-nowrap font-sans group cursor-pointer"
              >
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Request an Enquiry</span>
              </Button>
            </motion.div>

          </div>

          {/* ── DESKTOP RIGHT COLUMN: FLOATING BADGES OVER MACHINE ── */}
          <div className="hidden lg:block lg:col-span-5 relative min-h-[420px] xl:min-h-[480px]">
            {/* Click to inspect trigger */}
            <Button
              variant="secondary"
              size="sm"
              onPress={handleInspectImage}
              className="absolute top-2 left-2 z-20 inline-flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-lg bg-slate-900/90 text-white text-xs font-semibold shadow-card backdrop-blur-md border border-slate-700 hover:bg-industrial-primary transition-colors cursor-pointer font-sans focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
              aria-label="Click to view full-resolution station"
            >
              <ZoomIn className="w-4 h-4 text-sky-400" />
              <span>Inspect Station</span>
            </Button>

            {/* Badge 1: Top Right - Trusted Since 2021 */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1 xl:top-3 right-0 xl:right-2 z-20"
            >
              <Card className="p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-card flex flex-row items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-subtle">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-300 leading-tight font-sans">Trusted Since</span>
                  <span className="block text-xl font-black font-heading text-white tracking-wider leading-tight">2021</span>
                </div>
              </Card>
            </motion.div>

            {/* Badge 2: Center-Left - ±0.001 mm Accuracy (2:1 unit ratio) */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[48%] -left-4 xl:-left-8 z-20"
            >
              <Card className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-card flex flex-row items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-baseline gap-0.5 leading-tight">
                    <span className="text-xs text-slate-400 font-mono font-medium">±</span>
                    <span className="text-sm font-bold text-white font-mono tabular-nums">0.001</span>
                    <span className="text-xs text-slate-400 font-medium font-sans">mm</span>
                  </div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider leading-tight font-sans">Accuracy</span>
                </div>
              </Card>
            </motion.div>

            {/* Badge 3: Center-Right - Higher Accuracy, Less Rejection, Better Efficiency */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[38%] right-0 xl:right-2 z-20 min-w-[155px]"
            >
              <Card className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-card flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 font-sans">Higher Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 font-sans">Less Rejection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 font-sans">Better Efficiency</span>
                </div>
              </Card>
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
                <span className="block text-xs font-bold text-white leading-tight font-sans">High Precision</span>
                <span className="block text-xs text-slate-300 font-medium leading-tight font-sans">Accurate Measurements</span>
              </div>
            </div>

            {/* 2. Automated Systems */}
            <div className="flex items-center gap-3 px-4 xl:gap-8">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/25 flex items-center justify-center text-sky-400">
                <Cog className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight font-sans">Automated Systems</span>
                <span className="block text-xs text-slate-300 font-medium leading-tight font-sans">Multi-Gauging Solutions</span>
              </div>
            </div>

            {/* 3. Built for Industry */}
            <div className="flex items-center gap-3 px-4 xl:gap-8">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/25 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight font-sans">Built for Industry</span>
                <span className="block text-xs text-slate-300 font-medium leading-tight font-sans">OEM & Automotive</span>
              </div>
            </div>

            {/* 4. Better Productivity */}
            <div className="flex items-center gap-3 pl-4 xl:pr-8">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/25 flex items-center justify-center text-sky-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight font-sans">Better Productivity</span>
                <span className="block text-xs text-slate-300 font-medium leading-tight font-sans">Faster, Smarter, Reliable</span>
              </div>
            </div>
          </div>

          {/* Slogan with geometric accent */}
          <div className="hidden xl:flex items-center gap-3 pl-6 border-l border-sky-500/30">
            <div className="w-4 h-0.5 bg-sky-400" />
            <div className="text-right">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-300 font-heading">Smart Measurement.</p>
              <p className="text-xs font-extrabold uppercase tracking-widest text-sky-400 font-heading">Stronger Manufacturing.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

