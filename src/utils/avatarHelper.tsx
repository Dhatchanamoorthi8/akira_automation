import React from 'react';

/** Simple string hash to generate consistent numbers/colors */
function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a consistent DiceBear avatar URL for any given name/identifier.
 * Uses DiceBear Personas API (https://www.dicebear.com/)
 */
export function getPersonAvatarUrl(name: string): string {
  const cleanSeed = (name && name.trim()) || 'AkiraUser';
  return `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(cleanSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

interface PersonAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PersonAvatar: React.FC<PersonAvatarProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);
  const avatarUrl = getPersonAvatarUrl(name);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-16 h-16 text-lg',
  }[size];

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || name.slice(0, 2).toUpperCase() || 'U';

  if (imageError) {
    const bgColors = [
      'bg-indigo-600',
      'bg-blue-600',
      'bg-emerald-600',
      'bg-amber-600',
      'bg-purple-600',
      'bg-rose-600',
    ];
    const bgColor = bgColors[stringHash(name) % bgColors.length];

    return (
      <div
        className={`${sizeClasses} rounded-full ${bgColor} text-white font-semibold flex items-center justify-center shrink-0 shadow-2xs ${className}`}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-200/80 shadow-2xs ${className}`}>
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImageError(true)}
        className="w-full h-full object-cover rounded-full"
        loading="lazy"
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          COMPANY BRAND AVATARS                             */
/* -------------------------------------------------------------------------- */

interface CompanyBrandInfo {
  name: string;
  bgColor: string;
  renderLogo: () => React.ReactNode;
}

const BRAND_PALETTES = [
  { bg: 'bg-emerald-500', text: 'text-white' },
  { bg: 'bg-sky-500', text: 'text-white' },
  { bg: 'bg-blue-600', text: 'text-white' },
  { bg: 'bg-indigo-600', text: 'text-white' },
  { bg: 'bg-purple-600', text: 'text-white' },
  { bg: 'bg-rose-500', text: 'text-white' },
  { bg: 'bg-amber-500', text: 'text-white' },
  { bg: 'bg-teal-600', text: 'text-white' },
  { bg: 'bg-slate-800', text: 'text-white' },
];

/**
 * Known tech/enterprise brand SVGs matching video:
 * Nvidia, Apple, iOS, Microsoft, Ubuntu, Meta, Asana, GitHub, Gnome, Fedora, Fluxen, Tata, Bharat Forge, etc.
 */
const KNOWN_BRANDS: Record<string, CompanyBrandInfo> = {
  nvidia: {
    name: 'Nvidia',
    bgColor: 'bg-[#76B900]',
    renderLogo: () => (
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <path d="M8.938 9.775c.427-.087.892-.132 1.39-.132 2.923 0 4.673 1.637 4.673 4.312 0 2.536-1.897 4.312-4.577 4.312-1.39 0-2.483-.49-3.149-1.39l1.488-1.233c.427.568 1.018.892 1.706.892 1.488 0 2.483-1.043 2.483-2.581 0-1.638-1.043-2.581-2.581-2.581-.38 0-.71.044-1.043.155l-.391-1.754zm12.338 2.225c0 5.523-4.477 10-10 10-2.316 0-4.444-.79-6.136-2.115l1.488-1.503c1.332.99 2.955 1.578 4.648 1.578 4.38 0 7.96-3.58 7.96-7.96 0-4.38-3.58-7.96-7.96-7.96-3.805 0-7.007 2.695-7.79 6.273l-2.008-.344C2.474 5.378 6.516 2 11.276 2c5.523 0 10 4.477 10 10z" />
      </svg>
    ),
  },
  apple: {
    name: 'Apple',
    bgColor: 'bg-black',
    renderLogo: () => (
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.58-.72.98-1.72.87-2.72-.85.04-1.92.58-2.52 1.29-.53.61-.99 1.62-.87 2.6.96.07 1.94-.48 2.52-1.17z" />
      </svg>
    ),
  },
  ios: {
    name: 'Ios',
    bgColor: 'bg-slate-900',
    renderLogo: () => (
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.58-.72.98-1.72.87-2.72-.85.04-1.92.58-2.52 1.29-.53.61-.99 1.62-.87 2.6.96.07 1.94-.48 2.52-1.17z" />
      </svg>
    ),
  },
  microsoft: {
    name: 'Microsoft',
    bgColor: 'bg-white',
    renderLogo: () => (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    ),
  },
  meta: {
    name: 'Meta',
    bgColor: 'bg-[#0081FB]',
    renderLogo: () => (
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <path d="M16.994 4.545c-2.49 0-4.636 1.543-5.006 3.642-.37-2.099-2.516-3.642-5.006-3.642C3.125 4.545 0 7.747 0 11.821c0 4.148 3.09 7.634 7.025 7.634 2.57 0 4.673-1.637 4.963-3.791.29 2.154 2.393 3.791 4.963 3.791 3.935 0 7.049-3.486 7.049-7.634 0-4.074-3.125-7.276-6.982-7.276h-.024zM6.982 16.634c-2.316 0-4.148-2.225-4.148-4.813s1.832-4.813 4.148-4.813c1.777 0 3.339 1.488 3.553 3.618v2.39c-.214 2.13-1.776 3.618-3.553 3.618zm10.036 0c-1.777 0-3.339-1.488-3.553-3.618v-2.39c.214-2.13 1.776-3.618 3.553-3.618 2.316 0 4.148 2.225 4.148 4.813s-1.832 4.813-4.148 4.813z" />
      </svg>
    ),
  },
  ubuntu: {
    name: 'Ubuntu',
    bgColor: 'bg-[#E95420]',
    renderLogo: () => (
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <circle cx="6.5" cy="12" r="1.5" fill="#E95420" />
        <circle cx="15.5" cy="6.5" r="1.5" fill="#E95420" />
        <circle cx="15.5" cy="17.5" r="1.5" fill="#E95420" />
      </svg>
    ),
  },
  github: {
    name: 'Github',
    bgColor: 'bg-[#24292F]',
    renderLogo: () => (
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  asana: {
    name: 'Asana',
    bgColor: 'bg-[#F06A6A]',
    renderLogo: () => (
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <circle cx="12" cy="7" r="4" />
        <circle cx="6.5" cy="16.5" r="3.5" />
        <circle cx="17.5" cy="16.5" r="3.5" />
      </svg>
    ),
  },
  gnome: {
    name: 'Gnome',
    bgColor: 'bg-[#4A86CF]',
    renderLogo: () => (
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <path d="M14.5 2C12.5 2 11 3.5 11 5.5c0 1.5 1 2.8 2.3 3.3-.4 1.1-.9 2.5-1.5 4-1.4-1.8-3.3-3.8-5.3-3.8-2.5 0-4.5 2-4.5 4.5 0 3.3 3.8 6.5 7.5 8.5 4.5-2 8.5-5.5 8.5-10 0-4.5-3.5-10-8-10z" />
      </svg>
    ),
  },
  fedora: {
    name: 'Fedora',
    bgColor: 'bg-[#294172]',
    renderLogo: () => (
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7v10M9 10h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  fluxen: {
    name: 'Fluxen',
    bgColor: 'bg-black',
    renderLogo: () => (
      <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>
    ),
  },
  tata: {
    name: 'Tata Motors',
    bgColor: 'bg-[#003B79]',
    renderLogo: () => (
      <span className="text-[9px] font-bold tracking-tighter text-white">TATA</span>
    ),
  },
  bharat: {
    name: 'Bharat Forge',
    bgColor: 'bg-[#B22222]',
    renderLogo: () => (
      <span className="text-[9px] font-bold tracking-tighter text-white">BFL</span>
    ),
  },
  akira: {
    name: 'Akira Automation',
    bgColor: 'bg-[#0055A5]',
    renderLogo: () => (
      <span className="text-[9px] font-bold tracking-tighter text-white">AKR</span>
    ),
  },
};

function matchBrand(companyName: string): CompanyBrandInfo | null {
  const norm = companyName.toLowerCase();
  for (const [key, brand] of Object.entries(KNOWN_BRANDS)) {
    if (norm.includes(key)) {
      return brand;
    }
  }
  return null;
}

interface CompanyAvatarProps {
  company: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CompanyAvatar: React.FC<CompanyAvatarProps> = ({
  company,
  size = 'md',
  className = '',
}) => {
  const compName = company?.trim() || 'Internal';
  const matched = matchBrand(compName);

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size];

  if (matched) {
    return (
      <div
        className={`${sizeClasses} rounded-full ${matched.bgColor} flex items-center justify-center shrink-0 shadow-2xs overflow-hidden border border-black/5 ${className}`}
        title={compName}
      >
        {matched.renderLogo()}
      </div>
    );
  }

  // Generative modern circular brand badge for custom company names
  const paletteIndex = stringHash(compName) % BRAND_PALETTES.length;
  const palette = BRAND_PALETTES[paletteIndex];
  const initial = compName.charAt(0).toUpperCase();

  return (
    <div
      className={`${sizeClasses} rounded-full ${palette.bg} ${palette.text} font-bold flex items-center justify-center shrink-0 shadow-2xs border border-white/10 ${className}`}
      title={compName}
    >
      <span>{initial}</span>
    </div>
  );
};
