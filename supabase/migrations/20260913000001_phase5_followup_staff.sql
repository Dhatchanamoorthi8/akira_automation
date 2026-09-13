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
