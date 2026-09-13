import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Enquiry,
  EnquiryStatus,
  EnquiryFilters,
  EnquiryWithDetails,
  StaffProfile,
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
   * Submit an inbound enquiry/RFQ from public web visitor.
   * Safe for anonymous visitors; RLS allows insert for anon role.
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

      const { error } = await supabase
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
          status: 'new',
          source: input.source || 'website',
        });

      if (error) {
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
        status: 'new',
        source: input.source || 'website',
        assigned_to: null,
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

      return {
        enquiry: {
          ...enquiryData,
          followups: followupsData || [],
          activity_logs: activityData || [],
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
}

export const enquiryService = new EnquiryService();
