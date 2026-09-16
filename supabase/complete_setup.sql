-- ============================================================
-- AKIRA AUTOMATION — COMPLETE PRODUCTION SUPABASE SETUP
-- 
-- How to apply:
--   Option A: Open Supabase Dashboard -> SQL Editor -> New Query -> Paste all & Run
--   Option B: Run via Supabase CLI: supabase db push
-- 
-- Contains:
--   1. Extensions, helper functions, and updated_at triggers
--   2. 7 Core Relational Tables (profiles, products, product_images, enquiries, followups, activity_logs, email_messages)
--   3. Row Level Security (RLS) policies for anonymous visitors and authenticated admins/staff
--   4. auth.users profile auto-provisioning trigger
--   5. Storage bucket ('product-images') setup & policies
--   6. Phase 5 & Phase 6/7 Staff Assignment, Activity Audit Trail & Analytics RPCs
--   7. Phase 8/9 Hardened Role Constraints ('staff', 'admin') and RLS Guards
--   8. Phase 10 Email Messages History, Threading & Status Tracking
--   9. Production Seed: All 16 Precision Metrology Products & 33 Image references
-- ============================================================

-- ============================================================
-- AKIRA AUTOMATION — SUPABASE PRODUCTION DATABASE SCHEMA
-- Migration: 20260912000001_initial_schema.sql
-- ============================================================

-- Ensure pgcrypto or gen_random_uuid extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- Universal updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. TABLE: profiles
-- Application-level administrative users tied to auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'sales', 'editor', 'viewer')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. ADMIN ROLE HELPER FUNCTION
-- Secure function to check if current user is an active admin.
-- Runs with SECURITY DEFINER and search_path = public to avoid
-- infinite recursion when querying profiles inside RLS policies.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND active = true
  );
END;
$$;

-- ============================================================
-- 3b. PROFILE AUTO-PROVISIONING TRIGGER
-- Automatically creates a profile row with 'viewer' role when
-- a new user signs up in Supabase Auth. Prevents privilege escalation.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'viewer',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. TABLE: products
-- Products and metrology systems catalogue
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  category_slug TEXT,
  tagline TEXT,
  short_description TEXT,
  description TEXT,
  highlights TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  specifications JSONB NOT NULL DEFAULT '{}'::JSONB,
  features TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  applications TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  related_product_slugs TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  specs_image TEXT,
  cad_image TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. TABLE: product_images
-- Metadata for product photography and technical diagrams
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. TABLE: enquiries
-- Inbound RFQ / Technical consultation requests from website
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  industry TEXT,
  product_category TEXT,
  specific_product TEXT,
  requirement TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quotation_sent', 'follow_up', 'converted', 'closed')),
  source TEXT DEFAULT 'website',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. TABLE: followups
-- Follow-up schedule, status, and communication history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  type TEXT NOT NULL DEFAULT 'call' CHECK (type IN ('call', 'email', 'meeting', 'demo', 'quotation', 'other')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due_today', 'overdue', 'completed', 'cancelled')),
  notes TEXT,
  outcome TEXT,
  next_followup_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. TABLE: activity_logs
-- Append-only audit trail for historical changes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. TRIGGERS: AUTOMATIC UPDATED_AT
-- ============================================================
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_product_images_updated_at ON public.product_images;
CREATE TRIGGER trg_product_images_updated_at
  BEFORE UPDATE ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER trg_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_followups_updated_at ON public.followups;
CREATE TRIGGER trg_followups_updated_at
  BEFORE UPDATE ON public.followups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 10. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON public.product_images(sort_order);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON public.product_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON public.enquiries(email);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_assigned_to ON public.enquiries(assigned_to);

CREATE INDEX IF NOT EXISTS idx_followups_enquiry_id ON public.followups(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_followups_status ON public.followups(status);
CREATE INDEX IF NOT EXISTS idx_followups_scheduled_at ON public.followups(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_followups_next_followup_at ON public.followups(next_followup_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- ============================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------
-- Users can read their own profile; admins can read all profiles
CREATE POLICY "profiles_read_policy" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- Admins can update profiles; users can update their own full_name
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = id)
  WITH CHECK (public.is_admin() OR (auth.uid() = id AND role = 'admin'));

-- ------------------------------------------------------------
-- PRODUCTS POLICIES
-- ------------------------------------------------------------
-- Anonymous visitors can only select active products
CREATE POLICY "products_public_read_active" ON public.products
  FOR SELECT
  TO anon
  USING (active = true);

-- Authenticated admins can select all products (active and inactive)
CREATE POLICY "products_admin_select_all" ON public.products
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated admins can insert products
CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Authenticated admins can update products
CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Authenticated admins can delete products
CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------
-- PRODUCT IMAGES POLICIES
-- ------------------------------------------------------------
-- Anonymous visitors can view images belonging to active products
CREATE POLICY "product_images_public_read" ON public.product_images
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND p.active = true
    )
  );

-- Authenticated admins can select all product images
CREATE POLICY "product_images_admin_select" ON public.product_images
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated admins can insert product images
CREATE POLICY "product_images_admin_insert" ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Authenticated admins can update product images
CREATE POLICY "product_images_admin_update" ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Authenticated admins can delete product images
CREATE POLICY "product_images_admin_delete" ON public.product_images
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------
-- ENQUIRIES POLICIES
-- ------------------------------------------------------------
-- Public visitors (anon) can insert enquiries
CREATE POLICY "enquiries_public_insert" ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated admins can select all enquiries
CREATE POLICY "enquiries_admin_select" ON public.enquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated admins can update enquiry status and details
CREATE POLICY "enquiries_admin_update" ON public.enquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Notice: NO DELETE policy is created for enquiries to preserve customer records

-- ------------------------------------------------------------
-- FOLLOWUPS POLICIES
-- ------------------------------------------------------------
-- Authenticated admins can select followups
CREATE POLICY "followups_admin_select" ON public.followups
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated admins can insert followups
CREATE POLICY "followups_admin_insert" ON public.followups
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Authenticated admins can update followups
CREATE POLICY "followups_admin_update" ON public.followups
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Notice: NO DELETE policy is created for followups to preserve CRM history

-- ------------------------------------------------------------
-- ACTIVITY LOGS POLICIES
-- ------------------------------------------------------------
-- Authenticated admins can read historical activity logs
CREATE POLICY "activity_logs_admin_select" ON public.activity_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated operations can append activity logs
CREATE POLICY "activity_logs_admin_insert" ON public.activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() OR auth.uid() IS NOT NULL);

-- Notice: NO UPDATE or DELETE policies are created for activity_logs (append-only)

-- ============================================================
-- 12. ROLE GRANTS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Anonymous privileges: read active products & images, insert enquiries
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT INSERT ON public.enquiries TO anon;

-- Authenticated privileges
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.enquiries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.followups TO authenticated;
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;


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


-- ============================================================
-- AKIRA AUTOMATION — PHASE 5 DATABASE MIGRATION
-- Follow-up Management + Staff/User Assignment + RLS Policies
-- Migration: 20260913000001_phase5_followup_staff.sql
-- ============================================================

-- 1. UPDATE profiles.role CONSTRAINT TO INCLUDE 'staff'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'sales', 'editor', 'viewer', 'staff'));

-- 2. EXTEND followups TABLE SCHEMA
ALTER TABLE public.followups
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS due_time TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add priority check constraint
ALTER TABLE public.followups
  DROP CONSTRAINT IF EXISTS followups_priority_check;

ALTER TABLE public.followups
  ADD CONSTRAINT followups_priority_check
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- 3. CREATE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_followups_assigned_to ON public.followups(assigned_to);
CREATE INDEX IF NOT EXISTS idx_followups_due_date ON public.followups(due_date);
CREATE INDEX IF NOT EXISTS idx_followups_priority ON public.followups(priority);
CREATE INDEX IF NOT EXISTS idx_followups_completed_by ON public.followups(completed_by);

-- 4. STAFF ROLE HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('staff', 'sales', 'manager')
      AND active = true
  );
END;
$$;

-- 5. UPDATE RLS POLICIES FOR ENQUIRIES
-- Drop existing policies to recreate cleanly
DROP POLICY IF EXISTS "enquiries_admin_select" ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_admin_update" ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_staff_select" ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_staff_update" ON public.enquiries;

-- Admins see all enquiries; Staff see ONLY their assigned enquiries
CREATE POLICY "enquiries_select_policy" ON public.enquiries
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR 
    (assigned_to = auth.uid() AND (public.is_staff() OR public.is_admin()))
  );

-- Admins can update any enquiry; Staff can ONLY update status on assigned enquiries (cannot reassign)
CREATE POLICY "enquiries_update_policy" ON public.enquiries
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR 
    (assigned_to = auth.uid() AND public.is_staff())
  )
  WITH CHECK (
    public.is_admin() OR 
    (assigned_to = auth.uid() AND public.is_staff())
  );

-- 6. UPDATE RLS POLICIES FOR FOLLOWUPS
DROP POLICY IF EXISTS "followups_admin_select" ON public.followups;
DROP POLICY IF EXISTS "followups_admin_insert" ON public.followups;
DROP POLICY IF EXISTS "followups_admin_update" ON public.followups;
DROP POLICY IF EXISTS "followups_select_policy" ON public.followups;
DROP POLICY IF EXISTS "followups_insert_policy" ON public.followups;
DROP POLICY IF EXISTS "followups_update_policy" ON public.followups;

-- Admins see all follow-ups; Staff see ONLY their assigned follow-ups
CREATE POLICY "followups_select_policy" ON public.followups
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR 
    assigned_to = auth.uid()
  );

-- Admins can insert follow-ups; Staff can insert follow-ups assigned to themselves
CREATE POLICY "followups_insert_policy" ON public.followups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() OR 
    (assigned_to = auth.uid() AND public.is_staff())
  );

-- Admins can update any follow-up; Staff can update (complete/cancel) follow-ups assigned to themselves
CREATE POLICY "followups_update_policy" ON public.followups
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR 
    (assigned_to = auth.uid() AND public.is_staff())
  )
  WITH CHECK (
    public.is_admin() OR 
    (assigned_to = auth.uid() AND public.is_staff())
  );

-- 7. REINFORCE PROFILES POLICIES FOR USER MANAGEMENT
DROP POLICY IF EXISTS "profiles_read_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- Users can read their own profile; Admins can read all profiles
CREATE POLICY "profiles_read_policy" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- Only admins can update roles and active statuses; users can only update their own full_name
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = id)
  WITH CHECK (
    public.is_admin() OR 
    (auth.uid() = id AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
  );


-- ============================================================
-- AKIRA AUTOMATION — PHASE 6 & PHASE 7 DATABASE MIGRATION
-- Historical Activity Audit Trail + Dashboard Analytics Helpers
-- Migration: 20260913000002_phase6_phase7_activity_analytics.sql
-- ============================================================

-- 1. EXTEND activity_logs TABLE
ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 2. CREATE PERFORMANCE INDEXES FOR AUDIT LOGS & ANALYTICS
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_performed_by ON public.activity_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_created ON public.activity_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_desc ON public.activity_logs(created_at DESC);

-- Performance indexes on enquiries and followups for date range analytics
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at_desc ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_followups_created_at_desc ON public.followups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_followups_due_date_status ON public.followups(due_date, status);

-- 3. UPDATE RLS SELECT POLICY ON activity_logs
-- Drop previous policies to avoid conflicts
DROP POLICY IF EXISTS "activity_logs_admin_select" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_select_policy" ON public.activity_logs;

-- Administrators can read ALL activity logs.
-- Staff can read ONLY logs where they were the actor, or logs belonging to an enquiry/followup assigned to them.
-- Staff are strictly blocked from viewing user profiles, products, product images, auth, or system activities.
CREATE POLICY "activity_logs_select_policy" ON public.activity_logs
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR (
      public.is_staff() AND (
        performed_by = auth.uid() OR
        (entity_type = 'enquiry' AND EXISTS (
          SELECT 1 FROM public.enquiries e 
          WHERE e.id = activity_logs.entity_id AND e.assigned_to = auth.uid()
        )) OR
        (entity_type = 'followup' AND EXISTS (
          SELECT 1 FROM public.followups f 
          WHERE f.id = activity_logs.entity_id AND f.assigned_to = auth.uid()
        ))
      )
    )
  );

-- 4. RPC: AGGREGATED ADMIN ANALYTICS OVERVIEW
-- Computes key business KPIs for a given date window in a single PostgreSQL round-trip
CREATE OR REPLACE FUNCTION public.get_admin_analytics_overview(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_now TIMESTAMPTZ := now();
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Restrict execution to authenticated administrators
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrative privileges required.';
  END IF;

  WITH enquiry_stats AS (
    SELECT
      COUNT(*) AS total_enquiries,
      COUNT(*) FILTER (WHERE status = 'new') AS new_enquiries,
      COUNT(*) FILTER (WHERE status IN ('contacted', 'quotation_sent', 'follow_up')) AS active_enquiries,
      COUNT(*) FILTER (WHERE status = 'converted') AS converted_enquiries,
      COUNT(*) FILTER (WHERE status = 'closed') AS closed_enquiries
    FROM public.enquiries
    WHERE created_at >= p_start_date AND created_at <= p_end_date
  ),
  followup_stats AS (
    SELECT
      COUNT(*) AS total_followups,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed_followups,
      COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_followups,
      COUNT(*) FILTER (WHERE status = 'overdue' OR (status = 'upcoming' AND (due_date < v_today OR (due_date IS NULL AND scheduled_at < v_now)))) AS overdue_followups,
      COUNT(*) FILTER (WHERE status = 'due_today' OR (status = 'upcoming' AND due_date = v_today)) AS due_today_followups,
      COUNT(*) FILTER (WHERE status = 'upcoming' AND (due_date > v_today OR (due_date IS NULL AND scheduled_at >= v_now))) AS upcoming_followups
    FROM public.followups
    WHERE created_at >= p_start_date AND created_at <= p_end_date
  ),
  all_time_totals AS (
    SELECT
      (SELECT COUNT(*) FROM public.enquiries) AS all_time_enquiries,
      (SELECT COUNT(*) FROM public.followups) AS all_time_followups,
      (SELECT COUNT(*) FROM public.products WHERE active = true) AS active_products
  )
  SELECT jsonb_build_object(
    'total_enquiries', es.total_enquiries,
    'new_enquiries', es.new_enquiries,
    'active_enquiries', es.active_enquiries,
    'converted_enquiries', es.converted_enquiries,
    'closed_enquiries', es.closed_enquiries,
    'total_followups', fs.total_followups,
    'completed_followups', fs.completed_followups,
    'cancelled_followups', fs.cancelled_followups,
    'overdue_followups', fs.overdue_followups,
    'due_today_followups', fs.due_today_followups,
    'upcoming_followups', fs.upcoming_followups,
    'all_time_enquiries', att.all_time_enquiries,
    'all_time_followups', att.all_time_followups,
    'active_products', att.active_products
  ) INTO v_result
  FROM enquiry_stats es, followup_stats fs, all_time_totals att;

  RETURN v_result;
END;
$$;

-- 5. RPC: STAFF WORKLOAD & PERFORMANCE ANALYTICS
-- Aggregates CRM workload per staff member for the selected date window
CREATE OR REPLACE FUNCTION public.get_staff_workload_analytics(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_today DATE := CURRENT_DATE;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- Restrict execution to authenticated administrators
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrative privileges required.';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'staff_id', p.id,
      'full_name', COALESCE(p.full_name, 'Unnamed Staff'),
      'email', p.email,
      'role', p.role,
      'assigned_enquiries', COUNT(DISTINCT e.id),
      'open_enquiries', COUNT(DISTINCT e.id) FILTER (WHERE e.status IN ('new', 'contacted', 'quotation_sent', 'follow_up')),
      'converted_enquiries', COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'converted'),
      'total_followups', COUNT(DISTINCT f.id),
      'completed_followups', COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'completed'),
      'overdue_followups', COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'overdue' OR (f.status = 'upcoming' AND (f.due_date < v_today OR (f.due_date IS NULL AND f.scheduled_at < v_now))))
    )
  ) INTO v_result
  FROM public.profiles p
  LEFT JOIN public.enquiries e ON e.assigned_to = p.id AND e.created_at >= p_start_date AND e.created_at <= p_end_date
  LEFT JOIN public.followups f ON f.assigned_to = p.id AND f.created_at >= p_start_date AND f.created_at <= p_end_date
  WHERE p.active = true
    AND p.role IN ('admin', 'manager', 'sales', 'staff')
  GROUP BY p.id, p.full_name, p.email, p.role
  ORDER BY COUNT(DISTINCT e.id) DESC;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;


-- ============================================================
-- AKIRA AUTOMATION — FIX PROFILES ROLE CONSTRAINT & RBAC
-- Migration: 20260913000003_fix_profiles_role_constraint.sql
-- ============================================================

-- 1. DROP EXISTING ROLE CHECK CONSTRAINT
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. ADD SYNCHRONIZED CANONICAL ROLE CONSTRAINT (SUPPORTING 'staff' & CASE-INSENSITIVE)
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (LOWER(role) IN ('admin', 'staff', 'sales', 'manager', 'editor', 'viewer'));

-- 3. ENSURE is_staff() HELPER FUNCTION EXISTS
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND LOWER(role) IN ('staff', 'sales', 'manager')
      AND active = true
  );
END;
$$;

-- 4. HARDEN PROFILES RLS UPDATE POLICY
-- Only admins can change roles, active statuses, or edit other profiles.
-- Regular users can only update their own display name (full_name).
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = id)
  WITH CHECK (
    public.is_admin() OR 
    (auth.uid() = id AND LOWER(role) = (SELECT LOWER(p.role) FROM public.profiles p WHERE p.id = auth.uid()))
  );

-- 5. RE-GRANT EXECUTE ON HELPER FUNCTIONS
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, anon;


-- ============================================================
-- AKIRA AUTOMATION — PHASE 10 DATABASE MIGRATION
-- Dedicated Email Messages History, Threading & Delivery Status
-- Migration: 20260916000001_phase10_email_messages.sql
-- ============================================================

-- 1. CREATE TABLE: email_messages
CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('OUTBOUND', 'INBOUND')),
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  cc_email TEXT,
  reply_to TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  body_html TEXT,
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_message_id TEXT,
  message_id TEXT,
  in_reply_to TEXT,
  references_header TEXT,
  status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED', 'RECEIVED')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- 2. CREATE INDEXES FOR FAST RETRIEVAL & THREADING
CREATE INDEX IF NOT EXISTS idx_email_messages_enquiry_id ON public.email_messages(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_provider_msg_id ON public.email_messages(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_direction ON public.email_messages(direction);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON public.email_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_messages_created_at_desc ON public.email_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_message_id ON public.email_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_in_reply_to ON public.email_messages(in_reply_to);

-- ============================================================
-- 3. ENSURE ROLE HELPER FUNCTIONS EXIST
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('staff', 'sales', 'manager')
      AND active = true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, anon;

-- ============================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. RLS POLICIES FOR email_messages
-- ============================================================
-- Drop existing policies if re-running
DROP POLICY IF EXISTS "email_messages_admin_all" ON public.email_messages;
DROP POLICY IF EXISTS "email_messages_staff_select" ON public.email_messages;
DROP POLICY IF EXISTS "email_messages_staff_insert" ON public.email_messages;

-- Admins can read, insert, update, delete all email messages
CREATE POLICY "email_messages_admin_all" ON public.email_messages
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Staff can read email messages for enquiries assigned to them
CREATE POLICY "email_messages_staff_select" ON public.email_messages
  FOR SELECT
  TO authenticated
  USING (
    public.is_staff() AND (
      enquiry_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.enquiries e
        WHERE e.id = email_messages.enquiry_id AND e.assigned_to = auth.uid()
      )
    )
  );

-- Staff can insert outbound emails for enquiries assigned to them
CREATE POLICY "email_messages_staff_insert" ON public.email_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_staff() AND (
      direction = 'OUTBOUND' AND
      enquiry_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.enquiries e
        WHERE e.id = email_messages.enquiry_id AND e.assigned_to = auth.uid()
      )
    )
  );


-- ============================================================
-- AKIRA AUTOMATION — APP SETTINGS TABLE
-- Migration: 20260916000002_create_app_settings.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated staff/admins and anonymous visitors (for notification dispatch)
DROP POLICY IF EXISTS "app_settings_read_policy" ON public.app_settings;
CREATE POLICY "app_settings_read_policy" ON public.app_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow write/update only to administrators
DROP POLICY IF EXISTS "app_settings_admin_write_policy" ON public.app_settings;
CREATE POLICY "app_settings_admin_write_policy" ON public.app_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed default email notification settings if not already set
INSERT INTO public.app_settings (key, value)
VALUES (
  'notification_recipients',
  '{
    "primaryRecipient": "milestonegauges@gmail.com",
    "ccRecipients": "messalessarvices@gmail.com",
    "sendCustomerConfirmation": true
  }'::JSONB
)
ON CONFLICT (key) DO NOTHING;


--
-- AKIRA AUTOMATION — PRODUCTION PRODUCT SEED
-- Generated programmatically by scripts/migrate-products.cjs
--
BEGIN;

-- Product 1: Air Plug Gauge to Check ID Bore
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Air Plug Gauge to Check ID Bore',
  'air-plug-gauge',
  'Air Gauging',
  'air-gauging',
  'Precision Internal Diameter & Bore Measurement with Setting Rings',
  'AKIRA Air Plug Gauges are high-precision non-contact pneumatic gauges engineered to inspect inside diameters (ID), taper, and ovality across high-volume precision manufacturing. Sourced with hard chrome plating for extreme durability and supplied for through, blind, and step bore applications.',
  'AKIRA Air Plug Gauges are high-precision non-contact pneumatic gauges engineered to inspect inside diameters (ID), taper, and ovality across high-volume precision manufacturing. Sourced with hard chrome plating for extreme durability and supplied for through, blind, and step bore applications.',
  ARRAY['"Range: 2 mm to 200 mm"','"Supplied for through bore / blind bore / step bore"','"Adjustable depth collars for checking specific depths"','"Hard chrome plated gauging surface for extended tool life"','"Requires two setting rings for precise comparative calibration"']::text[],
  '{"Diameter Range":"2 mm to 200 mm","Bore Applications":"Through bore, Blind bore, Step bore","Surface Treatment":"Hard chrome plated","Depth Control":"Adjustable depth collars available","Master Requirements":"Two setting rings required (Double Master Calibration)","Principle":"Pneumatic back-pressure differential measurement","Wear Resistance":"High-wear resistant hard chrome plating"}'::jsonb,
  ARRAY['"Can be supplied for through bore / blind bore applications"','"Adjustable depth collars can be provided for checking a specific depth"','"Standard measurement range: 2 mm to 200 mm"','"Hard chrome plated construction for long life"','"Precision manufactured to partner with AKIRA display units"','"Two setting rings ensure precise comparative zero and span setting"']::text[],
  ARRAY['"Automotive engine cylinder and liner bore inspection"','"Precision bushing, sleeve, and bearing ID checks"','"Through bore, blind bore, and step bore quality control"','"Hydraulic valves, pumps, and pneumatic actuators"']::text[],
  ARRAY['"air-ring-gauge"','"air-gauge-display-unit"','"air-electronics-tri-colour-display"','"engine-block-liner-multigauging-station"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'products/air-plug-gauge/primary.webp',
  '/assets/products/air-plug-gauge.webp',
  'Air Plug Gauge to Check ID Bore',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 2: Air Calliper Gauge to Check OD
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Air Calliper Gauge to Check OD',
  'air-calliper-gauge',
  'Air Gauging',
  'air-gauging',
  'Snap Gauge with Air Jet Fixed in Carbide Tip for External Diameters',
  'AKIRA Air Calliper Gauges provide rapid, high-accuracy external diameter (OD) measurement. Built as a snap gauge configuration with precision air measuring jets embedded directly within tungsten carbide tips for ultimate durability and minimal friction wear.',
  'AKIRA Air Calliper Gauges provide rapid, high-accuracy external diameter (OD) measurement. Built as a snap gauge configuration with precision air measuring jets embedded directly within tungsten carbide tips for ultimate durability and minimal friction wear.',
  ARRAY['"Range: 10 mm to 180 mm Middle"','"Two setting masters required for setup"','"Offered with Snap Gauge with jet fixed in Carbide tip"','"Non-contact pneumatic measurement protects polished shafts"','"Custom configured per customer unit specification"']::text[],
  '{"Diameter Range":"10 mm to 180 mm Middle","Measuring Contact":"Snap Gauge with air jet fixed in Carbide tip","Master Requirements":"Two setting masters required","Unit Specification":"Custom built to specified display / column unit requirement","Measurement Principle":"Non-contact pneumatic differential pressure","Wear Points":"Carbide tipped contact surfaces"}'::jsonb,
  ARRAY['"Offered with Snap Gauge with jet fixed in Carbide tip"','"Range: 10 mm to 180 mm Middle"','"Two setting masters required for quick zero-setting"','"Protects precision ground surfaces from contact scratching"','"Immediate reading on AKIRA Air Column or Digital Display Units"','"Customer must specify the unit for which Air snap gauge is required"']::text[],
  ARRAY['"Crankshaft, camshaft, and transmission shaft OD inspection"','"Precision cylindrical pins, plungers, and turned parts"','"In-process and final inspection on shop floor machining lines"']::text[],
  ARRAY['"air-plug-gauge"','"air-ring-gauge"','"air-gauge-display-unit"','"electronic-calliper-gauge"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'products/air-calliper-gauge/primary.webp',
  '/assets/products/air-calliper-gauge.webp',
  'Air Calliper Gauge to Check OD',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 3: Air Ring Gauge to Check OD
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'Air Ring Gauge to Check OD',
  'air-ring-gauge',
  'Air Gauging',
  'air-gauging',
  'Two Jet & Three Jet Air Ring Gauges for OD, Taper, Ovality & Lobing',
  'AKIRA Air Ring Gauges are precision non-contact inspection tools designed for checking outside diameters, taper, and ovality. Available in both Two-Jet configurations for diametrical checks and Three-Jet configurations @ 120 degrees for detecting complex 3-lobe polygonal form errors.',
  'AKIRA Air Ring Gauges are precision non-contact inspection tools designed for checking outside diameters, taper, and ovality. Available in both Two-Jet configurations for diametrical checks and Three-Jet configurations @ 120 degrees for detecting complex 3-lobe polygonal form errors.',
  ARRAY['"Two Jet Air Ring Gauge: Outside diameter, Taper & Ovality inspection"','"Three Jet Air Ring Gauge: Detecting Lobing effect @ 120 Degrees"','"Can be supplied with Tungsten Carbide wear rings on request"','"Air Ring gauge above dia. 150 mm available on request"','"Non-destructive, self-cleaning pneumatic operation"']::text[],
  '{"Jet Configurations":"Two Jet (180°) or Three Jet (120°)","Inspection Parameters":"Outside Diameter (OD), Taper, Ovality, and Lobing","Wear Ring Options":"Tungsten Carbide wear rings available on request","Large Diameter Options":"Above Dia. 150 mm available on request","Masters":"Calibrated setting plug masters","Operation":"Self-cleaning pneumatic air purge"}'::jsonb,
  ARRAY['"Two Jet Air Ring Gauge to check outside diameter, Taper & Ovality"','"Three jet Air Ring Gauge for detecting Lobing effect @ 120 Degrees"','"Can be supplied with Tungsten Carbide wear rings on request"','"Air Ring gauge - above dia. 150 mm available on request"','"High repeatability and swift response when paired with AKIRA display units"','"Ideal for roundness and straightness verification of cylindrical shafts"']::text[],
  ARRAY['"Automotive piston pins, valve spools, and hydraulic plungers"','"Precision shafts, fuel injection needles, and transmission gears"','"Detection of 3-point lobing errors caused by centerless grinding"']::text[],
  ARRAY['"air-plug-gauge"','"air-calliper-gauge"','"air-gauge-display-unit"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'products/air-ring-gauge/primary.webp',
  '/assets/products/air-ring-gauge.webp',
  'Air Ring Gauge to Check OD',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 4: Electronic Calliper Gauge for OD (2 Point / 3 Point)
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'Electronic Calliper Gauge for OD (2 Point / 3 Point)',
  'electronic-calliper-gauge',
  'Electronic Gauging',
  'electronic-gauging',
  'Direct Contact Precision Electronic Snap Gauges for Shop Floor OD Checking',
  'AKIRA Electronic Calliper Gauges and Electronic Snap Gauges provide rapid, high-resolution electronic measurement for outside diameters. Engineered with robust inductive/LVDT probes in 2-point and 3-point configurations to verify diameters and concentricity on precision machined shafts.',
  'AKIRA Electronic Calliper Gauges and Electronic Snap Gauges provide rapid, high-resolution electronic measurement for outside diameters. Engineered with robust inductive/LVDT probes in 2-point and 3-point configurations to verify diameters and concentricity on precision machined shafts.',
  ARRAY['"Electronic Calliper Gauge for OD measurement"','"2 Point / 3 Point measurement configurations"','"Custom sizes including standard models up to Dia. 64 mm and beyond"','"Rigid ergonomic handles for effortless operator handling"','"Direct interface with AKIRA Tri-Colour DRO and multi-channel units"']::text[],
  '{"Measurement System":"High-precision electronic inductive / LVDT probe","Geometry":"2-Point diametral / 3-Point multi-point contact","Supported Range":"Custom manufactured for specified workpiece diameters (e.g. Ø 64 mm)","Output":"Electronic signal to DRO / Tri-Colour Digital Display","Construction":"Hardened alloy steel body with carbide contact anvils","Handle":"Ergonomic knurled grip handle"}'::jsonb,
  ARRAY['"Available in 2 Point and 3 Point configurations for OD inspection"','"High repeatability in demanding shop floor production environments"','"Direct electronic readout avoids parallax error"','"Instant tolerance feedback via paired AKIRA Digital Display Units"','"Built with high-wear carbide anvils for long operational life"']::text[],
  ARRAY['"Automotive shafts, axles, and gearbox journals"','"Precision turned components requiring instant digital inspection"','"Workpieces where shop floor compressed air is unavailable or dry contact is preferred"']::text[],
  ARRAY['"air-calliper-gauge"','"tri-colour-digital-display-unit"','"camshaft-multigauging-station"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'products/electronic-calliper-gauge/primary.webp',
  '/assets/products/electronic-calliper-gauge-set.webp',
  'Electronic Calliper Gauge for OD (2 Point / 3 Point)',
  0,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'products/electronic-calliper-gauge/secondary-1.webp',
  '/assets/products/electronic-snap-gauge-64.webp',
  'Electronic Calliper Gauge for OD (2 Point / 3 Point) - Accessory View 1',
  1,
  false
) ON CONFLICT DO NOTHING;

-- Product 5: AKIRA Air Gauge Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'AKIRA Air Gauge Display Unit',
  'air-gauge-display-unit',
  'Air Gauging',
  'air-gauging',
  'High Pressure Metrology Display Column with Built-in Precision Regulator',
  'The AKIRA Air Gauge Display Unit is a high-pressure pneumatic metrology column designed for fast, accurate inspection of bore size, taper, and ovality in a single setup. Features a built-in high-precision pressure regulator, system pressure check gauge, and self-cleaning air flow.',
  'The AKIRA Air Gauge Display Unit is a high-pressure pneumatic metrology column designed for fast, accurate inspection of bore size, taper, and ovality in a single setup. Features a built-in high-precision pressure regulator, system pressure check gauge, and self-cleaning air flow.',
  ARRAY['"High pressure system: High speed of response & self-cleaning gauging area"','"Accurate reading of size, taper, and ovality at a time"','"Non-contact gauging ensures long life due to minimal frictional wear"','"Two Setting Masters ensure correct magnification of reading at all times"','"System Pressure Check Gauge monitors regulated 3 bar (45 psi) line"','"Minimum line pressure required: 4.5 bars (67 psi)"']::text[],
  '{"Operating System":"High pressure pneumatic system","Regulated System Pressure":"3 bars (45 psi) regulated by built-in precision regulator","Minimum Line Pressure":"4.5 bars (67 psi)","Calibration Masters":"Two Setting Masters for precise magnification adjustment","Indicator Type":"Precision high-amplification dial indicator (0.001 mm LC)","Gauging Method":"Non-contact pneumatic back-pressure","Maintenance Features":"Self-cleaning gauging area purges chips and coolant"}'::jsonb,
  ARRAY['"High pressure system ensures rapid needle response without damping lag"','"Self cleaning of gauging area ensures accurate reading of size, taper and ovality at a time"','"Non-contact Gauging guarantees long life due to minimal frictional wear"','"Two Setting Masters ensure correct magnification of reading at all times"','"System Pressure Check Gauge provides constant verification on system pressure (3 bars / 45 psi)"','"Built-in industrial grade pressure regulator ensures immunity from shop floor line fluctuations"','"Compact, heavy-duty industrial blue housing engineered for workshop reliability"']::text[],
  ARRAY['"Benchtop bore and shaft inspection alongside machining centers"','"Pairing with Air Plug Gauges, Air Ring Gauges, and Air Snap Gauges"','"Zero-wear metrology in wet, oily, or coolant-sprayed machining environments"']::text[],
  ARRAY['"air-plug-gauge"','"air-ring-gauge"','"air-calliper-gauge"','"tri-colour-digital-display-unit"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'products/air-gauge-display-unit/primary.webp',
  '/assets/products/air-gauge-display-unit.webp',
  'AKIRA Air Gauge Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 6: Air Electronics Tri-Colour Digital Display Unit (B.D.)
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'Air Electronics Tri-Colour Digital Display Unit (B.D.)',
  'air-electronics-tri-colour-display',
  'Digital Display Units',
  'digital-displays',
  'Integrated Pneumatic-to-Electronic Digital Display with Built-in Air Dryer',
  'The AKIRA Air Electronics Tri-Colour Digital Display Unit (B.D.) integrates precision pneumatic gauging transducers with a modern 6-digit 7-segment tri-colour LED readout. Built with an internal auto-drain filter and air dryer unit, offering complete digital SPC connectivity.',
  'The AKIRA Air Electronics Tri-Colour Digital Display Unit (B.D.) integrates precision pneumatic gauging transducers with a modern 6-digit 7-segment tri-colour LED readout. Built with an internal auto-drain filter and air dryer unit, offering complete digital SPC connectivity.',
  ARRAY['"Channels: Single Channel pneumatic-electronic unit"','"Measuring Range: ± 0.080 µm with 1 µm resolution"','"Built-in Auto Drain Filter with Air Dryer"','"1\" 6-Digit 7-Segment Tri Colour Display"','"Double Master Calibration Facility"','"RS-232 Interface standard and Foot Switch facility"']::text[],
  '{"Channels":"Single Channel","Measuring Range":"± 0.080 µm","Resolution":"1 µm","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility included","Calibration Masters":"Double Master Calibration Facility","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Numeric Display":"1\" 6 Digit and 7 Segment Tri Colour Display","Air Conditioning":"Auto Drain Filter with Air Dryer built-in","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Single Channel precision pneumatic-to-electronic transducer"','"Tri-colour display shifts colour dynamically based on component tolerance status"','"Auto drain filter with air dryer preserves internal sensors from moisture and oil"','"Standard RS-232 serial communication with external PC / SPC systems"','"Optional foot switch for hands-free operator data logging"','"Capable of both static dimensional checking and dynamic min/max readings"']::text[],
  ARRAY['"Precision bore and OD inspection with digital SPC data logging"','"Automotive powertrain and fuel injection component grading"','"100% production line inspection with tri-colour visual tolerance verdict"']::text[],
  ARRAY['"tri-colour-digital-display-unit"','"two-channel-tri-colour-display"','"air-plug-gauge"']::text[],
  '/assets/products/air-electronics-specs.webp',
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'products/air-electronics-tri-colour-display/primary.webp',
  '/assets/products/air-electronics-display.webp',
  'Air Electronics Tri-Colour Digital Display Unit (B.D.)',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 7: Tri-Colour Digital Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'Tri-Colour Digital Display Unit',
  'tri-colour-digital-display-unit',
  'Digital Display Units',
  'digital-displays',
  'High-Resolution 0.1 µm Metrology DRO with Tri-Colour Status LED',
  'AKIRA Tri-Colour Digital Display Unit is a versatile shop floor readout unit available in single and double channel configurations. Features ultra-fine 0.1 µm resolution, a bright 1/2" 6-digit display, and an independent Tri-colour LED for instant GO / NO-GO component status.',
  'AKIRA Tri-Colour Digital Display Unit is a versatile shop floor readout unit available in single and double channel configurations. Features ultra-fine 0.1 µm resolution, a bright 1/2" 6-digit display, and an independent Tri-colour LED for instant GO / NO-GO component status.',
  ARRAY['"Channels: Single Channel & Double Channel"','"Measuring Range: ± 0.2 MM and ± 1 MM"','"Ultra-Fine Resolution: 0.1 µm and 1 µm"','"Status LED: One Tri-colour LED for component status"','"Single and Double Master Calibration Facility"','"RS-232 Interface Standard and Foot Switch facility"']::text[],
  '{"Channels":"Single Channel & Double Channel","Measuring Range":"± 0.2 MM and ± 1 MM","Resolution":"0.1 µm and 1 µm","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility","Calibration Facility":"Single and Double Master Calibration Facility","Component Status":"One Tri colour LED for Component status","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Numeric Display":"1/2\" 6 Digit and 7 Segment Tri Colour Display","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Dual range capability: ± 0.2 mm for micro-precision and ± 1 mm for broader tolerances"','"Selectable 0.1 µm or 1 µm display resolution"','"One Tri-colour LED gives operators immediate visual feedback (Green=OK, Yellow=Rework, Red=Reject)"','"Single and Double Master calibration modes for rapid daily shop floor mastering"','"Standard RS-232 output for direct connection to PC and SPC software"','"Benchtop stand mountable for comfortable ergonomic inspection"']::text[],
  ARRAY['"Benchtop dimensional verification of automotive parts"','"Electronic snap gauge and probe readout"','"Standards laboratory and shop-floor comparative gauging"']::text[],
  ARRAY['"air-electronics-tri-colour-display"','"two-channel-tri-colour-display"','"memory-module-unit"']::text[],
  '/assets/products/tri-colour-specs.webp',
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'products/tri-colour-digital-display-unit/primary.webp',
  '/assets/products/tri-colour-display-stand.webp',
  'Tri-Colour Digital Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 8: Two Channel Two Display Tri Colour Digital Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'Two Channel Two Display Tri Colour Digital Display Unit',
  'two-channel-tri-colour-display',
  'Digital Display Units',
  'digital-displays',
  'Simultaneous 2-Channel Metrology DRO with Dedicated Numeric Windows & Ports',
  'AKIRA Two Channel Two Display Tri Colour Digital Display Unit features two independent 6-digit numeric display windows (DIA1 and DIA2) and dual pneumatic ports (D1, D2). Allows simultaneous multi-point or multi-feature inspection on a single compact station.',
  'AKIRA Two Channel Two Display Tri Colour Digital Display Unit features two independent 6-digit numeric display windows (DIA1 and DIA2) and dual pneumatic ports (D1, D2). Allows simultaneous multi-point or multi-feature inspection on a single compact station.',
  ARRAY['"Channels: Two Channel Two Display (DIA1 & DIA2)"','"Measuring Range: ± 0.080 µm with 1 µm resolution"','"Auto Drain Filter with Air Dryer built-in"','"Double Master Calibration Facility"','"Dual pneumatic quick-connect ports (D1, D2)"','"RS-232 PC interface standard with optional 10,000 reading storage"']::text[],
  '{"Channels":"Two Channel Two Display","Measuring Range":"± 0.080 µm","Resolution":"1 µm","Displays":"Dual 1/2\" 6 Digit and 7 Segment Tri Colour Displays","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility","Calibration Facility":"Double Master Calibration Facility","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Air Conditioning":"Auto Drain Filter with Air Dryer built-in","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Two Channel Two Display architecture enables simultaneous two-point checking without channel switching"','"Independent DIA1 and DIA2 front panel display windows"','"Dual quick-connect pneumatic input fittings (D1, D2)"','"Built-in auto drain filter and air dryer protecting internal sensors"','"RS-232 output for dual-channel SPC data collection"','"Optional relay and buzzer outputs for PLC line automation"']::text[],
  ARRAY['"Simultaneous top & bottom bore diameter checking"','"Simultaneous OD and length inspection"','"Taper and ovality calculation across dual planes"']::text[],
  ARRAY['"three-channel-tri-colour-display"','"four-channel-tri-colour-display"','"air-plug-gauge"']::text[],
  '/assets/products/two-channel-specs.webp',
  NULL,
  false,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'products/two-channel-tri-colour-display/primary.webp',
  '/assets/products/two-channel-display.webp',
  'Two Channel Two Display Tri Colour Digital Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 9: Three Channel Three Display Tri Colour Digital Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'Three Channel Three Display Tri Colour Digital Display Unit',
  'three-channel-tri-colour-display',
  'Digital Display Units',
  'digital-displays',
  'Simultaneous 3-Channel Readout with Triple Display Windows (DIA1, DIA2, DIA3)',
  'AKIRA Three Channel Three Display Tri Colour Digital Display Unit features three dedicated display screens (DIA1, DIA2, DIA3) and three front pneumatic ports (D1, D2, D3). Sized specifically for three-plane bore inspection, multi-journal shafts, and stepped components.',
  'AKIRA Three Channel Three Display Tri Colour Digital Display Unit features three dedicated display screens (DIA1, DIA2, DIA3) and three front pneumatic ports (D1, D2, D3). Sized specifically for three-plane bore inspection, multi-journal shafts, and stepped components.',
  ARRAY['"Channels: Three Channel Three Display (DIA1, DIA2, DIA3)"','"Measuring Range: ± 0.080 µm with 1 µm resolution"','"Three pneumatic input fittings (D1, D2, D3)"','"Auto Drain Filter with Air Dryer built-in"','"Double Master Calibration Facility"','"RS-232 Output, Foot Switch, and optional 10,000 reading storage"']::text[],
  '{"Channels":"Three Channel Three Display","Measuring Range":"± 0.080 µm","Resolution":"1 µm","Displays":"Triple 1/2\" 6 Digit and 7 Segment Tri Colour Displays","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility","Calibration Facility":"Double Master Calibration Facility","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Air Conditioning":"Auto Drain Filter with Air Dryer built-in","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Three Channel Three Display configuration displays three parameters at a glance"','"Three independent pneumatic input ports for direct tool connection"','"Auto calibration with double master setting rings/plugs"','"Auto drain filter and air dryer built into chassis"','"Individual tolerance status indicators for each channel"','"RS-232 serial communication for automated test benches"']::text[],
  ARRAY['"Three-level cylinder bore inspection (Top, Middle, Bottom)"','"Three-journal camshaft and crankshaft OD checking"','"Complex multi-stepped shaft inspection"']::text[],
  ARRAY['"two-channel-tri-colour-display"','"four-channel-tri-colour-display"','"engine-block-liner-multigauging-station"']::text[],
  '/assets/products/three-channel-specs.webp',
  NULL,
  false,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'products/three-channel-tri-colour-display/primary.webp',
  '/assets/products/three-channel-display.webp',
  'Three Channel Three Display Tri Colour Digital Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 10: Auto Selection with Air Server Tri Colour Digital Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'Auto Selection with Air Server Tri Colour Digital Display Unit',
  'auto-selection-air-server-display',
  'Digital Display Units',
  'digital-displays',
  'Smart 4-Channel Pneumatic Switching with Energy-Saving Air Saver',
  'AKIRA Auto Selection with Air Server Tri Colour Digital Display Unit is an intelligent four-channel, single-display metrology unit. Features an integrated Air Saver with auto-selection diameter technology that activates airflow only when a tool is engaged, drastically cutting compressed air consumption.',
  'AKIRA Auto Selection with Air Server Tri Colour Digital Display Unit is an intelligent four-channel, single-display metrology unit. Features an integrated Air Saver with auto-selection diameter technology that activates airflow only when a tool is engaged, drastically cutting compressed air consumption.',
  ARRAY['"Channels: Four Channel One Display (D1, D2, D3, D4 inputs)"','"Air Saver with Auto Selection Diameter"','"Measuring Range: ± 0.080 µm with 1 µm resolution"','"Auto Drain Filter with Air Dryer built-in"','"Double Master Calibration Facility"','"RS-232 Interface standard and Foot Switch facility"']::text[],
  '{"Channels":"Four Channel One Display","Air Economy":"Air Saver with Auto Selection Diameter","Measuring Range":"± 0.080 µm","Resolution":"1 µm","Display":"1/2\" 6 Digit and 7 Segment Tri Colour Display","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility","Calibration Facility":"Double Master Calibration Facility","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Air Conditioning":"Auto Drain Filter with Air Dryer built-in","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Four Channel One Display design automatically detects and reads whichever of the 4 tools is engaged"','"Air Saver technology cuts compressed air usage during idle periods between measurements"','"Auto drain filter with air dryer built into unit"','"Double master calibration facility ensures swift calibration across all 4 ports"','"RS-232 interface for full digital traceability"','"Optional relay and buzzer outputs"']::text[],
  ARRAY['"Multi-tool gauging stations where an operator uses multiple air plugs or rings sequentially"','"Energy-conscious manufacturing plants seeking to reduce compressed air utility costs"','"High-throughput multi-feature inspection benches"']::text[],
  ARRAY['"four-channel-tri-colour-display"','"air-plug-gauge"','"air-ring-gauge"']::text[],
  '/assets/products/auto-selection-specs.webp',
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'products/auto-selection-air-server-display/primary.webp',
  '/assets/products/auto-selection-display.webp',
  'Auto Selection with Air Server Tri Colour Digital Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 11: Four Channel Four Display Tri Colour Digital Display Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000011',
  'Four Channel Four Display Tri Colour Digital Display Unit',
  'four-channel-tri-colour-display',
  'Digital Display Units',
  'digital-displays',
  'Comprehensive 4-Channel Multi-Gauging DRO with 4 Independent Screens',
  'AKIRA Four Channel Four Display Tri Colour Digital Display Unit provides complete simultaneous inspection across four independent channels (DIA1, DIA2, DIA3, DIA4) with four pneumatic quick-connect ports (D1 to D4). Engineered for complex multi-point automated gauging stations.',
  'AKIRA Four Channel Four Display Tri Colour Digital Display Unit provides complete simultaneous inspection across four independent channels (DIA1, DIA2, DIA3, DIA4) with four pneumatic quick-connect ports (D1 to D4). Engineered for complex multi-point automated gauging stations.',
  ARRAY['"Channels: Four Channel Four Display (DIA1, DIA2, DIA3, DIA4)"','"Measuring Range: ± 0.080 µm with 1 µm resolution"','"Four pneumatic quick-connect ports (D1, D2, D3, D4)"','"Auto Drain Filter with Air Dryer built-in"','"Double Master Calibration Facility"','"RS-232 Interface, Foot Switch, and optional 10,000 reading storage"']::text[],
  '{"Channels":"Four Channel Four Display","Measuring Range":"± 0.080 µm","Resolution":"1 µm","Displays":"Quad 1/2\" 6 Digit and 7 Segment Tri Colour Displays","Measurement Mode":"Absolute / Comparative Measurement","Auto Calibration":"Auto Calibration Facility","Calibration Facility":"Double Master Calibration Facility","PC Connectivity":"RS-232 Interface Standard & Foot Switch Facility","Units":"MM and Inch Measurement","Reading Dynamics":"Static / Dynamic Reading","Power Supply":"230 Volt AC Power Supply","Air Conditioning":"Auto Drain Filter with Air Dryer built-in","Data Storage (Optional)":"Reading Data Storage Facility up to 10,000 readings","Relay Output (Optional)":"Relay Output Facility","Buzzer Output (Optional)":"Buzzer Output Facility"}'::jsonb,
  ARRAY['"Quad display windows show 4 dimensions simultaneously without toggling"','"Four dedicated pneumatic ports for multi-jet tooling arrays"','"Independent tri-colour tolerance status for all 4 channels"','"Internal auto drain filter and air dryer unit for industrial reliability"','"RS-232 port for streaming 4-channel measurement packets to host PC"','"Double master calibration across all 4 channels"']::text[],
  ARRAY['"Automated multi-gauging fixtures on transfer lines"','"Simultaneous 4-journal shaft inspection"','"Engine cylinder multi-level diametrical and ovality checks"']::text[],
  ARRAY['"auto-selection-air-server-display"','"engine-block-liner-multigauging-station"','"camshaft-multigauging-station"']::text[],
  '/assets/products/four-channel-specs.webp',
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000011',
  'products/four-channel-tri-colour-display/primary.webp',
  '/assets/products/four-channel-display.webp',
  'Four Channel Four Display Tri Colour Digital Display Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 12: AKIRA Memory Module Unit
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000012',
  'AKIRA Memory Module Unit',
  'memory-module-unit',
  'Memory & Data Systems',
  'memory-data',
  'Dedicated 10,000 Reading Industrial Metrology Data Logger with Excel Export',
  'The AKIRA Memory Module Unit is an industrial digital logging hardware unit that bridges AKIRA Electronic DRO and Tri-Colour Display Units with host PCs and statistical process control (SPC) software. Stores up to 10,000 readings with date & time stamps and exports directly to Microsoft Excel.',
  'The AKIRA Memory Module Unit is an industrial digital logging hardware unit that bridges AKIRA Electronic DRO and Tri-Colour Display Units with host PCs and statistical process control (SPC) software. Stores up to 10,000 readings with date & time stamps and exports directly to Microsoft Excel.',
  ARRAY['"RS-232 Connectivity with Electronic DRO Type Unit"','"USB Connectivity with PC"','"10,000 Reading Storage Capacity"','"Memory Full LED indication"','"Time & Date Stamp with each recorded reading"','"Saved reading opened in Excel file when connected to PC"','"Compatible with any available SPC software (e.g. MINITAB)"','"Data modification possible with Excel file"']::text[],
  '{"Gauge Interface":"RS-232 Connectivity with Electronic DRO Type Unit","PC Interface":"USB Connectivity with PC","Storage Capacity":"10,000 Reading Storage Capacity","Status Indicator":"Memory Full LED indication","Data Timestamp":"Time & Date Stamp with each of recorded reading","File Format":"Saved reading will be opened in Excel File when connected to PC","SPC Compatibility":"Data can be saved in PC & used with any available SPC software (e.g. MINITAB)","Data Processing":"Data modification possible with Excel file"}'::jsonb,
  ARRAY['"RS-232 Connectivity with Electronic DRO Type Unit"','"USB Connectivity with PC for instant plug-and-play communication"','"10,000 Reading Storage Capacity eliminates need for constant PC presence on the shop floor"','"Memory Full LED indication warns operator before memory buffer overflows"','"Time & Date Stamp recorded with every measurement point for 100% audit traceability"','"Saved Reading will be Opened in Excel File when connected to PC"','"Data Can be Saved in PC & can be Used with any of the available SPC Software (FOR e.g. MINITAB)"','"Data Modification possible with Excel File"']::text[],
  ARRAY['"Shop-floor statistical quality audits and Cp/Cpk studies"','"Offline data collection in remote machining cells without dedicated PCs"','"Direct integration with Minitab, Excel, and enterprise SPC platforms"']::text[],
  ARRAY['"tri-colour-digital-display-unit"','"engine-block-liner-multigauging-station"','"camshaft-multigauging-station"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000012',
  'products/memory-module-unit/primary.webp',
  '/assets/products/memory-module-unit.webp',
  'AKIRA Memory Module Unit',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 13: Engine Block Liner Bore Multigauging Station
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000013',
  'Engine Block Liner Bore Multigauging Station',
  'engine-block-liner-multigauging-station',
  'Multigauging Stations',
  'multigauging',
  '6 Liner ID Dia Measurement in X & Y Axes at 3 Levels with 12-Jet Air Plug',
  'The AKIRA Engine Block Liner Bore Multigauging Station is a specialized multi-gauging metrology system engineered to inspect cylinder liner bores across multiple planes simultaneously. Utilizes a suspended 12-jet special air plug gauge, special 3-level master setting rings, and dual 3-channel tri-colour displays to check X and Y axes across 3 levels in a single ergonomic stroke.',
  'The AKIRA Engine Block Liner Bore Multigauging Station is a specialized multi-gauging metrology system engineered to inspect cylinder liner bores across multiple planes simultaneously. Utilizes a suspended 12-jet special air plug gauge, special 3-level master setting rings, and dual 3-channel tri-colour displays to check X and Y axes across 3 levels in a single ergonomic stroke.',
  ARRAY['"Tri-Color Six digit display system"','"6 LINER ID DIA Measurement in X Axis at 3 Levels & Y Axis at 3 Levels"','"Suspended type 12 JET Special Air Plug Gauge"','"Special 3 Level Master Settings Rings for setting of 3 Dia in X & Y Axis"','"Absolute / Comparative Measurement with Auto calibration facility"','"Metric / Inch & Static / Dynamic measurement modes"','"RS 232 Output and Optional 24V Relay Output"']::text[],
  '{"Display System":"Tri-Color Six digit display (Dual 3-channel units for X & Y axes)","Measurement Scope":"6 LINER ID DIA Measurement in X Axis at 3 Levels & Y Axis at 3 Levels","Tooling Type":"Suspended type 12 JET Special Air Plug Gauge","Calibration Masters":"Special 3 Level Master Settings Rings for Setting of 3 Dia X & Y Axis","Measurement Modes":"Absolute / Comparative Measurement","Calibration":"Auto calibration Facility","Units":"Metric / Inch Measurement","Measurement Dynamics":"Static / Dynamic measurement","Data Output":"RS 232 Output","Control Output":"Relay Output 24 V (Optional)","Status Indication":"Tricolour LED for component tolerance status"}'::jsonb,
  ARRAY['"Simultaneous 6-diameter liner bore measurement across X and Y axes at Top, Middle, and Bottom levels"','"Suspended type 12 JET Special Air Plug Gauge ensures frictionless, balanced entry into heavy engine blocks"','"Special 3-Level Master Setting Rings allow rapid, single-step mastering of all 3 levels in both axes"','"Tri-colour LED indicator provides immediate component tolerance status (Accept/Rework/Reject)"','"Auto calibration facility simplifies shift changeovers"','"RS-232 serial communication streams full multi-point dimensional data to host SPC computer"','"Optional 24V relay output triggers automation gates or error-proofing interlocks"']::text[],
  ARRAY['"Automotive engine cylinder block liner bore final quality inspection"','"Taper, ovality, and hourglass/barrel bore defect detection"','"High-volume engine manufacturing and assembly plants"']::text[],
  ARRAY['"camshaft-multigauging-station"','"three-channel-tri-colour-display"','"air-plug-gauge"','"memory-module-unit"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000013',
  'products/engine-block-liner-multigauging-station/primary.webp',
  '/assets/multigauging/engine-block-liner-station.webp',
  'Engine Block Liner Bore Multigauging Station',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 14: Camshaft Dia Multigauging Station
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000014',
  'Camshaft Dia Multigauging Station',
  'camshaft-multigauging-station',
  'Multigauging Stations',
  'multigauging',
  'Simultaneous 6 OD Dia Inspection Bench with Dual Tri-Colour Displays & CAD Fixture',
  'The AKIRA Camshaft Dia Multigauging Station is a turnkey multi-point dimensional inspection bench custom-engineered for automotive camshaft manufacturing. Inspects 6 outside diameters (OD) simultaneously with tri-colour 6-digit displays, auto calibration, and optional 24V automation relay outputs.',
  'The AKIRA Camshaft Dia Multigauging Station is a turnkey multi-point dimensional inspection bench custom-engineered for automotive camshaft manufacturing. Inspects 6 outside diameters (OD) simultaneously with tri-colour 6-digit displays, auto calibration, and optional 24V automation relay outputs.',
  ARRAY['"Tri-Color Six digit display units"','"6 OD DIA Measurement performed simultaneously"','"Absolute / Comparative Measurement modes"','"Auto calibration facility for fast master setting"','"Metric / Inch & Static / Dynamic measurement"','"RS 232 Output and Optional 24V Relay Output"','"Tricolour LED for component tolerance status"','"Ideal for Camshaft DIA Measurement"']::text[],
  '{"Display System":"Tri-Color Six digit display (Dual 3-channel display configuration)","Measurement Scope":"6 OD DIA Measurement","Application Target":"Ideal for Camshaft DIA Measurement","Measurement Modes":"Absolute / Comparative Measurement","Calibration":"Auto calibration Facility","Units":"Metric / Inch Measurement","Measurement Dynamics":"Static / Dynamic measurement","Data Output":"RS 232 Output","Automation Interface":"Relay Output 24 V (Optional)","Status Feedback":"Tricolour LED for component tolerance status","Fixture Design":"Precision V-block / mandrel clamping fixture with multi-point gauging blocks"}'::jsonb,
  ARRAY['"Simultaneous measurement of 6 bearing journals / ODs on a finished or ground camshaft"','"Tri-Color Six digit display allows operators to see all 6 diameters at once"','"Tricolour LED indicators deliver instant visual feedback on component tolerance"','"Auto calibration facility ensures rapid zeroing with setting masters"','"RS 232 Output for seamless line-side data transmission and SPC archiving"','"Optional 24 V relay output enables automatic part stamping or conveyor gating"','"Static and dynamic measurement modes allow runout and ovality checks during rotation"']::text[],
  ARRAY['"Automotive camshaft manufacturing and quality audit cells"','"Bearing journal diameter, taper, and runout inspection"','"OEM powertrain production lines"']::text[],
  ARRAY['"engine-block-liner-multigauging-station"','"three-channel-tri-colour-display"','"electronic-calliper-gauge"']::text[],
  NULL,
  '/assets/multigauging/camshaft-fixture-cad.webp',
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000014',
  'products/camshaft-multigauging-station/primary.webp',
  '/assets/multigauging/camshaft-multigauging-station.webp',
  'Camshaft Dia Multigauging Station',
  0,
  true
) ON CONFLICT DO NOTHING;

-- Product 15: Instruments & Measuring Equipment
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'Instruments & Measuring Equipment',
  'instruments-measuring-equipment',
  'Measuring Instruments',
  'instruments',
  'All Type of Instruments: Coating Thickness, Slip Gauges, Magnetic Stands, Calipers & Balances',
  'AKIRA AUTOMATION supplies all types of standard precision measuring instruments, calibration standards, and metrology accessories. Sourced to deliver dependable accuracy across shop-floor and standards room environments.',
  'AKIRA AUTOMATION supplies all types of standard precision measuring instruments, calibration standards, and metrology accessories. Sourced to deliver dependable accuracy across shop-floor and standards room environments.',
  ARRAY['"All type of Instruments, coating thickness, Slip gauge, magnetic stands etc."','"Digital Coating Thickness Gauge (60-140 rdg/min, IP54, 100,000 memory, C1/C2 probes)"','"Portable Leeb Hardness Tester with calibrated test block"','"Precision Digital Analytical & Industrial Weighing Scale"','"Absolute Digimatic Vernier Calipers (IP67)"','"Magnetic Stands with fine adjustment and articulated arms"','"Precision Metric Slip Gauge Sets in fitted wooden cases"','"Precision Pin Gauge Sets in graduated cases"']::text[],
  '{"Instrument Coverage":"All type of Instruments, coating thickness, Slip gauge, magnetic stands etc.","Coating Thickness Gauge":"Accuracy ±2%, up to 9mm (355 mils), 60-140 readings/min, IP54, 100k memory, USB & Bluetooth","Hardness Testing":"Portable Leeb Hardness Tester with calibrated test block (e.g. 791 HLD)","Weighing Systems":"Digital precision weighing scale with tare, print, and leveling bubble","Dimensional Calipers":"Absolute Digimatic IP67 Electronic Calipers","Magnetic Bases":"Switchable magnetic base with articulated red/black adjustment arms","Calibration Standards":"Fitted wooden boxed Metric Slip Gauge and Cylindrical Pin Gauge sets"}'::jsonb,
  ARRAY['"Complete one-stop provision of metrology laboratory and workshop measuring equipment"','"Digital coating thickness gauges with dual probes for ferrous and non-ferrous substrates"','"Leeb portable hardness testers for rapid hardness verification on large castings and forgings"','"High-precision slip gauge blocks providing unbroken traceability to standards"','"Heavy-duty magnetic bases for dial gauges and lever indicators"','"Robust digital calipers engineered for oily and harsh workshop conditions"']::text[],
  ARRAY['"Metrology laboratories and quality control inspection rooms"','"Surface treatment, electroplating, and paint coating inspection"','"Heat treatment hardness verification"','"Shop floor calibration and setup verification"']::text[],
  ARRAY['"special-gauges-fixtures"','"air-plug-gauge"','"tri-colour-digital-display-unit"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/primary.webp',
  '/assets/company/inspection-workbench.webp',
  'Instruments & Measuring Equipment',
  0,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-1.webp',
  '/assets/instruments/coating-thickness-gauge.webp',
  'Instruments & Measuring Equipment - Accessory View 1',
  1,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-2.webp',
  '/assets/instruments/hardness-tester.webp',
  'Instruments & Measuring Equipment - Accessory View 2',
  2,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-3.webp',
  '/assets/instruments/precision-scale.webp',
  'Instruments & Measuring Equipment - Accessory View 3',
  3,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-4.webp',
  '/assets/instruments/digital-vernier-caliper.webp',
  'Instruments & Measuring Equipment - Accessory View 4',
  4,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-5.webp',
  '/assets/instruments/magnetic-stand-blue.webp',
  'Instruments & Measuring Equipment - Accessory View 5',
  5,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-6.webp',
  '/assets/instruments/magnetic-stand-red.webp',
  'Instruments & Measuring Equipment - Accessory View 6',
  6,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-7.webp',
  '/assets/instruments/slip-gauge-set.webp',
  'Instruments & Measuring Equipment - Accessory View 7',
  7,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000015',
  'products/instruments-measuring-equipment/secondary-8.webp',
  '/assets/instruments/pin-gauge-set.webp',
  'Instruments & Measuring Equipment - Accessory View 8',
  8,
  false
) ON CONFLICT DO NOTHING;

-- Product 16: All Type of Special Gauges & Fixtures
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_slug,
  tagline,
  short_description,
  description,
  highlights,
  specifications,
  features,
  applications,
  related_product_slugs,
  specs_image,
  cad_image,
  featured,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000016',
  'All Type of Special Gauges & Fixtures',
  'special-gauges-fixtures',
  'Special Gauges & Fixtures',
  'fixtures',
  'Custom-Engineered Precision Gauging, Workholding & Multi-Feature Inspection Fixtures',
  'AKIRA AUTOMATION specializes in custom-built inspection fixtures, assembly tooling, and workholding solutions tailored to complex workpiece geometries. Designed and manufactured to withstand rigorous shop-floor production conditions while delivering repeatable micron-level accuracy.',
  'AKIRA AUTOMATION specializes in custom-built inspection fixtures, assembly tooling, and workholding solutions tailored to complex workpiece geometries. Designed and manufactured to withstand rigorous shop-floor production conditions while delivering repeatable micron-level accuracy.',
  ARRAY['"All type of special gauges & Fixtures"','"Custom multi-pin dimensional inspection fixtures"','"Work-holding and dedicated casting inspection fixtures"','"Tailored fixtures for unique manufacturing requirements"','"Flexible designs that adapt to different applications"','"Engineered to withstand rigorous manufacturing environments"']::text[],
  '{"Product Category":"All type of special gauges & Fixtures","Design Principle":"Precision-engineered solutions tailored for unique manufacturing requirements","Key Pillars":"Customization, Versatility, and Durability","Fixture Materials":"Hardened tool steel, structural aluminum, carbide wear pads, precision ground datum plates","Inspection Capability":"Multi-point diameter, concentricity, perpendicularity, hole center distances, and step heights","Workpiece Compatibility":"Machined castings, forged automotive components, stamped housings, and precision turned parts"}'::jsonb,
  ARRAY['"Customization: Tailored fixtures designed specifically for customer component drawings"','"Versatility: Flexible designs that adapt to different workpiece variants and applications"','"Durability: Engineered to withstand rigorous manufacturing environments over years of service"','"Integrated locator pins, toggle clamps, and precision dial/probe mountings"','"Assembly and workholding solutions engineered to eliminate operator loading errors"','"Complete design, manufacturing, inspection, and commissioning support"']::text[],
  ARRAY['"Automotive transmission housings, cylinder heads, and brackets"','"Precision machined castings with multiple critical datum relationships"','"Dedicated line-side inspection fixtures for 100% component verification"']::text[],
  ARRAY['"engine-block-liner-multigauging-station"','"camshaft-multigauging-station"','"instruments-measuring-equipment"']::text[],
  NULL,
  NULL,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  tagline = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  applications = EXCLUDED.applications,
  related_product_slugs = EXCLUDED.related_product_slugs,
  specs_image = EXCLUDED.specs_image,
  cad_image = EXCLUDED.cad_image,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000016',
  'products/special-gauges-fixtures/primary.webp',
  '/assets/fixtures/multi-pin-gauging-fixture.webp',
  'All Type of Special Gauges & Fixtures',
  0,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (
  product_id,
  storage_path,
  image_url,
  alt_text,
  sort_order,
  is_primary
) VALUES (
  'a0000000-0000-0000-0000-000000000016',
  'products/special-gauges-fixtures/secondary-1.webp',
  '/assets/fixtures/workholding-inspection-fixture.webp',
  'All Type of Special Gauges & Fixtures - Accessory View 1',
  1,
  false
) ON CONFLICT DO NOTHING;

COMMIT;
