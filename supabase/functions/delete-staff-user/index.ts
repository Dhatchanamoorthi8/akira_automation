/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error('Required Supabase Edge Function secrets are not configured.');
      return jsonResponse({ error: 'User deletion is not configured on the server.' }, 500);
    }

    const authorization = req.headers.get('Authorization');
    const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!accessToken) {
      return jsonResponse({ error: 'Authentication is required.' }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey);
    const {
      data: { user: caller },
      error: authError,
    } = await userClient.auth.getUser(accessToken);

    if (authError || !caller) {
      return jsonResponse({ error: 'Your session is invalid or expired. Please sign in again.' }, 401);
    }

    let body: { userId?: unknown };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'A valid JSON request body is required.' }, 400);
    }

    const userId = body.userId;
    if (typeof userId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return jsonResponse({ error: 'A valid target user ID is required.' }, 400);
    }

    if (userId === caller.id) {
      return jsonResponse({ error: 'You cannot delete your own account.' }, 403);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerProfile, error: callerProfileError } = await adminClient
      .from('profiles')
      .select('role, active')
      .eq('id', caller.id)
      .maybeSingle();

    if (callerProfileError) {
      console.error('Failed to verify administrator profile:', callerProfileError.message);
      return jsonResponse({ error: 'Unable to verify administrator permissions.' }, 500);
    }

    if (callerProfile?.role !== 'admin' || !callerProfile.active) {
      return jsonResponse({ error: 'Active administrator privileges are required.' }, 403);
    }

    const { data: targetProfile, error: targetError } = await adminClient
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (targetError) {
      console.error('Failed to load target profile:', targetError.message);
      return jsonResponse({ error: 'Unable to load the user account for deletion.' }, 500);
    }

    if (!targetProfile) {
      return jsonResponse({ error: 'The user account no longer exists.' }, 404);
    }

    const [enquiriesResult, followupsResult, visitsResult, attendanceResult] = await Promise.all([
      adminClient
        .from('enquiries')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', userId),
      adminClient
        .from('followups')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', userId),
      adminClient
        .from('field_visits')
        .select('id', { count: 'exact', head: true })
        .eq('staff_id', userId),
      adminClient
        .from('staff_attendance')
        .select('id', { count: 'exact', head: true })
        .eq('staff_id', userId),
    ]);

    if (enquiriesResult.error || followupsResult.error || visitsResult.error || attendanceResult.error) {
      console.error('Failed to verify user CRM dependencies:', {
        enquiries: enquiriesResult.error?.message,
        followups: followupsResult.error?.message,
        fieldVisits: visitsResult.error?.message,
        attendance: attendanceResult.error?.message,
      });
      return jsonResponse({ error: 'Unable to verify user history. The account was not deleted.' }, 500);
    }

    const enquiriesCount = enquiriesResult.count ?? 0;
    const followupsCount = followupsResult.count ?? 0;
    const fieldVisitsCount = visitsResult.count ?? 0;
    const attendanceCount = attendanceResult.count ?? 0;
    if (enquiriesCount > 0 || followupsCount > 0 || fieldVisitsCount > 0 || attendanceCount > 0) {
      return jsonResponse({
        error: `Cannot delete this account because it has ${enquiriesCount} enquiry assignments, ${followupsCount} follow-ups, ${fieldVisitsCount} field visits, and ${attendanceCount} attendance records. Deactivate it instead to preserve history.`,
      }, 409);
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Supabase Auth user deletion failed:', deleteError.message);
      return jsonResponse({ error: `Unable to delete the authentication account: ${deleteError.message}` }, 400);
    }

    const { error: auditError } = await adminClient.from('activity_logs').insert({
      entity_type: 'profile',
      entity_id: userId,
      action: 'USER_DELETED',
      old_value: { email: targetProfile.email, fullName: targetProfile.full_name },
      description: `Permanently deleted user: ${targetProfile.full_name || targetProfile.email}`,
      performed_by: caller.id,
    });

    if (auditError) {
      console.error('User was deleted, but the audit log could not be recorded:', auditError.message);
      return jsonResponse({
        success: true,
        warning: 'The user was deleted, but the audit log could not be recorded.',
      });
    }

    return jsonResponse({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error.';
    console.error('Unexpected user deletion failure:', message);
    return jsonResponse({ error: 'An unexpected server error prevented user deletion.' }, 500);
  }
});
