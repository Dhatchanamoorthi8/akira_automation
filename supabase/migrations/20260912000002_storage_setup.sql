-- ============================================================
-- AKIRA AUTOMATION — SUPABASE STORAGE SETUP
-- Migration: 20260912000002_storage_setup.sql
-- Bucket: product-images
-- ============================================================

-- 1. Create the storage bucket if not already present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Enable RLS on storage.objects (standard in Supabase)
-- In Supabase, storage.objects has RLS enabled by default.

-- 3. Storage Policies for product-images bucket

-- Anyone can view images in the public product-images bucket
DROP POLICY IF EXISTS "Public product images read policy" ON storage.objects;
CREATE POLICY "Public product images read policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Only authenticated admins can upload images to product-images
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND public.is_admin()
);

-- Only authenticated admins can update images in product-images
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.is_admin()
)
WITH CHECK (
  bucket_id = 'product-images'
  AND public.is_admin()
);

-- Only authenticated admins can delete images from product-images
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.is_admin()
);
