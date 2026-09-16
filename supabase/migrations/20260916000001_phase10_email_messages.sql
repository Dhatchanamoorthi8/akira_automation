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
