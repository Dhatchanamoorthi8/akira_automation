import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from './useAuth';
import { PageLoader } from '../components/common/PageLoader';
import { ShieldAlert, Database, LogOut, ArrowLeft, Briefcase } from 'lucide-react';
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

  if (isLoading || isProfileLoading) {
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

  if (!isAuthorized) {
    // If user is a staff member attempting to access admin-only pages, give them clear feedback & link to /staff
    if (isStaff) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-industrial-bg">
          <div className="max-w-md w-full bg-white border border-amber-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-industrial-dark font-heading">
              Administrative Access Restricted
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your staff account (<strong className="text-slate-800">{user.email}</strong>) does not have access to administrative settings, products, or system logs.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                to="/staff"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-industrial-blue text-white hover:bg-sky-700 transition-colors shadow-sm"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Go to Staff Workspace
              </Link>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-industrial-bg">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-industrial-dark font-heading">
            Administrator Privileges Required
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your account (<strong className="text-slate-800">{user.email}</strong>) is authenticated, but does not possess active administrative permissions. Contact your system administrator for access.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-industrial-dark text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children ? children : <Outlet />}</>;
};
