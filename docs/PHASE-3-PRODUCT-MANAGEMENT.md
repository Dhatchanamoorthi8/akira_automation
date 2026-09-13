# Phase 3 Product Management

## Architecture

The AKIRA AUTOMATION Product Management System is an enterprise-grade administration suite allowing engineering and sales administrators to manage the complete precision metrology catalogue, upload high-resolution component imagery, configure primary display photos, and update technical parameters without altering application source code.

The architecture strictly separates responsibilities:
```
+--------------------------------------------------------------------+
|                         Admin Interface                            |
|  - /admin/products            (Catalogue Management Table & Cards) |
|  - /admin/products/new        (New Gauge & Instrument Provisioning)|
|  - /admin/products/:id/edit   (Technical Specifications & Media)   |
+--------------------------------------------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
|                         Service Layer                              |
|  - productService.ts       (CRUD, Slug Generation, Filtering)      |
|  - productImageService.ts  (Storage Upload, Reorder, Primary, Alt) |
|  - activityService.ts      (Audit Logging for all Mutations)       |
+--------------------------------------------------------------------+
                                  |
            +---------------------+---------------------+
            v (PostgREST API)                           v (Storage API)
+-------------------------------+             +----------------------+
|     PostgreSQL Database       |             |   Supabase Storage   |
|  - public.products            |             |   - 'product-images' |
|  - public.product_images      |             |   - Public Read      |
|  - public.activity_logs       |             |   - Admin Write      |
|  - RLS Enforcement            |             +----------------------+
+-------------------------------+
```

---

## Product Database

The database utilizes two core tables for catalogue management:

### 1. `public.products`
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `name` (TEXT, NOT NULL) — Official model name (e.g., "Air Plug Gauge to Check ID Bore")
- `slug` (TEXT, NOT NULL, UNIQUE) — URL identifier
- `category` (TEXT) — Industrial category (e.g., "Air Gauging")
- `category_slug` (TEXT) — URL category slug (e.g., "air-gauging")
- `tagline` (TEXT) — Technical sub-header
- `short_description` (TEXT) — Card summary
- `description` (TEXT) — Full engineering overview
- `highlights` (TEXT[]) — Bulleted key capabilities
- `specifications` (JSONB) — Key-value pairs for technical specifications table
- `features` (TEXT[]) — Engineering bullet points
- `applications` (TEXT[]) — Manufacturing applications (e.g. engine blocks, bushings)
- `related_product_slugs` (TEXT[]) — Cross-linked equipment slugs
- `specs_image` (TEXT, optional) — Schematic drawing URL
- `cad_image` (TEXT, optional) — 3D dimensional CAD drawing URL
- `featured` (BOOLEAN, default `false`) — Editorial showcase on homepage
- `active` (BOOLEAN, default `true`) — Visibility toggle
- `created_at` / `updated_at` (TIMESTAMPTZ) — Automated timestamps

### 2. `public.product_images`
- `id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key referencing `products(id)` ON DELETE CASCADE)
- `storage_path` (TEXT, NOT NULL) — Path inside Supabase Storage bucket
- `image_url` (TEXT, NOT NULL) — Public CDN URL
- `alt_text` (TEXT) — Accessibility descriptive label
- `sort_order` (INTEGER, NOT NULL, default `0`) — Gallery sequence order
- `is_primary` (BOOLEAN, NOT NULL, default `false`) — Main catalogue cover indicator
- `created_at` / `updated_at` (TIMESTAMPTZ)

---

## Product Service

The `ProductService` (`src/services/productService.ts`) manages all database queries:
- `getProducts(filters)`: Retrieves products with optional search query, category, active state, and featured state.
- `getProductById(id)`: Fetches product record along with registered images.
- `getProductBySlug(slug)`: Used by public product detail pages.
- `createProduct(input)`: Validates slug uniqueness and creates product with activity log.
- `updateProduct(id, input)`: Updates product record and logs changes.
- `deleteProduct(id)`: Cascades image storage deletion and purges product.
- `setProductActive(id, active)`: Quick visibility toggle with audit logging.
- `setProductFeatured(id, featured)`: Quick showcase toggle with audit logging.
- `generateSlug(name)`: Converts technical model name into lowercase URL-safe slug.
- `checkSlugUnique(slug, excludeId)`: Ensures no slug collisions.

---

## Product Image Service

The `ProductImageService` (`src/services/productImageService.ts`) coordinates binary storage and relational metadata:
- `validateFile(file)`: Enforces 5 MB max limit and JPEG/PNG/WebP MIME types.
- `upload(options)`: Stores binary in `product-images/products/{productId}/{uuid}-{sanitizedName}` and records row in `product_images`.
- `setPrimary(productId, imageId)`: Demotes other images for this product and marks the selected image as primary.
- `reorder(productId, updates)`: Updates `sort_order` sequence.
- `updateAltText(imageId, altText)`: Updates accessibility description.
- `replace(options)`: Safe atomic swap uploading new image before purging old binary.
- `delete(imageId)`: Purges Storage object and database row; auto-promotes another image if the primary was deleted.

---

## Storage Architecture

- **Bucket**: `product-images` (Public read enabled, 5 MB file size limit, allowed MIME types `image/jpeg`, `image/png`, `image/webp`).
- **Isolation**: Admin write operations are guarded by Supabase RLS (`public.is_admin() = true`).
- **File Naming**: Structured paths `products/{productId}/{uuid}-{filename}` prevent overwrites and path traversal exploits.

---

## RLS Security

- **Anonymous Public Visitors**:
  - `products`: `SELECT` allowed only where `active = true`.
  - `product_images`: `SELECT` allowed where parent product is active.
- **Authenticated Administrators**:
  - Full `SELECT`, `INSERT`, `UPDATE`, `DELETE` on `products` and `product_images` guarded by `public.is_admin() = true`.
- **Storage**:
  - Public `SELECT` on all objects in `product-images`.
  - Authenticated admin-only `INSERT`, `UPDATE`, `DELETE`.

---

## Public Website Integration

- Dynamic data fetching in `productService.ts` seamlessly consumes live Supabase data in production while preserving instant static fallback if Supabase is offline.
- Public components (`ProductCard`, `ProductDetail`, `ProductGallery`, `RelatedProducts`, `CategoryHighlights`) automatically reflect admin changes upon page refresh.
- Only `active = true` products are visible to public visitors.

---

## Activity Logging

All admin catalogue modifications create entries in `public.activity_logs`:
- `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED`
- `PRODUCT_ACTIVATED`, `PRODUCT_DEACTIVATED`, `PRODUCT_FEATURED`, `PRODUCT_UNFEATURED`
- `PRODUCT_IMAGE_UPLOADED`, `PRODUCT_IMAGE_REPLACED`, `PRODUCT_IMAGE_DELETED`
- `PRODUCT_PRIMARY_IMAGE_CHANGED`, `PRODUCT_IMAGE_REORDERED`, `PRODUCT_IMAGE_ALT_UPDATED`
