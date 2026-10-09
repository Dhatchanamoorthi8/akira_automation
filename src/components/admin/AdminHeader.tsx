import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Breadcrumbs, Kbd, Chip, Input } from '@heroui/react';
import {
  Menu,
  PanelLeft,
  Search,
  Bell,
  LayoutDashboard,
  Users,
  CalendarClock,
  Package,
  ImageIcon,
  History,
  Shield,
  MapPin,
  Receipt,
} from 'lucide-react';
import { AdminProfileMenu } from './AdminProfileMenu';
import { useAuth } from '../../auth/useAuth';

export interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  title?: string;
  portal?: 'admin' | 'staff';
  activeTab?: string;
  searchPlaceholder?: string;
  userName?: string | null;
  userEmail?: string | null;
  role?: string | null;
  isAdmin?: boolean;
  onSignOut?: () => void;
}

interface BreadcrumbItem {
  icon: React.ElementType;
  label: string;
  to: string;
  subLabel?: string;
}

function getHeaderBreadcrumb(
  pathname: string,
  search: string,
  activeTabProp?: string,
  portalProp?: 'admin' | 'staff'
): BreadcrumbItem {
  const isStaffPortal =
    portalProp === 'staff' ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/stafft');

  if (isStaffPortal) {
    const tabParam = new URLSearchParams(search).get('tab');
    let tab = activeTabProp;
    if (!tab) {
      if (pathname.startsWith('/staff/')) {
        tab = pathname.replace('/staff/', '').split('/')[0];
      } else if (pathname.startsWith('/stafft/')) {
        tab = pathname.replace('/stafft/', '').split('/')[0];
      } else if (tabParam) {
        tab = tabParam;
      } else {
        tab = 'overview';
      }
    }

    const tabMap: Record<string, { label: string; icon: React.ElementType }> = {
      overview: { label: 'Overview', icon: LayoutDashboard },
      followups: { label: 'Follow-ups', icon: CalendarClock },
      enquiries: { label: 'My Inquiries', icon: Users },
      visits: { label: 'Field Visits', icon: MapPin },
      invoices: { label: 'Invoices & Quotes', icon: Receipt },
    };

    const currentTab = tabMap[tab || 'overview'] || {
      label: 'Workspace',
      icon: LayoutDashboard,
    };

    return {
      icon: currentTab.icon,
      label: 'Sales & Field',
      to: '/staff/overview',
      subLabel: currentTab.label,
    };
  }

  // Admin routes
  if (
    pathname === '/admin' ||
    pathname === '/admin/' ||
    pathname.startsWith('/admin/dashboard')
  ) {
    return { icon: LayoutDashboard, label: 'Home', to: '/admin/dashboard' };
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
    return {
      icon: ImageIcon,
      label: 'Product Images',
      to: '/admin/product-images',
    };
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
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  portal,
  activeTab,
  searchPlaceholder,
}) => {
  const { isConfigured } = useAuth();
  const location = useLocation();

  const isStaff =
    portal === 'staff' ||
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/stafft');

  const breadcrumb = getHeaderBreadcrumb(
    location.pathname,
    location.search,
    activeTab,
    portal
  );

  return (
    <header className="h-16 bg-white border-b border-slate-200/70 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile/Desktop Toggle [◫] & Breadcrumb matching reference screenshot */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          onPress={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer shrink-0"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </Button>

        {/* Desktop sidebar rail collapse/expand toggle button [◫] */}
        {onToggleSidebarCollapse && (
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            onPress={onToggleSidebarCollapse}
            className="hidden lg:flex p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors min-h-[36px] min-w-[36px] items-center justify-center cursor-pointer shrink-0"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="w-4 h-4 text-slate-700" />
          </Button>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <Breadcrumbs
            aria-label="Breadcrumb"
            className="text-sm font-semibold text-slate-900"
          >
            <Breadcrumbs.Item href={breadcrumb.to}>
              <span
                className={
                  breadcrumb.subLabel
                    ? 'text-slate-500 hover:text-slate-900 font-medium text-xs sm:text-sm'
                    : 'text-slate-900 font-bold text-xs sm:text-sm'
                }
              >
                {breadcrumb.label}
              </span>
            </Breadcrumbs.Item>
            {breadcrumb.subLabel && (
              <Breadcrumbs.Item>
                <span className="text-slate-900 font-bold text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[220px]">
                  {breadcrumb.subLabel}
                </span>
              </Breadcrumbs.Item>
            )}
          </Breadcrumbs>
          {isStaff && (
            <Chip
              size="sm"
              color="success"
              variant="soft"
              className="font-mono text-[9px] uppercase font-bold shrink-0 hidden sm:inline-flex"
            >
              Staff Portal
            </Chip>
          )}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
        <div className="w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
            <Search className="w-3.5 h-3.5" />
          </div>
          <Input
            type="search"
            readOnly
            placeholder={
              searchPlaceholder ||
              (isStaff ? 'Search inquiries, clients, visits...' : 'Search...')
            }
            className="w-full pl-9 pr-14 py-1.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none z-10">
            <Kbd className="inline-flex items-center px-1.5 py-0.5 border border-slate-200 rounded-md bg-white text-[10px] text-slate-500">
              ⌘ K
            </Kbd>
          </div>
        </div>
      </div>

      {/* Right: Date Indicator, Status, Notification & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Backend Connection Badge */}
        <Chip
          variant="soft"
          color={isConfigured ? 'accent' : 'warning'}
          size="sm"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-slate-50 text-slate-600 border-slate-200/60"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>{isConfigured ? 'Online' : 'Offline'}</span>
        </Chip>

        {/* Notifications Icon Button */}
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          aria-label="View system notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </Button>

        {/* Profile Dropdown */}
        <AdminProfileMenu />
      </div>
    </header>
  );
};
