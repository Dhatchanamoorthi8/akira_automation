import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { EnquiryModal } from './components/common/EnquiryModal';
import { EnquiryProvider } from './context/EnquiryContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/PageLoader';

// Direct import for the primary landing page to maximize first contentful paint
import { Home } from './pages/Home';

// Lazy-loaded secondary routes for optimized route-level code splitting
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Solutions = lazy(() => import('./pages/Solutions').then(m => ({ default: m.Solutions })));
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Industries = lazy(() => import('./pages/Industries').then(m => ({ default: m.Industries })));
const Services = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const WhyChooseUs = lazy(() => import('./pages/WhyChooseUs').then(m => ({ default: m.WhyChooseUs })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Scroll to top on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <EnquiryProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-industrial-bg w-full max-w-full overflow-x-hidden">
          <Header />
          <main className="flex-grow w-full max-w-full overflow-x-hidden">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/solutions" element={<Solutions />} />
                  <Route path="/solutions/:category" element={<Solutions />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/industries" element={<Industries />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/why-choose-us" element={<WhyChooseUs />} />
                  <Route path="/why-milestone" element={<Navigate to="/why-choose-us" replace />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
          <EnquiryModal />
        </div>
      </Router>
    </EnquiryProvider>
  );
};

export default App;
