import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: 'dark' | 'light';
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  variant = 'dark',
  className = '' 
}) => {
  const isDark = variant === 'dark';

  return (
    <nav className={`flex items-center text-xs py-2.5 max-w-full ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1.5 md:space-x-2 overflow-x-auto no-scrollbar py-0.5 max-w-full">
        <li className="inline-flex items-center shrink-0">
          <Link 
            to="/" 
            className={`inline-flex items-center transition-colors ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-industrial-primary'
            }`}
          >
            <Home className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="inline-flex items-center shrink-0">
            <ChevronRight className={`w-3.5 h-3.5 mx-1 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            {item.href ? (
              <Link 
                to={item.href} 
                className={`transition-colors whitespace-nowrap ${
                  isDark ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-industrial-primary'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={`font-semibold truncate max-w-[200px] sm:max-w-xs md:max-w-none ${
                  isDark ? 'text-slate-100' : 'text-industrial-dark'
                }`}
                title={item.label}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
