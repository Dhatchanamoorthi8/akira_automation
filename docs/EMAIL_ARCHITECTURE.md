# AKIRA AUTOMATION — Transactional Email & Notification Architecture

## 1. Overview & Security Principles

This document specifies the target architecture for transactional email delivery (RFQs, enquiry notifications, customer confirmations, and internal sales alerts) for **AKIRA AUTOMATION**.

### Critical Security Rule:
**Never handle SMTP credentials, API keys (e.g. Resend, SendGrid, Postmark, AWS SES), or email secrets directly inside client-side browser code.**
All outbound notification dispatches must occur strictly within secure server-side execution environments (Supabase Edge Functions or Database Webhooks).

---

## 2. Target Architecture Flow

```
[ Customer Browser ]
        |
        | 1. Form submission (enquiryService.createEnquiry)
        v
[ Supabase PostgreSQL ]
  Table: public.enquiries
  Action: INSERT (Protected by RLS)
        |
        | 2. Database Webhook / Asynchronous Database Trigger
        v
[ Supabase Edge Function: send-enquiry-email ]
  - Validates payload
  - Resolves business recipient (milestonegauges@gmail.com / sales@akiraautomation.com)
  - Formats branded HTML email template with ISO 9001 metrology header
  - Signs payload using transactional provider API key
        |
        | 3. HTTPS REST API Call (TLS 1.3)
        v
[ Transactional Email Provider (Resend / AWS SES / Postmark) ]
        |
        +----------------------------+
        |                            |
        v                            v
[ Engineering / Sales Desk ]    [ Customer Confirmation ]
  milestonegauges@gmail.com       (Optional acknowledgment copy)
```

---

## 3. Implementation Blueprint for Supabase Edge Function

### Directory Location:
`supabase/functions/send-enquiry-email/index.ts`

### Environment Variables Required (Configured in Supabase Dashboard):
- `RESEND_API_KEY`: Secret API token for transactional mail provider.
- `COMPANY_INBOX`: Default recipient email (`milestonegauges@gmail.com`).
- `COMPANY_CC`: Secondary review email (`sales@akiraautomation.com`).

### Edge Function Logic (TypeScript Deno Runtime):
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface EnquiryWebhookPayload {
  type: 'INSERT';
  table: 'enquiries';
  record: {
    id: string;
    name: string;
    company: string | null;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    product_category: string | null;
    specific_product: string | null;
    created_at: string;
  };
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload: EnquiryWebhookPayload = await req.json();
  const { record } = payload;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    },
    body: JSON.stringify({
      from: 'AKIRA Automation Portal <notifications@akiraautomation.com>',
      to: [Deno.env.get('COMPANY_INBOX') || 'milestonegauges@gmail.com'],
      cc: [Deno.env.get('COMPANY_CC') || 'sales@akiraautomation.com'],
      subject: `[AKIRA Technical RFQ] ${record.specific_product || record.product_category || 'Gauging Enquiry'} - ${record.company || record.name}`,
      html: `
        <h2>New Technical Metrology Enquiry</h2>
        <p><strong>Customer:</strong> ${record.name}</p>
        <p><strong>Company:</strong> ${record.company || 'N/A'}</p>
        <p><strong>Email:</strong> ${record.email}</p>
        <p><strong>Phone:</strong> ${record.phone || 'N/A'}</p>
        <p><strong>Category:</strong> ${record.product_category || 'N/A'}</p>
        <p><strong>Specific Model / Drawing:</strong> ${record.specific_product || 'N/A'}</p>
        <hr />
        <h3>Technical Requirement / Tolerance Specifications:</h3>
        <p style="white-space: pre-wrap;">${record.message}</p>
      `,
    }),
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## 4. Current Migration Stage vs Future Production Hardening

| Stage | Data Persistence | Outbound Notification | Security Level |
| :--- | :--- | :--- | :--- |
| **Current (Supabase Foundation)** | `public.enquiries` table in PostgreSQL | Client fallback (`mailto:` + existing FormSubmit integration if unconfigured) | High. Zero secrets in browser. Submissions permanently captured in DB. |
| **Production Hardening (Phase 2)** | `public.enquiries` table in PostgreSQL | Supabase Edge Function triggered by DB webhook via Resend/SES | Enterprise grade. Fully decoupled asynchronous delivery with retry queues. |
