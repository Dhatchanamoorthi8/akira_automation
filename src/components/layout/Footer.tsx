import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Clock, Award } from 'lucide-react';
import { company } from '../../config/company';
import { companyData } from '../../data/company';
import { productCategories } from '../../data/productSummaries';
import { Reveal } from '../animation/Reveal';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-industrial-dark text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="industrial-container">
        {/* Main Footer Grid */}
        <Reveal direction="up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
            
            {/* Col 1: Brand & Profile */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="inline-block bg-white p-2.5 rounded-lg border border-slate-700/60 shadow-sm hover:border-slate-500 transition-colors">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-11 sm:h-12 w-auto max-w-[240px] sm:max-w-[280px] object-contain rounded"
                  loading="lazy"
                />
              </Link>

              <p className="text-xs tracking-wider text-industrial-highlight uppercase font-bold">
                {company.tagline}
              </p>

              <p className="text-xs italic text-industrial-secondary font-medium">
                "{company.slogan}"
              </p>

              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                Specialized in precision gauging, automated multi-gauging, fixtures, air gauges, electronic gauges, and work-holding solutions tailored for OEM and precision manufacturing.
              </p>

              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                  <Award className="w-4 h-4 text-industrial-primary" />
                  <span>Motto: <strong>"Keeping Customers First"</strong></span>
                </div>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                Quick Navigation
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/solutions" className="text-slate-400 hover:text-white transition-colors">
                    Solutions
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-slate-400 hover:text-white transition-colors">
                    Products Catalogue
                  </Link>
                </li>
                <li>
                  <Link to="/industries" className="text-slate-400 hover:text-white transition-colors">
                    Industries We Serve
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-slate-400 hover:text-white transition-colors">
                    Service & Support
                  </Link>
                </li>
                <li>
                  <Link to="/why-choose-us" className="text-slate-400 hover:text-white transition-colors">
                    Why Choose Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                    Contact & Enquiry
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Product Categories */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                Product Categories
              </h3>
              <ul className="space-y-2.5 text-sm">
                {productCategories.filter(c => c.slug !== 'all').map((cat) => (
                  <li key={cat.slug}>
                    <Link 
                      to={`/products?category=${cat.slug}`} 
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Registered Office & Contact */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                Registered Office
              </h3>
              <div className="space-y-3.5 text-sm text-slate-400">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                  <p className="leading-snug text-xs">
                    {companyData.address.street},<br />
                    {companyData.address.village}, {companyData.address.city},<br />
                    {companyData.address.district},<br />
                    {companyData.address.state} - {companyData.address.pin}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <a href={`mailto:${companyData.emails[0]}`} className="hover:text-white block transition-colors">
                      {companyData.emails[0]}
                    </a>
                    <a href={`mailto:${companyData.emails[1]}`} className="hover:text-white block transition-colors">
                      {companyData.emails[1]}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs font-mono">
                    <a href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`} className="hover:text-white block transition-colors">
                      {companyData.phones[0]}
                    </a>
                    <a href={`tel:${companyData.phones[1].replace(/\s+/g, '')}`} className="hover:text-white block transition-colors">
                      {companyData.phones[1]}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{companyData.businessHours}</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Bottom Legal Bar */}
        <Reveal direction="up" delay={0.15}>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} <strong>{company.name}</strong>. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-slate-400">
              <span>{company.slogan}</span>
              <span>•</span>
              <span>Technical Support • Quality Service • Team Spirit</span>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
};
