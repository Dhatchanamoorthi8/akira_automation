-- Migration: Allow authenticated users to read active products and product images
-- Ensures staff workspace and quotation generators can access products and their UUIDs

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'products' AND policyname = 'products_authenticated_read_active'
  ) THEN
    CREATE POLICY products_authenticated_read_active ON products 
    FOR SELECT TO authenticated 
    USING (active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_images' AND policyname = 'product_images_authenticated_read'
  ) THEN
    CREATE POLICY product_images_authenticated_read ON product_images 
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_images.product_id AND p.active = true));
  END IF;
END $$;
