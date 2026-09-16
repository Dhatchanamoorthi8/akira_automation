const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const schemaPath = path.join(rootDir, 'supabase', 'migrations', '20260912000001_initial_schema.sql');
const storagePath = path.join(rootDir, 'supabase', 'migrations', '20260912000002_storage_setup.sql');
const phase5Path = path.join(rootDir, 'supabase', 'migrations', '20260913000001_phase5_followup_staff.sql');
const phase6_7Path = path.join(rootDir, 'supabase', 'migrations', '20260913000002_phase6_phase7_activity_analytics.sql');
const phase8_9Path = path.join(rootDir, 'supabase', 'migrations', '20260913000003_fix_profiles_role_constraint.sql');
const phase10Path = path.join(rootDir, 'supabase', 'migrations', '20260916000001_phase10_email_messages.sql');
const phase11Path = path.join(rootDir, 'supabase', 'migrations', '20260916000002_create_app_settings.sql');
const seedPath = path.join(rootDir, 'supabase', 'seed', 'seed.sql');
const outputPath = path.join(rootDir, 'supabase', 'complete_setup.sql');

const schema = fs.readFileSync(schemaPath, 'utf8');
const storage = fs.readFileSync(storagePath, 'utf8');
const phase5 = fs.readFileSync(phase5Path, 'utf8');
const phase6_7 = fs.readFileSync(phase6_7Path, 'utf8');
const phase8_9 = fs.readFileSync(phase8_9Path, 'utf8');
const phase10 = fs.readFileSync(phase10Path, 'utf8');
const phase11 = fs.readFileSync(phase11Path, 'utf8');
const seed = fs.readFileSync(seedPath, 'utf8');

const header = `-- ============================================================
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

`;

const content = header + schema + '\n\n' + storage + '\n\n' + phase5 + '\n\n' + phase6_7 + '\n\n' + phase8_9 + '\n\n' + phase10 + '\n\n' + phase11 + '\n\n' + seed;
fs.writeFileSync(outputPath, content, 'utf8');

console.log('Successfully created:', outputPath);
console.log('File size:', fs.statSync(outputPath).size, 'bytes');
