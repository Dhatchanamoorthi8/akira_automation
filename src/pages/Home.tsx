import React from 'react';
import { SEOHead } from '../components/layout/SEOHead';
import { Hero } from '../components/home/Hero';
import { TrustStrip } from '../components/home/TrustStrip';
import { AboutSection } from '../components/home/AboutSection';
import { SolutionsGrid } from '../components/home/SolutionsGrid';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { MultigaugingShowcase } from '../components/home/MultigaugingShowcase';
import { CustomerBenefits } from '../components/home/CustomerBenefits';
import { IndustriesSection } from '../components/home/IndustriesSection';
import { AutomationSection } from '../components/home/AutomationSection';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';
import { ServiceSupportSection } from '../components/home/ServiceSupportSection';
import { InstrumentsFixturesGallery } from '../components/home/InstrumentsFixturesGallery';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { ContactSection } from '../components/home/ContactSection';
import { createOrganizationSchema, createWebSiteSchema } from '../config/seo';

export const Home: React.FC = () => {
  const homeSchemas = [
    createOrganizationSchema(),
    createWebSiteSchema()
  ];

  return (
    <>
      <SEOHead
        title="AKIRA AUTOMATION | Precision • Innovation • Smart Solutions"
        description="AKIRA AUTOMATION provides high-precision gauging fixtures, automated multi-gauging stations, air gauges, digital DRO displays, and work-holding solutions for manufacturing."
        keywords="AKIRA AUTOMATION, Precision Gauging India, Multi Gauging Solutions, Air Gauging, Air Plug Gauge, Air Ring Gauge, Inspection Fixtures, Industrial Metrology"
        canonicalPath="/"
        structuredData={homeSchemas}
      />
      
      {/* 1. Hero */}
      <Hero />

      {/* 2. Trust / Strength Strip */}
      <TrustStrip />

      {/* 3. About Us */}
      <AboutSection />

      {/* 4. Core Solutions */}
      <SolutionsGrid />

      {/* 5. Featured Products */}
      <FeaturedProducts />

      {/* 6. Multi-Gauging Showcase */}
      <MultigaugingShowcase />

      {/* 7. Customer Benefits */}
      <CustomerBenefits />

      {/* 8. Industries We Serve */}
      <IndustriesSection />

      {/* 9. Automation & Technology */}
      <AutomationSection />

      {/* 10. Why Choose Us */}
      <WhyChooseUsSection />

      {/* 11. Service & Support */}
      <ServiceSupportSection />

      {/* 12. Instruments / Special Gauges */}
      <InstrumentsFixturesGallery />

      {/* 13. Enquiry CTA */}
      <EnquiryCTA />

      {/* 14. Contact Section */}
      <ContactSection />
    </>
  );
};
