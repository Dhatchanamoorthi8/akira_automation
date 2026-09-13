import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/useAuth';
import { User, LogOut, ExternalLink, ChevronDown, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AdminProfileMenu: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Administrator';
  const displayEmail = user?.email || 'admin@akiraautomation.com';
  const roleLabel = profile?.role === 'admin' ? 'Administrator' : profile?.role || 'Staff';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Close on Escape or click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 min-h-[44px]"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Admin Profile Menu"
      >
        <div className="w-8 h-8 rounded-full bg-industrial-dark text-white font-bold text-xs flex items-center justify-center border border-slate-300 shrink-0">
          {initials || <User className="w-4 h-4" />}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-bold text-industrial-dark leading-tight flex items-center gap-1">
            <span className="truncate max-w-[120px]">{displayName}</span>
            <ShieldCheck className="w-3 h-3 text-sky-500 shrink-0" />
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            {roleLabel}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-card py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-bold text-industrial-dark truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
              {displayEmail}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-sky-50 text-industrial-primary border border-sky-200">
              <ShieldCheck className="w-3 h-3" />
              <span>{roleLabel} Access</span>
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
              role="menuitem"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>Return to Public Website</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                await signOut();
                navigate('/admin/login');
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left min-h-[44px]"
              role="menuitem"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
