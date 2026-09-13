# AKIRA AUTOMATION — Database Schema Reference

## 1. Entity Relationship Diagram

```
                 +---------------------------+
                 |        auth.users         |
                 +---------------------------+
                               | (id)
                               v
                 +---------------------------+
                 |     public.profiles       |
                 +---------------------------+
                    |          |          |
         +----------+          |          +----------+
         | (assigned_to)       | (created_by)        | (performed_by)
         v                     v                     v
+-----------------+   +-----------------+   +-----------------+
| public.enquiries|   |public.followups |   |public.activity_ |
+-----------------+   +-----------------+   |      logs       |
         | (id)                ^            +-----------------+
         |                     |
         +---------------------+ (enquiry_id)

+-----------------+
| public.products |
+-----------------+
         | (id)
         v
+-----------------+
| public.product_ |
|     images      |
+-----------------+
```

---

## 2. Table Specifications

### 2.1 Table: `profiles`
- **Purpose**: Application-level administrative user profile linked to Supabase Auth (`auth.users`).
- **Columns**:
  - `id`: `UUID` (PK, references `auth.users(id)` on delete cascade)
  - `email`: `TEXT NOT NULL`
  - `full_name`: `TEXT`
  - `role`: `TEXT NOT NULL DEFAULT 'admin'` (Allowed: `admin`, `manager`, `sales`, `editor`, `viewer`)
  - `active`: `BOOLEAN NOT NULL DEFAULT true`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Indexes**: Primary key index on `id`.
- **Triggers**: `trg_profiles_updated_at` (calls `public.set_updated_at()`).
- **RLS Policy**:
  - `SELECT`: `auth.uid() = id OR public.is_admin()`
  - `UPDATE`: `public.is_admin() OR auth.uid() = id`

---

### 2.2 Table: `products`
- **Purpose**: Metrology catalogue containing full technical specifications, features, and dimensional parameters.
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `name`: `TEXT NOT NULL`
  - `slug`: `TEXT NOT NULL UNIQUE`
  - `category`: `TEXT`
  - `category_slug`: `TEXT`
  - `tagline`: `TEXT`
  - `short_description`: `TEXT`
  - `description`: `TEXT`
  - `highlights`: `TEXT[] NOT NULL DEFAULT '{}'`
  - `specifications`: `JSONB NOT NULL DEFAULT '{}'`
  - `features`: `TEXT[] NOT NULL DEFAULT '{}'`
  - `applications`: `TEXT[] NOT NULL DEFAULT '{}'`
  - `related_product_slugs`: `TEXT[] NOT NULL DEFAULT '{}'`
  - `specs_image`: `TEXT`
  - `cad_image`: `TEXT`
  - `featured`: `BOOLEAN NOT NULL DEFAULT false`
  - `active`: `BOOLEAN NOT NULL DEFAULT true`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Indexes**:
  - `idx_products_slug` ON `slug`
  - `idx_products_category` ON `category`
  - `idx_products_category_slug` ON `category_slug`
  - `idx_products_active` ON `active`
  - `idx_products_featured` ON `featured`
  - `idx_products_created_at` ON `created_at`
- **Triggers**: `trg_products_updated_at` (calls `public.set_updated_at()`).
- **RLS Policy**:
  - `SELECT` (Public / Anon): `active = true`
  - CRUD (Admin): `public.is_admin()`

---

### 2.3 Table: `product_images`
- **Purpose**: Metadata and storage references for primary photography, secondary views, and technical diagrams.
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `product_id`: `UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE`
  - `storage_path`: `TEXT NOT NULL`
  - `image_url`: `TEXT NOT NULL`
  - `alt_text`: `TEXT`
  - `sort_order`: `INTEGER NOT NULL DEFAULT 0`
  - `is_primary`: `BOOLEAN NOT NULL DEFAULT false`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Indexes**:
  - `idx_product_images_product_id` ON `product_id`
  - `idx_product_images_sort_order` ON `sort_order`
  - `idx_product_images_is_primary` ON `is_primary`
- **Triggers**: `trg_product_images_updated_at` (calls `public.set_updated_at()`).
- **RLS Policy**:
  - `SELECT` (Public / Anon): Permitted if referenced product is `active = true`.
  - CRUD (Admin): `public.is_admin()`.

---

### 2.4 Table: `enquiries`
- **Purpose**: Stores technical RFQs and customer contact submissions submitted from the website.
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `name`: `TEXT NOT NULL`
  - `company`: `TEXT`
  - `email`: `TEXT NOT NULL`
  - `phone`: `TEXT`
  - `subject`: `TEXT`
  - `message`: `TEXT NOT NULL`
  - `industry`: `TEXT`
  - `product_category`: `TEXT`
  - `specific_product`: `TEXT`
  - `requirement`: `TEXT`
  - `status`: `TEXT NOT NULL DEFAULT 'new'` (`new`, `contacted`, `quotation_sent`, `follow_up`, `converted`, `closed`)
  - `source`: `TEXT DEFAULT 'website'`
  - `assigned_to`: `UUID REFERENCES public.profiles(id) ON DELETE SET NULL`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Indexes**:
  - `idx_enquiries_status` ON `status`
  - `idx_enquiries_email` ON `email`
  - `idx_enquiries_created_at` ON `created_at`
  - `idx_enquiries_assigned_to` ON `assigned_to`
- **Triggers**: `trg_enquiries_updated_at` (calls `public.set_updated_at()`).
- **RLS Policy**:
  - `INSERT` (Public / Anon): Permitted (`WITH CHECK (true)`).
  - `SELECT` (Public / Anon): **DENIED**.
  - `SELECT` & `UPDATE` (Admin): `public.is_admin()`.
  - `DELETE`: Denied across normal API to preserve audit records.

---

### 2.5 Table: `followups`
- **Purpose**: Sales communication log, appointment scheduler, and customer engagement history.
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `enquiry_id`: `UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE`
  - `scheduled_at`: `TIMESTAMPTZ NOT NULL`
  - `completed_at`: `TIMESTAMPTZ`
  - `type`: `TEXT NOT NULL DEFAULT 'call'` (`call`, `email`, `meeting`, `demo`, `quotation`, `other`)
  - `status`: `TEXT NOT NULL DEFAULT 'upcoming'` (`upcoming`, `due_today`, `overdue`, `completed`, `cancelled`)
  - `notes`: `TEXT`
  - `outcome`: `TEXT`
  - `next_followup_at`: `TIMESTAMPTZ`
  - `created_by`: `UUID REFERENCES public.profiles(id) ON DELETE SET NULL`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Indexes**:
  - `idx_followups_enquiry_id` ON `enquiry_id`
  - `idx_followups_status` ON `status`
  - `idx_followups_scheduled_at` ON `scheduled_at`
  - `idx_followups_next_followup_at` ON `next_followup_at`
- **Triggers**: `trg_followups_updated_at` (calls `public.set_updated_at()`).
- **RLS Policy**:
  - `SELECT`, `INSERT`, `UPDATE` (Admin): `public.is_admin()`.
  - `DELETE`: Denied.

---

### 2.6 Table: `activity_logs`
- **Purpose**: Append-only immutable audit trail capturing administrative modifications.
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `entity_type`: `TEXT NOT NULL`
  - `entity_id`: `UUID`
  - `action`: `TEXT NOT NULL`
  - `old_value`: `JSONB`
  - `new_value`: `JSONB`
  - `description`: `TEXT`
  - `performed_by`: `UUID REFERENCES public.profiles(id) ON DELETE SET NULL`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Indexes**:
  - `idx_activity_logs_entity` ON `(entity_type, entity_id)`
  - `idx_activity_logs_created_at` ON `created_at`
- **RLS Policy**:
  - `SELECT` (Admin): `public.is_admin()`.
  - `INSERT`: Permitted for authenticated sessions.
  - `UPDATE` & `DELETE`: **DENIED** (Ensures audit trail cannot be manipulated).
