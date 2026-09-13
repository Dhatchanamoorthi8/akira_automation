# AKIRA AUTOMATION — PHASE 5: FOLLOW-UP MANAGEMENT & STAFF ASSIGNMENT

## 1. Architectural Overview

Phase 5 introduces comprehensive staff assignment, role-based access control (RBAC), an extended CRM follow-up lifecycle engine, and the completed transition of the public website contact form from client-side third-party dispatch (`formsubmit.co`) to direct Supabase PostgreSQL persistence as the single source of truth.

```
                  ┌─────────────────────────────────┐
                  │    AKIRA AUTOMATION PORTAL       │
                  └───────────────┬─────────────────┘
                                  │
                  ┌───────────────┴─────────────────┐
                  │          AuthProvider           │
                  │   (Role Detection: Admin/Staff) │
                  └───────┬─────────────────┬───────┘
                          │                 │
             Role: 'admin'│                 │Role: 'staff' / 'sales' / 'manager'
                          ▼                 ▼
          ┌───────────────────────┐ ┌───────────────────────┐
          │     Admin Portal      │ │    Staff Workspace    │
          │  /admin/dashboard     │ │        /staff         │
          │  /admin/products      │ ├───────────────────────┤
          │  /admin/images        │ │ • My Assigned Inquiries│
          │  /admin/enquiries     │ │ • Work Queue          │
          │  /admin/followups     │ │ • 5 Status KPI Chips  │
          │  /admin/users [NEW]   │ │ • Followup Completion │
          │  /admin/activity      │ │ • Quick Reschedule    │
          └───────────────────────┘ └───────────────────────┘
                     │                          │
                     ▼                          ▼
          ┌─────────────────────────────────────────────────┐
          │            PostgreSQL + Supabase RLS            │
          │  • profiles (admin vs staff)                    │
          │  • followups (assigned_to, priority, dates)     │
          │  • enquiries (assigned_to, lifecycle status)    │
          │  • activity_logs (audit trail)                  │
          └─────────────────────────────────────────────────┘
```

---

## 2. Role-Based Access Control & Permissions Matrix

The system implements strict separation of duties between Administrators and Staff members across both UI route guards (`ProtectedRoute`) and PostgreSQL Row-Level Security (RLS) policies.

| Capability / Resource | Administrator (`admin`) | Staff Member (`staff`, `sales`, `manager`) | Public / Anonymous |
| :--- | :---: | :---: | :---: |
| **Public Website & Catalog** | Full Access | Full Access | Full Access |
| **Technical RFQ Submission** | Permitted | Permitted | Permitted (Direct DB Insert) |
| **Admin Dashboard (`/admin/dashboard`)** | Full Access | **Blocked** (Redirects / Staff Banner) | Blocked (Redirects to Login) |
| **Product Management (`/admin/products`)**| Create, Edit, Delete | **Blocked** (Zero Access) | Blocked |
| **Product Image Manager (`/admin/images`)**| Upload, Reorder, Delete | **Blocked** (Zero Access) | Blocked |
| **Staff & User Management (`/admin/users`)**| Full CRUD & Role Assignment | **Blocked** (Zero Access) | Blocked |
| **Activity Logs (`/admin/activity`)** | Full System Audit Access | **Blocked** (Zero Access) | Blocked |
| **Enquiries (`/admin/enquiries`)** | View All, Assign, Edit Status | View **Only Assigned** RFQs | Blocked |
| **Follow-up Lifecycle (`/admin/followups`)**| View All, Reassign, Cancel | View **Only Assigned** Tasks | Blocked |
| **Staff Workspace (`/staff`)** | Full Access (Supervisory) | **Primary Workstation** | Blocked |

---

## 3. Database Schema Extensions & Migration

The Phase 5 migration (`supabase/migrations/20260913000001_phase5_followup_staff.sql`) establishes:

### 3.1 Extended `followups` Table
- `assigned_to` (`UUID REFERENCES profiles(id) ON DELETE SET NULL`): Explicit staff assignment.
- `title` (`TEXT`): Human-readable task headline (e.g., *"Provide customized quote for 2-jet air ring gauge"*).
- `description` (`TEXT`): Detailed operational guidelines.
- `due_date` (`DATE`): Normalized calendar due date.
- `due_time` (`TIME`): Optional specific appointment time.
- `priority` (`VARCHAR(20) DEFAULT 'medium'`): Constrained to `'low'`, `'medium'`, `'high'`, `'urgent'`.
- `completed_by` (`UUID REFERENCES profiles(id) ON DELETE SET NULL`): Accountability tracking.
- `cancelled_at` (`TIMESTAMPTZ`): Soft-cancellation timestamp.
- `cancellation_reason` (`TEXT`): Explicit rationale for cancellation.

### 3.2 Extended `profiles` Role Check
Updated `profiles.role` check constraint to include `'staff'` alongside `'admin'`, `'manager'`, `'sales'`, and `'viewer'`:
```sql
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'sales', 'staff', 'viewer'));
```

### 3.3 High-Performance Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_followups_assigned_to ON public.followups(assigned_to);
CREATE INDEX IF NOT EXISTS idx_followups_due_date ON public.followups(due_date);
CREATE INDEX IF NOT EXISTS idx_followups_priority ON public.followups(priority);
CREATE INDEX IF NOT EXISTS idx_followups_completed_by ON public.followups(completed_by);
```

### 3.4 PostgreSQL Helper Function: `is_staff()`
```sql
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'sales', 'staff')
      AND active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## 4. Contact Form Email Migration Status (Supabase Primary)

### 4.1 Decommissioned FormSubmit.co
The legacy client-side third-party browser form dispatch (`formsubmit.co/ajax/...`) has been decommissioned. Previously, form submissions were made via client-side AJAX calls to an external endpoint, which had reliability, rate-limiting, and privacy risks.

### 4.2 Direct Database Insertion
Customer technical enquiries submitted via `/contact` or product detail modal now insert directly into `public.enquiries` using Supabase client:
```ts
const dbRes = await enquiryService.createEnquiry({
  name: formData.name,
  companyName: formData.companyName,
  email: formData.email,
  phone: formData.phone,
  industry: formData.industry,
  productCategory: formData.productCategory,
  specificProduct: formData.specificProduct,
  requirement: formData.requirement,
  message: formData.message,
  source: 'website',
});
```

### 4.3 Phase 8 Email Notification Boundary Preparation
- Database insertion is established as the single primary source of truth.
- `emailService.sendEnquiry` returns a structured notification boundary confirmation.
- In **Phase 8 (Email Notifications / Edge Functions)**, automated email notifications (internal alerts to `milestonegauges@gmail.com` and customer acknowledgment auto-responders) will be dispatched entirely server-side via Supabase Database Webhooks / Edge Functions (`resend` or SMTP integration).
- Zero secret credentials (`SMTP_PASSWORD`, `EMAIL_API_KEY`) exist in client-side Vite bundles or `.env`.

---

## 5. Staff User Provisioning & Edge Function Architecture

To ensure strict zero-trust security without exposing `SUPABASE_SERVICE_ROLE_KEY` to the browser, staff user provisioning is architected with a dedicated Supabase Edge Function:

- **Location**: `supabase/functions/create-staff-user/index.ts`
- **Security**: Requires an authenticated administrator JWT. Invokes `supabaseAdmin.auth.admin.createUser()` in a secure serverless environment with service-role boundaries.
- **Client Fallback**: If Edge Functions are unconfigured or offline in development, `userService.createStaffUser` uses authenticated client signup with automatic profile update and full activity audit logging.

---

## 6. Verification and Test Coverage

Phase 5 has been verified end-to-end:
- **TypeScript**: 0 errors (`npm run type-check`).
- **Vitest**: 34 test suites, 132 tests passing (`npm test -- --run`).
- **Playwright E2E**: 12 multi-viewport tests across Desktop (1440x900), Tablet (768x1024), and Mobile (390x844) passing (`npx playwright test e2e/phase5-staff-flows.spec.ts`).
- **Regression E2E**: 18 tests passing (`npx playwright test e2e/crm-flows.spec.ts`).
- **Production Build**: Clean bundle in 10.07s (`npm run build`).
