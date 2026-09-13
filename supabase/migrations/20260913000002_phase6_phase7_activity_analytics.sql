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
