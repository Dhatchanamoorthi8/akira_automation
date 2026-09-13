# AKIRA AUTOMATION — Supabase Production Backend Migration Plan

## 1. Executive Summary & Objective

This document defines the production architecture, security boundaries, migration strategy, and execution steps for integrating **Supabase** as the backend data platform for **AKIRA AUTOMATION**.

This migration is **strictly additive and non-destructive**:
- The public website, SEO structure, routes, motion animations, and visual styling remain 100% operational.
- Existing static data remains available as an offline fallback if Supabase credentials are not configured or during service outages.
- Future administrative capabilities (enquiry management, follow-ups, product management, image storage, and historical activity logs) will be founded upon a secured, production-grade PostgreSQL database with Row Level Security (RLS) and Supabase Auth.

---

## 2. Current Architectural Audit

| Dimension | Current Production State | Supabase Target Architecture |
| :--- | :--- | :--- |
| **Hosting & Runtime** | Vercel SPA (React 19, Vite, TypeScript) | Vercel SPA + Supabase Cloud / Managed Postgres |
| **Product Data Source** | In-memory static files (`src/data/products.ts`, `src/data/productSummaries.ts`) | Supabase PostgreSQL `products` table (via `ProductService`) |
| **Product Images** | 33 static WebP files in `public/assets/` | Supabase Storage `product-images` bucket + `product_images` table |
| **Enquiry Persistence** | None. Form posts directly to `formsubmit.co/ajax` with `mailto:` client fallback | Persistent database records in `enquiries` table with status workflow |
| **Authentication** | None. Empty directories `src/pages/admin` and `src/components/admin` | Supabase Auth (JWT, secure sessions, `profiles` role validation) |
| **Admin Authorization** | None | PostgreSQL Row Level Security (RLS) via `is_admin()` helper function |
| **Follow-up & CRM** | None | `followups` table with scheduling, status, and assignment |
| **Historical Logs** | None | Append-only `activity_logs` table for audit trails |
| **Environment Vars** | `VITE_CONTACT_EMAIL`, `VITE_CONTACT_CC_EMAIL` | Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| **Secrets Exposure** | 0 secrets found; clean git repository | Zero backend secrets or service-role keys in frontend bundle |

### Detailed Findings:
1. **Products**: Exactly 16 detailed products with technical specifications, highlights, features, and applications exist in `src/data/products.ts`. Exactly 16 lightweight summaries across 8 categories exist in `src/data/productSummaries.ts`.
2. **Product Images**: Exactly 33 unique image paths are referenced across the catalogue:
   - 16 primary product images
   - 6 technical specification diagram images
   - 1 CAD fixture diagram
   - 10 secondary/accessory images
   - 100% (33/33) of these files physically exist in `public/assets/` with 0 missing files.
3. **Enquiry & Contact**: Form submissions are managed by `useEnquiryForm.ts` and dispatched via `emailService.ts` to `formsubmit.co/ajax/` using `fetch`. No records are saved to any database.
4. **Architectural Boundaries**: A regression test `src/test/architecture/importBoundaries.test.ts` strictly enforces that root UI components must NOT statically import `data/products`, and `productService.ts` must use dynamic `import('../data/products')` code-splitting. Our updated `ProductService` must respect this test and retain the dynamic fallback.

---

## 3. Database Schema Architecture

All tables will reside in the `public` schema with PostgreSQL UUID primary keys, default timestamps, and automated `updated_at` triggers.

```
+-------------------------------------------------------------+
|                     auth.users                              |
+-------------------------------------------------------------+
                              | (id)
                              v
+-------------------------------------------------------------+
|                      profiles                               |
|-------------------------------------------------------------|
| id: uuid (PK, FK -> auth.users)                             |
| email: text                                                 |
| full_name: text                                             |
| role: text ('admin')                                        |
| active: boolean (true)                                      |
| created_at / updated_at: timestamptz                        |
+-------------------------------------------------------------+
       |                                     |
       | (assigned_to)                       | (created_by / performed_by)
       v                                     v
+-----------------------------+       +-----------------------------+
|          enquiries          |       |          followups          |
|-----------------------------|       |-----------------------------|
| id: uuid (PK)               |       | id: uuid (PK)               |
| name: text                  |       | enquiry_id: uuid (FK) <-----+ (enquiry_id)
| company: text               |       | scheduled_at: timestamptz   |
| email: text                 |       | completed_at: timestamptz   |
| phone: text                 |       | type: text                  |
| subject: text               |       | status: text                |
| message: text               |       | notes: text                 |
| status: text                |       | outcome: text               |
| source: text ('website')    |       | next_followup_at: timestamptz|
| assigned_to: uuid (FK)      |       | created_by: uuid (FK)       |
+-----------------------------+       +-----------------------------+
                                                     ^
                                                     |
+-----------------------------+       +-----------------------------+
|          products           |       |        activity_logs        |
|-----------------------------|       |-----------------------------|
| id: uuid (PK)               |       | id: uuid (PK)               |
| name: text                  |       | entity_type: text           |
| slug: text (UNIQUE)         |       | entity_id: uuid             |
| category: text              |       | action: text                |
| category_slug: text         |       | old_value: jsonb            |
| tagline: text               |       | new_value: jsonb            |
| short_description: text     |       | description: text           |
| description: text           |       | performed_by: uuid (FK)     |
| highlights: text[]          |       | created_at: timestamptz     |
| specifications: jsonb       |       +-----------------------------+
| features: text[]            |
| applications: text[]        |
| related_product_slugs: text[]|
| specs_image: text           |
| cad_image: text             |
| featured: boolean           |
| active: boolean             |
+-----------------------------+
       |
       v (product_id)
+-----------------------------+
|       product_images        |
|-----------------------------|
| id: uuid (PK)               |
| product_id: uuid (FK)       |
| storage_path: text          |
| image_url: text             |
| alt_text: text              |
| sort_order: integer (0)     |
| is_primary: boolean (false) |
+-----------------------------+
```

---

## 4. Row Level Security (RLS) Matrix

RLS is enabled on **all 6 tables** without exception:

| Table | Anonymous / Public | Authenticated Admin (`is_admin() = true`) |
| :--- | :--- | :--- |
| `profiles` | None | Read own profile; Read all admin profiles |
| `products` | `SELECT` where `active = true` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` all |
| `product_images` | `SELECT` where product is `active = true` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` all |
| `enquiries` | `INSERT` only (no `SELECT`, `UPDATE`, `DELETE`) | `SELECT`, `UPDATE` (Soft-status workflow; no delete) |
| `followups` | None | `SELECT`, `INSERT`, `UPDATE` (Historical audit; no delete) |
| `activity_logs` | None | `SELECT` only (Append-only audit trail; no update/delete) |

### Helper Function:
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND active = true
  );
END;
$$;
```

---

## 5. Storage Architecture

- **Bucket**: `product-images`
- **Access Policy**:
  - `SELECT` (Public Read): Anyone can view images.
  - `INSERT` / `UPDATE` / `DELETE` (Admin Write): Only users where `is_admin() = true`.
- **Validation Rules**:
  - MIME types: `image/jpeg`, `image/png`, `image/webp`.
  - Max file size: 5 MB.
  - Path schema: `products/{product_id}/{uuid}-{safe_filename}` (prevents path traversal and collisions).

---

## 6. Phased Migration Strategy

- **Phase 1: Environment & Client Foundation**
  - Install `@supabase/supabase-js`.
  - Create `src/lib/supabase.ts` with environment variable validation and graceful offline fallback.
  - Update `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Phase 2: Database Schema & Migrations**
  - Create `supabase/migrations/20260912000001_initial_schema.sql` (tables, triggers, `is_admin`, RLS, indexes).
  - Create `supabase/migrations/20260912000002_storage_setup.sql` (bucket definition and storage RLS).
  - Create `supabase/tests/rls_security_test.sql` for automated policy verification.
- **Phase 3: Data Migration & Seed Tooling**
  - Create `supabase/seed/seed.sql` populating all 16 existing products and initial product image records.
  - Create `scripts/migrate-products.ts` or Node utility to extract and seed data programmatically.
  - Generate `docs/PRODUCT_MIGRATION_REPORT.md` validating 16/16 products and 33/33 images.
- **Phase 4: Service Layer & Product Service Integration**
  - Create `src/types/database.ts` (complete TypeScript interfaces).
  - Update `src/services/productService.ts` to query Supabase with automatic transparent fallback to static data if Supabase is offline or unconfigured.
  - Create `src/services/productImageService.ts`.
  - Create `src/services/enquiryService.ts`.
  - Create `src/services/followupService.ts`.
  - Create `src/services/activityService.ts`.
  - Create `src/services/dashboardService.ts`.
- **Phase 5: Auth & Protected Routes Foundation**
  - Create `src/auth/AuthProvider.tsx`, `src/auth/authService.ts`, `src/auth/useAuth.ts`, `src/auth/ProtectedRoute.tsx`.
  - Create `src/pages/admin/AdminLogin.tsx`.
  - Connect `useEnquiryForm.ts` to `enquiryService.createEnquiry()` while keeping mailto/email notification fallback intact.
- **Phase 6: Verification & Final Reports**
  - Run all Vitest suites, type checking, and production Vite build.
  - Produce `docs/SUPABASE_ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, `docs/EMAIL_ARCHITECTURE.md`, and `docs/SUPABASE_IMPLEMENTATION_REPORT.md`.

---

## 7. Risk Analysis & Mitigation

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Supabase environment variables missing in local or Vercel preview** | Website fails to boot | `src/lib/supabase.ts` fails gracefully; `productService.ts` detects unconfigured state and falls back seamlessly to static data. |
| **Breaking `importBoundaries.test.ts`** | Test suite failure | Maintain dynamic `import('../data/products')` inside `productService.ts` and keep components using the service interface. |
| **Public enquiry leakage** | Security / Privacy violation | RLS explicitly denies `SELECT` on `enquiries` for `anon` role. Anonymous users only have `INSERT` permission. |
| **Orphaned Storage images on upload failure** | Storage bloat | `productImageService.ts` creates database records only after storage upload succeeds; rolls back storage binary if database insertion fails. |
| **Breaking Public Product URLs** | SEO loss | Exact slugs from `src/data/products.ts` are preserved during migration. No routes are renamed. |

---

## 8. Rollback Strategy

If any deployment or runtime issue occurs:
1. The static datasets (`src/data/products.ts`, `src/data/productSummaries.ts`) remain 100% intact in the repository.
2. `productService.ts` can immediately revert to static-only mode simply by leaving `VITE_SUPABASE_URL` unset or setting a feature flag `VITE_ENABLE_SUPABASE=false`.
3. The existing public website contains zero hard dependencies on Supabase availability.
