/// <reference path="../deno.d.ts" />
// Supabase Edge Function: resend-webhook
// Processes delivery tracking webhooks from Resend (email.sent, email.delivered, email.bounced, email.complained).
// Updates public.email_messages.status and logs delivery status changes.

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
    const eventType = payload.type || payload.event || 'unknown';
    const emailData = payload.data || payload;
    const providerMessageId = emailData.email_id || emailData.id || null;

    console.log(`[RESEND_WEBHOOK_EVENT] Type: ${eventType} MessageID: ${providerMessageId}`);

    if (!providerMessageId) {
      return new Response(
        JSON.stringify({ success: true, message: 'Event received without message ID. Skipped.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let mappedStatus: string | null = null;
    let errorMessage: string | null = null;
    let deliveredAt: string | null = null;

    switch (eventType) {
      case 'email.sent':
        mappedStatus = 'SENT';
        break;
      case 'email.delivered':
        mappedStatus = 'DELIVERED';
        deliveredAt = new Date().toISOString();
        break;
      case 'email.delivery_delayed':
        mappedStatus = 'SENDING';
        break;
      case 'email.bounced':
        mappedStatus = 'BOUNCED';
        errorMessage = emailData.bounce?.message || 'Message bounced by destination mail exchanger';
        break;
      case 'email.complained':
        mappedStatus = 'BOUNCED';
        errorMessage = 'Spam complaint recorded by recipient';
        break;
      case 'email.failed':
        mappedStatus = 'FAILED';
        errorMessage = emailData.error?.message || 'Delivery failed';
        break;
      default:
        console.log(`[RESEND_WEBHOOK_UNHANDLED] Event type: ${eventType}`);
        break;
    }

    if (mappedStatus) {
      const updateData: Record<string, unknown> = {
        status: mappedStatus,
      };

      if (deliveredAt) {
        updateData.delivered_at = deliveredAt;
      }
      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      const { data: updatedMsg, error: updateErr } = await adminClient
        .from('email_messages')
        .update(updateData)
        .eq('provider_message_id', providerMessageId)
        .select('id, enquiry_id, status')
        .maybeSingle();

      if (updateErr) {
        console.error('[WEBHOOK_UPDATE_ERROR]', updateErr.message);
      } else if (updatedMsg) {
        console.log(`[STATUS_UPDATED] Message ${updatedMsg.id} status changed to ${mappedStatus}`);

        // Record audit activity if bounced or failed
        if (mappedStatus === 'BOUNCED' || mappedStatus === 'FAILED') {
          await adminClient.from('activity_logs').insert({
            entity_type: 'email_delivery',
            entity_id: updatedMsg.enquiry_id || updatedMsg.id,
            action: mappedStatus === 'BOUNCED' ? 'EMAIL_BOUNCED' : 'EMAIL_DELIVERY_FAILED',
            new_value: {
              providerMessageId,
              status: mappedStatus,
              errorMessage,
              eventType,
            },
            description: `Email delivery status update: [${mappedStatus}] ${errorMessage || 'No error details'}`,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, eventType, providerMessageId, mappedStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[RESEND_WEBHOOK_ERROR]', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
