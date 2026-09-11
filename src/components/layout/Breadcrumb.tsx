import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs text-industrial-muted py-3" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5 md:space-x-2 flex-wrap">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-industrial-primary transition-colors">
            <Home className="w-3.5 h-3.5 mr-1" />
            Home
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="inline-flex items-center">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
            {item.href ? (
              <Link to={item.href} className="text-slate-500 hover:text-industrial-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-industrial-dark truncate max-w-[200px] sm:max-w-xs md:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
