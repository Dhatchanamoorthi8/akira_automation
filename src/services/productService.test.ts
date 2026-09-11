import { describe, it, expect } from 'vitest';
import { productService } from './productService';
import { ProductSummary } from '../types';

describe('productService', () => {
  describe('Summary Data', () => {
    it('returns all product summaries', () => {
      const summaries = productService.getProductSummaries();
      expect(Array.isArray(summaries)).toBe(true);
      expect(summaries.length).toBeGreaterThanOrEqual(16);
    });

    it('summary objects contain all required lightweight fields', () => {
      const summaries = productService.getProductSummaries();
      for (const summary of summaries) {
        expect(summary.id).toBeDefined();
        expect(typeof summary.slug).toBe('string');
        expect(summary.slug.length).toBeGreaterThan(0);
        expect(typeof summary.title).toBe('string');
        expect(summary.title.length).toBeGreaterThan(0);
        expect(typeof summary.category).toBe('string');
        expect(typeof summary.categorySlug).toBe('string');
        expect(typeof summary.image).toBe('string');
        expect(typeof summary.description).toBe('string');
        expect(typeof summary.tagline).toBe('string');
        expect(Array.isArray(summary.highlights)).toBe(true);
      }
    });

    it('summaries do NOT contain heavy technical specification tables or deep CAD images', () => {
      const summaries = productService.getProductSummaries();
      for (const summary of summaries) {
        // Assert that the heavy specifications dictionary is not present on summary objects
        const rawObject = summary as unknown as Record<string, unknown>;
        expect(rawObject.specifications).toBeUndefined();
        expect(rawObject.secondaryImages).toBeUndefined();
        expect(rawObject.cadImage).toBeUndefined();
      }
    });
  });

  describe('Featured Products', () => {
    it('returns only products flagged as isFeatured', () => {
      const featured = productService.getFeaturedProducts();
      expect(featured.length).toBeGreaterThan(0);
      for (const item of featured) {
        expect(item.isFeatured).toBe(true);
      }
    });

    it('returned featured objects remain lightweight summaries', () => {
      const featured = productService.getFeaturedProductSummaries();
      for (const item of featured) {
        const rawObject = item as unknown as Record<string, unknown>;
        expect(rawObject.specifications).toBeUndefined();
      }
    });
  });

  describe('Product Lookup by Slug', () => {
    it('returns the correct product with full technical specifications for a valid slug', async () => {
      const product = await productService.getProductBySlug('air-plug-gauge');
      expect(product).toBeDefined();
      expect(product?.slug).toBe('air-plug-gauge');
      expect(product?.title).toContain('Air Plug Gauge');
      expect(product?.category).toBe('Air Gauging');
      // Full technical specifications must be populated
      expect(product?.specifications).toBeDefined();
      expect(Object.keys(product?.specifications || {}).length).toBeGreaterThan(0);
      expect(product?.features.length).toBeGreaterThan(0);
    });

    it('returns undefined for an invalid slug without throwing unhandled exceptions', async () => {
      const product = await productService.getProductBySlug('non-existent-system-slug');
      expect(product).toBeUndefined();
    });
  });

  describe('Category Queries and Filtering', () => {
    it('returns all defined metrology categories', () => {
      const categories = productService.getProductCategories();
      expect(categories.length).toBeGreaterThan(0);
      const airGauging = categories.find((c) => c.slug === 'air-gauging');
      expect(airGauging).toBeDefined();
      expect(airGauging?.name).toBe('Air Gauging');
    });

    it('allows filtering product summaries by categorySlug', () => {
      const summaries = productService.getProductSummaries();
      const airGaugingItems = summaries.filter((p: ProductSummary) => p.categorySlug === 'air-gauging');
      expect(airGaugingItems.length).toBeGreaterThan(0);
      for (const item of airGaugingItems) {
        expect(item.categorySlug).toBe('air-gauging');
      }
    });
  });

  describe('Related Products', () => {
    it('returns related products for a given product excluding itself', async () => {
      const product = await productService.getProductBySlug('air-plug-gauge');
      expect(product).toBeDefined();
      if (!product) return;

      const related = await productService.getRelatedProducts(product, 3);
      expect(related.length).toBeGreaterThan(0);
      expect(related.length).toBeLessThanOrEqual(3);
      for (const item of related) {
        expect(item.slug).not.toBe(product.slug);
      }
    });
  });
});
