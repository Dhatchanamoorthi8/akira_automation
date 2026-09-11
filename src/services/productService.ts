import { Product, ProductSummary, ProductCategory } from '../types';
import { productSummaries, productCategories } from '../data/productSummaries';

/**
 * Product Service Layer
 * Abstracts data storage and retrieval, allowing seamless transition
 * between local static summaries, lazy-loaded datasets, and future REST/CMS APIs.
 */
class ProductService {
  /**
   * Returns lightweight product summaries for catalog lists, navigation, and cards.
   * Does NOT load heavy technical specifications tables.
   */
  getProductSummaries(): ProductSummary[] {
    return productSummaries;
  }

  /**
   * Returns product summaries flagged for homepage editorial showcase.
   */
  getFeaturedProductSummaries(): ProductSummary[] {
    return productSummaries.filter(p => p.isFeatured);
  }

  /**
   * Alias for getFeaturedProductSummaries for standard API conformance.
   */
  getFeaturedProducts(): ProductSummary[] {
    return this.getFeaturedProductSummaries();
  }

  /**
   * Returns all available product and solution categories.
   */
  getProductCategories(): ProductCategory[] {
    return productCategories;
  }

  /**
   * Asynchronously loads the complete product catalog including deep technical
   * specifications and secondary images via dynamic code splitting.
   */
  async getProducts(): Promise<Product[]> {
    const { products } = await import('../data/products');
    return products;
  }

  /**
   * Asynchronously retrieves a specific product by its URL slug.
   * Lazily loads the full specifications dataset only when inspecting a product detail page.
   */
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const { products } = await import('../data/products');
    return products.find(p => p.slug === slug);
  }

  /**
   * Asynchronously loads related products for a given product.
   */
  async getRelatedProducts(product: Product, limit: number = 3): Promise<Product[]> {
    const { products } = await import('../data/products');
    return products
      .filter(
        p => p.slug !== product.slug && 
        (product.relatedProductSlugs?.includes(p.slug) || p.categorySlug === product.categorySlug)
      )
      .slice(0, limit);
  }
}

export const productService = new ProductService();
