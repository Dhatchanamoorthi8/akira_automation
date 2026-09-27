import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Clock,
  Bell,
  Box,
  CircleDollarSign,
  Users,
  CalendarCheck,
  Image as ImageIcon,
  FileText,
  Search,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { Drawer, Button, Avatar } from '@heroui/react';

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItemConfig {
  name: string;
  to: string;
  icon: React.ElementType;
  isImplemented: boolean;
  badge?: string;
}

interface NavGroupConfig {
  title?: string;
  items: NavItemConfig[];
}

const navGroups: NavGroupConfig[] = [
  {
    title: '', // Top unsectioned items
    items: [
      {
        name: 'Home',
        to: '/admin/dashboard',
        icon: Home,
        isImplemented: true,
      },
      {
        name: 'Up next',
        to: '/admin/followups',
        icon: Clock,
        isImplemented: true,
      },
      {
        name: 'Notifications',
        to: '/admin/activity',
        icon: Bell,
        isImplemented: true,
        badge: '2',
      },
    ],
  },
  {
    title: 'Records',
    items: [
      {
        name: 'Enquiries',
        to: '/admin/enquiries',
        icon: Box,
        isImplemented: true,
      },
      {
        name: 'Products',
        to: '/admin/products',
        icon: CircleDollarSign,
        isImplemented: true,
      },
      {
        name: 'Staff & Users',
        to: '/admin/users',
        icon: Users,
        isImplemented: true,
      },
    ],
  },
  {
    title: 'Resources',
    items: [
      {
        name: 'Attendance',
        to: '/admin/attendance',
        icon: CalendarCheck,
        isImplemented: true,
      },
      {
        name: 'Product Images',
        to: '/admin/product-images',
        icon: ImageIcon,
        isImplemented: true,
      },
      {
        name: 'Email Settings',
        to: '/admin/settings/email',
        icon: FileText,
        isImplemented: true,
      },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  isCollapsed: propIsCollapsed,
  onToggleCollapse: propOnToggleCollapse,
}) => {
  const { signOut, profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Jordan Ellis';

  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('akira_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed;
  void propOnToggleCollapse;
  void setInternalCollapsed;

  const isPathActive = (to: string) => {
    if (to === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin' || location.pathname === '/admin/';
    }
    if (to === '/admin/products') {
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
    if (to === '/admin/attendance') {
      return location.pathname === '/admin/attendance' || location.pathname.startsWith('/admin/attendance/');
    }
    if (to === '/admin/activity') {
      return location.pathname === '/admin/activity' || location.pathname.startsWith('/admin/activity/');
    }
    if (to === '/admin/settings/email') {
      return location.pathname.startsWith('/admin/settings/email') || location.pathname.startsWith('/admin/email-settings');
    }
    return location.pathname === to;
  };

  const renderNavContent = (isMobile = false) => {
    const collapsed = !isMobile && isCollapsed;

    return (
      <div className="flex flex-col h-full bg-white border-r border-slate-200/70 select-none">
        {/* Top Workspace Header (HeroUI Team style) */}
        <div className={`p-3 border-b border-slate-100 flex items-center shrink-0 ${collapsed ? 'flex-col justify-center gap-2' : 'justify-between gap-2'}`}>
          {!collapsed ? (
            <>
              <Link
                to="/admin/dashboard"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors flex-1 min-w-0"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FDE8EC] border border-[#FECDD3] flex items-center justify-center text-[#FB7185] shrink-0 font-bold text-xs shadow-2xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-slate-900 block leading-tight truncate">
                    HeroUI Team
                  </span>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#FDE8EC] border border-[#FECDD3] flex items-center justify-center text-[#FB7185] shrink-0 font-bold text-xs shadow-2xs mx-auto">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          )}

          {/* Mobile close button (only in mobile drawer) */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <div className={`flex-1 overflow-y-auto ${collapsed ? 'px-2 py-3 space-y-3' : 'px-3 py-3 space-y-4'}`}>
          {navGroups.map((group, groupIdx) => (
            <div key={group.title || `group-${groupIdx}`} className="space-y-1">
              {!collapsed && group.title && (
                <div className="px-3 pt-2 pb-1">
                  <span className="text-xs font-semibold text-slate-400 block tracking-normal">
                    {group.title}
                  </span>
                </div>
              )}

              {collapsed && group.title && (
                <div className="w-6 mx-auto border-t border-slate-100 my-1.5" />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isPathActive(item.to);

                  if (collapsed) {
                    return (
                      <Link
                        key={item.name}
                        to={item.to}
                        title={item.name}
                        className={`flex items-center justify-center w-10 h-10 mx-auto rounded-2xl text-xs font-semibold transition-all relative ${
                          active
                            ? 'bg-[#FDE8EC] text-[#FB7185] shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'text-[#FB7185]' : 'text-slate-500'}`} />
                        {item.badge && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                        )}
                        <span className="sr-only">{item.name}</span>
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.to}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-3 py-2 rounded-2xl text-sm transition-colors ${
                        active
                          ? 'bg-[#FDE8EC] text-slate-900 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            active ? 'text-[#FB7185]' : 'text-slate-500'
                          } transition-colors`}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
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

        {/* Footer / Jordan Ellis style User Profile Card */}
        <div className={`border-t border-slate-100 bg-white shrink-0 ${collapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3 flex items-center justify-between gap-2'}`}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Avatar
                  size="sm"
                  className="w-8 h-8 rounded-xl bg-[#E2EBD8] text-[#4A6B34] border border-[#C8DAC0] shrink-0 font-semibold text-xs flex items-center justify-center shadow-2xs"
                >
                  <Avatar.Fallback>
                    {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'JE'}
                  </Avatar.Fallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {displayName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <Link
                  to="/"
                  title="Public Website"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Public Website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={async () => {
                    onCloseMobile();
                    await signOut();
                    navigate('/admin/login');
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer min-h-[30px] min-w-[30px]"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar
                size="sm"
                className="w-8 h-8 rounded-xl bg-[#E2EBD8] text-[#4A6B34] border border-[#C8DAC0] font-semibold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                title={displayName}
              >
                <Avatar.Fallback>
                  {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'JE'}
                </Avatar.Fallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onPress={async () => {
                  onCloseMobile();
                  await signOut();
                  navigate('/admin/login');
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer min-h-[28px] min-w-[28px]"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 shrink-0 z-20 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer (Slide-in) using HeroUI v3 Drawer */}
      <Drawer.Backdrop
        isOpen={isMobileOpen}
        onOpenChange={(open) => {
          if (!open) onCloseMobile();
        }}
        className="lg:hidden"
      >
        <Drawer.Content placement="left" className="max-w-xs w-full p-0 bg-transparent shadow-none border-none">
          <Drawer.Dialog className="h-full w-full p-0 bg-white shadow-2xl flex flex-col" aria-label="Navigation Sidebar">
            {renderNavContent(true)}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </>
  );
};

export default AdminSidebar;
