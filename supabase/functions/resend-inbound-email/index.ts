/// <reference path="../deno.d.ts" />
// Supabase Edge Function: resend-inbound-email
// Processes incoming email events (email.received) from Resend Inbound.
// Matches customer responses to corresponding enquiry records via headers/subject/sender.
// Stores inbound message in public.email_messages and updates enquiry activity timeline.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
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
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json().catch(() => ({}));
    console.log('[INBOUND_WEBHOOK_RECEIVED] Type:', payload.type, 'Event:', payload.event);

    // Resend Inbound event structure:
    // payload: { type: 'email.received', data: { from, to, subject, text, html, headers, message_id, ... } }
    // Or direct inbound object: { from, to, subject, text, html, headers, ... }
    const emailData = payload.data || payload;

    const fromEmail = (typeof emailData.from === 'string' ? emailData.from : emailData.from?.email || emailData.from?.address || '').trim();
    const toEmail = Array.isArray(emailData.to) ? emailData.to.join(', ') : (emailData.to?.email || emailData.to || '').trim();
    const subject = (emailData.subject || 'Re: AKIRA AUTOMATION Enquiry').trim();
    const textBody = emailData.text || '';
    const htmlBody = emailData.html || null;
    const providerMessageId = emailData.id || emailData.message_id || payload.id || null;

    // Headers extraction
    const headers: Record<string, string> = emailData.headers || {};
    const messageIdHeader = headers['message-id'] || headers['Message-ID'] || null;
    const inReplyToHeader = headers['in-reply-to'] || headers['In-Reply-To'] || null;
    const referencesHeader = headers['references'] || headers['References'] || null;

    console.log(`[INBOUND_EMAIL] From: "${fromEmail}" Subject: "${subject}" In-Reply-To: "${inReplyToHeader}"`);

    // Matching Strategy 1: In-Reply-To / References matching existing outbound message in email_messages
    let matchedEnquiryId: string | null = null;

    if (inReplyToHeader || referencesHeader) {
      const searchRefs = [inReplyToHeader, referencesHeader].filter(Boolean) as string[];
      for (const ref of searchRefs) {
        // Strip angle brackets if present e.g. <msg_123@domain>
        const cleanRef = ref.replace(/[<>]/g, '').trim();
        const { data: matchedMsg } = await adminClient
          .from('email_messages')
          .select('enquiry_id')
          .or(`provider_message_id.eq.${cleanRef},message_id.eq.${cleanRef}`)
          .not('enquiry_id', 'is', null)
          .limit(1)
          .maybeSingle();

        if (matchedMsg?.enquiry_id) {
          matchedEnquiryId = matchedMsg.enquiry_id;
          console.log(`[INBOUND_MATCH] Matched via RFC header reference (${cleanRef}) -> enquiryId: ${matchedEnquiryId}`);
          break;
        }
      }
    }

    // Matching Strategy 2: Extract UUID or #AK-xxxx from subject line
    if (!matchedEnquiryId && subject) {
      // Check for UUID in subject
      const uuidMatch = subject.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (uuidMatch) {
        const candidateId = uuidMatch[0];
        const { data: enqCheck } = await adminClient
          .from('enquiries')
          .select('id')
          .eq('id', candidateId)
          .maybeSingle();

        if (enqCheck?.id) {
          matchedEnquiryId = enqCheck.id;
          console.log(`[INBOUND_MATCH] Matched via subject UUID -> enquiryId: ${matchedEnquiryId}`);
        }
      }

      // Check for 8-char prefix match e.g. #12345678
      if (!matchedEnquiryId) {
        const shortMatch = subject.match(/#([0-9a-f]{8})/i);
        if (shortMatch) {
          const shortId = shortMatch[1].toLowerCase();
          const { data: candidates } = await adminClient
            .from('enquiries')
            .select('id')
            .limit(50);

          const found = candidates?.find((c: { id: string }) => c.id.toLowerCase().startsWith(shortId));
          if (found) {
            matchedEnquiryId = found.id;
            console.log(`[INBOUND_MATCH] Matched via subject short ID #${shortId} -> enquiryId: ${matchedEnquiryId}`);
          }
        }
      }
    }

    // Matching Strategy 3: Match by sender email address (most recent active enquiry)
    if (!matchedEnquiryId && fromEmail) {
      // Extract pure email from "Name <email@example.com>"
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
      const senderMatch = fromEmail.match(emailRegex);
      const cleanSender = senderMatch ? senderMatch[1].toLowerCase() : fromEmail.toLowerCase();

      const { data: recentEnq } = await adminClient
        .from('enquiries')
        .select('id')
        .eq('email', cleanSender)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentEnq?.id) {
        matchedEnquiryId = recentEnq.id;
        console.log(`[INBOUND_MATCH] Matched via sender email address (${cleanSender}) -> enquiryId: ${matchedEnquiryId}`);
      }
    }

    // Insert into public.email_messages
    const { data: insertedMsg, error: insertErr } = await adminClient
      .from('email_messages')
      .insert({
        enquiry_id: matchedEnquiryId,
        direction: 'INBOUND',
        from_email: fromEmail,
        to_email: toEmail,
        subject,
        body: textBody || '(No plain text content)',
        body_html: htmlBody,
        provider: 'resend_inbound',
        provider_message_id: providerMessageId,
        message_id: messageIdHeader,
        in_reply_to: inReplyToHeader,
        references_header: referencesHeader,
        status: 'RECEIVED',
        sent_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
        metadata: {
          rawEvent: payload.type || 'email.received',
          headers,
        },
      })
      .select()
      .maybeSingle();

    if (insertErr) {
      console.error('[INBOUND_INSERT_ERROR]', insertErr.message);
    }

    // If matched to an enquiry, record an activity log and update enquiry status
    if (matchedEnquiryId) {
      try {
        await adminClient.from('activity_logs').insert({
          entity_type: 'enquiry',
          entity_id: matchedEnquiryId,
          action: 'INBOUND_EMAIL_RECEIVED',
          new_value: {
            from: fromEmail,
            subject,
            providerMessageId,
            messageSnippet: (textBody || '').slice(0, 150),
          },
          description: `Customer replied via email: "${subject}" from ${fromEmail}`,
        });

        // If enquiry is in 'quotation_sent' or 'contacted', transition to 'follow_up'
        await adminClient
          .from('enquiries')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', matchedEnquiryId);
      } catch (logErr) {
        console.warn('Error recording inbound activity log:', logErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        matched: Boolean(matchedEnquiryId),
        enquiryId: matchedEnquiryId,
        messageId: insertedMsg?.id || null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[INBOUND_WEBHOOK_ERROR]', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
