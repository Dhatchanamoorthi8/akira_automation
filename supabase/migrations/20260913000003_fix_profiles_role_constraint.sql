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
