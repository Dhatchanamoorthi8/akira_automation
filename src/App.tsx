import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { EnquiryModal } from './components/common/EnquiryModal';
import { EnquiryProvider } from './context/EnquiryContext';
import { ImageViewerModal } from './components/common/ImageViewerModal';
import { ImageViewerProvider } from './context/ImageViewerContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/PageLoader';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';

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

// Administrative routes
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminProductImages = lazy(() => import('./pages/admin/AdminProductImages').then(m => ({ default: m.AdminProductImages })));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm').then(m => ({ default: m.AdminProductForm })));
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries').then(m => ({ default: m.AdminEnquiries })));
const AdminEnquiryDetail = lazy(() => import('./pages/admin/AdminEnquiryDetail').then(m => ({ default: m.AdminEnquiryDetail })));
const AdminFollowups = lazy(() => import('./pages/admin/AdminFollowups').then(m => ({ default: m.AdminFollowups })));
const AdminActivity = lazy(() => import('./pages/admin/AdminActivity').then(m => ({ default: m.AdminActivity })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminFollowupDetail = lazy(() => import('./pages/admin/AdminFollowupDetail').then(m => ({ default: m.AdminFollowupDetail })));
const StaffWorkspace = lazy(() => import('./pages/staff/StaffWorkspace').then(m => ({ default: m.StaffWorkspace })));

// Scroll to top on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const isPortalRoute = pathname.startsWith('/admin') || pathname.startsWith('/staff');

  return (
    <div className="min-h-screen flex flex-col bg-industrial-bg w-full">
      {!isPortalRoute && <Header />}
      <main className="flex-grow w-full">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Portal Routes */}
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

              {/* Staff Portal Workspace */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'staff', 'sales', 'manager']}>
                    <StaffWorkspace />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="enquiries" element={<AdminEnquiries />} />
                <Route path="enquiries/:id" element={<AdminEnquiryDetail />} />
                <Route path="followups" element={<AdminFollowups />} />
                <Route path="followups/:id" element={<AdminFollowupDetail />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="activity" element={<AdminActivity />} />
                <Route path="history" element={<Navigate to="/admin/activity" replace />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="product-images" element={<AdminProductImages />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id/edit" element={<AdminProductForm />} />
              </Route>

              {/* 404 Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isPortalRoute && (
        <>
          <Footer />
          <EnquiryModal />
          <ImageViewerModal />
        </>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <EnquiryProvider>
        <ImageViewerProvider>
          <Router>
            <ScrollToTop />
            <AppShell />
          </Router>
        </ImageViewerProvider>
      </EnquiryProvider>
    </AuthProvider>
  );
};

export default App;
