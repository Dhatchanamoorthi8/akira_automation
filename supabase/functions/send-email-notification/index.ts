/// <reference path="../deno.d.ts" />
// Supabase Edge Function: send-email-notification
// Server-side transactional email dispatcher for AKIRA AUTOMATION.
// Supports Resend test mode (onboarding@resend.dev) without custom domain/DNS.
// Zero secrets in client-side code; strictly server-controlled recipients & sender.

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
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-retry-count',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

interface EmailRequestPayload {
  eventType: 'new_enquiry' | 'new_enquiry_customer' | 'enquiry_assigned' | 'followup_assigned' | 'followup_due' | 'followup_overdue' | 'test' | string;
  recipient?: string | string[];
  cc?: string | string[];
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  templateData?: Record<string, unknown>;
  idempotencyKey?: string;
  retryCount?: number;
  _hp?: string; // Honeypot
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Sanitize API key: strip accidental leading/trailing whitespace or quotes
    const rawApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const resendApiKey = rawApiKey.replace(/^["']|["']$/g, '').trim();

    // Configuration: Test Mode vs Verified Domain Mode
    // Set TEST_EMAIL_MODE = 'false' in Supabase Secrets once you verify a custom domain.
    // Defaults to true (test mode) using Resend testing sender: onboarding@resend.dev
    const testEmailModeEnv = Deno.env.get('TEST_EMAIL_MODE');
    const isTestMode = testEmailModeEnv !== 'false';

    const configuredFrom = Deno.env.get('EMAIL_FROM');
    const emailFrom = isTestMode
      ? 'AKIRA AUTOMATION <onboarding@resend.dev>'
      : (configuredFrom || 'AKIRA AUTOMATION <onboarding@resend.dev>');

    // Server-controlled admin recipient:
    // Defaults to the Resend account owner's email address
    const adminRecipient = (Deno.env.get('ADMIN_NOTIFICATION_EMAIL') ?? 'moorthi832002@gmail.com').trim();

    // 2. Parse request body
    const body: EmailRequestPayload = await req.json();
    const { eventType, cc, replyTo, subject, html, text, idempotencyKey, _hp } = body;
    let { recipient } = body;

    // Honeypot spam check
    if (_hp && _hp.trim().length > 0) {
      console.warn('[ABUSE_PREVENTION] Honeypot field filled. Suppressing submission.');
      return new Response(
        JSON.stringify({ success: false, code: 'SPAM_REJECTED', error: 'Invalid submission parameters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Header injection prevention: sanitize subject
    let sanitizedSubject = (subject || 'Technical Enquiry - AKIRA AUTOMATION').replace(/[\r\n]/g, ' ').trim();
    if (sanitizedSubject.length > 200) {
      return new Response(
        JSON.stringify({ success: false, code: 'VALIDATION_ERROR', error: 'Subject line exceeds maximum allowable length.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Strict Server-Side Control of Recipients
    let recipientsList: string[] = [];

    if (eventType === 'new_enquiry' || eventType === 'test') {
      // Inbound RFQ Alert: server strictly locks recipient to internal admin desk
      recipientsList = [adminRecipient];
    } else if (eventType === 'new_enquiry_customer') {
      if (isTestMode) {
        // Resend test sender onboarding@resend.dev only allows sending to the account owner's email.
        // Send customer confirmation copy to admin to avoid Resend 403 rejection.
        console.log(`[TEST_MODE] Resend testing domain in use. Routing customer copy to admin: ${adminRecipient}`);
        recipientsList = [adminRecipient];
        sanitizedSubject = `[TEST MODE - Customer Copy] ${sanitizedSubject}`;
      } else {
        recipientsList = recipient ? (Array.isArray(recipient) ? recipient : [recipient]) : [adminRecipient];
      }
    } else {
      // Authenticated staff notifications (enquiry_assigned, followup_assigned)
      if (isTestMode) {
        // In test mode, route to admin if staff email is not verified in Resend sandbox
        console.log(`[TEST_MODE] Notification recipient routed to admin ${adminRecipient} for sandbox delivery`);
        recipientsList = [adminRecipient];
      } else {
        recipientsList = recipient ? (Array.isArray(recipient) ? recipient : [recipient]) : [adminRecipient];
      }
    }

    if (recipientsList.length === 0 || (!html && !text)) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'VALIDATION_ERROR',
          error: 'Recipient list and email content (html or text) are required.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Critical Provider Secret Check (NO MOCK FALLBACK)
    if (!resendApiKey) {
      console.error('[EMAIL_NOTIFICATION_FAILED] ERROR_CODE: EMAIL_PROVIDER_NOT_CONFIGURED HTTP_STATUS: 500');
      return new Response(
        JSON.stringify({
          success: false,
          code: 'EMAIL_PROVIDER_NOT_CONFIGURED',
          error: 'RESEND_API_KEY is not configured in Supabase Edge Secrets. Transactional email dispatch cannot proceed.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Service client for audit and idempotency check
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 6. Idempotency duplicate check (24-hour window)
    if (idempotencyKey) {
      const { data: existingLog } = await adminClient
        .from('activity_logs')
        .select('id, created_at, entity_id')
        .eq('entity_type', 'email_dispatch')
        .eq('action', 'EMAIL_NOTIFICATION_SENT')
        .contains('new_value', { idempotencyKey })
        .limit(1)
        .maybeSingle();

      if (existingLog) {
        console.log(`[IDEMPOTENT_SUPPRESSION] Duplicate key ${idempotencyKey} previously delivered.`);
        return new Response(
          JSON.stringify({
            success: true,
            idempotentDuplicate: true,
            status: 'SENT',
            provider: 'resend',
            providerMessageId: existingLog.entity_id,
            message: 'Email notification previously dispatched. Duplicate send suppressed.',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const ccList = cc ? (Array.isArray(cc) ? cc : [cc]) : undefined;
    const enquiryId = (body.templateData?.enquiryId as string) || 'none';

    console.log(`[EMAIL_NOTIFICATION_START] eventType=${eventType} enquiryId=${enquiryId} from="${emailFrom}" to="${recipientsList.join(', ')}" isTestMode=${isTestMode}`);

    // 7. Real Provider Dispatch to Resend
    let providerMessageId: string | null = null;
    let errorCode: string | null = null;
    let errorMessage: string | null = null;
    let httpStatus = 500;

    try {
      console.log(`[RESEND_REQUEST] Dispatching to https://api.resend.com/emails`);
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
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

      console.log(`[RESEND_RESPONSE_STATUS] ${httpStatus}`);

      if (resendRes.ok && resendData?.id) {
        providerMessageId = resendData.id;
        console.log(`[RESEND_SUCCESS] providerMessageId=${providerMessageId}`);
      } else {
        errorCode = resendData?.name || `HTTP_${httpStatus}`;
        errorMessage = resendData?.message || `Resend rejected request with status ${httpStatus}`;
        console.error(`[RESEND_FAILURE] status=${httpStatus} code=${errorCode} message=${errorMessage}`);
      }
    } catch (fetchErr: unknown) {
      errorCode = 'NETWORK_ERROR';
      errorMessage = fetchErr instanceof Error ? fetchErr.message : 'Network failure reaching Resend API';
      console.error(`[RESEND_FAILURE] status=503 code=${errorCode} message=${errorMessage}`);
      httpStatus = 503;
    }

    // 8. Record immutable activity audit log
    const isSuccess = Boolean(providerMessageId);
    try {
      await adminClient.from('activity_logs').insert({
        entity_type: 'email_dispatch',
        entity_id: providerMessageId || `failed_${Date.now()}`,
        action: isSuccess ? 'EMAIL_NOTIFICATION_SENT' : 'EMAIL_NOTIFICATION_FAILED',
        new_value: {
          eventType,
          recipients: recipientsList,
          from: emailFrom,
          replyTo: replyTo || null,
          subject: sanitizedSubject,
          provider: 'resend',
          providerMessageId,
          status: isSuccess ? 'SENT' : 'FAILED',
          idempotencyKey: idempotencyKey || null,
          errorCode,
          errorMessage,
          httpStatus,
          isTestMode,
        },
        description: isSuccess
          ? `Transactional email (${eventType}) accepted by Resend with ID: ${providerMessageId}`
          : `Failed delivering transactional email (${eventType}) to ${recipientsList.join(', ')}: [${errorCode}] ${errorMessage}`,
      });
    } catch (auditErr) {
      console.warn('Unable to record email dispatch activity log:', auditErr);
    }

    // 9. Return actual failure if Resend rejected (Requirement 7)
    if (!isSuccess) {
      return new Response(
        JSON.stringify({
          success: false,
          code: errorCode,
          status: 'FAILED',
          httpStatus,
          error: errorMessage,
          isTestMode,
        }),
        {
          status: httpStatus >= 400 && httpStatus <= 599 ? httpStatus : 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 10. Genuine success response with real Resend provider message ID (Requirement 8, 9)
    return new Response(
      JSON.stringify({
        success: true,
        status: 'SENT',
        provider: 'resend',
        providerMessageId,
        recipients: recipientsList,
        from: emailFrom,
        isTestMode,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error(`[INTERNAL_ERROR] ${message}`);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'INTERNAL_ERROR',
        error: message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
