/**
 * Centralized SEO Configuration & Utilities
 * AKIRA PRECISION AUTOMATION — Production SEO Standards
 */

import { company } from './company';
import { companyData } from '../data/company';

export const SITE_URL = 'https://akiraautomation.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/company/akira-automation-logo.jpeg`;
export const HERO_OG_IMAGE = `${SITE_URL}/assets/hero/hero-lab-gauging.webp`;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  structuredData?: object | object[];
}

/**
 * Standardizes canonical URL creation:
 * - Uses production domain https://akiraautomation.com
 * - Strips query parameters and hashes
 * - Ensures root has trailing slash (https://akiraautomation.com/)
 * - Ensures subpages have no trailing slash (https://akiraautomation.com/about)
 */
export function getCanonicalUrl(pathOrUrl?: string): string {
  if (!pathOrUrl || pathOrUrl === '/' || pathOrUrl === SITE_URL || pathOrUrl === `${SITE_URL}/`) {
    return `${SITE_URL}/`;
  }

  let clean = pathOrUrl;
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const url = new URL(clean);
      clean = url.pathname;
    } catch {
      clean = '/';
    }
  }

  // Remove query params and hash
  clean = clean.split('?')[0].split('#')[0];

  if (!clean || clean === '/') {
    return `${SITE_URL}/`;
  }

  const normalized = clean.startsWith('/') ? clean : `/${clean}`;
  return `${SITE_URL}${normalized.replace(/\/+$/, '')}`;
}

/**
 * Formats document titles cleanly:
 * Avoids redundant "| AKIRA PRECISION AUTOMATION"
 * Keeps titles concise and brand-aware.
 */
export function formatTitle(title: string): string {
  const brand = company.name;
  if (!title) return `${brand} | ${company.tagline}`;
  
  const cleanTitle = title.trim();
  if (cleanTitle.toLowerCase().includes(brand.toLowerCase()) || cleanTitle.toLowerCase().includes('akira precision automation')) {
    return cleanTitle;
  }

  // Google SERP title pixel width limit corresponds to ~55-60 characters
  // 1. If full brand fits within 60 chars, append full brand name
  if (cleanTitle.length + 3 + brand.length <= 60) {
    return `${cleanTitle} | ${brand}`;
  }

  // 2. If short brand 'AKIRA' fits within 60 chars, append concise brand
  if (cleanTitle.length + 3 + 5 <= 60) {
    return `${cleanTitle} | AKIRA`;
  }

  // 3. Otherwise return descriptive title without truncation
  return cleanTitle;
}

/**
 * Resolves image URL to an absolute URL suitable for OpenGraph / Twitter crawlers
 */
export function getAbsoluteImageUrl(imagePath?: string): string {
  if (!imagePath) return DEFAULT_OG_IMAGE;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Generates Schema.org Organization / LocalBusiness JSON-LD
 */
export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#organization`,
    "name": company.name,
    "legalName": company.legalName,
    "url": SITE_URL,
    "logo": getAbsoluteImageUrl(company.logo),
    "image": HERO_OG_IMAGE,
    "description": "Akira Precision Automation manufactures precision gauging fixtures, automated multi-gauging stations, air gauges, digital DRO displays, and work-holding solutions for automotive OEMs and precision manufacturing.",
    "slogan": company.slogan,
    "foundingDate": "2021",
    "sameAs": [
      "https://www.linkedin.com/company/akira-precision-automation",
      "https://www.indiamart.com/akira-precision-automation/",
      "https://www.instagram.com/akira_precision_automation?utm_source=qr&stkn=MWU5bDh0Nm15bmhxcQ==",
      "https://www.facebook.com/profile.php?id=61594534806711"
    ],
    "knowsAbout": [
      "Precision Metrology",
      "Automated Multi-Gauging Systems",
      "Pneumatic Air Gauging",
      "Air Plug Gauges",
      "Air Ring Gauges",
      "Inspection Fixtures & Tooling",
      "LVDT Inductive Probes",
      "Electronic Gauging",
      "Sub-Micron Calibration",
      "Gage R&R Quality Verification"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": companyData.address.street,
      "addressLocality": companyData.address.village ? `${companyData.address.village}, ${companyData.address.city}` : companyData.address.city,
      "addressRegion": companyData.address.state,
      "postalCode": companyData.address.pin,
      "addressCountry": "IN"
    },
    "telephone": companyData.phones[0],
    "email": companyData.emails[0],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": companyData.phones[0],
        "contactType": "sales",
        "email": companyData.emails[0],
        "availableLanguage": ["English", "Tamil", "Hindi"],
        "areaServed": ["IN", "Worldwide"]
      },
      {
        "@type": "ContactPoint",
        "telephone": companyData.phones[1],
        "contactType": "technical support",
        "email": company.ccEmail,
        "availableLanguage": ["English", "Tamil", "Hindi"],
        "areaServed": ["IN", "Worldwide"]
      }
    ],
    "openingHours": "Mo-Sa 09:00-18:30",
    "priceRange": "$$"
  };
}

/**
 * Generates Schema.org WebSite JSON-LD
 */
export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": `${SITE_URL}/`,
    "name": company.name,
    "description": `${company.name} - ${company.tagline}`,
    "publisher": {
      "@id": `${SITE_URL}/#organization`
    }
  };
}

/**
 * Generates Schema.org BreadcrumbList JSON-LD
 */
export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": getCanonicalUrl(item.url)
    }))
  };
}

/**
 * Generates Schema.org FAQPage JSON-LD for AI Overviews & Answer Engines
 */
export function createFAQSchema(faqs?: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generates Schema.org Product JSON-LD with verified E-E-A-T technical reviewer
 */
export function createProductSchema(product: {
  title: string;
  description: string;
  image: string;
  category: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/products/${product.slug}#product`,
    "name": product.title,
    "description": product.description,
    "image": getAbsoluteImageUrl(product.image),
    "category": product.category,
    "brand": {
      "@type": "Brand",
      "name": company.name
    },
    "manufacturer": {
      "@type": "Organization",
      "name": company.name,
      "url": SITE_URL
    },
    "reviewedBy": {
      "@type": "Person",
      "name": "Kalidoss",
      "jobTitle": "Lead Metrology Applications Engineer",
      "worksFor": {
        "@type": "Organization",
        "name": company.name,
        "url": SITE_URL
      },
      "knowsAbout": [
        "Precision Gauging Systems",
        "Automated Multi-Gauging",
        "Pneumatic Air Gauging",
        "DIN 2250 Calibration Standards",
        "ISO/IEC 17025 Traceability"
      ]
    },
    "url": `${SITE_URL}/products/${product.slug}`
  };
}

