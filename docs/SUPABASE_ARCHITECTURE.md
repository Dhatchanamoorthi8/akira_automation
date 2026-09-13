# AKIRA AUTOMATION — Supabase Production Architecture

## 1. System Architecture Diagram

```
+-------------------------------------------------------------+
|                      Client Browser                         |
|  - Public Metrology Website (React 19 / Vite / Tailwind)    |
|  - Admin Console (/admin/login, /admin/dashboard)           |
+-------------------------------------------------------------+
                              |
                              v (HTTPS / TLS 1.3)
+-------------------------------------------------------------+
|                  Supabase JavaScript Client                 |
|  - @supabase/supabase-js (Browser context)                  |
|  - Environment: VITE_SUPABASE_URL, VITE_KEY (Anon/Public)   |
|  - Session Persistence & Auto-Refresh Token                 |
+-------------------------------------------------------------+
           |                              |
           v (Data REST API / PostgREST)   v (Storage API / S3)
+-----------------------------+   +-----------------------------+
|    Supabase PostgREST API   |   |   Supabase Storage Engine   |
|   (Validates JWT / claims)  |   |  Bucket: 'product-images'   |
+-----------------------------+   +-----------------------------+
           |                              |
           v                              v
+-------------------------------------------------------------+
|               PostgreSQL Database (v15+)                    |
|-------------------------------------------------------------|
| 1. Row Level Security (RLS) Policies                        |
| 2. Security Definer Role Validation (public.is_admin())     |
| 3. Automated Triggers (set_updated_at())                    |
| 4. Relational Tables:                                       |
|    - profiles (admin RBAC)                                  |
|    - products (metrology catalogue)                         |
|    - product_images (metadata & storage pointers)           |
|    - enquiries (RFQs from public website)                   |
|    - followups (CRM schedule and interaction logs)          |
|    - activity_logs (immutable append-only audit trail)      |
+-------------------------------------------------------------+
                              |
                              v (Database Webhooks - Phase 2)
+-------------------------------------------------------------+
|               Supabase Edge Functions (Deno)                |
|  - send-enquiry-email                                       |
|  - image-cleanup-cron                                       |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|          Transactional Email (Resend / AWS SES)             |
|   -> milestonegauges@gmail.com / sales@akiraautomation.com  |
+-------------------------------------------------------------+
```

---

## 2. Authentication Architecture

- **Engine**: Supabase Auth (GoTrue).
- **Credentials**: Email and password.
- **Tokens**: JWT access tokens and refresh tokens handled natively via browser storage; no custom JWT parsing or manual storage of tokens.
- **Session Lifecycle**:
  - Handled by `AuthProvider.tsx` via `supabase.auth.onAuthStateChange`.
  - On login, `authService.signIn()` authenticates credentials with generic failure messages to protect against account enumeration.
  - Active admin validation: Queries `public.profiles` for `auth.uid()` where `role = 'admin'` and `active = true`.
- **Route Protection**:
  - `ProtectedRoute.tsx` guards administrative routes (`/admin/*`).
  - Unauthenticated visitors are redirected to `/admin/login` preserving target return URL.
  - Authenticated non-admin visitors encounter an unauthorized access banner.

---

## 3. Storage Architecture

- **Bucket**: `product-images` (Public bucket).
- **Public Read**: Anyone can retrieve optimized WebP product assets without authentication.
- **Admin Write**: Restricted to authenticated users where `public.is_admin() = true`.
- **Validation**:
  - MIME types: `image/jpeg`, `image/png`, `image/webp`.
  - Max size: 5 MB per asset.
  - Path schema: `products/{product_id}/{uuid}-{safe_filename}` to eliminate filename collisions and path traversal attacks.
- **Transaction Safety**: `ProductImageService` uploads binary before creating database records. If the database insertion fails, the storage object is purged immediately.

---

## 4. Row Level Security (RLS) Matrix

| Entity | Anonymous Visitors (`anon`) | Authenticated Admins (`is_admin() = true`) |
| :--- | :--- | :--- |
| `profiles` | Denied | Read own profile; Read all admin profiles |
| `products` | `SELECT` where `active = true` | Full CRUD (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) |
| `product_images` | `SELECT` for images of active products | Full CRUD (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) |
| `enquiries` | `INSERT` only (Cannot read or modify) | `SELECT`, `UPDATE` (Soft workflow; delete prevented) |
| `followups` | Denied | `SELECT`, `INSERT`, `UPDATE` (Delete prevented) |
| `activity_logs` | Denied | `SELECT`, `INSERT` (Append-only; update & delete prevented) |

---

## 5. Environment Variables & Security Rules

### Frontend Bundle (`.env`, Vercel Dashboard):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### Strict Security Rules:
1. **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code or `VITE_*` variables.
2. **NEVER** include database passwords or direct `postgres://` connection strings in the browser.
3. **NEVER** disable Row Level Security on any application table.
4. **NEVER** allow anonymous `SELECT` queries on the `enquiries` table.
