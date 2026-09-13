import React from 'react';
import { Menu, Search, Bell, Shield, Database } from 'lucide-react';
import { AdminProfileMenu } from './AdminProfileMenu';
import { useAuth } from '../../auth/useAuth';
import { company } from '../../config/company';

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  title?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileSidebar,
  title = 'Metrology Dashboard',
}) => {
  const { isConfigured } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-subtle">
      {/* Left: Mobile Menu Trigger & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-industrial-dark transition-colors focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand / Desktop Title */}
        <div className="flex items-center gap-2">
          <div className="lg:hidden flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-md bg-industrial-dark text-white flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-xs font-bold text-industrial-dark font-heading">
              {company.name}
            </span>
          </div>

          <h2 className="hidden lg:block text-base font-bold text-industrial-dark font-heading">
            {title}
          </h2>
        </div>
      </div>

      {/* Center: Search Bar (Placeholder with keyboard cue) */}
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
            onClick={() => {
              // Notification for future search backend
            }}
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
