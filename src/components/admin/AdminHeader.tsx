import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Database,
  LayoutDashboard,
  Users,
  CalendarClock,
  Package,
  ImageIcon,
  History,
  Shield,
} from 'lucide-react';
import { AdminProfileMenu } from './AdminProfileMenu';
import { useAuth } from '../../auth/useAuth';

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  title?: string;
}

interface BreadcrumbItem {
  icon: React.ElementType;
  label: string;
  to: string;
  subLabel?: string;
}

function getAdminBreadcrumb(pathname: string): BreadcrumbItem {
  if (pathname === '/admin' || pathname === '/admin/' || pathname.startsWith('/admin/dashboard')) {
    return { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' };
  }
  if (pathname.startsWith('/admin/enquiries')) {
    const isDetail = pathname.replace('/admin/enquiries', '').length > 1;
    return {
      icon: Users,
      label: 'People',
      to: '/admin/enquiries',
      subLabel: isDetail ? 'Enquiry Dossier' : undefined,
    };
  }
  if (pathname.startsWith('/admin/followups')) {
    const isDetail = pathname.replace('/admin/followups', '').length > 1;
    return {
      icon: CalendarClock,
      label: 'Follow-ups',
      to: '/admin/followups',
      subLabel: isDetail ? 'Follow-up Details' : undefined,
    };
  }
  if (pathname.startsWith('/admin/products')) {
    const isNew = pathname.includes('/new');
    const isEdit = pathname.includes('/edit');
    return {
      icon: Package,
      label: 'Products',
      to: '/admin/products',
      subLabel: isNew ? 'New Product' : isEdit ? 'Edit Product' : undefined,
    };
  }
  if (pathname.startsWith('/admin/product-images')) {
    return { icon: ImageIcon, label: 'Product Images', to: '/admin/product-images' };
  }
  if (pathname.startsWith('/admin/users')) {
    return { icon: Users, label: 'Staff & Users', to: '/admin/users' };
  }
  if (pathname.startsWith('/admin/activity')) {
    return { icon: History, label: 'Activity Logs', to: '/admin/activity' };
  }
  return { icon: Shield, label: 'Admin Portal', to: '/admin/dashboard' };
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileSidebar,
}) => {
  const { isConfigured } = useAuth();
  const location = useLocation();

  const breadcrumb = getAdminBreadcrumb(location.pathname);
  const BreadcrumbIcon = breadcrumb.icon;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-subtle">
      {/* Left: Mobile Menu Trigger & Dynamic Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-industrial-dark transition-colors focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumb (Desktop & Mobile) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
            <BreadcrumbIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-gray-400">&gt;</span>
          <Link
            to={breadcrumb.to}
            className={`transition-colors ${
              breadcrumb.subLabel
                ? 'text-gray-500 hover:text-gray-900 font-medium'
                : 'text-gray-900 font-bold text-sm'
            }`}
          >
            {breadcrumb.label}
          </Link>
          {breadcrumb.subLabel && (
            <>
              <span className="text-gray-400">&gt;</span>
              <span className="text-gray-900 font-bold text-sm truncate max-w-[150px] sm:max-w-[220px]">
                {breadcrumb.subLabel}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            readOnly
            placeholder="Search products, RFQ numbers, customers..."
            className="w-full pl-9 pr-16 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 cursor-pointer transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="inline-flex items-center px-1.5 py-0.5 border border-slate-200 rounded bg-white text-[10px] font-mono text-slate-400">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Status Indicator, Notification & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Connection Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border bg-slate-50 text-slate-600 border-slate-200">
          <span
            className={`w-2 h-2 rounded-full ${
              isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <Database className="w-3 h-3 text-slate-400" />
          <span>{isConfigured ? 'DB Connected' : 'Offline Mode'}</span>
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-industrial-dark transition-colors focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="View system notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Profile Dropdown */}
        <AdminProfileMenu />
      </div>
    </header>
  );
};
