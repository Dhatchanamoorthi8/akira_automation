import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProductImage } from '../types/database';
import { activityService } from './activityService';

const BUCKET_NAME = 'product-images';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadImageOptions {
  productId: string;
  file: File;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ReplaceImageOptions {
  imageId: string;
  productId: string;
  newFile: File;
  altText?: string;
}

export interface ProductImageValidationResult {
  valid: boolean;
  error?: string;
}

export class ProductImageService {
  /**
   * Validate image file format and size constraints before initiating upload.
   */
  validateFile(file: File): ProductImageValidationResult {
    if (!file) {
      return { valid: false, error: 'No file provided.' };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file format '${file.type}'. Allowed formats are JPEG, PNG, and WebP.`,
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB maximum limit.`,
      };
    }

    return { valid: true };
  }

  /**
   * Sanitizes filename to prevent path traversal or special character exploits.
   */
  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * List all images for a given product, ordered by sort_order.
   */
  async list(productId: string): Promise<ProductImage[]> {
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

  /**
   * Upload a new product image to Supabase Storage and register metadata in database.
   */
  async upload(options: UploadImageOptions): Promise<{ image: ProductImage | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { image: null, error: 'Database configuration is unavailable.' };
    }

    const { productId, file, altText, isPrimary = false, sortOrder = 0 } = options;

    const validation = this.validateFile(file);
    if (!validation.valid) {
      return { image: null, error: validation.error || 'Invalid file.' };
    }

    const safeName = this.sanitizeFilename(file.name);
    const uniquePrefix = crypto.randomUUID();
    const storagePath = `products/${productId}/${uniquePrefix}-${safeName}`;

    try {
      // Step 1: Upload binary to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        return { image: null, error: `Storage upload failed: ${uploadError.message}` };
      }

      // Step 2: Retrieve public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      const imageUrl = urlData.publicUrl;

      // Step 3: Insert metadata record into product_images table
      const { data: dbData, error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          storage_path: storagePath,
          image_url: imageUrl,
          alt_text: altText || file.name,
          is_primary: isPrimary,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (dbError) {
        // Rollback: purge uploaded binary from storage to avoid orphaned assets
        await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
        return { image: null, error: `Failed to save image record: ${dbError.message}` };
      }

      // Step 4: If marked as primary, demote other primary images for this product
      if (isPrimary && dbData) {
        await supabase
          .from('product_images')
          .update({ is_primary: false })
          .eq('product_id', productId)
          .neq('id', dbData.id);
      }

      await activityService.recordActivity({
        entityType: 'PRODUCT',
        entityId: productId,
        action: 'PRODUCT_IMAGE_UPLOADED',
        description: `Uploaded product image: ${altText || file.name}`,
      });

      if (isPrimary) {
        await activityService.recordActivity({
          entityType: 'PRODUCT',
          entityId: productId,
          action: 'PRODUCT_PRIMARY_IMAGE_CHANGED',
          description: `Set uploaded image as primary`,
        });
      }

      return { image: dbData as ProductImage, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown upload error';
      return { image: null, error: msg };
    }
  }

  /**
   * Replaces an existing image safely without risk of data loss.
   * Only purges old storage binary after new record is successfully committed.
   */
  async replace(options: ReplaceImageOptions): Promise<{ image: ProductImage | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { image: null, error: 'Database configuration is unavailable.' };
    }

    const { imageId, productId, newFile, altText } = options;

    const validation = this.validateFile(newFile);
    if (!validation.valid) {
      return { image: null, error: validation.error || 'Invalid file.' };
    }

    // Step 1: Retrieve existing image record to know old storage path
    const { data: oldRecord, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (fetchError || !oldRecord) {
      return { image: null, error: 'Existing image record could not be found.' };
    }

    const safeName = this.sanitizeFilename(newFile.name);
    const uniquePrefix = crypto.randomUUID();
    const newStoragePath = `products/${productId}/${uniquePrefix}-${safeName}`;

    try {
      // Step 2: Upload new binary
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(newStoragePath, newFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: newFile.type,
        });

      if (uploadError) {
        return { image: null, error: `Storage upload failed: ${uploadError.message}` };
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(newStoragePath);

      // Step 3: Update database record
      const { data: updatedRecord, error: dbError } = await supabase
        .from('product_images')
        .update({
          storage_path: newStoragePath,
          image_url: urlData.publicUrl,
          alt_text: altText || oldRecord.alt_text,
        })
        .eq('id', imageId)
        .select()
        .single();

      if (dbError) {
        // Rollback new upload; leave existing record and old file untouched
        await supabase.storage.from(BUCKET_NAME).remove([newStoragePath]);
        return { image: null, error: `Database update failed: ${dbError.message}` };
      }

      // Step 4: Now that new record is safely saved, delete old storage asset
      if (oldRecord.storage_path && oldRecord.storage_path !== newStoragePath) {
        await supabase.storage.from(BUCKET_NAME).remove([oldRecord.storage_path]);
      }

      await activityService.recordActivity({
        entityType: 'PRODUCT',
        entityId: productId,
        action: 'PRODUCT_IMAGE_REPLACED',
        description: `Replaced product image with ${newFile.name}`,
      });

      return { image: updatedRecord as ProductImage, error: null };
    } catch (err: unknown) {
      return {
        image: null,
        error: err instanceof Error ? err.message : 'Failed to replace image.',
      };
    }
  }

  /**
   * Delete an image record and remove its storage binary.
   */
  async delete(imageId: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      // Fetch record to identify storage path and product_id
      const { data: record } = await supabase
        .from('product_images')
        .select('*')
        .eq('id', imageId)
        .single();

      // Delete database record first
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        return { success: false, error: dbError.message };
      }

      // Purge binary from storage
      if (record?.storage_path) {
        await supabase.storage.from(BUCKET_NAME).remove([record.storage_path]);
      }

      // If deleted image was primary, auto-promote next available image
      if (record?.is_primary && record.product_id) {
        const { data: remaining } = await supabase
          .from('product_images')
          .select('id')
          .eq('product_id', record.product_id)
          .order('sort_order', { ascending: true })
          .limit(1);

        if (remaining && remaining.length > 0) {
          await supabase
            .from('product_images')
            .update({ is_primary: true })
            .eq('id', remaining[0].id);

          await activityService.recordActivity({
            entityType: 'PRODUCT',
            entityId: record.product_id,
            action: 'PRODUCT_PRIMARY_IMAGE_CHANGED',
            description: 'Promoted next available image to primary after primary deletion',
          });
        }
      }

      if (record?.product_id) {
        await activityService.recordActivity({
          entityType: 'PRODUCT',
          entityId: record.product_id,
          action: 'PRODUCT_IMAGE_DELETED',
          description: `Deleted product image`,
        });
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Deletion failed.',
      };
    }
  }

  /**
   * Designate a specific image as the primary cover photo for a product.
   */
  async setPrimary(productId: string, imageId: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      // Demote all images for this product
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);

      // Promote selected image
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'PRODUCT',
        entityId: productId,
        action: 'PRODUCT_PRIMARY_IMAGE_CHANGED',
        description: `Designated image as primary`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update primary image.',
      };
    }
  }

  /**
   * Update the sort order sequence for multiple images belonging to a product.
   */
  async reorder(productId: string, updates: { id: string; sort_order: number }[]): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      for (const update of updates) {
        await supabase
          .from('product_images')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      await activityService.recordActivity({
        entityType: 'PRODUCT',
        entityId: productId,
        action: 'PRODUCT_IMAGE_REORDERED',
        description: `Reordered gallery images`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Reordering failed.',
      };
    }
  }

  /**
   * Update the alt text description for an image.
   */
  async updateAltText(imageId: string, altText: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('product_images')
        .update({ alt_text: altText.trim() })
        .eq('id', imageId)
        .select('product_id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.product_id) {
        await activityService.recordActivity({
          entityType: 'PRODUCT',
          entityId: data.product_id,
          action: 'PRODUCT_IMAGE_ALT_UPDATED',
          description: `Updated image alt text to: "${altText.trim()}"`,
        });
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update alt text.',
      };
    }
  }
}

export const productImageService = new ProductImageService();
