import { Product, ProductSummary, ProductCategory } from '../types';
import { productSummaries, productCategories } from '../data/productSummaries';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DbProduct,
  ProductImage,
  ProductWithImages,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
} from '../types/database';
import { activityService } from './activityService';

/**
 * Maps database product and image records to the frontend Product contract.
 */
function mapDbProductToProduct(dbProd: DbProduct, images: ProductImage[] = []): Product {
  const primaryImage = images.find(img => img.is_primary)?.image_url
    || images[0]?.image_url
    || `/assets/products/${dbProd.slug}.webp`;

  const secondaryImages = images
    .filter(img => !img.is_primary)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(img => img.image_url);

  return {
    id: dbProd.id,
    slug: dbProd.slug,
    title: dbProd.name,
    category: dbProd.category || 'Metrology Systems',
    categorySlug: dbProd.category_slug || 'all',
    tagline: dbProd.tagline || '',
    image: primaryImage,
    description: dbProd.description || dbProd.short_description || '',
    highlights: dbProd.highlights || [],
    isFeatured: dbProd.featured,
    secondaryImages: secondaryImages.length > 0 ? secondaryImages : undefined,
    specsImage: dbProd.specs_image || undefined,
    cadImage: dbProd.cad_image || undefined,
    specifications: dbProd.specifications || {},
    features: dbProd.features || [],
    applications: dbProd.applications || [],
    relatedProductSlugs: dbProd.related_product_slugs || [],
  };
}

/**
 * Product Service Layer
 * Abstracts data storage and retrieval, allowing seamless transition
 * between local static summaries, lazy-loaded datasets, and Supabase PostgreSQL.
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
   * specifications and secondary images.
   * Queries Supabase if configured; otherwise gracefully falls back to dynamic code-splitting import.
   */
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && import.meta.env.MODE !== 'test') {
      try {
        const { data: dbProducts, error } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('active', true)
          .order('name');

        if (!error && dbProducts && dbProducts.length > 0) {
          return dbProducts.map((raw: any) => {
            const images = raw.product_images || [];
            return mapDbProductToProduct(raw as DbProduct, images as ProductImage[]);
          });
        }
      } catch {
        // Fall back to static dataset
      }
    }

    const { products } = await import('../data/products');
    return products;
  }

  /**
   * Asynchronously retrieves a specific product by its URL slug.
   * Lazily loads full specifications from Supabase or static dataset.
   */
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    if (isSupabaseConfigured() && import.meta.env.MODE !== 'test') {
      try {
        const { data: dbProduct, error } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('slug', slug)
          .maybeSingle();

        if (!error && dbProduct) {
          const images = (dbProduct as any).product_images || [];
          return mapDbProductToProduct(dbProduct as DbProduct, images as ProductImage[]);
        }
      } catch {
        // Fall back to static dataset
      }
    }

    const { products } = await import('../data/products');
    return products.find(p => p.slug === slug);
  }

  /**
   * Asynchronously loads related products for a given product.
   */
  async getRelatedProducts(product: Product, limit: number = 3): Promise<Product[]> {
    const allProducts = await this.getProducts();
    return allProducts
      .filter(
        p => p.slug !== product.slug && 
        (product.relatedProductSlugs?.includes(p.slug) || p.categorySlug === product.categorySlug)
      )
      .slice(0, limit);
  }

  /**
   * Retrieve all images registered for a specific product ID.
   */
  async getProductImages(productId: string): Promise<ProductImage[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });

      if (error || !data) return [];
      return data as ProductImage[];
    } catch {
      return [];
    }
  }

  // ============================================================
  // ADMIN & PRODUCT MANAGEMENT METHODS
  // ============================================================

  /**
   * Generates a clean URL-safe slug from a product name.
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Verifies if a slug is available for a new product or existing product edit.
   */
  async checkSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      let query = supabase
        .from('products')
        .select('id')
        .eq('slug', slug.trim());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) return true;
      return !data || data.length === 0;
    } catch {
      return true;
    }
  }

  /**
   * Admin: List products with search, category filtering, status filters, sorting, and pagination.
   */
  async getAdminProducts(filters: ProductFilters = {}): Promise<{
    products: ProductWithImages[];
    total: number;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { products: [], total: 0, error: 'Database configuration is unavailable.' };
    }

    const {
      search,
      category,
      active,
      featured,
      sortBy = 'name',
      sortOrder = 'asc',
      limit = 50,
      offset = 0,
    } = filters;

    try {
      let query = supabase
        .from('products')
        .select('*, product_images(*)', { count: 'exact' });

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`name.ilike.${term},slug.ilike.${term},category.ilike.${term}`);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (typeof active === 'boolean') {
        query = query.eq('active', active);
      }

      if (typeof featured === 'boolean') {
        query = query.eq('featured', featured);
      }

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        return { products: [], total: 0, error: error.message };
      }

      const productsWithImages: ProductWithImages[] = (data || []).map((prod: any) => {
        const sortedImages = (prod.product_images || []).sort(
          (a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order
        );
        return {
          ...prod,
          product_images: sortedImages,
        };
      });

      return {
        products: productsWithImages,
        total: count !== null ? count : productsWithImages.length,
        error: null,
      };
    } catch (err: unknown) {
      return {
        products: [],
        total: 0,
        error: err instanceof Error ? err.message : 'Failed to fetch products.',
      };
    }
  }

  /**
   * Admin: Retrieve a single product by ID with registered images.
   */
  async getProductById(id: string): Promise<{ product: ProductWithImages | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { product: null, error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return { product: null, error: error.message };
      }

      if (!data) {
        return { product: null, error: 'Product not found.' };
      }

      const sortedImages = ((data as any).product_images || []).sort(
        (a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order
      );

      return {
        product: {
          ...data,
          product_images: sortedImages,
        } as ProductWithImages,
        error: null,
      };
    } catch (err: unknown) {
      return {
        product: null,
        error: err instanceof Error ? err.message : 'Failed to load product.',
      };
    }
  }

  /**
   * Admin: Create a new product.
   */
  async createProduct(input: CreateProductInput): Promise<{ product: DbProduct | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { product: null, error: 'Database configuration is unavailable.' };
    }

    if (!input.name || !input.name.trim()) {
      return { product: null, error: 'Product name is required.' };
    }

    const slug = (input.slug && input.slug.trim()) ? this.generateSlug(input.slug) : this.generateSlug(input.name);
    if (!slug) {
      return { product: null, error: 'A valid URL-safe slug is required.' };
    }

    const isUnique = await this.checkSlugUnique(slug);
    if (!isUnique) {
      return { product: null, error: `Slug "${slug}" is already in use by another product. Please choose a unique slug.` };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: input.name.trim(),
          slug,
          category: input.category || 'Metrology Systems',
          category_slug: input.category_slug || this.generateSlug(input.category || 'Metrology Systems'),
          tagline: input.tagline?.trim() || null,
          short_description: input.short_description?.trim() || null,
          description: input.description?.trim() || null,
          highlights: input.highlights || [],
          specifications: input.specifications || {},
          features: input.features || [],
          applications: input.applications || [],
          related_product_slugs: input.related_product_slugs || [],
          specs_image: input.specs_image || null,
          cad_image: input.cad_image || null,
          featured: Boolean(input.featured),
          active: input.active !== undefined ? Boolean(input.active) : true,
        })
        .select()
        .single();

      if (error) {
        return { product: null, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'PRODUCT',
        entityId: data.id,
        action: 'PRODUCT_CREATED',
        description: `Created new product "${data.name}" (${data.slug})`,
        newValue: data,
      });

      return { product: data as DbProduct, error: null };
    } catch (err: unknown) {
      return {
        product: null,
        error: err instanceof Error ? err.message : 'Failed to create product.',
      };
    }
  }

  /**
   * Admin: Update an existing product.
   */
  async updateProduct(id: string, input: UpdateProductInput): Promise<{ product: DbProduct | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { product: null, error: 'Database configuration is unavailable.' };
    }

    if (input.slug) {
      const formattedSlug = this.generateSlug(input.slug);
      const isUnique = await this.checkSlugUnique(formattedSlug, id);
      if (!isUnique) {
        return { product: null, error: `Slug "${formattedSlug}" is already taken by another product.` };
      }
      input.slug = formattedSlug;
    }

    try {
      const payload: Record<string, any> = {};
      if (input.name !== undefined) payload.name = input.name.trim();
      if (input.slug !== undefined) payload.slug = input.slug;
      if (input.category !== undefined) {
        payload.category = input.category;
        payload.category_slug = input.category_slug || this.generateSlug(input.category);
      }
      if (input.tagline !== undefined) payload.tagline = input.tagline?.trim() || null;
      if (input.short_description !== undefined) payload.short_description = input.short_description?.trim() || null;
      if (input.description !== undefined) payload.description = input.description?.trim() || null;
      if (input.highlights !== undefined) payload.highlights = input.highlights;
      if (input.specifications !== undefined) payload.specifications = input.specifications;
      if (input.features !== undefined) payload.features = input.features;
      if (input.applications !== undefined) payload.applications = input.applications;
      if (input.related_product_slugs !== undefined) payload.related_product_slugs = input.related_product_slugs;
      if (input.specs_image !== undefined) payload.specs_image = input.specs_image || null;
      if (input.cad_image !== undefined) payload.cad_image = input.cad_image || null;
      if (input.featured !== undefined) payload.featured = Boolean(input.featured);
      if (input.active !== undefined) payload.active = Boolean(input.active);

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { product: null, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'PRODUCT',
        entityId: id,
        action: 'PRODUCT_UPDATED',
        description: `Updated product "${data.name}"`,
        newValue: data,
      });

      return { product: data as DbProduct, error: null };
    } catch (err: unknown) {
      return {
        product: null,
        error: err instanceof Error ? err.message : 'Failed to update product.',
      };
    }
  }

  /**
   * Admin: Delete a product and its associated storage assets.
   */
  async deleteProduct(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      // 1. Retrieve product details and images to clean up storage objects
      const { data: product } = await supabase
        .from('products')
        .select('name, product_images(storage_path)')
        .eq('id', id)
        .single();

      const imagePaths = (product as any)?.product_images
        ?.map((img: any) => img.storage_path)
        .filter(Boolean) || [];

      if (imagePaths.length > 0) {
        await supabase.storage.from('product-images').remove(imagePaths);
      }

      // 2. Delete product record (database foreign key cascades and removes product_images rows)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'PRODUCT',
        entityId: id,
        action: 'PRODUCT_DELETED',
        description: `Permanently deleted product "${product?.name || id}" and its media`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete product.',
      };
    }
  }

  /**
   * Admin: Quick toggle product active visibility state.
   */
  async setProductActive(id: string, active: boolean): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .update({ active })
        .eq('id', id)
        .select('name')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'PRODUCT',
        entityId: id,
        action: active ? 'PRODUCT_ACTIVATED' : 'PRODUCT_DEACTIVATED',
        description: `${active ? 'Activated' : 'Deactivated'} product "${data?.name || id}"`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update product status.',
      };
    }
  }

  /**
   * Admin: Quick toggle featured editorial showcase flag.
   */
  async setProductFeatured(id: string, featured: boolean): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .update({ featured })
        .eq('id', id)
        .select('name')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'PRODUCT',
        entityId: id,
        action: featured ? 'PRODUCT_FEATURED' : 'PRODUCT_UNFEATURED',
        description: `${featured ? 'Featured' : 'Unfeatured'} product "${data?.name || id}" on homepage`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update featured flag.',
      };
    }
  }
}

export const productService = new ProductService();
