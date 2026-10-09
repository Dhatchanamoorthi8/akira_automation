import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { Button, Card, Chip, InputGroup, Label, TextField } from '@heroui/react';
import { useAuth } from '../../auth/useAuth';
import { SEOHead } from '../../components/layout/SEOHead';
import { company } from '../../config/company';

export const AdminLogin: React.FC = () => {
  const {
    signIn,
    user,
    profile,
    isAdmin,
    isStaff,
    isConfigured,
    isLoading,
    isProfileLoading,
    sessionExpired,
    clearSessionExpired,
    signOut,
  } = useAuth();
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
  const rawTargetDestination = redirectParam
    ? decodeURIComponent(redirectParam)
    : fromState
    ? fromState.pathname + (fromState.search || '')
    : '/admin/dashboard';

  // Check for expired or unauthorized session flag
  useEffect(() => {
    if (searchParams.get('error') === 'session_expired' || sessionExpired) {
      setError('Your session has expired. Please sign in again.');
      clearSessionExpired();
    } else if (searchParams.get('error') === 'unauthorized') {
      setError('Access denied. You do not possess authorized privileges for this area.');
    }
  }, [searchParams, sessionExpired, clearSessionExpired]);

  // Helper to compute correct destination based on user role
  const getDestinationForRole = (isAdminUser: boolean, isStaffUser: boolean): string | null => {
    if (isAdminUser) {
      // Admins should be directed to explicit /admin/* sub-paths; /admin, /admin/, or /admin/login default to dashboard
      if (
        !rawTargetDestination ||
        rawTargetDestination === '/admin' ||
        rawTargetDestination === '/admin/' ||
        rawTargetDestination === '/admin/login' ||
        !rawTargetDestination.startsWith('/admin')
      ) {
        return '/admin/dashboard';
      }
      return rawTargetDestination;
    }
    if (isStaffUser) {
      // Operational staff always go to /staff
      return '/staff';
    }
    return null;
  };

  // Redirect if already logged in based on role
  useEffect(() => {
    if (isLoading || isProfileLoading) return;
    if (user) {
      if (profile && !profile.active) {
        setError('Your account has been deactivated. Please contact your system administrator to reactivate your access.');
        signOut();
        return;
      }
      const destination = getDestinationForRole(isAdmin, isStaff);
      if (destination) {
        navigate(destination, { replace: true });
      } else if (profile && !isAdmin && !isStaff) {
        setError('Access denied. You do not possess authorized staff or administrator privileges.');
        signOut();
      }
    }
  }, [user, profile, isAdmin, isStaff, isLoading, isProfileLoading, navigate, rawTargetDestination, signOut]);

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
      if (userProfile && !userProfile.active) {
        setError('Your account has been deactivated. Please contact your system administrator to reactivate your access.');
        await signOut();
        return;
      }

      const isUserAdmin = Boolean(userProfile?.role === 'admin' && userProfile?.active);
      const isUserStaff = Boolean(
        userProfile &&
        ['staff', 'sales', 'manager', 'editor'].includes(userProfile.role) &&
        userProfile.active
      );

      const destination = getDestinationForRole(isUserAdmin, isUserStaff);
      if (destination) {
        navigate(destination, { replace: true });
      } else {
        setError('Access denied. You do not possess authorized staff or administrator privileges.');
        await signOut();
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Admin Portal Login | Akira Precision Automation"
        description="Administrative authentication portal for Akira Precision Automation staff and engineers."
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
          <Card className="py-8 px-6 sm:px-8 shadow-card border border-slate-200">
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-industrial-dark">
                  Administrative Sign In
                </h2>
                <p className="text-[11px] text-slate-500">
                  Enter authorized engineering credentials
                </p>
              </div>
              <Chip variant="secondary" className="text-[10px] font-mono font-semibold uppercase">
                SSL Secured
              </Chip>
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
              <TextField className="w-full" name="email" type="email" isRequired>
                <Label className="text-xs font-semibold text-slate-700">Authorized Email</Label>
                <InputGroup>
                  <InputGroup.Prefix>
                    <Mail className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    id="admin-email"
                    autoComplete="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="admin@akiraautomation.com"
                    className="w-full text-xs"
                  />
                </InputGroup>
              </TextField>

              <TextField className="w-full" name="password" isRequired>
                <Label className="text-xs font-semibold text-slate-700">Password</Label>
                <InputGroup>
                  <InputGroup.Prefix>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs"
                  />
                  <InputGroup.Suffix className="pe-0">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onPress={() => setShowPassword(!showPassword)}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={isSubmitting}
                  onPress={() => {}}
                  className="w-full min-h-[44px] gap-2 text-xs font-semibold bg-industrial-primary hover:bg-industrial-hover text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <span>Sign In to Admin Portal</span>
                  )}
                </Button>
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
          </Card>
        </div>
      </div>
    </>
  );
};
