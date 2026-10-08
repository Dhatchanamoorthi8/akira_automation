-- ============================================================
-- AKIRA AUTOMATION — CRM & ERP DELETE & UPDATE RLS POLICIES
-- Migration: 20261007000001_add_crm_erp_delete_policies.sql
-- Enables secure delete and editing capabilities for CRM and ERP modules.
-- ============================================================

-- 1. ENQUIRIES DELETE POLICY
-- Allow authenticated administrators to delete enquiries/leads
DROP POLICY IF EXISTS "enquiries_admin_delete" ON public.enquiries;
CREATE POLICY "enquiries_admin_delete" ON public.enquiries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 2. FOLLOWUPS DELETE POLICY
-- Allow authenticated administrators to delete follow-up tasks
DROP POLICY IF EXISTS "followups_admin_delete" ON public.followups;
CREATE POLICY "followups_admin_delete" ON public.followups
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. INVOICES DELETE POLICY
-- Allow administrators to delete any invoice; staff can delete their own draft invoices
DROP POLICY IF EXISTS "invoices_delete_policy" ON public.invoices;
CREATE POLICY "invoices_delete_policy" ON public.invoices
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin() OR 
    (created_by = auth.uid() AND status = 'draft')
  );

-- 4. FIELD VISITS DELETE POLICY
-- Allow administrators to delete any visit; assigned staff can delete scheduled visits they created
DROP POLICY IF EXISTS "field_visits_delete_policy" ON public.field_visits;
CREATE POLICY "field_visits_delete_policy" ON public.field_visits
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin() OR 
    (staff_id = auth.uid() AND status = 'scheduled')
  );

-- 5. STAFF ATTENDANCE DELETE POLICY
-- Strictly restricted to administrators for data correction/audit maintenance
DROP POLICY IF EXISTS "staff_attendance_delete_policy" ON public.staff_attendance;
CREATE POLICY "staff_attendance_delete_policy" ON public.staff_attendance
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
