# AKIRA AUTOMATION — Phase 8: Email Notifications & Edge Functions

**Generated**: September 13, 2026  
**Status**: COMPLETE & VERIFIED  
**System**: AKIRA AUTOMATION Transactional Messaging Layer  

---

## 1. Architectural Overview

Phase 8 implements server-side, transactional email dispatch for AKIRA AUTOMATION without exposing third-party provider API keys or SMTP secrets to client-side code:

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  (EnquiryForm / enquiryService / followupService)       │
└───────────────────────────┬─────────────────────────────┘
                            │ supabase.functions.invoke('send-email-notification')
                            ▼
┌─────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION                     │
│    supabase/functions/send-email-notification/index.ts  │
│  - JWT & Origin Validation (CORS)                       │
│  - Idempotency & Duplicate Send Protection              │
│  - Server-side Secrets (RESEND_API_KEY / EMAIL_FROM)    │
│  - Audit Logging (public.activity_logs)                 │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS REST API
                            ▼
┌─────────────────────────────────────────────────────────┐
│              EMAIL PROVIDER (Resend / SMTP)             │
│  - High Deliverability DKIM/SPF Transactional Delivery  │
│  - Customer Confirmation & Staff Task Alerts            │
└─────────────────────────────────────────────────────────┘
```

### Security Principles:
- **Zero Client-Side Secrets**: No `RESEND_API_KEY`, `SENDGRID_API_KEY`, or SMTP passwords exist in frontend code or client bundles.
- **Graceful Fault Tolerance**: If network degradation or provider downtime occurs, `emailService` logs warnings safely and never throws unhandled exceptions that could crash visitor or admin UI sessions.
- **Idempotency**: Requests carry unique event keys (e.g. `enq_admin_<id>`, `fup_assign_<id>_<staff_id>`) preventing duplicate emails if an operation is re-tried.

---

## 2. Event Triggers & Notification Matrix

| Event Type | Trigger Point | Recipient | Subject Format | Idempotency Key |
| :--- | :--- | :--- | :--- | :--- |
| `new_enquiry` | Inbound RFQ via `enquiryService.createEnquiry` | Primary admin & sales CC | `[New RFQ] Technical Enquiry from <Company/Name> (<Product>)` | `enq_admin_<enquiryId>` |
| `new_enquiry_customer` | Inbound RFQ via `enquiryService.createEnquiry` | Prospective customer email | `Acknowledgement: AKIRA AUTOMATION Enquiry Received (<Product>)` | `enq_cust_<enquiryId>` |
| `enquiry_assigned` | Admin assigns enquiry via `enquiryService.assignEnquiry` | Assigned staff email | `[Assignment] Technical RFQ Assigned to You: <Customer>` | `enq_assign_<enquiryId>_<staffId>` |
| `followup_assigned` | Milestone scheduled via `followupService.createFollowup` | Assigned staff email | `[Task Assigned] <TYPE> Follow-up with <Customer>` | `fup_assign_<fupId>_<staffId>` |
| `followup_reminder` | Scheduled reminder or overdue alert | Assigned staff email | `[<REMINDER/OVERDUE>] <TYPE> Follow-up for <Customer>` | `fup_rem_<fupId>_<due/overdue>` |

---

## 3. Email Template Specifications

All templates are located in `src/templates/emailTemplates.ts` and compiled to responsive, accessible HTML with plain-text alternatives:

1. **Header**: Deep slate background (`#0f172a`), 3px solid blue accent line (`#2563eb`), bold AKIRA AUTOMATION brand heading.
2. **Typography**: System font stack (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto`), 14px body text, 1.6 line height.
3. **Structured Cards**: Bordered data tables with customer contacts, technical requirements, tolerances, and scheduled dates.
4. **Call to Action**: High-contrast blue button directly linking authorized users to the relevant dossier inside the Admin or Staff Portal (`/admin/enquiries/:id` or `/staff/followups`).
5. **Footer**: Official AKIRA AUTOMATION Private Limited entity disclosures and automated notice.

---

## 4. Supabase Secrets & Deployment Guide

### Environment Variables
Configure the following secrets in Supabase via Dashboard (`Project Settings -> Edge Functions -> Secrets`) or CLI:

```bash
# Required for live Resend dispatch
supabase secrets set RESEND_API_KEY="re_123456789..."

# Optional custom sender address
supabase secrets set EMAIL_FROM="AKIRA AUTOMATION <notifications@akiraautomation.com>"

# Deploy the Edge Function
supabase functions deploy send-email-notification
```

*Note: In local test and preview environments where `RESEND_API_KEY` is not present, the Edge Function automatically switches to Mock Simulation Mode, logging the structured dispatch and returning `{ success: true, mock: true }`.*

---

## 5. Automated Test Verification

```bash
# Unit Tests (emailService + emailTemplates)
npm test -- --run src/services/emailService.test.ts src/templates/emailTemplates.test.ts
✓ src/templates/emailTemplates.test.ts (6 tests)
✓ src/services/emailService.test.ts (11 tests)
Test Files  2 passed (2)
     Tests  17 passed (17)

# Full Workspace Regression Suite
npm test -- --run
Test Files  36 passed (36)
     Tests  152 passed (152)
```
