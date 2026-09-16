/// <reference path="../deno.d.ts" />
// Supabase Edge Function: send-email-notification
// Production Transactional Email Dispatcher for AKIRA AUTOMATION.
// Zero secrets in client-side code; strictly server-controlled recipients & sender.
// Real Resend Provider integration (notifications@akiraautomation.com).
// Records all outbound dispatches to public.email_messages and public.activity_logs.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && (
    origin.endsWith('.vercel.app') ||
    origin === 'https://akiraautomation.com' ||
    origin === 'https://www.akiraautomation.com' ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:')
  );
  const allowOrigin = isAllowed ? origin : '*';
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-retry-count",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

interface EmailRequestPayload {
  eventType:
    | "new_enquiry"
    | "new_enquiry_customer"
    | "enquiry_assigned"
    | "followup_assigned"
    | "followup_reminder"
    | "admin_reply"
    | "test"
    | "check_domain"
    | string;
  enquiryId?: string;
  recipient?: string | string[];
  cc?: string | string[];
  replyTo?: string;
  subject?: string;
  message?: string;
  html?: string;
  text?: string;
  templateData?: Record<string, unknown>;
  idempotencyKey?: string;
  retryCount?: number;
  _hp?: string; // Honeypot spam trap
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Sanitize API key: strip accidental quotes or whitespace
    const rawApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const resendApiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();

    // Production Sender Address - strictly centralized
    // Defaults to notifications@akiraautomation.com
    const configuredFrom =
      Deno.env.get("EMAIL_FROM") || Deno.env.get("EMAIL_FROM_ADDRESS");
    const emailFrom =
      configuredFrom && !configuredFrom.includes("onboarding@resend.dev")
        ? configuredFrom
        : "AKIRA AUTOMATION <notifications@akiraautomation.com>";

    // Primary admin notification mailbox
    const adminRecipient = (
      Deno.env.get("ADMIN_NOTIFICATION_EMAIL") ?? "akiraautomation@gmail.com"
    ).trim();
    const supportEmail = (
      Deno.env.get("SUPPORT_EMAIL") ?? "support@akiraautomation.com"
    ).trim();

    // 2. Critical Provider Secret Check
    if (!resendApiKey) {
      console.error(
        "[EMAIL_FAILED] RESEND_API_KEY is not configured in Supabase Secrets.",
      );
      return new Response(
        JSON.stringify({
          success: false,
          code: "EMAIL_PROVIDER_NOT_CONFIGURED",
          error: "RESEND_API_KEY is missing from Supabase Edge Secrets.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Handle Domain Status Check (GET or POST check_domain)
    if (
      req.method === "GET" ||
      (req.method === "POST" &&
        new URL(req.url).searchParams.get("action") === "check_domain")
    ) {
      try {
        const domainRes = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${resendApiKey}` },
        });
        const domainData = await domainRes.json();
        const domains = Array.isArray(domainData?.data)
          ? domainData.data
          : Array.isArray(domainData)
            ? domainData
            : [];
        const akiraDomain =
          domains.find(
            (d: Record<string, unknown>) => d.name === "akiraautomation.com",
          ) ||
          domains[0] ||
          null;

        return new Response(
          JSON.stringify({
            success: true,
            isVerified: akiraDomain?.status === "verified",
            domainName: akiraDomain?.name || "akiraautomation.com",
            status: akiraDomain?.status || "not_found",
            records: akiraDomain?.records || [],
            allDomains: domains.map((d: Record<string, unknown>) => ({
              name: d.name,
              status: d.status,
            })),
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      } catch (domainErr: unknown) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              domainErr instanceof Error
                ? domainErr.message
                : "Error checking Resend domain status",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // 4. Parse request body for email dispatch
    const body: Record<string, any> = await req.json();
    const eventType = (body.eventType ||
      body.type ||
      (body.enquiry ? "new_enquiry" : "contact_form")) as string;
    const cc = body.cc;
    const idempotencyKey = body.idempotencyKey || body.idempotency_key;
    const _hp = body._hp;
    let recipient = body.recipient || body.to;
    let replyTo = body.replyTo || body.reply_to;
    let subject = body.subject;
    let html = body.html;
    let text = body.text || body.message;
    let enquiryId = body.enquiryId || body.enquiry_id;

    // Direct check_domain event
    if (eventType === "check_domain") {
      try {
        const domainRes = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${resendApiKey}` },
        });
        const domainData = await domainRes.json();
        const domains = Array.isArray(domainData?.data) ? domainData.data : [];
        const akiraDomain =
          domains.find(
            (d: Record<string, unknown>) => d.name === "akiraautomation.com",
          ) ||
          domains[0] ||
          null;

        return new Response(
          JSON.stringify({
            success: true,
            isVerified: akiraDomain?.status === "verified",
            domainName: akiraDomain?.name || "akiraautomation.com",
            status: akiraDomain?.status || "not_found",
            records: akiraDomain?.records || [],
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      } catch (err: unknown) {
        return new Response(
          JSON.stringify({
            success: false,
            error: err instanceof Error ? err.message : "Domain check error",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Honeypot spam check
    if (_hp && _hp.trim().length > 0) {
      console.warn(
        "[ABUSE_PREVENTION] Honeypot field filled. Suppressing submission.",
      );
      return new Response(
        JSON.stringify({
          success: false,
          code: "SPAM_REJECTED",
          error: "Invalid submission parameters.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Header injection prevention: sanitize subject
    let sanitizedSubject = (subject || "Technical Enquiry — AKIRA AUTOMATION")
      .replace(/[\r\n]/g, " ")
      .trim();
    if (sanitizedSubject.length > 200) {
      return new Response(
        JSON.stringify({
          success: false,
          code: "VALIDATION_ERROR",
          error: "Subject line exceeds maximum allowable length.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 5. Strict Server-Side Control of Recipients & Security Authorization
    let recipientsList: string[] = [];
    let matchedEnquiryRecord: Record<string, unknown> | null = null;
    let resolvedEnquiryId: string | null =
      enquiryId || (body.templateData?.enquiryId as string) || null;

    if (eventType === "new_enquiry") {
      // Inbound website lead: recipient is the configured admin notification destination
      recipientsList = recipient
        ? Array.isArray(recipient)
          ? recipient
          : [recipient]
        : [adminRecipient];
      if (!replyTo && body.templateData?.email) {
        replyTo = body.templateData.email as string;
      }
    } else if (eventType === "new_enquiry_customer") {
      // Customer acknowledgement
      recipientsList = recipient
        ? Array.isArray(recipient)
          ? recipient
          : [recipient]
        : [];
      if (recipientsList.length === 0 && body.templateData?.email) {
        recipientsList = [body.templateData.email as string];
      }
      replyTo = supportEmail;
    } else if (eventType === "admin_reply") {
      // CRITICAL SECURITY: Recipient MUST come directly from the database enquiry record!
      // The browser is strictly prevented from providing an arbitrary destination address.
      if (!resolvedEnquiryId) {
        return new Response(
          JSON.stringify({
            success: false,
            code: "VALIDATION_ERROR",
            error: "enquiryId is required for admin reply.",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const { data: enqData, error: enqErr } = await adminClient
        .from("enquiries")
        .select("id, name, company, email, subject")
        .eq("id", resolvedEnquiryId)
        .maybeSingle();

      if (enqErr || !enqData || !enqData.email) {
        console.error(
          "[ADMIN_REPLY_AUTH] Target enquiry or customer email not found:",
          enqErr?.message,
        );
        return new Response(
          JSON.stringify({
            success: false,
            code: "ENQUIRY_NOT_FOUND",
            error:
              "Target enquiry could not be found or has no valid customer email.",
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      matchedEnquiryRecord = enqData;
      recipientsList = [enqData.email.trim().toLowerCase()];
      replyTo = supportEmail;

      // Wrap message in professional AKIRA template if not already raw HTML
      if (!html && body.message) {
        text = body.message;
        html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
    <div style="background:#0f172a;padding:24px 32px;border-bottom:3px solid #2563eb;">
      <h1 style="margin:0;font-size:20px;color:#fff;font-weight:700;">AKIRA AUTOMATION</h1>
      <p style="margin:4px 0 0 0;font-size:11px;color:#94a3b8;letter-spacing:0.08em;font-weight:600;">PRECISION • INNOVATION • SMART SOLUTIONS</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:15px;color:#334155;">Dear <strong>${enqData.name}</strong>,</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:18px;margin:16px 0;font-size:14px;line-height:1.6;color:#1e293b;white-space:pre-wrap;">${body.message}</div>
      <p style="margin:20px 0 0;font-size:13px;color:#64748b;">You can reply directly to this email to continue the technical discussion.</p>
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;font-size:12px;color:#64748b;">
      <p style="margin:0 0 4px;"><strong>AKIRA AUTOMATION PRIVATE LIMITED</strong></p>
      <p style="margin:0;color:#94a3b8;">Multi-Jet Air Gauging, Electronic Gauging Columns & Precision Metrology Systems</p>
    </div>
  </div>
</body>
</html>`;
      }
    } else if (eventType === "test") {
      // Diagnostic test email
      recipientsList = recipient
        ? Array.isArray(recipient)
          ? recipient
          : [recipient]
        : [adminRecipient];
      sanitizedSubject = sanitizedSubject || "AKIRA AUTOMATION — Test Email";
      if (!text && !html) {
        text = `This is a test email from the AKIRA AUTOMATION email system.\n\nTimestamp: ${new Date().toISOString()}\nEnvironment: Production\nEdge Function: send-email-notification`;
      }
    } else {
      // Staff notifications (enquiry_assigned, followup_assigned, followup_reminder)
      recipientsList = recipient
        ? Array.isArray(recipient)
          ? recipient
          : [recipient]
        : [adminRecipient];
      replyTo = supportEmail;
    }

    if (recipientsList.length === 0 || (!html && !text)) {
      return new Response(
        JSON.stringify({
          success: false,
          code: "VALIDATION_ERROR",
          error:
            "Recipient address and email content (html or text) are required.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 6. Idempotency duplicate check (24-hour window)
    if (idempotencyKey) {
      const { data: existingLog } = await adminClient
        .from("activity_logs")
        .select("id, created_at, entity_id")
        .eq("entity_type", "email_dispatch")
        .eq("action", "EMAIL_NOTIFICATION_SENT")
        .contains("new_value", { idempotencyKey })
        .limit(1)
        .maybeSingle();

      if (existingLog) {
        console.log(
          `[IDEMPOTENT_SUPPRESSION] Duplicate key ${idempotencyKey} previously delivered.`,
        );
        return new Response(
          JSON.stringify({
            success: true,
            idempotentDuplicate: true,
            status: "SENT",
            provider: "resend",
            providerMessageId: existingLog.entity_id,
            message:
              "Email notification previously dispatched. Duplicate send suppressed.",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    const ccList = cc ? (Array.isArray(cc) ? cc : [cc]) : undefined;
    console.log(
      `[EMAIL_DISPATCH_START] eventType=${eventType} enquiryId=${resolvedEnquiryId} from="${emailFrom}" to="${recipientsList.join(", ")}"`,
    );

    // 7. Real Provider Dispatch to Resend (No Mock Fallback)
    let providerMessageId: string | null = null;
    let errorCode: string | null = null;
    let errorMessage: string | null = null;
    let httpStatus = 500;

    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: recipientsList,
          cc: ccList,
          reply_to: replyTo || undefined,
          subject: sanitizedSubject,
          html: html || undefined,
          text: text || undefined,
        }),
      });

      httpStatus = resendRes.status;
      const resendData = await resendRes.json().catch(() => ({}));

      if (resendRes.ok && resendData?.id) {
        providerMessageId = resendData.id;
        console.log(`[RESEND_SUCCESS] providerMessageId=${providerMessageId}`);
      } else {
        errorCode = resendData?.name || `HTTP_${httpStatus}`;
        errorMessage =
          resendData?.message ||
          `Resend rejected request with status ${httpStatus}`;
        console.error(
          `[RESEND_FAILURE] status=${httpStatus} code=${errorCode} message=${errorMessage}`,
        );

        // Detect unverified domain error from Resend
        if (
          errorMessage.toLowerCase().includes("domain") ||
          errorMessage.toLowerCase().includes("not verified") ||
          httpStatus === 403
        ) {
          errorCode = "DOMAIN_NOT_VERIFIED";
        }
      }
    } catch (fetchErr: unknown) {
      errorCode = "NETWORK_ERROR";
      errorMessage =
        fetchErr instanceof Error
          ? fetchErr.message
          : "Network failure reaching Resend API";
      console.error(`[RESEND_FAILURE] Network error: ${errorMessage}`);
      httpStatus = 503;
    }

    const isSuccess = Boolean(providerMessageId);

    // 8. Record in dedicated email_messages table
    let savedEmailMessage: Record<string, unknown> | null = null;
    try {
      const { data: emData } = await adminClient
        .from("email_messages")
        .insert({
          enquiry_id: resolvedEnquiryId || null,
          direction: "OUTBOUND",
          from_email: emailFrom,
          to_email: recipientsList.join(", "),
          cc_email: ccList ? ccList.join(", ") : null,
          reply_to: replyTo || null,
          subject: sanitizedSubject,
          body: text || html || "",
          body_html: html || null,
          provider: "resend",
          provider_message_id: providerMessageId,
          status: isSuccess ? "SENT" : "FAILED",
          error_message: errorMessage,
          sent_at: isSuccess ? new Date().toISOString() : null,
          metadata: {
            eventType,
            idempotencyKey: idempotencyKey || null,
            errorCode,
            httpStatus,
          },
        })
        .select()
        .maybeSingle();

      savedEmailMessage = emData;
    } catch (dbErr) {
      console.warn(
        "Unable to record email_messages row (table may need migration):",
        dbErr,
      );
    }

    // 9. Record immutable activity audit log
    try {
      await adminClient.from("activity_logs").insert({
        entity_type: "email_dispatch",
        entity_id:
          resolvedEnquiryId || providerMessageId || `failed_${Date.now()}`,
        action: isSuccess
          ? "EMAIL_NOTIFICATION_SENT"
          : "EMAIL_NOTIFICATION_FAILED",
        new_value: {
          eventType,
          recipients: recipientsList,
          from: emailFrom,
          replyTo: replyTo || null,
          subject: sanitizedSubject,
          provider: "resend",
          providerMessageId,
          status: isSuccess ? "SENT" : "FAILED",
          idempotencyKey: idempotencyKey || null,
          errorCode,
          errorMessage,
          httpStatus,
          enquiryId: resolvedEnquiryId,
        },
        description: isSuccess
          ? `Outbound email (${eventType}) sent to ${recipientsList.join(", ")} [Resend ID: ${providerMessageId}]`
          : `Email dispatch (${eventType}) to ${recipientsList.join(", ")} failed: [${errorCode}] ${errorMessage}`,
      });
    } catch (auditErr) {
      console.warn("Unable to record activity_logs entry:", auditErr);
    }

    // 10. Provider Failure: return genuine failure (Requirement 7)
    if (!isSuccess) {
      return new Response(
        JSON.stringify({
          success: false,
          code: errorCode,
          status: "FAILED",
          httpStatus,
          error: errorMessage,
          provider: "resend",
        }),
        {
          status: httpStatus >= 400 && httpStatus <= 599 ? httpStatus : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 11. Genuine Provider Success Response
    return new Response(
      JSON.stringify({
        success: true,
        status: "SENT",
        provider: "resend",
        providerMessageId,
        recipients: recipientsList,
        from: emailFrom,
        emailMessage: savedEmailMessage,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error(`[INTERNAL_ERROR] ${message}`);
    return new Response(
      JSON.stringify({
        success: false,
        code: "INTERNAL_ERROR",
        error: message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
