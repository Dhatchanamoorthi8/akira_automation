import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Followup,
  FollowupStatus,
  FollowupType,
  FollowupPriority,
  FollowupFilters,
  FollowupWithEnquiry,
} from '../types/database';
import { activityService } from './activityService';
import { emailService } from './emailService';
import { StaffProfile } from '../types/database';

export interface CreateFollowupInput {
  enquiryId: string;
  scheduledAt: string;
  type?: FollowupType;
  title?: string;
  description?: string;
  assignedTo?: string | null;
  dueDate?: string;
  dueTime?: string;
  priority?: FollowupPriority;
  notes?: string;
  createdBy?: string;
}

export interface UpdateFollowupInput {
  title?: string;
  description?: string;
  assignedTo?: string | null;
  dueDate?: string;
  dueTime?: string;
  priority?: FollowupPriority;
  scheduledAt?: string;
  type?: FollowupType;
  status?: FollowupStatus;
  notes?: string;
  outcome?: string;
  nextFollowupAt?: string;
  completedBy?: string | null;
  cancellationReason?: string;
}

export class FollowupService {
  /**
   * List follow-up entries with comprehensive filtering by status, timeframe, priority,
   * assigned staff, or enquiry ID. Includes parent customer enquiry and staff profiles.
   */
  async getFollowups(filters: FollowupFilters = {}): Promise<{
    followups: FollowupWithEnquiry[];
    total: number;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { followups: [], total: 0, error: 'Database configuration is unavailable.' };
    }

    const {
      enquiryId,
      assignedTo,
      status,
      type,
      priority,
      timeframe,
      dateFrom,
      dateTo,
      search,
      sortBy = 'scheduled_at',
      sortOrder = 'asc',
      limit = 50,
      offset = 0,
    } = filters;

    try {
      const now = new Date();
      const nowIso = now.toISOString();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

      let query = supabase
        .from('followups')
        .select(`
          *,
          enquiry:enquiries!followups_enquiry_id_fkey(id, name, company, email, phone),
          creator_profile:profiles!followups_created_by_fkey(id, email, full_name, role),
          assigned_profile:profiles!followups_assigned_to_fkey(id, email, full_name, role)
        `, { count: 'exact' });

      if (enquiryId) {
        query = query.eq('enquiry_id', enquiryId);
      }

      if (assignedTo && assignedTo !== 'all') {
        if (assignedTo === 'unassigned') {
          query = query.is('assigned_to', null);
        } else {
          query = query.eq('assigned_to', assignedTo);
        }
      }

      if (type && type !== 'all') {
        query = query.eq('type', type);
      }

      if (priority && priority !== 'all') {
        query = query.eq('priority', priority);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Timeframe logic
      if (timeframe === 'overdue') {
        query = query
          .lt('scheduled_at', nowIso)
          .not('status', 'in', '(completed,cancelled)');
      } else if (timeframe === 'today') {
        query = query
          .gte('scheduled_at', startOfDay)
          .lte('scheduled_at', endOfDay)
          .not('status', 'in', '(completed,cancelled)');
      } else if (timeframe === 'upcoming') {
        query = query
          .gt('scheduled_at', nowIso)
          .not('status', 'in', '(completed,cancelled)');
      } else if (timeframe === 'completed') {
        query = query.eq('status', 'completed');
      } else if (timeframe === 'cancelled') {
        query = query.eq('status', 'cancelled');
      }

      if (dateFrom) {
        query = query.gte('scheduled_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('scheduled_at', dateTo);
      }

      if (search?.trim()) {
        const term = search.trim();
        query = query.or(`title.ilike.%${term}%,notes.ilike.%${term}%,description.ilike.%${term}%`);
      }

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        // Fallback gracefully if assigned_profile relation or extended fields are still migrating
        const fallbackQuery = await supabase
          .from('followups')
          .select('*, enquiry:enquiries!followups_enquiry_id_fkey(id, name, company, email, phone), creator_profile:profiles!followups_created_by_fkey(id, email, full_name, role)', { count: 'exact' })
          .order(sortBy, { ascending: sortOrder === 'asc' })
          .range(offset, offset + limit - 1);

        if (!fallbackQuery.error && fallbackQuery.data) {
          return {
            followups: fallbackQuery.data as FollowupWithEnquiry[],
            total: fallbackQuery.count || 0,
            error: null,
          };
        }

        return { followups: [], total: 0, error: error.message };
      }

      return {
        followups: (data || []) as FollowupWithEnquiry[],
        total: count || 0,
        error: null,
      };
    } catch (err: unknown) {
      return {
        followups: [],
        total: 0,
        error: err instanceof Error ? err.message : 'Unable to load follow-ups.',
      };
    }
  }

  /**
   * Retrieve single follow-up by UUID with full relations.
   */
  async getFollowupById(id: string): Promise<{ followup: FollowupWithEnquiry | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { followup: null, error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('followups')
        .select(`
          *,
          enquiry:enquiries!followups_enquiry_id_fkey(id, name, company, email, phone, specific_product, status),
          creator_profile:profiles!followups_created_by_fkey(id, email, full_name, role),
          assigned_profile:profiles!followups_assigned_to_fkey(id, email, full_name, role)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        // Fallback without assigned_profile relation if migration is pending
        const { data: fallbackData } = await supabase
          .from('followups')
          .select('*, enquiry:enquiries!followups_enquiry_id_fkey(id, name, company, email, phone), creator_profile:profiles!followups_created_by_fkey(id, email, full_name, role)')
          .eq('id', id)
          .maybeSingle();

        if (fallbackData) {
          return { followup: fallbackData as FollowupWithEnquiry, error: null };
        }
        return { followup: null, error: error?.message || 'Follow-up record not found.' };
      }

      return { followup: data as FollowupWithEnquiry, error: null };
    } catch (err: unknown) {
      return {
        followup: null,
        error: err instanceof Error ? err.message : 'Unable to load follow-up details.',
      };
    }
  }

  /**
   * Create a new follow-up task and append audit trail.
   */
  async createFollowup(input: CreateFollowupInput): Promise<{ followup: Followup | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { followup: null, error: 'Database configuration is unavailable.' };
    }

    if (!input.enquiryId) {
      return { followup: null, error: 'Customer inquiry ID is required.' };
    }

    if (!input.scheduledAt) {
      return { followup: null, error: 'Follow-up date and time are required.' };
    }

    const dueDate = input.dueDate || input.scheduledAt.slice(0, 10);
    const dueTime = input.dueTime || new Date(input.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const payload: Record<string, unknown> = {
        enquiry_id: input.enquiryId,
        scheduled_at: input.scheduledAt,
        type: input.type || 'call',
        status: 'upcoming',
        notes: input.notes?.trim() || null,
        created_by: input.createdBy || null,
        title: input.title?.trim() || `Follow-up on enquiry`,
        description: input.description?.trim() || input.notes?.trim() || null,
        assigned_to: input.assignedTo || null,
        due_date: dueDate,
        due_time: dueTime,
        priority: input.priority || 'medium',
      };

      const { data, error } = await supabase
        .from('followups')
        .insert(payload)
        .select()
        .single();

      if (error) {
        // Fallback for pre-migration schema if new columns are not yet recognized
        const basicPayload = {
          enquiry_id: input.enquiryId,
          scheduled_at: input.scheduledAt,
          type: input.type || 'call',
          status: 'upcoming',
          notes: input.notes?.trim() || null,
          created_by: input.createdBy || null,
        };

        const fallback = await supabase
          .from('followups')
          .insert(basicPayload)
          .select()
          .single();

        if (fallback.error) {
          return { followup: null, error: fallback.error.message };
        }

        return { followup: fallback.data as Followup, error: null };
      }

      // Record activity log
      await activityService.recordActivity({
        entityType: 'enquiry',
        entityId: input.enquiryId,
        action: 'FOLLOWUP_CREATED',
        newValue: {
          followup_id: data.id,
          title: data.title,
          scheduled_at: data.scheduled_at,
          type: data.type,
          priority: data.priority,
          assigned_to: data.assigned_to,
        },
        description: `Scheduled ${data.type.toUpperCase()} follow-up: "${data.title || 'Review'}" (${data.priority?.toUpperCase() || 'NORMAL'} priority)`,
      });

      // Trigger asynchronous staff notification if assigned
      if (data.assigned_to) {
        Promise.all([
          supabase.from('enquiries').select('*').eq('id', input.enquiryId).maybeSingle(),
          supabase.from('profiles').select('id, email, full_name, role').eq('id', data.assigned_to).maybeSingle(),
        ]).then(([{ data: enqData }, { data: staffData }]) => {
          if (enqData && staffData) {
            emailService.notifyFollowupAssigned(data as Followup, enqData, staffData as StaffProfile).catch((err) => {
              console.warn('[FollowupService] Follow-up assignment email warning:', err);
            });
          }
        }).catch((err) => {
          console.warn('[FollowupService] Unable to dispatch follow-up email notification:', err);
        });
      }

      return { followup: data as Followup, error: null };
    } catch (err: unknown) {
      return {
        followup: null,
        error: err instanceof Error ? err.message : 'Network failure scheduling follow-up.',
      };
    }
  }

  /**
   * Update existing follow-up details (reschedule, notes, priority, reassign).
   */
  async updateFollowup(
    id: string,
    updates: UpdateFollowupInput,
    enquiryId?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
      if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
      if (updates.dueTime !== undefined) payload.due_time = updates.dueTime;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.scheduledAt !== undefined) payload.scheduled_at = updates.scheduledAt;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.outcome !== undefined) payload.outcome = updates.outcome;
      if (updates.nextFollowupAt !== undefined) payload.next_followup_at = updates.nextFollowupAt;
      if (updates.completedBy !== undefined) payload.completed_by = updates.completedBy;

      const { data, error } = await supabase
        .from('followups')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const targetEnquiryId = enquiryId || data?.enquiry_id;
      if (targetEnquiryId) {
        await activityService.recordActivity({
          entityType: 'enquiry',
          entityId: targetEnquiryId,
          action: 'FOLLOWUP_UPDATED',
          newValue: payload,
          description: `Follow-up updated: ${data.title || id}`,
        });
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update follow-up.',
      };
    }
  }

  /**
   * Complete a follow-up with recording of customer outcome and completed_by.
   */
  async completeFollowup(
    id: string,
    outcome: string,
    enquiryId?: string,
    completedBy?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const payload: Record<string, unknown> = {
        status: 'completed',
        outcome: outcome.trim(),
        completed_at: new Date().toISOString(),
      };
      if (completedBy) {
        payload.completed_by = completedBy;
      }

      const { data, error } = await supabase
        .from('followups')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Retry without completed_by if column is pending migration
        const { data: retryData, error: retryError } = await supabase
          .from('followups')
          .update({
            status: 'completed',
            outcome: outcome.trim(),
            completed_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (retryError) {
          return { success: false, error: retryError.message };
        }

        const targetEnquiryId = enquiryId || retryData?.enquiry_id;
        if (targetEnquiryId) {
          await activityService.recordActivity({
            entityType: 'enquiry',
            entityId: targetEnquiryId,
            action: 'FOLLOWUP_COMPLETED',
            newValue: { followup_id: id, outcome: outcome.trim() },
            description: `Follow-up completed. Outcome: ${outcome.trim()}`,
          });
        }
        return { success: true, error: null };
      }

      const targetEnquiryId = enquiryId || data?.enquiry_id;
      if (targetEnquiryId) {
        await activityService.recordActivity({
          entityType: 'enquiry',
          entityId: targetEnquiryId,
          action: 'FOLLOWUP_COMPLETED',
          newValue: { followup_id: id, outcome: outcome.trim() },
          description: `Follow-up completed. Outcome: ${outcome.trim()}`,
        });
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error completing follow-up.',
      };
    }
  }

  /**
   * Cancel an existing follow-up with reason and audit logging.
   */
  async cancelFollowup(
    id: string,
    reason?: string,
    enquiryId?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const payload: Record<string, unknown> = {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason?.trim() || null,
      };

      const { data, error } = await supabase
        .from('followups')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Fallback without cancelled_at / cancellation_reason if column is pending
        const { data: retryData, error: retryError } = await supabase
          .from('followups')
          .update({ status: 'cancelled' })
          .eq('id', id)
          .select()
          .single();

        if (retryError) {
          return { success: false, error: retryError.message };
        }

        const targetEnquiryId = enquiryId || retryData?.enquiry_id;
        if (targetEnquiryId) {
          await activityService.recordActivity({
            entityType: 'enquiry',
            entityId: targetEnquiryId,
            action: 'FOLLOWUP_CANCELLED',
            newValue: { followup_id: id, reason: reason?.trim() },
            description: `Follow-up cancelled${reason ? `: ${reason.trim()}` : ''}`,
          });
        }
        return { success: true, error: null };
      }

      const targetEnquiryId = enquiryId || data?.enquiry_id;
      if (targetEnquiryId) {
        await activityService.recordActivity({
          entityType: 'enquiry',
          entityId: targetEnquiryId,
          action: 'FOLLOWUP_CANCELLED',
          newValue: { followup_id: id, reason: reason?.trim() },
          description: `Follow-up cancelled${reason ? `: ${reason.trim()}` : ''}`,
        });
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network failure cancelling follow-up.',
      };
    }
  }

  /**
   * Schedule the next successive follow-up task.
   */
  async scheduleNextFollowup(
    currentFollowupId: string,
    enquiryId: string,
    nextDate: string,
    type: FollowupType = 'call',
    notes?: string,
    assignedTo?: string | null,
    title?: string,
    priority?: FollowupPriority
  ): Promise<{ followup: Followup | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { followup: null, error: 'Database configuration is unavailable.' };
    }

    // Link current follow-up with next timestamp
    await supabase
      .from('followups')
      .update({ next_followup_at: nextDate })
      .eq('id', currentFollowupId);

    // Create next follow-up
    return this.createFollowup({
      enquiryId,
      scheduledAt: nextDate,
      type,
      notes,
      assignedTo,
      title: title || `Next touchpoint (${type})`,
      priority: priority || 'medium',
    });
  }
}

export const followupService = new FollowupService();
