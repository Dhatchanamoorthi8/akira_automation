import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Gauge } from 'lucide-react';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { Reveal } from '../components/animation/Reveal';
import { ScaleReveal } from '../components/animation/ScaleReveal';

export const NotFound: React.FC = () => {
  return (
    <>
      <SEOHead
        title="404 - Page Not Found"
        description={`The requested page could not be located on ${company.name} website.`}
        noIndex={true}
      />

      <section className="py-24 bg-industrial-bg min-h-[65vh] flex items-center">
        <div className="industrial-container max-w-lg mx-auto text-center space-y-6">
          <ScaleReveal>
            <div className="w-20 h-20 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center mx-auto shadow-sm">
              <Gauge className="w-10 h-10" />
            </div>
          </ScaleReveal>

          <Reveal direction="up">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-industrial-primary">
              Error 404
            </span>
            <h1 className="text-3xl font-extrabold font-heading text-industrial-dark mt-1">
              Dimensional Offset: Page Not Found
            </h1>
            <p className="text-xs text-industrial-muted mt-2 leading-relaxed">
              The requested URL could not be found. Please check the address or use the navigation below to browse our precision metrology catalogue.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.15} className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/" className="btn-primary text-xs py-2.5">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
            <Link to="/products" className="btn-secondary text-xs py-2.5">
              <Search className="w-4 h-4" />
              <span>Browse Products</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
};
