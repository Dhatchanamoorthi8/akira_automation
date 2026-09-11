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
  });

  it('updates document.title in the actual DOM with company branding suffix', () => {
    render(
      <SEOHead
        title="Air Plug Gauges"
        description="High precision ID bore measuring systems"
      />
    );

    expect(document.title).toBe('Air Plug Gauges | AKIRA AUTOMATION');
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

  it('creates a canonical link tag with correct href in document.head', () => {
    render(
      <SEOHead
        title="Product Catalogue"
        description="Explore all precision gauges"
        canonicalPath="/products"
      />
    );

    const canonicalLink = document.head.querySelector('link[rel="canonical"]');
    expect(canonicalLink).not.toBeNull();
    expect(canonicalLink?.getAttribute('href')).toContain('/products');
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
    expect(canonicals[0].getAttribute('href')).toContain('/products/air-plug-gauge');

    // Simulate route navigation to a different product
    rerender(
      <SEOHead
        title="Air Ring Gauge"
        description="Air ring gauge description"
        canonicalPath="/products/air-ring-gauge"
      />
    );

    canonicals = document.head.querySelectorAll('link[rel="canonical"]');
    // Crucial check: Must have exactly one canonical tag, not two
    expect(canonicals.length).toBe(1);
    expect(canonicals[0].getAttribute('href')).toContain('/products/air-ring-gauge');
  });

  it('creates OpenGraph tags (og:title, og:description, og:image, og:type)', () => {
    render(
      <SEOHead
        title="Custom Multi-Gauging"
        description="Automated multi-gauging fixtures"
        ogImage="/assets/custom-fixture.webp"
      />
    );

    const ogTitle = document.head.querySelector('meta[property="og:title"]');
    const ogDesc = document.head.querySelector('meta[property="og:description"]');
    const ogImage = document.head.querySelector('meta[property="og:image"]');
    const ogType = document.head.querySelector('meta[property="og:type"]');

    expect(ogTitle?.getAttribute('content')).toBe('Custom Multi-Gauging | AKIRA AUTOMATION');
    expect(ogDesc?.getAttribute('content')).toBe('Automated multi-gauging fixtures');
    expect(ogImage?.getAttribute('content')).toBe('/assets/custom-fixture.webp');
    expect(ogType?.getAttribute('content')).toBe('website');
  });

  it('creates complete Twitter / X card metadata in document.head', () => {
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
  expect(twitterImage?.getAttribute('content')).toBe('/assets/tooling.webp');
  });
});
