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
