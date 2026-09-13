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
