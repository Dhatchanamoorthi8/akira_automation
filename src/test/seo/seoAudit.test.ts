import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { products } from '../../data/products';
import { solutions } from '../../data/solutions';
import { 
  SITE_URL, 
  getCanonicalUrl, 
  formatTitle, 
  createOrganizationSchema, 
  createWebSiteSchema, 
  createBreadcrumbSchema, 
  createProductSchema 
} from '../../config/seo';
import { company } from '../../config/company';

describe('AKIRA PRECISION AUTOMATION LLP — Senior SEO Audit Test Suite', () => {
  const publicDir = path.resolve(__dirname, '../../../public');

  describe('Phase 1 & 2: Route & URL Inventory', () => {
    it('has all 16 precision products with valid slugs, titles, and categories', () => {
      expect(products.length).toBe(16);
      const slugs = new Set();
      const titles = new Set();

      products.forEach((prod) => {
        expect(prod.slug).toBeTruthy();
        expect(prod.title).toBeTruthy();
        expect(prod.description).toBeTruthy();
        expect(prod.category).toBeTruthy();
        expect(prod.categorySlug).toBeTruthy();
        expect(prod.image).toMatch(/^\/assets\//);

        // Ensure no duplicate slugs or titles
        expect(slugs.has(prod.slug)).toBe(false);
        expect(titles.has(prod.title)).toBe(false);
        slugs.add(prod.slug);
        titles.add(prod.title);
      });
    });

    it('has all 12 core solution capabilities with valid slugs and descriptions', () => {
      expect(solutions.length).toBe(12);
      const solutionSlugs = new Set();

      solutions.forEach((sol) => {
        expect(sol.slug).toBeTruthy();
        expect(sol.title).toBeTruthy();
        expect(sol.shortDescription).toBeTruthy();
        expect(sol.fullDescription).toBeTruthy();
        expect(sol.features.length).toBeGreaterThan(0);
        expect(sol.applications.length).toBeGreaterThan(0);

        expect(solutionSlugs.has(sol.slug)).toBe(false);
        solutionSlugs.add(sol.slug);
      });
    });
  });

  describe('Phase 3: Brand Consistency & Obsolescence Audit', () => {
    it('ensures company brand name is AKIRA PRECISION AUTOMATION LLP', () => {
      expect(company.name).toBe('AKIRA PRECISION AUTOMATION LLP');
      expect(company.legalName).toBe('Akira Precision Automation LLP');
      expect(company.tagline).toBe('Precision • Innovation • Smart Solutions');
      expect(company.slogan).toBe('Automating Today... Building Tomorrow...');
    });

    it('ensures formatTitle avoids duplicate brand name appending', () => {
      const alreadyBranded = 'AKIRA PRECISION AUTOMATION LLP | Precision Gauging Solutions';
      expect(formatTitle(alreadyBranded)).toBe('AKIRA PRECISION AUTOMATION LLP | Precision Gauging Solutions');

      const unbranded = 'Air Plug Gauges';
      expect(formatTitle(unbranded)).toBe('Air Plug Gauges | AKIRA PRECISION AUTOMATION LLP');
    });
  });

  describe('Phase 9: Canonical URL System', () => {
    it('uses https://akiraautomation.com as base origin', () => {
      expect(SITE_URL).toBe('https://akiraautomation.com');
    });

    it('normalizes root path to include trailing slash', () => {
      expect(getCanonicalUrl('/')).toBe('https://akiraautomation.com/');
      expect(getCanonicalUrl('')).toBe('https://akiraautomation.com/');
      expect(getCanonicalUrl('https://akiraautomation.com')).toBe('https://akiraautomation.com/');
      expect(getCanonicalUrl('https://akiraautomation.com/')).toBe('https://akiraautomation.com/');
    });

    it('normalizes subpages to strip trailing slash', () => {
      expect(getCanonicalUrl('/about')).toBe('https://akiraautomation.com/about');
      expect(getCanonicalUrl('/about/')).toBe('https://akiraautomation.com/about');
      expect(getCanonicalUrl('/products/air-plug-gauge/')).toBe('https://akiraautomation.com/products/air-plug-gauge');
    });

    it('strips query parameters and hashes from canonical URLs', () => {
      expect(getCanonicalUrl('/products?category=air-gauging#specs')).toBe('https://akiraautomation.com/products');
      expect(getCanonicalUrl('/solutions#multigauging')).toBe('https://akiraautomation.com/solutions');
      expect(getCanonicalUrl('/contact?source=adwords&utm_medium=cpc')).toBe('https://akiraautomation.com/contact');
    });

    it('never produces canonicals pointing to localhost, preview, or old domains', () => {
      const testPaths = ['http://localhost:3000/about', 'https://akira-preview.vercel.app/products', 'https://milestoneengservices.com/contact'];
      testPaths.forEach((tp) => {
        const canonical = getCanonicalUrl(tp);
        expect(canonical.startsWith('https://akiraautomation.com')).toBe(true);
        expect(canonical).not.toContain('localhost');
        expect(canonical).not.toContain('vercel.app');
        expect(canonical).not.toContain('milestoneengservices');
      });
    });
  });

  describe('Phase 10 & 21: Robots.txt & Private Route Protection', () => {
    it('contains valid robots.txt with disallow directives for admin and staff portals', () => {
      const robotsPath = path.join(publicDir, 'robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);
      const robotsContent = fs.readFileSync(robotsPath, 'utf-8');

      expect(robotsContent).toContain('User-agent: *');
      expect(robotsContent).toContain('Allow: /');
      expect(robotsContent).toContain('Disallow: /admin');
      expect(robotsContent).toContain('Disallow: /staff');
      expect(robotsContent).toContain('Sitemap: https://akiraautomation.com/sitemap.xml');
    });
  });

  describe('Phase 11: Production Sitemap Verification', () => {
    it('contains all 36 public routes (8 core, 12 solutions, 16 products)', () => {
      const sitemapPath = path.join(publicDir, 'sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

      // Core routes
      expect(sitemapContent).toContain('<loc>https://akiraautomation.com/</loc>');
      expect(sitemapContent).toContain('<loc>https://akiraautomation.com/about</loc>');
      expect(sitemapContent).toContain('<loc>https://akiraautomation.com/solutions</loc>');
      expect(sitemapContent).toContain('<loc>https://akiraautomation.com/products</loc>');
      expect(sitemapContent).toContain('<loc>https://akiraautomation.com/industries</loc>');
      expect(sitemapContent).toContain('<loc>https://akiraautomation.com/services</loc>');
      expect(sitemapContent).toContain('<loc>https://akiraautomation.com/why-choose-us</loc>');
      expect(sitemapContent).toContain('<loc>https://akiraautomation.com/contact</loc>');

      // All 16 products
      products.forEach((p) => {
        expect(sitemapContent).toContain(`<loc>https://akiraautomation.com/products/${p.slug}</loc>`);
      });

      // All 12 solutions
      solutions.forEach((s) => {
        expect(sitemapContent).toContain(`<loc>https://akiraautomation.com/solutions/${s.slug}</loc>`);
      });

      // Exclusions: No admin, staff, or redirect URLs
      expect(sitemapContent).not.toContain('/admin');
      expect(sitemapContent).not.toContain('/staff');
      expect(sitemapContent).not.toContain('/why-milestone');
      expect(sitemapContent).not.toContain('localhost');
      expect(sitemapContent).not.toContain('vercel.app');
    });
  });

  describe('Phase 12: Structured Data (JSON-LD) Verification', () => {
    it('generates valid Organization / LocalBusiness schema with authentic data', () => {
      const schema = createOrganizationSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('LocalBusiness');
      expect(schema.name).toBe('AKIRA PRECISION AUTOMATION LLP');
      expect(schema.legalName).toBe('Akira Precision Automation LLP');
      expect(schema.url).toBe('https://akiraautomation.com');
      expect(schema.address['@type']).toBe('PostalAddress');
      expect(schema.address.addressCountry).toBe('IN');
      expect(schema.telephone).toBeTruthy();
      expect(schema.email).toBeTruthy();

      // Ensure no fake ratings or certifications were injected
      expect((schema as any).aggregateRating).toBeUndefined();
      expect((schema as any).review).toBeUndefined();
    });

    it('generates valid WebSite schema for homepage', () => {
      const schema = createWebSiteSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.url).toBe('https://akiraautomation.com/');
      expect(schema.name).toBe('AKIRA PRECISION AUTOMATION LLP');
    });

    it('generates valid BreadcrumbList schema with sequential positions', () => {
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: 'Air Plug Gauge', url: '/products/air-plug-gauge' }
      ];
      const schema = createBreadcrumbSchema(breadcrumbs);
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement.length).toBe(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].item).toBe('https://akiraautomation.com/');
      expect(schema.itemListElement[2].position).toBe(3);
      expect(schema.itemListElement[2].item).toBe('https://akiraautomation.com/products/air-plug-gauge');
    });

    it('generates valid Product schema for every product without fake ratings or prices', () => {
      products.forEach((prod) => {
        const schema = createProductSchema({
          title: prod.title,
          description: prod.description,
          image: prod.image,
          category: prod.category,
          slug: prod.slug
        });

        expect(schema['@context']).toBe('https://schema.org');
        expect(schema['@type']).toBe('Product');
        expect(schema.name).toBe(prod.title);
        expect(schema.description).toBe(prod.description);
        expect(schema.image.startsWith('https://akiraautomation.com')).toBe(true);
        expect(schema.brand.name).toBe('AKIRA PRECISION AUTOMATION LLP');
        expect(schema.url).toBe(`https://akiraautomation.com/products/${prod.slug}`);

        // Zero hallucination check
        expect((schema as any).aggregateRating).toBeUndefined();
        expect((schema as any).offers).toBeUndefined();
        expect((schema as any).review).toBeUndefined();
      });
    });
  });
});
