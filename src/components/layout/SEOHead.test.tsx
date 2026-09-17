import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { SEOHead } from './SEOHead';

describe('SEOHead Component', () => {
  beforeEach(() => {
    // Clear head metadata before each test to ensure deterministic assertions
    document.title = '';
    const metas = document.head.querySelectorAll('meta');
    metas.forEach((m) => m.remove());
    const links = document.head.querySelectorAll('link[rel="canonical"]');
    links.forEach((l) => l.remove());
    const scripts = document.head.querySelectorAll('script#structured-data-jsonld');
    scripts.forEach((s) => s.remove());
  });

  it('updates document.title in the actual DOM with company branding suffix when not already present', () => {
    render(
      <SEOHead
        title="Air Plug Gauges"
        description="High precision ID bore measuring systems"
      />
    );

    expect(document.title).toBe('Air Plug Gauges | AKIRA AUTOMATION');
  });

  it('does NOT duplicate company branding suffix if title already contains AKIRA AUTOMATION', () => {
    render(
      <SEOHead
        title="AKIRA AUTOMATION | Precision Gauging Solutions"
        description="High precision ID bore measuring systems"
      />
    );

    expect(document.title).toBe('AKIRA AUTOMATION | Precision Gauging Solutions');
  });

  it('creates and updates the meta description tag in document.head', () => {
    render(
      <SEOHead
        title="Air Ring Gauges"
        description="Precision OD measurement tooling for automotive shafts"
      />
    );

    const metaDesc = document.head.querySelector('meta[name="description"]');
    expect(metaDesc).not.toBeNull();
    expect(metaDesc?.getAttribute('content')).toBe(
      'Precision OD measurement tooling for automotive shafts'
    );
  });

  it('creates a canonical link tag with strict production origin in document.head', () => {
    render(
      <SEOHead
        title="Product Catalogue"
        description="Explore all precision gauges"
        canonicalPath="/products"
      />
    );

    const canonicalLink = document.head.querySelector('link[rel="canonical"]');
    expect(canonicalLink).not.toBeNull();
    expect(canonicalLink?.getAttribute('href')).toBe('https://akiraautomation.com/products');
  });

  it('replaces previous canonical link upon route change and ensures NEVER more than one canonical tag exists', () => {
    const { rerender } = render(
      <SEOHead
        title="Air Plug Gauge"
        description="Air plug gauge description"
        canonicalPath="/products/air-plug-gauge"
      />
    );

    let canonicals = document.head.querySelectorAll('link[rel="canonical"]');
    expect(canonicals.length).toBe(1);
    expect(canonicals[0].getAttribute('href')).toBe('https://akiraautomation.com/products/air-plug-gauge');

    // Simulate route navigation to a different product
    rerender(
      <SEOHead
        title="Air Ring Gauge"
        description="Air ring gauge description"
        canonicalPath="/products/air-ring-gauge"
      />
    );

    canonicals = document.head.querySelectorAll('link[rel="canonical"]');
    expect(canonicals.length).toBe(1);
    expect(canonicals[0].getAttribute('href')).toBe('https://akiraautomation.com/products/air-ring-gauge');
  });

  it('creates OpenGraph tags (og:title, og:description, og:image, og:url, og:site_name, og:type) with absolute image URLs', () => {
    render(
      <SEOHead
        title="Custom Multi-Gauging"
        description="Automated multi-gauging fixtures"
        canonicalPath="/solutions/multigauging"
        ogImage="/assets/custom-fixture.webp"
      />
    );

    const ogTitle = document.head.querySelector('meta[property="og:title"]');
    const ogDesc = document.head.querySelector('meta[property="og:description"]');
    const ogImage = document.head.querySelector('meta[property="og:image"]');
    const ogUrl = document.head.querySelector('meta[property="og:url"]');
    const ogSiteName = document.head.querySelector('meta[property="og:site_name"]');
    const ogType = document.head.querySelector('meta[property="og:type"]');

    expect(ogTitle?.getAttribute('content')).toBe('Custom Multi-Gauging | AKIRA AUTOMATION');
    expect(ogDesc?.getAttribute('content')).toBe('Automated multi-gauging fixtures');
    expect(ogImage?.getAttribute('content')).toBe('https://akiraautomation.com/assets/custom-fixture.webp');
    expect(ogUrl?.getAttribute('content')).toBe('https://akiraautomation.com/solutions/multigauging');
    expect(ogSiteName?.getAttribute('content')).toBe('AKIRA AUTOMATION');
    expect(ogType?.getAttribute('content')).toBe('website');
  });

  it('creates complete Twitter / X card metadata in document.head with absolute image URL', () => {
    render(
      <SEOHead
        title="Precision Tooling"
        description="High accuracy metrology instruments"
        ogImage="/assets/tooling.webp"
      />
    );

    const twitterCard = document.head.querySelector('meta[name="twitter:card"]');
    const twitterTitle = document.head.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.head.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.head.querySelector('meta[name="twitter:image"]');

    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
    expect(twitterTitle?.getAttribute('content')).toBe('Precision Tooling | AKIRA AUTOMATION');
    expect(twitterDesc?.getAttribute('content')).toBe('High accuracy metrology instruments');
    expect(twitterImage?.getAttribute('content')).toBe('https://akiraautomation.com/assets/tooling.webp');
  });

  it('sets robots directive to index, follow by default and noindex, nofollow when noIndex is true', () => {
    const { rerender } = render(
      <SEOHead
        title="Public Page"
        description="Search indexable content"
      />
    );

    let robots = document.head.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toBe('index, follow');

    rerender(
      <SEOHead
        title="Private Page"
        description="Private portal content"
        noIndex={true}
      />
    );

    robots = document.head.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('injects valid Schema.org structured data script and clears it when noIndex is true', () => {
    const customSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Test Gauge"
    };

    const { rerender } = render(
      <SEOHead
        title="Test Gauge"
        description="Test description"
        structuredData={customSchema}
      />
    );

    const script = document.head.querySelector('script#structured-data-jsonld');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent || '{}');
    expect(parsed.name).toBe('Test Gauge');

    // Rerender with noIndex
    rerender(
      <SEOHead
        title="404 Page"
        description="Not found"
        noIndex={true}
      />
    );

    expect(script?.textContent).toBe('');
  });
});
