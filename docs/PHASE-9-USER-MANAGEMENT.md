# Phase 9: Personnel & User Management Architecture & Hardening

## 1. Executive Summary
This document details the audit, resolution, and hardening implemented for personnel, staff, and user management in **AKIRA AUTOMATION**, addressing Issue 1 (Staff role update check constraint failure) and Issue 2 (Personnel Management, Edit Modal, Deactivate/Delete confirmation workflows, and relational integrity).

---

## 2. Issue 1: Staff Role Constraint Audit & Resolution

### A. Root Cause
In initial schema migrations (`20260912000001_initial_schema.sql`), an inline table constraint was defined:
```sql
CHECK (role IN ('admin', 'manager', 'sales', 'editor', 'viewer'))
```
The `'staff'` role was omitted from this initial constraint. When an administrator attempted to assign the `'staff'` role to a user profile, PostgreSQL threw:
```
Could not update user role: new row for relation "profiles" violates check constraint "profiles_role_check"
```

### B. Solution & Migration
Rather than dropping constraints or bypassing them on the client:
1. Created migration `supabase/migrations/20260913000003_fix_profiles_role_constraint.sql`:
   ```sql
   ALTER TABLE public.profiles 
     DROP CONSTRAINT IF EXISTS profiles_role_check;

   ALTER TABLE public.profiles 
     ADD CONSTRAINT profiles_role_check 
     CHECK (LOWER(role) IN ('admin', 'staff', 'sales', 'manager', 'editor', 'viewer'));
   ```
2. Preserved all legitimate existing roles (`admin`, `staff`, `sales`, `manager`, `editor`, `viewer`).
3. Re-synchronized the canonical role definitions in TypeScript (`src/types/database.ts`):
   ```typescript
   export const USER_ROLES: readonly UserRole[] = [
     'admin',
     'staff',
     'sales',
     'manager',
     'editor',
     'viewer',
   ] as const;
   ```
4. Added backend RLS hardening so non-administrators can never modify roles or elevate privileges.

---

## 3. Issue 2: Personnel Management (Edit & Deactivate/Delete Workflows)

### A. Safe User Lifecycle
To preserve audit integrity and prevent orphaned foreign keys:
- **Active Lifecycle**: `active: true` (Authorized to authenticate and perform role tasks).
- **Inactive Lifecycle**: `active: false` (Revokes authentication and route access immediately, while 100% preserving historical customer assignments, quotes, and audit trails).

### B. Relational Dependency Inspection
File: `src/services/userService.ts` (`getUserDependencies`, `deleteUser`)
Before allowing account deletion, the system inspects foreign key relationships:
- `enquiries.assigned_to`
- `followups.assigned_to`
- `activity_logs.user_id`

**Enforcement Rule**:
- If `enquiriesCount > 0` or `followupsCount > 0`: Hard deletion is **blocked**. The UI presents an informative advisory directing the administrator to **Deactivate** the account instead.
- If zero dependencies exist: Administrator may choose between **Deactivate Account** (Recommended) or **Permanently Delete Account** (with confirmation safeguard).

### C. Self-Lockout Protection
In both UI (`AdminUsers.tsx`) and service layers:
- The currently logged-in administrator (`currentUser.id === targetUser.id`) is blocked from:
  - Revoking their own `admin` role (self-demotion protection).
  - Deactivating their own active account.
  - Deleting their own account.

### D. User Edit Modal
File: `src/pages/admin/AdminUsers.tsx`
- **Fields**:
  - Full Name (Editable, validated).
  - Business Email (Read-only, clearly documented as bound to Supabase Auth identity to avoid credential desynchronization).
  - Role (`staff`, `admin`, `sales`, `manager`, `editor`, `viewer`).
  - Account Status (`Active`, `Inactive`).
- **Error Handling**: Displays clean, sanitized error banners. Never exposes raw PostgreSQL or internal database exceptions.

### E. Comprehensive Activity Logging
File: `src/services/userService.ts`
All lifecycle transitions are recorded in `activity_logs` with structured metadata:
- `USER_CREATED`: New user registered with assigned role.
- `USER_UPDATED`: Display name or profile fields modified.
- `USER_ROLE_CHANGED`: Old role and new role captured in diff and metadata.
- `USER_DEACTIVATED`: Account deactivated; access revoked.
- `USER_ACTIVATED`: Account reactivated; access restored.
- `USER_DELETED`: Safe deletion of non-dependent account recorded with email and name.
*Passwords are never logged or stored in plain text.*

---

## 4. Verification Results
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`).
- **Unit Tests**: 6/6 tests passing in `src/services/userService.test.ts`.
- **E2E Tests**: Playwright `e2e/phase9-correction-hardening.spec.ts` passed 8/8 tests, verifying Edit User Modal, Manage Modal, and Role RBAC enforcement.
