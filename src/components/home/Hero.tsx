import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle2, Sliders, Gauge } from 'lucide-react';
import { company } from '../../config/company';
import { useEnquiry } from '../../context/EnquiryContext';
import { ShinyText } from '../animation/ShinyText';
import { PrecisionText } from '../animation/PrecisionText';
import { PrecisionRuler } from '../animation/PrecisionRuler';
import { fadeUp, heroImageReveal } from '../../animations/variants';

export const Hero: React.FC = () => {
  const { openEnquiry } = useEnquiry();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative bg-gradient-to-br from-industrial-dark via-[#0c2642] to-industrial-dark text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
      {/* Background Engineering Grids & Accents */}
      <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-industrial-highlight/15 blur-3xl pointer-events-none" />

      {/* Precision Caliper Ruler Graphic at top */}
      <div className="absolute top-0 left-0 right-0">
        <PrecisionRuler ticksCount={64} highlightInterval={8} className="opacity-60" />
      </div>

      <div className="industrial-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Typography & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tag / Badge */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wider uppercase text-industrial-highlight backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span><ShinyText>{company.tagline}</ShinyText></span>
            </motion.div>

            {/* Main Hero Headline with PrecisionText */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-white leading-[1.12]">
              <PrecisionText
                text="Precision Gauging Solutions for"
                highlightText="Modern Manufacturing"
                delay={0.15}
              />
            </h1>

            {/* Supporting Copy */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal"
            >
              {company.name} delivers high-quality precision instruments and automated multi-gauging systems. Supporting OEMs, automation integrators, and precision engineering sectors with customized gauging solutions focused on <strong className="text-white font-semibold">accuracy, productivity, and reliability</strong>.
            </motion.p>

            {/* Key Value Points from PPT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 text-xs text-slate-300"
            >
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/10">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Automated Multi-Gauging</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/10">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Compressed Air Technology</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/10">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Tailored Fixtures</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 w-full sm:w-auto"
            >
              <Link
                to="/solutions"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-industrial-primary text-white font-bold text-sm tracking-wide transition-all duration-200 hover:bg-sky-600 shadow-lg shadow-blue-900/30 hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-400 group text-center"
              >
                <span>Explore Solutions</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
              </Link>
              <button
                type="button"
                onClick={() => openEnquiry()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-white/10 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-400 text-center"
              >
                <span>Request an Enquiry</span>
                <Sliders className="w-4 h-4 text-sky-300 shrink-0" />
              </button>
            </motion.div>

            {/* Micro Metrology Indicator Strip */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-sm bg-tolerance-green inline-block shrink-0" />
                <span>Tolerance: Tri-Colour Status</span>
              </div>
              <div className="flex items-center gap-2 font-mono whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block shrink-0" />
                <span>Resolution: Up to 0.1 µm</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero High-Res Metrology Image from PPT (5 cols) */}
          <motion.div
            variants={heroImageReveal}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-industrial-dark group">
              <img
                src="/assets/hero/hero-lab-gauging.webp"
                alt="AKIRA AUTOMATION Precision Metrology and Automated Gauging System"
                className="w-full h-auto object-cover max-h-[520px] transition-transform duration-700 group-hover:scale-103"
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

              {/* Technical Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-industrial-dark/85 backdrop-blur-md border border-slate-700 text-xs text-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white font-heading">Automated Multi-Gauging Systems</p>
                  <p className="text-[11px] text-slate-400">High-speed dimensional verification for OEM manufacturing</p>
                </div>
                <div className="shrink-0 px-2.5 py-1 rounded bg-industrial-primary text-[10px] font-mono text-white font-bold">
                  PRECISION
                </div>
              </div>
            </div>

            {/* Floating Established Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -top-4 -left-4 bg-white text-industrial-dark rounded-xl p-3 shadow-card border border-slate-200 hidden sm:flex items-center gap-3 z-20"
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

