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

export const Home: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Precision Gauging & Smart Automation Solutions"
        description="AKIRA AUTOMATION provides precision gauging, automated multi-gauging systems, air plug gauges, air ring gauges, fixtures, and electronic displays."
        keywords="AKIRA AUTOMATION, Akira Automation, Precision Gauging, Multi Gauging Solutions, Air Gauging, Fixtures, Air Plug Gauges, Air Ring Gauges"
      />
      
      {/* Exact Order specified in Requirement 45 */}
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
