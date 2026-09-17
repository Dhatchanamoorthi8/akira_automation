import React, { useEffect } from 'react';
import { company } from '../../config/company';
import { 
  getCanonicalUrl, 
  formatTitle, 
  getAbsoluteImageUrl, 
  createOrganizationSchema 
} from '../../config/seo';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  structuredData?: object | object[];
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalPath = '',
  ogImage,
  ogType = 'website',
  noIndex = false,
  structuredData,
}) => {
  useEffect(() => {
    // 1. Document Title with smart brand formatting
    const formattedTitle = formatTitle(title);
    document.title = formattedTitle;

    // Helper to safely create or update <meta> tags
    const updateMetaTag = (attributeName: 'name' | 'property', attributeValue: string, content: string) => {
      let tag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attributeName, attributeValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    updateMetaTag('name', 'description', description);
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // 3. Search Engine Indexing & Robots Directives (auto-protect portal routes)
    const isPortalRoute = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/admin') || 
      window.location.pathname.startsWith('/staff')
    );
    const shouldNoIndex = noIndex || isPortalRoute;
    const robotsDirective = shouldNoIndex ? 'noindex, nofollow' : 'index, follow';
    updateMetaTag('name', 'robots', robotsDirective);

    // 4. Hardened Canonical Link (Strictly Production Domain, No Query/Hash/Duplicates)
    const existingCanonicals = document.querySelectorAll('link[rel="canonical"]');
    existingCanonicals.forEach((el) => el.remove());

    const canonicalHref = getCanonicalUrl(canonicalPath || window.location.pathname);
    const canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', canonicalHref);
    document.head.appendChild(canonicalLink);

    // 5. OpenGraph Meta Tags
    const resolvedOgImage = getAbsoluteImageUrl(ogImage);
    updateMetaTag('property', 'og:title', formattedTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', resolvedOgImage);
    updateMetaTag('property', 'og:url', canonicalHref);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:site_name', company.name);

    // 6. Twitter / X Meta Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', formattedTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', resolvedOgImage);

    // 7. Structured Data (JSON-LD)
    let scriptTag = document.getElementById('structured-data-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'structured-data-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (shouldNoIndex) {
      // Do not output structured data on 404 or admin/private pages
      scriptTag.textContent = '';
    } else if (structuredData) {
      if (Array.isArray(structuredData)) {
        scriptTag.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@graph": structuredData
        });
      } else {
        scriptTag.textContent = JSON.stringify(structuredData);
      }
    } else {
      // Fallback default organization schema
      scriptTag.textContent = JSON.stringify(createOrganizationSchema());
    }

  }, [title, description, keywords, canonicalPath, ogImage, ogType, noIndex, structuredData]);

  return null;
};
