-- ============================================================
-- AKIRA AUTOMATION — SUPABASE RLS SECURITY TEST SUITE
-- File: supabase/tests/rls_security_test.sql
-- Compatible with pgTAP / Supabase CLI test runner
-- ============================================================

BEGIN;
SELECT plan(22);

-- ============================================================
-- 1. SETUP FIXTURES
-- ============================================================

-- Create test user in auth.users
CREATE USER test_admin_user WITH PASSWORD 'secret_test_password';
CREATE USER test_non_admin_user WITH PASSWORD 'secret_test_password';

-- Test UUIDs
\set admin_uid '11111111-1111-1111-1111-111111111111'
\set non_admin_uid '22222222-2222-2222-2222-222222222222'

INSERT INTO auth.users (id, email)
VALUES
  (:'admin_uid', 'admin@akiraautomation.com'),
  (:'non_admin_uid', 'regular@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, active)
VALUES
  (:'admin_uid', 'admin@akiraautomation.com', 'Admin User', 'admin', true),
  (:'non_admin_uid', 'regular@example.com', 'Regular User', 'viewer', true)
ON CONFLICT (id) DO NOTHING;

-- Seed a test active product and an inactive product
\set active_prod_id '33333333-3333-3333-3333-333333333333'
\set inactive_prod_id '44444444-4444-4444-4444-444444444444'

INSERT INTO public.products (id, name, slug, active)
VALUES
  (:'active_prod_id', 'Active Gauge System', 'active-gauge-system', true),
  (:'inactive_prod_id', 'Draft Gauge Prototype', 'draft-gauge-prototype', false)
ON CONFLICT (id) DO NOTHING;

-- Seed an image for active product
\set active_img_id '55555555-5555-5555-5555-555555555555'
INSERT INTO public.product_images (id, product_id, storage_path, image_url)
VALUES
  (:'active_img_id', :'active_prod_id', 'products/active.webp', 'https://example.com/active.webp')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. ANONYMOUS ROLE TESTS
-- ============================================================
SET ROLE anon;
SET request.jwt.claims TO '{"role": "anon"}';

-- Test 1: Anon can read active products
SELECT results_eq(
  $$ SELECT slug FROM public.products WHERE id = '33333333-3333-3333-3333-333333333333' $$,
  $$ VALUES ('active-gauge-system') $$,
  'Anon CAN read active products'
);

-- Test 2: Anon CANNOT read inactive products
SELECT is_empty(
  $$ SELECT slug FROM public.products WHERE id = '44444444-4444-4444-4444-444444444444' $$,
  'Anon CANNOT read inactive products'
);

-- Test 3: Anon can read image of active product
SELECT results_eq(
  $$ SELECT storage_path FROM public.product_images WHERE id = '55555555-5555-5555-5555-555555555555' $$,
  $$ VALUES ('products/active.webp') $$,
  'Anon CAN read images of active products'
);

-- Test 4: Anon CANNOT insert products
SELECT throws_ok(
  $$ INSERT INTO public.products (name, slug) VALUES ('Hacked Product', 'hacked') $$,
  '42501',
  NULL,
  'Anon CANNOT insert products'
);

-- Test 5: Anon CANNOT update products
SELECT throws_ok(
  $$ UPDATE public.products SET name = 'Tampered' WHERE id = '33333333-3333-3333-3333-333333333333' $$,
  '42501',
  NULL,
  'Anon CANNOT update products'
);

-- Test 6: Anon CANNOT delete products
SELECT throws_ok(
  $$ DELETE FROM public.products WHERE id = '33333333-3333-3333-3333-333333333333' $$,
  '42501',
  NULL,
  'Anon CANNOT delete products'
);

-- Test 7: Anon CAN insert enquiries
SELECT lives_ok(
  $$ INSERT INTO public.enquiries (name, company, email, message) VALUES ('Test Client', 'Acme Corp', 'rfq@acme.com', 'Interested in air plug gauge') $$,
  'Anon CAN insert enquiries'
);

-- Test 8: Anon CANNOT read enquiries
SELECT is_empty(
  $$ SELECT * FROM public.enquiries $$,
  'Anon CANNOT read enquiries'
);

-- Test 9: Anon CANNOT update enquiries
SELECT throws_ok(
  $$ UPDATE public.enquiries SET status = 'closed' $$,
  '42501',
  NULL,
  'Anon CANNOT update enquiries'
);

-- Test 10: Anon CANNOT delete enquiries
SELECT throws_ok(
  $$ DELETE FROM public.enquiries $$,
  '42501',
  NULL,
  'Anon CANNOT delete enquiries'
);

-- Test 11: Anon CANNOT read activity logs
SELECT is_empty(
  $$ SELECT * FROM public.activity_logs $$,
  'Anon CANNOT read activity logs'
);

-- ============================================================
-- 3. AUTHENTICATED ADMIN TESTS
-- ============================================================
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

-- Test 12: Admin CAN read active and inactive products
SELECT results_eq(
  $$ SELECT count(*)::integer FROM public.products WHERE id IN ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444') $$,
  $$ VALUES (2) $$,
  'Admin CAN read all products including inactive'
);

-- Test 13: Admin CAN insert product
\set new_admin_prod '66666666-6666-6666-6666-666666666666'
SELECT lives_ok(
  $$ INSERT INTO public.products (id, name, slug) VALUES ('66666666-6666-6666-6666-666666666666', 'New Multigauge', 'new-multigauge') $$,
  'Admin CAN insert product'
);

-- Test 14: Admin CAN update product
SELECT lives_ok(
  $$ UPDATE public.products SET name = 'Updated Multigauge' WHERE id = '66666666-6666-6666-6666-666666666666' $$,
  'Admin CAN update product'
);

-- Test 15: Admin CAN delete product
SELECT lives_ok(
  $$ DELETE FROM public.products WHERE id = '66666666-6666-6666-6666-666666666666' $$,
  'Admin CAN delete product'
);

-- Test 16: Admin CAN read enquiries
SELECT isnt_empty(
  $$ SELECT * FROM public.enquiries $$,
  'Admin CAN read enquiries'
);

-- Test 17: Admin CAN update enquiries
SELECT lives_ok(
  $$ UPDATE public.enquiries SET status = 'contacted' WHERE email = 'rfq@acme.com' $$,
  'Admin CAN update enquiries'
);

-- Test 18: Admin CAN insert followups
SELECT lives_ok(
  $$ INSERT INTO public.followups (enquiry_id, scheduled_at, type, status)
     SELECT id, now() + interval '1 day', 'call', 'upcoming' FROM public.enquiries LIMIT 1 $$,
  'Admin CAN insert followups'
);

-- Test 19: Admin CAN read followups
SELECT isnt_empty(
  $$ SELECT * FROM public.followups $$,
  'Admin CAN read followups'
);

-- Test 20: Admin CAN insert activity logs
SELECT lives_ok(
  $$ INSERT INTO public.activity_logs (entity_type, action, description) VALUES ('PRODUCT', 'PRODUCT_CREATED', 'Created new product') $$,
  'Admin CAN append activity logs'
);

-- Test 21: Admin CAN read activity logs
SELECT isnt_empty(
  $$ SELECT * FROM public.activity_logs $$,
  'Admin CAN read activity logs'
);

-- Test 22: Admin CANNOT delete activity logs (Append-only restriction)
SELECT throws_ok(
  $$ DELETE FROM public.activity_logs $$,
  '42501',
  NULL,
  'Admin CANNOT delete activity logs (audit trail is immutable)'
);

SELECT * FROM finish();
ROLLBACK;
