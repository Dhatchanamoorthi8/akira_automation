# AKIRA AUTOMATION — End-to-End Email Delivery Audit & Hardening Report

**Audit Date**: September 13, 2026  
**System**: AKIRA AUTOMATION Precision Metrology Systems  
**Status**: EMAIL DELIVERY FIXED — PENDING RESEND API KEY & DOMAIN CONFIGURATION IN SUPABASE SECRETS  
**Auditor**: Senior Security & Full-Stack Infrastructure Engineer  

---

## 1. Executive Summary

A comprehensive, end-to-end diagnostic audit was performed across the entire AKIRA AUTOMATION transactional email pipeline:
```
Contact Form (Client) 
  ↓
React useEnquiryForm Hook 
  ↓
PostgreSQL `enquiries` Table (Direct UUID Insert) 
  ↓
EnquiryService / EmailService Trigger 
  ↓
Supabase Edge Function (`send-email-notification`) 
  ↓
Resend API (`https://api.resend.com/emails`) 
  ↓
Recipient Mailbox
```

### Key Findings & Root Cause Analysis
1. **Mock Fallback & Fake Success**:
   - The deployed Edge Function previously defaulted to a development mock simulation when `RESEND_API_KEY` was missing or rejected, returning HTTP 200 with `{ success: true, mock: true, messageId: "sim_..." }`.
   - In `src/hooks/useEnquiryForm.ts`, an obsolete stub `emailService.sendEnquiry()` was called which returned a hardcoded `{ success: true, message: "Enquiry safely recorded..." }` without ever invoking the Edge Function.
2. **Invalid Provider Secret in Remote Supabase Secrets**:
   - Live Edge Function invocation using authenticated administrative credentials proved that `RESEND_API_KEY` exists in the remote Supabase Edge Secrets, but Resend rejected the key with:
     ```json
     {
       "statusCode": 401,
       "name": "validation_error",
       "message": "API key is invalid"
     }
     ```
   - Because the Edge Function returned this object with HTTP 200, frontend callers mistook it for success.
3. **Gateway JWT Verification on Public Contact Form**:
   - Anonymous web visitors submitting RFQs do not possess a user JWT session.
   - The Supabase Gateway was enforcing JWT verification by default, returning `401 Unauthorized` with `x-supabase-server-error: UNUSABLE_CREDENTIAL` before the function code could even execute.
4. **Placeholder ID Bug**:
   - `enquiryService.createEnquiry` previously created a placeholder object with `id: 'newly-created'` instead of the actual database row ID. As a result, email deep links and idempotency keys had static `newly-created` identifiers.

---

## 2. Architecture & Delivery Pipeline

```
┌─────────────────────────┐
│   Public Contact Form   │  Validated RFC 5322 inputs, Honeypot check (_hp),
│  (Industrial Gauge RFQ) │  Throttled 2-second submit lock
└────────────┬────────────┘
             │ 1. Direct UUID Insert (Client-generated crypto.randomUUID)
             ▼
┌─────────────────────────┐
│ PostgreSQL `enquiries`  │  Row Level Security: INSERT permitted for `anon`.
│       (Supabase)        │  Persisted record guaranteed before email dispatch.
└────────────┬────────────┘
             │ 2. Asynchronous Trigger (Non-blocking: DB never rolled back on email failure)
             ▼
┌─────────────────────────┐
│  EmailService (Client)  │  Zero client secrets; invokes Supabase Edge Function
│                         │  Captures real provider confirmation; rejects mock success.
└────────────┬────────────┘
             │ 3. POST /functions/v1/send-email-notification (verify_jwt = false)
             ▼
┌─────────────────────────┐
│ Supabase Edge Function  │  - Validates honeypot & maximum payload size
│(send-email-notification)│  - Server controls `recipient` (Admin alert locked to internal desk)
│                         │  - Server controls `from` (notifications@akiraautomation.com)
│                         │  - Checks 24-hr idempotency in `activity_logs`
│                         │  - NO MOCK FALLBACK: Fails with HTTP 500 if provider unconfigured
└────────────┬────────────┘
             │ 4. POST https://api.resend.com/emails (Bearer ${RESEND_API_KEY})
             ▼
┌─────────────────────────┐
│       Resend API        │  Validates API Key, Verified Domain (DKIM/SPF), Rate Limits
└────────────┬────────────┘
             │ 5. Captures Provider Message ID / Error Status
             ▼
┌─────────────────────────┐
│   activity_logs Table   │  Immutable audit log: `EMAIL_NOTIFICATION_SENT` or
│       (PostgreSQL)      │  `EMAIL_NOTIFICATION_FAILED` with safe diagnostics.
└─────────────────────────┘
```

---

## 3. Frontend Contact Form Audit Details

| Question | Finding | Status |
| :--- | :--- | :---: |
| **A. Does contact form insert into Supabase?** | Yes, `enquiryService.createEnquiry()` executes `supabase.from('enquiries').insert(...)`. | **PASS** |
| **B. Does it invoke `send-email-notification`?** | Yes, via `emailService.notifyNewEnquiry()`. The obsolete stub `sendEnquiry()` was removed from `useEnquiryForm.ts`. | **FIXED** |
| **C. Is Edge Function called before/after DB insert?** | Called strictly **after** database insertion succeeds. If DB insert fails, no email is sent. | **PASS** |
| **D. Is the function call awaited?** | Handled asynchronously with non-blocking error containment so DB transactions are never rolled back if email delivery fails. | **PASS** |
| **E. Is function error captured?** | Yes, `emailService` inspects both network errors and `data.success === false`, returning structured error diagnostics. | **FIXED** |
| **F. Is email result ignored?** | Result is logged; failures write `EMAIL_FAILED` to `public.activity_logs`. The client UI confirms enquiry submission safely without making false delivery claims. | **PASS** |
| **G. Is there a mock fallback?** | Removed completely. Neither client nor Edge Function returns fake success. | **FIXED** |
| **H. Is there a fake "email sent" success response?** | Removed. Client-facing success copy updated to "Thank you. Your enquiry has been submitted successfully." | **FIXED** |
| **I. Is frontend calling an old email service?** | Obsolete `emailService.sendEnquiry()` call eliminated from `useEnquiryForm.ts`. | **FIXED** |
| **J. Is there duplicate email logic?** | Eliminated. Single coordination point in `enquiryService.createEnquiry()`. | **FIXED** |

---

## 4. Edge Function & Provider Secret Audit

### Diagnostic Live Invocation Results
Live testing against `https://ocyphrcgktochijuozwe.supabase.co/functions/v1/send-email-notification`:

1. **Unauthenticated Public Request (Prior to Fix)**:
   - Status: `401 Unauthorized`
   - Header: `x-supabase-server-error: UNUSABLE_CREDENTIAL`
   - Cause: Edge Gateway enforced JWT verification on publishable API key `sb_publishable_...`.
   - Resolution: Configured `[functions.send-email-notification] verify_jwt = false` in `supabase/config.toml`.

2. **Authenticated Administrative Request**:
   - Gateway Status: `200 OK` (JWT accepted)
   - Edge Function Execution: Invoked and executed.
   - External Resend Response:
     ```json
     {
       "statusCode": 401,
       "name": "validation_error",
       "message": "API key is invalid"
     }
     ```
   - Conclusion: `RESEND_API_KEY` **EXISTS** in remote Supabase Secrets, but its value is **INVALID** (e.g. dummy placeholder `re_123456789...` from documentation or revoked token).

---

## 5. Security & Abuse Protection Implementation

1. **Zero Client Secrets**:
   - No Resend API keys, SMTP credentials, or service-role keys are exposed to the browser or present in `dist/`.
2. **Server-Controlled Sender & Recipient**:
   - Public visitors submitting RFQs cannot specify arbitrary `to` or `from` headers.
   - For `new_enquiry`, the administrative alert is locked server-side to `Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'moorthi832002@gmail.com'`.
   - Outbound sender address is strictly controlled server-side: `Deno.env.get('EMAIL_FROM') || 'AKIRA AUTOMATION <notifications@akiraautomation.com>'`.
   - `reply_to` is populated with the customer's validated email so internal engineers can reply directly.
3. **Spam & Injection Defenses**:
   - Hidden honeypot field (`_hp`) rejects automated bot submissions.
   - Subject header sanitization strips `\r` and `\n` to prevent header injection attacks.
   - 24-hour idempotency checking via `activity_logs` suppresses duplicate submissions.
   - Dual-click throttling prevents rapid repeated form submissions.

---

## 6. Real-World Live Test Evidence

* **Enquiry Insertion Test (Live PostgreSQL)**:
  * Enquiry ID: `f42e9b2c-2dca-4c64-a40c-246d01ea28ed`
  * Status: Successfully written to `public.enquiries`.
* **Edge Function Invocation**:
  * Request ID: `01a09982-661a-7cec-bb53-9a53bd11bc88`
  * Execution Region: `ap-south-1`
  * Gateway Status: `200 OK`
* **Resend Response**:
  * Status: `401 Unauthorized` (`validation_error: API key is invalid`)
  * Provider Message ID: **MISSING** (Rejected by Resend due to invalid secret)
* **Mailbox Delivery**:
  * Status: **PENDING VALID RESEND_API_KEY IN SUPABASE DASHBOARD**

---

## 7. Operational Instructions for Live Production Email Activation

To enable live delivery to real recipient mailboxes:

1. **Obtain a Live Resend API Key**:
   - Log in to [Resend](https://resend.com) and create a production API key starting with `re_...`.
2. **Verify Domain in Resend**:
   - Add `akiraautomation.com` under Resend -> Domains.
   - Add the required DNS records (DKIM, SPF, MX) at your DNS registrar.
   - Ensure domain status shows **VERIFIED** in Resend.
3. **Configure Secrets in Supabase**:
   - Open Supabase Dashboard -> Project `ocyphrcgktochijuozwe` -> **Project Settings** -> **Edge Functions** -> **Secrets**.
   - Set `RESEND_API_KEY` to your live `re_...` key.
   - Set `EMAIL_FROM` to `AKIRA AUTOMATION <notifications@akiraautomation.com>`.
   - Set `ADMIN_NOTIFICATION_EMAIL` to `moorthi832002@gmail.com`.
4. **Deploy Edge Function**:
   - Deploy `send-email-notification` with JWT verification disabled for public contact form access:
     ```bash
     npx supabase functions deploy send-email-notification --no-verify-jwt
     ```
