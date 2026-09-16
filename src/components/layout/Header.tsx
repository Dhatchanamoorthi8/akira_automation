import React, { useState, useEffect, useRef } from 'react';
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
import { useCompanyEmails } from '../../hooks/useCompanyEmails';
import { solutions } from '../../data/solutions';
import { productSummaries } from '../../data/productSummaries';

export const Header: React.FC = () => {
  const emails = useCompanyEmails();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdown, setSolutionsDropdown] = useState(false);
  const [productsDropdown, setProductsDropdown] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

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

  // Handle Escape key, body scroll lock, and keyboard focus trap for mobile drawer
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
          return;
        }

        if (e.key === 'Tab' && drawerRef.current) {
          const focusables = Array.from(
            drawerRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          );
          if (focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        if (triggerButtonRef.current) {
          triggerButtonRef.current.focus();
        }
      };
    } else {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSolutionsDropdown(false);
          setProductsDropdown(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [mobileMenuOpen]);

  const toggleAccordion = (name: string) => {
    setMobileAccordion(mobileAccordion === name ? null : name);
  };

  return (
    <header className="sticky top-0 z-50 w-full max-w-full transition-all duration-300">
      {/* Top Utility Bar - Compact Engineering Status Bar */}
      <div className="bg-industrial-dark text-slate-300 text-[10px] sm:text-xs border-b border-slate-800 w-full overflow-hidden">
        <div className="industrial-container py-1 sm:py-1.5 flex items-center justify-between gap-2 sm:gap-4 max-w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 sm:flex-initial">
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-300 font-medium shrink-0">
              <Award className="w-3.5 h-3.5 text-industrial-primary" />
              Sales & Service
            </span>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <a 
              href={`mailto:${emails[0]}`} 
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors truncate min-w-0 font-mono text-[10px] sm:text-xs"
              title={emails[0]}
            >
              <Mail className="w-3 h-3 text-industrial-highlight shrink-0" />
              <span className="truncate">{emails[0]}</span>
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-[10px] sm:text-xs">
            <a 
              href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`} 
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors font-mono whitespace-nowrap"
            >
              <Phone className="w-3 h-3 text-industrial-highlight shrink-0" />
              <span>{companyData.phones[0]}</span>
            </a>
            <span className="hidden sm:inline-block text-slate-600">/</span>
            <a 
              href={`tel:${companyData.phones[1].replace(/\s+/g, '')}`} 
              className="hidden sm:inline-flex items-center gap-1.5 hover:text-white transition-colors font-mono whitespace-nowrap"
            >
              <span>{companyData.phones[1]}</span>
            </a>
            <span className="hidden lg:inline-block px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 uppercase tracking-wider font-semibold font-mono">
              Smart Solutions
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className={`w-full bg-white transition-all duration-300 border-b border-slate-200/90 shadow-subtle ${
        isScrolled ? 'py-1.5 sm:py-2.5 shadow-sm' : 'py-2 sm:py-3.5'
      }`}>
        <div className="industrial-container flex items-center justify-between">
          {/* Logo / Brand Area */}
          <Link to="/" className="flex items-center group focus:outline-none focus:ring-2 focus:ring-industrial-primary rounded-lg py-0.5 px-0.5 transition-opacity hover:opacity-95" aria-label="AKIRA AUTOMATION Home">
            <img
              src="/assets/company/akira-automation-logo.jpeg"
              alt="AKIRA AUTOMATION logo"
              className="h-8 sm:h-11 md:h-12 w-auto object-contain max-w-[165px] sm:max-w-[300px] transition-transform duration-300 group-hover:scale-[1.01]"
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
                      className="absolute top-full -left-28 w-[720px] bg-white rounded-xl shadow-elevated border border-slate-200 p-4 grid grid-cols-2 gap-4 z-50"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2">Gauging & Tooling</span>
                        {productSummaries.slice(0, 5).map((p) => (
                          <Link
                            key={p.slug}
                            to={`/products/${p.slug}`}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-industrial-dark hover:text-industrial-primary transition-colors gap-2"
                          >
                            <span className="line-clamp-2 leading-tight">{p.title}</span>
                            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                          </Link>
                        ))}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2">Displays & Multi-Gauging</span>
                        {productSummaries.slice(5, 11).map((p) => (
                          <Link
                            key={p.slug}
                            to={`/products/${p.slug}`}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-industrial-dark hover:text-industrial-primary transition-colors gap-2"
                          >
                            <span className="line-clamp-2 leading-tight">{p.title}</span>
                            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
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
            ref={triggerButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-industrial-dark hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-industrial-primary min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div 
            className="xl:hidden fixed inset-0 z-50 overflow-hidden flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-industrial-dark/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Slide Drawer */}
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.28 }}
              className="relative bg-white h-full w-full max-w-sm sm:max-w-md p-5 sm:p-6 overflow-y-auto shadow-2xl flex flex-col justify-between z-10 border-l border-slate-200"
            >
              <div className="space-y-4">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/company/akira-automation-logo.jpeg"
                      alt="AKIRA AUTOMATION"
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-slate-500 hover:text-industrial-dark hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-industrial-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.03, delayChildren: 0.04 }
                    }
                  }}
                  className="flex flex-col gap-1 text-sm font-medium"
                >
                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link 
                      to="/" 
                      className={`block px-3.5 py-2.5 rounded-lg transition-colors font-medium ${
                        location.pathname === '/' ? 'bg-industrial-accent text-industrial-primary font-semibold' : 'hover:bg-slate-50 text-industrial-dark'
                      }`}
                    >
                      Home
                    </Link>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link 
                      to="/about" 
                      className={`block px-3.5 py-2.5 rounded-lg transition-colors font-medium ${
                        location.pathname === '/about' ? 'bg-industrial-accent text-industrial-primary font-semibold' : 'hover:bg-slate-50 text-industrial-dark'
                      }`}
                    >
                      About Us
                    </Link>
                  </motion.div>

                  {/* Mobile Solutions Accordion */}
                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <button 
                      onClick={() => toggleAccordion('solutions')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors font-medium ${
                        location.pathname.startsWith('/solutions') ? 'bg-industrial-accent text-industrial-primary font-semibold' : 'hover:bg-slate-50 text-industrial-dark'
                      }`}
                      aria-expanded={mobileAccordion === 'solutions'}
                    >
                      <span>Solutions</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'solutions' ? 'rotate-180 text-industrial-primary' : ''}`} />
                    </button>
                    {mobileAccordion === 'solutions' && (
                      <div className="pl-4 py-1.5 space-y-1 bg-slate-50 rounded-lg mt-1 text-xs border border-slate-100">
                        {solutions.slice(0, 6).map((sol) => (
                          <Link key={sol.id} to={`/solutions#${sol.slug}`} className="block py-1.5 px-2 text-slate-700 hover:text-industrial-primary">
                            {sol.title}
                          </Link>
                        ))}
                        <Link to="/solutions" className="block py-1.5 px-2 text-industrial-primary font-semibold hover:underline">
                          View All 12 Solutions →
                        </Link>
                      </div>
                    )}
                  </motion.div>

                  {/* Mobile Products Accordion */}
                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <button 
                      onClick={() => toggleAccordion('products')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors font-medium ${
                        location.pathname.startsWith('/products') ? 'bg-industrial-accent text-industrial-primary font-semibold' : 'hover:bg-slate-50 text-industrial-dark'
                      }`}
                      aria-expanded={mobileAccordion === 'products'}
                    >
                      <span>Products</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'products' ? 'rotate-180 text-industrial-primary' : ''}`} />
                    </button>
                    {mobileAccordion === 'products' && (
                      <div className="pl-4 py-1.5 space-y-1 bg-slate-50 rounded-lg mt-1 text-xs border border-slate-100">
                        {productSummaries.slice(0, 6).map((prod) => (
                          <Link key={prod.slug} to={`/products/${prod.slug}`} className="block py-1.5 px-2 text-slate-700 hover:text-industrial-primary">
                            {prod.title}
                          </Link>
                        ))}
                        <Link to="/products" className="block py-1.5 px-2 text-industrial-primary font-semibold hover:underline">
                          View Full Catalogue →
                        </Link>
                      </div>
                    )}
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link 
                      to="/industries" 
                      className={`block px-3.5 py-2.5 rounded-lg transition-colors font-medium ${
                        location.pathname === '/industries' ? 'bg-industrial-accent text-industrial-primary font-semibold' : 'hover:bg-slate-50 text-industrial-dark'
                      }`}
                    >
                      Industries
                    </Link>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link 
                      to="/services" 
                      className={`block px-3.5 py-2.5 rounded-lg transition-colors font-medium ${
                        location.pathname === '/services' ? 'bg-industrial-accent text-industrial-primary font-semibold' : 'hover:bg-slate-50 text-industrial-dark'
                      }`}
                    >
                      Services
                    </Link>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link 
                      to="/why-choose-us" 
                      className={`block px-3.5 py-2.5 rounded-lg transition-colors font-medium ${
                        location.pathname === '/why-choose-us' ? 'bg-industrial-accent text-industrial-primary font-semibold' : 'hover:bg-slate-50 text-industrial-dark'
                      }`}
                    >
                      Why Choose Us
                    </Link>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}>
                    <Link 
                      to="/contact" 
                      className={`block px-3.5 py-2.5 rounded-lg transition-colors font-medium ${
                        location.pathname === '/contact' ? 'bg-industrial-accent text-industrial-primary font-semibold' : 'hover:bg-slate-50 text-industrial-dark'
                      }`}
                    >
                      Contact
                    </Link>
                  </motion.div>
                </motion.div>
              </div>

              <div className="pt-5 border-t border-slate-200 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openEnquiry();
                  }}
                  className="w-full btn-primary text-center"
                >
                  <span>Enquire Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-[11px] text-industrial-muted space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="font-bold text-industrial-dark uppercase tracking-wider text-[10px]">Direct Lines & Email:</p>
                  <a href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`} className="font-mono text-industrial-dark hover:text-industrial-primary block">
                    {companyData.phones[0]}
                  </a>
                  <a href={`tel:${companyData.phones[1].replace(/\s+/g, '')}`} className="font-mono text-industrial-dark hover:text-industrial-primary block">
                    {companyData.phones[1]}
                  </a>
                  {emails.map((email) => (
                    <a key={email} href={`mailto:${email}`} className="font-mono text-industrial-dark hover:text-industrial-primary block truncate pt-1 border-t border-slate-200/60">
                      {email}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </header>
  );
};
