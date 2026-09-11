import React, { useEffect } from 'react';
import { company } from '../../config/company';
import { companyData } from '../../data/company';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalPath = '',
  ogImage = '/assets/hero/hero-lab-gauging.webp',
}) => {
  useEffect(() => {
    // 1. Title Tag
    const fullTitle = `${title} | ${company.name}`;
    document.title = fullTitle;

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

    // 3. OpenGraph Meta Tags
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:type', 'website');

    // 4. Twitter / X Meta Tags (Requirement 11)
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);

    // 5. Canonical Link Hardening (Requirement 8)
    // Remove any existing canonical tags to avoid duplicates
    const existingCanonicals = document.querySelectorAll('link[rel="canonical"]');
    existingCanonicals.forEach((el) => el.remove());

    const canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    
    // Construct valid canonical URL using origin and canonicalPath or current pathname
    const origin = window.location.origin;
    const resolvedPath = canonicalPath || window.location.pathname;
    canonicalLink.setAttribute('href', `${origin}${resolvedPath}`);
    document.head.appendChild(canonicalLink);

    // 6. JSON-LD Structured Data for LocalBusiness & Organization
    let scriptTag = document.getElementById('structured-data-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'structured-data-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": company.name,
      "image": company.logo,
      "description": description,
      "foundingDate": "2021",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": companyData.address.street,
        "addressLocality": companyData.address.village,
        "addressRegion": companyData.address.state,
        "postalCode": companyData.address.pin,
        "addressCountry": "IN"
      },
      "telephone": companyData.phones[0],
      "email": companyData.emails[0],
      "slogan": company.tagline
    };

    scriptTag.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, canonicalPath, ogImage]);

  return null;
};
