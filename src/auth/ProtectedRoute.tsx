import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from './useAuth';
import { PageLoader } from '../components/common/PageLoader';
import { Database } from 'lucide-react';
import { UserRole } from '../types/database';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['admin'],
}) => {
  const { user, profile, isAdmin, isStaff, isLoading, isProfileLoading, isConfigured, signOut } = useAuth();
  const location = useLocation();

  // Only block the entire screen with PageLoader during initial load before profile is known.
  // If the user and profile are already loaded into state, background token refreshes or
  // silent profile revalidations will never unmount child routes or wipe form states.
  if (isLoading || (isProfileLoading && !profile)) {
    return <PageLoader />;
  }

  if (!isConfigured) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-industrial-bg">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-industrial-dark font-heading">
            Database Configuration Unavailable
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Supabase backend connection is not configured. Please ensure{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
              VITE_SUPABASE_URL
            </code>{' '}
            and{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
              VITE_SUPABASE_PUBLISHABLE_KEY
            </code>{' '}
            are populated in your environment settings.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-industrial-dark text-white hover:bg-slate-800 transition-colors"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?redirect=${redirectUrl}`} state={{ from: location }} replace />;
  }

  const userRole = profile?.role;
  const isAuthorized = Boolean(
    profile?.active &&
    (isAdmin || (userRole && allowedRoles.includes(userRole)))
  );

  // Automatically sign out users who have invalid/unauthorized roles (neither admin nor staff)
  React.useEffect(() => {
    if (user && !isLoading && !isProfileLoading && !isAuthorized && !isStaff) {
      signOut();
    }
  }, [user, isLoading, isProfileLoading, isAuthorized, isStaff, signOut]);

  if (!isAuthorized) {
    // If staff user attempts to access admin-only pages, automatically redirect them to /staff
    if (isStaff) {
      return <Navigate to="/staff" replace />;
    }

    // If account has no valid role or is deactivated, redirect to login
    return <Navigate to="/admin/login?error=unauthorized" replace />;
  }

  return <>{children ? children : <Outlet />}</>;
};
