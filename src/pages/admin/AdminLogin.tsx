import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { SEOHead } from '../../components/layout/SEOHead';
import { company } from '../../config/company';

export const AdminLogin: React.FC = () => {
  const { signIn, user, isAdmin, isStaff, isConfigured, sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine redirect path
  const redirectParam = searchParams.get('redirect');
  const fromState = (location.state as { from?: { pathname: string; search?: string } })?.from;
  const targetDestination = redirectParam
    ? decodeURIComponent(redirectParam)
    : fromState
    ? fromState.pathname + (fromState.search || '')
    : '/admin/dashboard';

  // Check for expired session flag
  useEffect(() => {
    if (searchParams.get('error') === 'session_expired' || sessionExpired) {
      setError('Your session has expired. Please sign in again.');
      clearSessionExpired();
    }
  }, [searchParams, sessionExpired, clearSessionExpired]);

  // Redirect if already logged in based on role
  useEffect(() => {
    if (user) {
      if (isStaff && !isAdmin) {
        navigate('/staff', { replace: true });
      } else {
        navigate(targetDestination, { replace: true });
      }
    }
  }, [user, isAdmin, isStaff, navigate, targetDestination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      const userProfile = result.profile;
      const isUserAdmin = Boolean(userProfile?.role === 'admin' && userProfile?.active);
      const isUserStaff = Boolean(
        (userProfile?.role === 'staff' || userProfile?.role === 'sales' || userProfile?.role === 'manager') &&
        userProfile?.active
      );

      if (isUserStaff && !isUserAdmin) {
        navigate('/staff', { replace: true });
      } else {
        navigate(targetDestination, { replace: true });
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Admin Portal Login | AKIRA AUTOMATION"
        description="Administrative authentication portal for AKIRA AUTOMATION staff and engineers."
        noIndex={true}
      />
      <div className="min-h-[85vh] flex flex-col justify-center py-8 sm:py-14 px-4 sm:px-6 lg:px-8 bg-industrial-bg">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-industrial-dark text-white shadow-md mx-auto">
              <Shield className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-industrial-dark font-heading">
                {company.name}
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Precision Metrology & Industrial Automation Portal
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white py-8 px-6 sm:px-8 shadow-card border border-slate-200 rounded-xl">
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-industrial-dark">
                  Administrative Sign In
                </h2>
                <p className="text-[11px] text-slate-500">
                  Enter authorized engineering credentials
                </p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                SSL Secured
              </span>
            </div>

            {!isConfigured && (
              <div className="mb-5 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Supabase Environment Pending</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Database variables are currently unset. To sign in with a live account, configure <code className="font-mono text-[10px]">VITE_SUPABASE_URL</code>.
                </p>
              </div>
            )}

            {error && (
              <div
                className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-[12px]">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Authorized Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@akiraautomation.com"
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-industrial-primary hover:bg-industrial-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-primary shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <span>Sign In to Admin Portal</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 hover:text-industrial-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Website</span>
              </Link>
              <span className="font-mono text-[10px] text-slate-400">
                ISO 9001:2015 Console
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
