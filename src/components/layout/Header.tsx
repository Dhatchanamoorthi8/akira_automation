import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Mail, 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Wind, 
  Gauge, 
  Award
} from 'lucide-react';
import { useEnquiry } from '../../context/EnquiryContext';
import { companyData } from '../../data/company';
import { solutions } from '../../data/solutions';
import { productSummaries } from '../../data/productSummaries';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdown, setSolutionsDropdown] = useState(false);
  const [productsDropdown, setProductsDropdown] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const { openEnquiry } = useEnquiry();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSolutionsDropdown(false);
    setProductsDropdown(false);
  }, [location.pathname]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSolutionsDropdown(false);
        setProductsDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleAccordion = (name: string) => {
    setMobileAccordion(mobileAccordion === name ? null : name);
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Utility Bar */}
      <div className="bg-industrial-dark text-slate-300 text-xs border-b border-slate-800">
        <div className="industrial-container py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
              <Award className="w-3.5 h-3.5 text-industrial-primary" />
              Sales & Service
            </span>
            <span className="hidden md:inline-block text-slate-500">|</span>
            <a 
              href={`mailto:${companyData.emails[0]}`} 
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-industrial-highlight" />
              <span>{companyData.emails[0]}</span>
            </a>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            <a 
              href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`} 
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors font-mono"
            >
              <Phone className="w-3.5 h-3.5 text-industrial-highlight" />
              <span>{companyData.phones[0]}</span>
            </a>
            <span className="hidden sm:inline-block text-slate-500">/</span>
            <a 
              href={`tel:${companyData.phones[1].replace(/\s+/g, '')}`} 
              className="hidden sm:inline-flex items-center gap-1.5 hover:text-white transition-colors font-mono"
            >
              <span>{companyData.phones[1]}</span>
            </a>
            <span className="hidden lg:inline-block px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
              Smart Solutions
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className={`w-full bg-white transition-all duration-300 border-b border-slate-200 shadow-sm ${
        isScrolled ? 'py-2.5 shadow-md' : 'py-3.5'
      }`}>
        <div className="industrial-container flex items-center justify-between">
          {/* Logo / Brand Area */}
          <Link to="/" className="flex items-center group focus:outline-none focus:ring-2 focus:ring-industrial-primary rounded-lg py-1 px-1 transition-opacity hover:opacity-95" aria-label="AKIRA AUTOMATION Home">
            <img
              src="/assets/company/akira-automation-logo.jpeg"
              alt="AKIRA AUTOMATION logo"
              className="h-10 sm:h-12 md:h-13 w-auto object-contain max-w-[260px] sm:max-w-[320px] transition-transform duration-300 group-hover:scale-[1.01]"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 text-sm font-medium text-industrial-text">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md transition-colors hover:text-industrial-primary hover:bg-slate-50 ${
                location.pathname === '/' ? 'text-industrial-primary font-semibold' : ''
              }`}
            >
              Home
            </Link>

            <Link 
              to="/about" 
              className={`px-3 py-2 rounded-md transition-colors hover:text-industrial-primary hover:bg-slate-50 ${
                location.pathname === '/about' ? 'text-industrial-primary font-semibold' : ''
              }`}
            >
              About Us
            </Link>

              {/* Solutions Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setSolutionsDropdown(true)}
                onMouseLeave={() => setSolutionsDropdown(false)}
              >
                <Link
                  to="/solutions"
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-md transition-colors hover:text-industrial-primary hover:bg-slate-50 ${
                    location.pathname.startsWith('/solutions') ? 'text-industrial-primary font-semibold' : ''
                  }`}
                >
                  <span>Solutions</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${solutionsDropdown ? 'rotate-180 text-industrial-primary' : ''}`} />
                </Link>

                <AnimatePresence>
                  {solutionsDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-0 w-[540px] bg-white rounded-xl shadow-elevated border border-slate-200 p-4 grid grid-cols-2 gap-2 z-50"
                    >
                      {solutions.slice(0, 8).map((sol) => (
                        <Link
                          key={sol.id}
                          to={`/solutions#${sol.slug}`}
                          className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-3 text-left group/item"
                        >
                          <div className="w-8 h-8 rounded-md bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0 group-hover/item:bg-industrial-primary group-hover/item:text-white transition-colors">
                            {sol.id === 'multigauging' && <Cpu className="w-4 h-4" />}
                            {sol.id === 'air-gauging' && <Wind className="w-4 h-4" />}
                            {sol.id === 'fixtures' && <Layers className="w-4 h-4" />}
                            {sol.id === 'electronic-gauging' && <Gauge className="w-4 h-4" />}
                            {sol.id !== 'multigauging' && sol.id !== 'air-gauging' && sol.id !== 'fixtures' && sol.id !== 'electronic-gauging' && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-industrial-dark group-hover/item:text-industrial-primary">
                              {sol.title}
                            </div>
                            <p className="text-[11px] text-industrial-muted line-clamp-1 mt-0.5">
                              {sol.shortDescription}
                            </p>
                          </div>
                        </Link>
                      ))}
                      <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-industrial-primary font-semibold">
                        <Link to="/solutions" className="inline-flex items-center gap-1 hover:underline">
                          View All 12 Core Solutions <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Products Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setProductsDropdown(true)}
                onMouseLeave={() => setProductsDropdown(false)}
              >
                <Link
                  to="/products"
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-md transition-colors hover:text-industrial-primary hover:bg-slate-50 ${
                    location.pathname.startsWith('/products') ? 'text-industrial-primary font-semibold' : ''
                  }`}
                >
                  <span>Products</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${productsDropdown ? 'rotate-180 text-industrial-primary' : ''}`} />
                </Link>

                <AnimatePresence>
                  {productsDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full -left-20 w-[620px] bg-white rounded-xl shadow-elevated border border-slate-200 p-4 grid grid-cols-2 gap-3 z-50"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2">Gauging & Tooling</span>
                        {productSummaries.slice(0, 5).map((p) => (
                          <Link
                            key={p.slug}
                            to={`/products/${p.slug}`}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-industrial-dark hover:text-industrial-primary transition-colors"
                          >
                            <span className="truncate">{p.title}</span>
                            <ArrowRight className="w-3 h-3 text-slate-300" />
                          </Link>
                        ))}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2">Displays & Multi-Gauging</span>
                        {productSummaries.slice(5, 11).map((p) => (
                          <Link
                            key={p.slug}
                            to={`/products/${p.slug}`}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-industrial-dark hover:text-industrial-primary transition-colors"
                          >
                            <span className="truncate">{p.title}</span>
                            <ArrowRight className="w-3 h-3 text-slate-300" />
                          </Link>
                        ))}
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-industrial-primary font-semibold">
                        <Link to="/products" className="inline-flex items-center gap-1 hover:underline">
                          Explore Full Product Catalogue <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            <Link 
              to="/industries" 
              className={`px-3 py-2 rounded-md transition-colors hover:text-industrial-primary hover:bg-slate-50 ${
                location.pathname === '/industries' ? 'text-industrial-primary font-semibold' : ''
              }`}
            >
              Industries
            </Link>

            <Link 
              to="/services" 
              className={`px-3 py-2 rounded-md transition-colors hover:text-industrial-primary hover:bg-slate-50 ${
                location.pathname === '/services' ? 'text-industrial-primary font-semibold' : ''
              }`}
            >
              Services
            </Link>

            <Link 
              to="/why-choose-us" 
              className={`px-3 py-2 rounded-md transition-colors hover:text-industrial-primary hover:bg-slate-50 ${
                location.pathname === '/why-choose-us' || location.pathname === '/why-milestone' ? 'text-industrial-primary font-semibold' : ''
              }`}
            >
              Why Choose Us
            </Link>

            <Link 
              to="/contact" 
              className={`px-3 py-2 rounded-md transition-colors hover:text-industrial-primary hover:bg-slate-50 ${
                location.pathname === '/contact' ? 'text-industrial-primary font-semibold' : ''
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action: Enquire Now Button */}
          <div className="hidden lg:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openEnquiry()}
              className="btn-primary"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-industrial-dark hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-industrial-primary"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="xl:hidden fixed inset-0 top-[104px] z-40">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-industrial-dark/50 backdrop-blur-sm"
              aria-hidden="true"
            />
            {/* Slide Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
              className="relative bg-white h-full w-4/5 max-w-sm ml-auto p-6 overflow-y-auto shadow-2xl flex flex-col justify-between z-10"
            >
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</p>
                </div>

                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.03, delayChildren: 0.05 }
                    }
                  }}
                  className="flex flex-col gap-1 text-sm font-medium"
                >
                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link to="/" className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 text-industrial-dark font-medium">
                      Home
                    </Link>
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link to="/about" className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 text-industrial-dark font-medium">
                      About Us
                    </Link>
                  </motion.div>

                  {/* Mobile Solutions Accordion */}
                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <button 
                      onClick={() => toggleAccordion('solutions')}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-industrial-dark font-medium"
                    >
                      <span>Solutions</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordion === 'solutions' ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileAccordion === 'solutions' && (
                      <div className="pl-4 py-1 space-y-1 bg-slate-50 rounded-lg mt-1 text-xs">
                        {solutions.slice(0, 6).map((sol) => (
                          <Link key={sol.id} to={`/solutions#${sol.slug}`} className="block py-1.5 px-2 text-slate-700 hover:text-industrial-primary">
                            {sol.title}
                          </Link>
                        ))}
                        <Link to="/solutions" className="block py-1.5 px-2 text-industrial-primary font-semibold">
                          View All Solutions →
                        </Link>
                      </div>
                    )}
                  </motion.div>

                  {/* Mobile Products Accordion */}
                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <button 
                      onClick={() => toggleAccordion('products')}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-industrial-dark font-medium"
                    >
                      <span>Products</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordion === 'products' ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileAccordion === 'products' && (
                      <div className="pl-4 py-1 space-y-1 bg-slate-50 rounded-lg mt-1 text-xs">
                        {productSummaries.slice(0, 6).map((prod) => (
                          <Link key={prod.slug} to={`/products/${prod.slug}`} className="block py-1.5 px-2 text-slate-700 hover:text-industrial-primary">
                            {prod.title}
                          </Link>
                        ))}
                        <Link to="/products" className="block py-1.5 px-2 text-industrial-primary font-semibold">
                          View Full Catalogue →
                        </Link>
                      </div>
                    )}
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link to="/industries" className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 text-industrial-dark font-medium">
                      Industries
                    </Link>
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link to="/services" className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 text-industrial-dark font-medium">
                      Services
                    </Link>
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link to="/why-choose-us" className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 text-industrial-dark font-medium">
                      Why Choose Us
                    </Link>
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link to="/contact" className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 text-industrial-dark font-medium">
                      Contact
                    </Link>
                  </motion.div>
                </motion.div>
              </div>

              <div className="pt-6 border-t border-slate-200 space-y-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openEnquiry();
                  }}
                  className="w-full btn-primary text-center"
                >
                  Enquire Now
                </button>
                <div className="text-xs text-industrial-muted space-y-1">
                  <p className="font-semibold text-industrial-dark">Direct Lines:</p>
                  <p className="font-mono">{companyData.phones[0]}</p>
                  <p className="font-mono">{companyData.phones[1]}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
