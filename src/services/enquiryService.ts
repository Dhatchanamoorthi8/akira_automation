import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Enquiry,
  EnquiryStatus,
  EnquiryFilters,
  EnquiryWithDetails,
  StaffProfile,
  UpdateEnquiryInput,
} from '../types/database';
import { activityService } from './activityService';
import { emailService } from './emailService';

export interface CreateEnquiryInput {
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  industry?: string;
  productCategory?: string;
  specificProduct?: string;
  requirement?: string;
  message: string;
  source?: string;
  assignedTo?: string;
  status?: EnquiryStatus;
}

export interface StatusCounts {
  all: number;
  new: number;
  contacted: number;
  quotation_sent: number;
  follow_up: number;
  converted: number;
  closed: number;
}

export class EnquiryService {
  /**
   * Submit an inbound enquiry/RFQ from public web visitor or staff manual entry.
   * Safe for anonymous visitors and authenticated staff users.
   */
  async createEnquiry(input: CreateEnquiryInput): Promise<{ enquiry: Enquiry | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return {
        enquiry: null,
        error: 'Database configuration is unavailable. Unable to record enquiry.',
      };
    }

    if (!input.name || !input.name.trim()) {
      return { enquiry: null, error: 'Full name is required.' };
    }

    if (!input.email || !input.email.trim()) {
      return { enquiry: null, error: 'Valid business email is required.' };
    }

    if (!input.message || !input.message.trim()) {
      return { enquiry: null, error: 'Requirement description is required.' };
    }

    try {
      const enquiryId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `enq_${Date.now()}`;
      const subject = `Inquiry: ${input.specificProduct || input.productCategory || 'Gauging Requirement'} - ${input.companyName || input.name}`;

      let insertRes = await supabase
        .from('enquiries')
        .insert({
          id: enquiryId,
          name: input.name.trim(),
          company: input.companyName?.trim() || null,
          email: input.email.trim().toLowerCase(),
          phone: input.phone?.trim() || null,
          subject,
          message: input.message.trim(),
          industry: input.industry || null,
          product_category: input.productCategory || null,
          specific_product: input.specificProduct || null,
          requirement: input.requirement || null,
          status: input.status || 'new',
          source: input.source || 'website',
          assigned_to: input.assignedTo || null,
        });

      // If foreign key constraint fails on assigned_to, retry with null assigned_to
      if (insertRes.error && input.assignedTo && insertRes.error.message.includes('assigned_to')) {
        console.warn('Retrying enquiry creation without assigned_to due to constraint:', insertRes.error.message);
        insertRes = await supabase
          .from('enquiries')
          .insert({
            id: enquiryId,
            name: input.name.trim(),
            company: input.companyName?.trim() || null,
            email: input.email.trim().toLowerCase(),
            phone: input.phone?.trim() || null,
            subject,
            message: input.message.trim(),
            industry: input.industry || null,
            product_category: input.productCategory || null,
            specific_product: input.specificProduct || null,
            requirement: input.requirement || null,
            status: input.status || 'new',
            source: input.source || 'website',
            assigned_to: null,
          });
      }

      if (insertRes.error) {
        console.error('Create enquiry supabase error:', insertRes.error);
        return {
          enquiry: null,
          error: 'Unable to submit your enquiry. Please try again.',
        };
      }

      const createdEnquiry: Enquiry = {
        id: enquiryId,
        name: input.name.trim(),
        company: input.companyName?.trim() || null,
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        subject,
        message: input.message.trim(),
        industry: input.industry || null,
        product_category: input.productCategory || null,
        specific_product: input.specificProduct || null,
        requirement: input.requirement || null,
        status: input.status || 'new',
        source: input.source || 'website',
        assigned_to: input.assignedTo || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Asynchronously trigger admin notification and customer confirmation
      // The database assignment/insert has already succeeded; do not rollback if email provider fails
      emailService.notifyNewEnquiry(createdEnquiry).then((results) => {
        const failed = results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.warn('[EnquiryService] External email notification failed for some recipients:', failed);
        }
      }).catch((err) => {
        console.warn('[EnquiryService] Background email notification invocation error:', err);
      });

      return { enquiry: createdEnquiry, error: null };
    } catch {
      return {
        enquiry: null,
        error: 'Unable to submit your enquiry. Please check your connection and try again.',
      };
    }
  }

  /**
   * Retrieve list of enquiries for administrative review.
   * Restricted by RLS to authenticated admins only.
   */
  async getEnquiries(filters: EnquiryFilters = {}): Promise<{
    enquiries: EnquiryWithDetails[];
    total: number;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { enquiries: [], total: 0, error: 'Database configuration is unavailable.' };
    }

    const {
      search,
      status,
      source,
      assignedTo,
      dateFrom,
      dateTo,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
    } = filters;

    try {
      let query = supabase
        .from('enquiries')
        .select('*, assigned_profile:profiles!enquiries_assigned_to_fkey(id, email, full_name, role)', { count: 'exact' });

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`name.ilike.${term},company.ilike.${term},email.ilike.${term},phone.ilike.${term},subject.ilike.${term}`);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (source && source !== 'all') {
        query = query.eq('source', source);
      }

      if (assignedTo && assignedTo !== 'all') {
        if (assignedTo === 'unassigned') {
          query = query.is('assigned_to', null);
        } else {
          query = query.eq('assigned_to', assignedTo);
        }
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { enquiries: [], total: 0, error: error.message };
      }

      return {
        enquiries: (data || []) as EnquiryWithDetails[],
        total: count || 0,
        error: null,
      };
    } catch (err: unknown) {
      return {
        enquiries: [],
        total: 0,
        error: err instanceof Error ? err.message : 'Unable to load enquiries.',
      };
    }
  }

  /**
   * Fast, lightweight query for dropdown selectors (ID, name, company, email).
   * Omits heavy joins and exact table count scans.
   */
  async getEnquiryOptions(limit = 100): Promise<{
    options: { id: string; name: string; company: string | null; email: string }[];
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { options: [], error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('id, name, company, email')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { options: [], error: error.message };
      }

      return {
        options: (data || []) as { id: string; name: string; company: string | null; email: string }[],
        error: null,
      };
    } catch (err: unknown) {
      return {
        options: [],
        error: err instanceof Error ? err.message : 'Failed to load enquiry options.',
      };
    }
  }

  /**
   * Retrieve counts across each status for top-level filter tabs.
   */
  async getStatusCounts(assignedTo?: string): Promise<StatusCounts> {
    const defaultCounts: StatusCounts = {
      all: 0,
      new: 0,
      contacted: 0,
      quotation_sent: 0,
      follow_up: 0,
      converted: 0,
      closed: 0,
    };

    if (!isSupabaseConfigured()) return defaultCounts;

    try {
      let bAll = supabase.from('enquiries').select('*', { count: 'exact', head: true });
      let bNew = supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new');
      let bContacted = supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'contacted');
      let bQuote = supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'quotation_sent');
      let bFollow = supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'follow_up');
      let bConverted = supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'converted');
      let bClosed = supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'closed');

      if (assignedTo && assignedTo !== 'all') {
        bAll = bAll.eq('assigned_to', assignedTo);
        bNew = bNew.eq('assigned_to', assignedTo);
        bContacted = bContacted.eq('assigned_to', assignedTo);
        bQuote = bQuote.eq('assigned_to', assignedTo);
        bFollow = bFollow.eq('assigned_to', assignedTo);
        bConverted = bConverted.eq('assigned_to', assignedTo);
        bClosed = bClosed.eq('assigned_to', assignedTo);
      }

      const [allRes, newRes, contactedRes, quoteRes, followRes, convertedRes, closedRes] =
        await Promise.all([bAll, bNew, bContacted, bQuote, bFollow, bConverted, bClosed]);

      return {
        all: allRes.count || 0,
        new: newRes.count || 0,
        contacted: contactedRes.count || 0,
        quotation_sent: quoteRes.count || 0,
        follow_up: followRes.count || 0,
        converted: convertedRes.count || 0,
        closed: closedRes.count || 0,
      };
    } catch {
      return defaultCounts;
    }
  }

  /**
   * Retrieve single enquiry by UUID with assigned profile, follow-ups, and activity history.
   */
  async getEnquiryById(id: string): Promise<{ enquiry: EnquiryWithDetails | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { enquiry: null, error: 'Database configuration is unavailable.' };
    }

    try {
      // 1. Fetch enquiry with assigned staff profile
      const { data: enquiryData, error: enquiryError } = await supabase
        .from('enquiries')
        .select('*, assigned_profile:profiles!enquiries_assigned_to_fkey(id, email, full_name, role)')
        .eq('id', id)
        .maybeSingle();

      if (enquiryError || !enquiryData) {
        return { enquiry: null, error: enquiryError?.message || 'Enquiry not found.' };
      }

      // 2. Fetch associated followups
      const { data: followupsData } = await supabase
        .from('followups')
        .select('*')
        .eq('enquiry_id', id)
        .order('scheduled_at', { ascending: true });

      // 3. Fetch associated activity logs
      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', 'enquiry')
        .eq('entity_id', id)
        .order('created_at', { ascending: false });

      // 4. Fetch associated invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*, items:invoice_items(*)')
        .eq('enquiry_id', id)
        .order('created_at', { ascending: false });

      // 5. Fetch associated field visits
      const { data: visitsData } = await supabase
        .from('field_visits')
        .select('*, staff_profile:profiles!field_visits_staff_id_fkey(id, email, full_name, role)')
        .eq('enquiry_id', id)
        .order('scheduled_at', { ascending: false });

      return {
        enquiry: {
          ...enquiryData,
          followups: followupsData || [],
          activity_logs: activityData || [],
          invoices: invoicesData || [],
          field_visits: visitsData || [],
        } as EnquiryWithDetails,
        error: null,
      };
    } catch (err: unknown) {
      return {
        enquiry: null,
        error: err instanceof Error ? err.message : 'Unable to load enquiry details.',
      };
    }
  }

  /**
   * Convert an enquiry into a qualified Deal (Standard CRM conversion pattern).
   * Validates deal details and transitions status to 'converted'.
   */
  async convertEnquiry(
    id: string,
    input: {
      dealTitle: string;
      dealValue?: number;
      expectedCloseDate?: string;
      notes?: string;
      convertedBy?: string;
    }
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    if (!input.dealTitle || !input.dealTitle.trim()) {
      return { success: false, error: 'Deal title is required for CRM conversion.' };
    }

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('enquiries')
        .update({
          status: 'converted',
          deal_title: input.dealTitle.trim(),
          deal_value: input.dealValue || null,
          expected_close_date: input.expectedCloseDate || null,
          converted_at: now,
          converted_by: input.convertedBy || null,
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'enquiry',
        entityId: id,
        action: 'ENQUIRY_CONVERTED',
        newValue: {
          status: 'converted',
          deal_title: input.dealTitle.trim(),
          deal_value: input.dealValue,
          expected_close_date: input.expectedCloseDate,
        },
        description: `Lead converted to Deal: "${input.dealTitle.trim()}" (Value: ₹${(input.dealValue || 0).toLocaleString('en-IN')})`,
        performedBy: input.convertedBy || null,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to convert lead.',
      };
    }
  }

  /**
   * Close an enquiry with a mandatory Lost Reason (Standard CRM lost opportunity pattern).
   */
  async closeEnquiry(
    id: string,
    input: {
      lostReason: string;
      lostNotes?: string;
      closedBy?: string;
    }
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    if (!input.lostReason || !input.lostReason.trim()) {
      return { success: false, error: 'Please select a reason for closing the lead.' };
    }

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('enquiries')
        .update({
          status: 'closed',
          lost_reason: input.lostReason.trim(),
          lost_notes: input.lostNotes?.trim() || null,
          closed_at: now,
          closed_by: input.closedBy || null,
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'enquiry',
        entityId: id,
        action: 'ENQUIRY_CLOSED',
        newValue: {
          status: 'closed',
          lost_reason: input.lostReason.trim(),
          lost_notes: input.lostNotes?.trim() || null,
        },
        description: `Lead closed. Reason: ${input.lostReason.trim()}${input.lostNotes ? ` - ${input.lostNotes.trim()}` : ''}`,
        performedBy: input.closedBy || null,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to close lead.',
      };
    }
  }

  /**
   * Update enquiry lifecycle status (e.g. new -> contacted -> quotation_sent).
   */
  async updateEnquiryStatus(
    id: string,
    newStatus: EnquiryStatus,
    oldStatus?: EnquiryStatus
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    // Validate transition if oldStatus is provided
    if (oldStatus && oldStatus !== newStatus) {
      const VALID_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]> = {
        new: ['contacted', 'closed'],
        contacted: ['quotation_sent', 'follow_up', 'closed'],
        quotation_sent: ['follow_up', 'converted', 'closed'],
        follow_up: ['quotation_sent', 'converted', 'closed'],
        converted: ['closed'],
        closed: ['new', 'contacted'],
      };

      const allowed = VALID_TRANSITIONS[oldStatus] || [];
      if (!allowed.includes(newStatus)) {
        return {
          success: false,
          error: `Invalid status transition from "${oldStatus}" to "${newStatus}".`,
        };
      }
    }

    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Audit log
      await activityService.recordActivity({
        entityType: 'enquiry',
        entityId: id,
        action: 'ENQUIRY_STATUS_CHANGED',
        oldValue: oldStatus ? { status: oldStatus } : undefined,
        newValue: { status: newStatus },
        description: `Enquiry status transitioned from ${oldStatus || 'unknown'} to ${newStatus.toUpperCase()}`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error updating enquiry status.',
      };
    }
  }

  /**
   * Assign enquiry to a specific staff/admin profile.
   */
  async assignEnquiry(
    id: string,
    profileId: string | null,
    staffName?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      // Step 1: Inspect current enquiry assignment to check for duplicates
      const { enquiry: currentEnquiry } = await this.getEnquiryById(id);
      if (currentEnquiry && currentEnquiry.assigned_to === profileId) {
        // No assignment change (Staff A -> Staff A); suppress duplicate notifications
        return { success: true, error: null };
      }

      const previousStaffId = currentEnquiry?.assigned_to || null;

      // Step 2: Update database record
      const { error } = await supabase
        .from('enquiries')
        .update({ assigned_to: profileId })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Step 2b: Automatically create or reassign open follow-up task so staff immediately sees action items
      try {
        if (profileId) {
          const { data: openFollowups } = await supabase
            .from('followups')
            .select('id')
            .eq('enquiry_id', id)
            .not('status', 'in', '(completed,cancelled)')
            .limit(1);

          if (openFollowups && openFollowups.length > 0) {
            await supabase
              .from('followups')
              .update({ assigned_to: profileId, updated_at: new Date().toISOString() })
              .eq('id', openFollowups[0].id);
          } else {
            const todayDate = new Date().toISOString().slice(0, 10);
            await supabase.from('followups').insert({
              enquiry_id: id,
              assigned_to: profileId,
              title: `Initial Follow-up: ${currentEnquiry?.company || currentEnquiry?.name || 'Customer Lead'}`,
              description: `Assigned to ${staffName || 'sales team'} for follow-up and requirement qualification.`,
              type: 'call',
              status: 'due_today',
              priority: 'high',
              scheduled_at: new Date().toISOString(),
              due_date: todayDate,
              notes: currentEnquiry?.requirement || currentEnquiry?.message || 'Contact customer to qualify metrology requirement.',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          await supabase
            .from('followups')
            .update({ assigned_to: null, updated_at: new Date().toISOString() })
            .eq('enquiry_id', id)
            .not('status', 'in', '(completed,cancelled)');
        }
      } catch (err) {
        console.warn('[EnquiryService] Follow-up auto-assignment error:', err);
      }

      // Step 3: Audit log assignment change
      await activityService.recordActivity({
        entityType: 'enquiry',
        entityId: id,
        action: profileId ? 'ENQUIRY_ASSIGNED' : 'ENQUIRY_UNASSIGNED',
        oldValue: { assigned_to: previousStaffId },
        newValue: { assigned_to: profileId, staff_name: staffName },
        description: profileId
          ? `Enquiry assigned to ${staffName || profileId}`
          : 'Enquiry unassigned',
      });

      // Step 4: Asynchronously dispatch email notification if assigned to staff
      if (profileId) {
        (async () => {
          try {
            // Fetch updated enquiry and recipient staff profile
            const [enqRes, staffRes, adminAuth] = await Promise.all([
              this.getEnquiryById(id),
              supabase.from('profiles').select('id, email, full_name, role').eq('id', profileId).maybeSingle(),
              supabase.auth.getUser(),
            ]);

            const enquiry = enqRes.enquiry;
            const staffData = staffRes.data;

            if (enquiry && staffData) {
              // Resolve admin name who performed the assignment
              let adminName = 'AKIRA Operations Admin';
              if (adminAuth.data?.user?.id) {
                const { data: adminProf } = await supabase
                  .from('profiles')
                  .select('full_name, email')
                  .eq('id', adminAuth.data.user.id)
                  .maybeSingle();
                if (adminProf?.full_name) {
                  adminName = adminProf.full_name;
                }
              }

              const sendResult = await emailService.notifyEnquiryAssigned(
                enquiry,
                staffData as StaffProfile,
                adminName
              );

              // If email failed, do NOT rollback assignment; record EMAIL_FAILED log
              if (!sendResult.success) {
                await activityService.recordActivity({
                  entityType: 'email_dispatch',
                  entityId: id,
                  action: 'EMAIL_FAILED',
                  newValue: {
                    eventType: 'enquiry_assigned',
                    recipient: staffData.email,
                    enquiryId: id,
                    error: sendResult.error || 'Provider delivery failure',
                  },
                  description: `Assignment email failed to deliver to ${staffData.email}: ${sendResult.error || 'Network error'}`,
                });
              }
            }
          } catch (mailErr: unknown) {
            console.warn('[EnquiryService] Asynchronous email dispatch exception:', mailErr);
          }
        })();
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error assigning enquiry.',
      };
    }
  }

  /**
   * Load active staff profiles for assignment selector.
   */
  async getAdminProfiles(): Promise<StaffProfile[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('active', true)
        .order('full_name', { ascending: true });

      if (error || !data) return [];
      return data as StaffProfile[];
    } catch {
      return [];
    }
  }

  /**
   * Update enquiry contact details, requirement, or notes.
   */
  async updateEnquiry(
    id: string,
    input: UpdateEnquiryInput
  ): Promise<{ success: boolean; enquiry: Enquiry | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, enquiry: null, error: 'Database configuration is unavailable.' };
    }

    try {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (input.name !== undefined) payload.name = input.name.trim();
      if (input.company !== undefined) payload.company = input.company?.trim() || null;
      if (input.email !== undefined) payload.email = input.email.trim().toLowerCase();
      if (input.phone !== undefined) payload.phone = input.phone?.trim() || null;
      if (input.subject !== undefined) payload.subject = input.subject?.trim() || null;
      if (input.message !== undefined) payload.message = input.message.trim();
      if (input.industry !== undefined) payload.industry = input.industry || null;
      if (input.product_category !== undefined) payload.product_category = input.product_category || null;
      if (input.specific_product !== undefined) payload.specific_product = input.specific_product || null;
      if (input.requirement !== undefined) payload.requirement = input.requirement || null;
      if (input.source !== undefined) payload.source = input.source;

      const { data, error } = await supabase
        .from('enquiries')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, enquiry: null, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'enquiry',
        entityId: id,
        action: 'ENQUIRY_UPDATED',
        newValue: payload,
        description: `Enquiry details updated for ${data.name}${data.company ? ` (${data.company})` : ''}`,
      });

      return { success: true, enquiry: data as Enquiry, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        enquiry: null,
        error: err instanceof Error ? err.message : 'Failed to update enquiry.',
      };
    }
  }

  /**
   * Delete an enquiry and associated CRM records (admin-restricted).
   */
  async deleteEnquiry(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      // 1. Fetch enquiry name/company for audit log before deletion
      const { data: enq } = await supabase
        .from('enquiries')
        .select('name, company')
        .eq('id', id)
        .maybeSingle();

      // 2. Delete the record
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // 3. Record audit activity
      await activityService.recordActivity({
        entityType: 'enquiry',
        entityId: id,
        action: 'ENQUIRY_DELETED',
        description: `Permanently deleted lead record "${enq?.name || id}"${enq?.company ? ` (${enq.company})` : ''}`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete enquiry.',
      };
    }
  }
}

export const enquiryService = new EnquiryService();
