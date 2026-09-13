import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  CalendarClock,
  Package,
  Image as ImageIcon,
  History,
  LogOut,
  X,
  Shield,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { company } from '../../config/company';

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  name: string;
  to: string;
  icon: React.ElementType;
  isImplemented: boolean;
  badge?: string;
}

interface NavGroupConfig {
  title: string;
  items: NavItemConfig[];
}

const navGroups: NavGroupConfig[] = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        to: '/admin/dashboard',
        icon: LayoutDashboard,
        isImplemented: true,
      },
    ],
  },
  {
    title: 'Customer & RFQs',
    items: [
      {
        name: 'Enquiries',
        to: '/admin/enquiries',
        icon: Mail,
        isImplemented: true,
      },
      {
        name: 'Follow-ups',
        to: '/admin/followups',
        icon: CalendarClock,
        isImplemented: true,
      },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      {
        name: 'Products',
        to: '/admin/products',
        icon: Package,
        isImplemented: true,
      },
      {
        name: 'Product Images',
        to: '/admin/product-images',
        icon: ImageIcon,
        isImplemented: true,
      },
    ],
  },
  {
    title: 'Audit & Personnel',
    items: [
      {
        name: 'Staff & Users',
        to: '/admin/users',
        icon: Users,
        isImplemented: true,
      },
      {
        name: 'Activity Logs',
        to: '/admin/activity',
        icon: History,
        isImplemented: true,
      },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPathActive = (to: string) => {
    if (to === '/admin/products') {
      // Matches /admin/products, /admin/products/new, /admin/products/:id/edit
      // MUST NOT match /admin/product-images!
      return (
        (location.pathname === '/admin/products' || location.pathname.startsWith('/admin/products/')) &&
        !location.pathname.startsWith('/admin/product-images')
      );
    }
    if (to === '/admin/product-images') {
      return location.pathname === '/admin/product-images' || location.pathname.startsWith('/admin/product-images/');
    }
    if (to === '/admin/enquiries') {
      return location.pathname === '/admin/enquiries' || location.pathname.startsWith('/admin/enquiries/');
    }
    if (to === '/admin/followups') {
      return location.pathname === '/admin/followups' || location.pathname.startsWith('/admin/followups/');
    }
    if (to === '/admin/users') {
      return location.pathname === '/admin/users' || location.pathname.startsWith('/admin/users/');
    }
    if (to === '/admin/activity') {
      return location.pathname === '/admin/activity' || location.pathname.startsWith('/admin/activity/');
    }
    return location.pathname === to;
  };

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Top Brand Bar */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
        <Link
          to="/admin/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-industrial-dark text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-slate-800 transition-colors">
            <Shield className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-industrial-dark font-heading block leading-tight tracking-tight">
              {company.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase">
              Admin Console
            </span>
          </div>
        </Link>

        {/* Mobile close button (only in mobile drawer) */}
        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {group.title}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;

                if (!item.isImplemented) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 cursor-not-allowed opacity-75 select-none min-h-[44px]"
                      title={`${item.name} module is coming in Phase 3`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                }

                const active = isPathActive(item.to);

                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
                      active
                        ? 'bg-industrial-primary text-white shadow-subtle'
                        : 'text-slate-600 hover:text-industrial-dark hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Quick Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-industrial-dark hover:bg-slate-100 transition-colors min-h-[44px]"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          <span>Public Website</span>
        </Link>

        <button
          type="button"
          onClick={async () => {
            onCloseMobile();
            await signOut();
            navigate('/admin/login');
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left min-h-[44px]"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-20">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer (Slide-in) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-industrial-dark/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
