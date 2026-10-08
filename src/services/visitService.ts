import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  FieldVisit,
  CreateVisitInput,
  UpdateVisitInput,
  VisitFilters,
} from '../types/database';
import { activityService } from './activityService';

export class VisitService {
  /**
   * Schedule a new field visit for a sales/service engineer.
   */
  async createVisit(input: CreateVisitInput): Promise<{
    visit: FieldVisit | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { visit: null, error: 'Database configuration is unavailable.' };
    }

    if (!input.enquiryId) {
      return { visit: null, error: 'Customer enquiry ID is required.' };
    }

    if (!input.staffId) {
      return { visit: null, error: 'Staff assignment is required.' };
    }

    if (!input.scheduledAt) {
      return { visit: null, error: 'Visit scheduled date and time are required.' };
    }

    try {
      const { data, error } = await supabase
        .from('field_visits')
        .insert({
          enquiry_id: input.enquiryId,
          staff_id: input.staffId,
          title: input.title.trim() || 'Client Site Visit',
          visit_purpose: input.visitPurpose || 'consultation',
          status: 'scheduled',
          scheduled_at: input.scheduledAt,
          customer_contact_person: input.customerContactPerson?.trim() || null,
          outcome_notes: input.notes?.trim() || null,
          created_by: input.createdBy || null,
        })
        .select(`
          *,
          enquiry:enquiries!field_visits_enquiry_id_fkey(id, name, company, email, phone),
          staff_profile:profiles!field_visits_staff_id_fkey(id, email, full_name, role)
        `)
        .single();

      if (error || !data) {
        return { visit: null, error: error?.message || 'Failed to schedule field visit.' };
      }

      await activityService.recordActivity({
        entityType: 'field_visit',
        entityId: data.id,
        action: 'VISIT_SCHEDULED',
        newValue: {
          title: data.title,
          scheduled_at: data.scheduled_at,
          staff_id: input.staffId,
          enquiry_id: input.enquiryId,
        },
        description: `Scheduled field visit: ${data.title}`,
        performedBy: input.createdBy || null,
      });

      return { visit: data as FieldVisit, error: null };
    } catch (err: unknown) {
      return {
        visit: null,
        error: err instanceof Error ? err.message : 'Unable to schedule visit.',
      };
    }
  }

  /**
   * Check in to a customer site visit (captures GPS coordinates).
   */
  async checkInVisit(
    id: string,
    coords: { lat: number; lng: number },
    address?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('field_visits')
        .update({
          status: 'in_progress',
          check_in_at: now,
          check_in_lat: coords.lat,
          check_in_lng: coords.lng,
          check_in_address: address || `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`,
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'field_visit',
        entityId: id,
        action: 'VISIT_CHECKED_IN',
        newValue: { check_in_at: now, lat: coords.lat, lng: coords.lng },
        description: `Checked in to client site (GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to check in.',
      };
    }
  }

  /**
   * Check out of a customer site visit, capturing duration, outcome, and photo evidence.
   */
  async checkOutVisit(
    id: string,
    coords: { lat: number; lng: number },
    outcomeNotes: string,
    photos: string[] = [],
    signatureUrl?: string,
    address?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    if (!outcomeNotes.trim()) {
      return { success: false, error: 'Visit outcome notes are required to complete visit.' };
    }

    try {
      // 1. Fetch check_in_at to calculate duration
      const { data: currentVisit } = await supabase
        .from('field_visits')
        .select('check_in_at')
        .eq('id', id)
        .maybeSingle();

      const now = new Date();
      let durationMinutes = 0;
      if (currentVisit?.check_in_at) {
        const checkInTime = new Date(currentVisit.check_in_at);
        durationMinutes = Math.max(1, Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60)));
      }

      const { error } = await supabase
        .from('field_visits')
        .update({
          status: 'completed',
          check_out_at: now.toISOString(),
          check_out_lat: coords.lat,
          check_out_lng: coords.lng,
          check_out_address: address || `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`,
          duration_minutes: durationMinutes,
          outcome_notes: outcomeNotes.trim(),
          photos,
          customer_signature_url: signatureUrl || null,
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'field_visit',
        entityId: id,
        action: 'VISIT_COMPLETED',
        newValue: {
          check_out_at: now.toISOString(),
          duration_minutes: durationMinutes,
          outcome_notes: outcomeNotes.trim(),
        },
        description: `Completed site visit (${durationMinutes} mins). Outcome: ${outcomeNotes.slice(0, 80)}`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to complete visit.',
      };
    }
  }

  /**
   * List visits with filters.
   */
  async getVisits(filters: VisitFilters = {}): Promise<{
    visits: FieldVisit[];
    total: number;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { visits: [], total: 0, error: 'Database configuration is unavailable.' };
    }

    const {
      enquiryId,
      staffId,
      status,
      purpose,
      dateFrom,
      dateTo,
      search,
      limit = 50,
      offset = 0,
    } = filters;

    try {
      let query = supabase
        .from('field_visits')
        .select(`
          *,
          enquiry:enquiries!field_visits_enquiry_id_fkey(id, name, company, email, phone),
          staff_profile:profiles!field_visits_staff_id_fkey(id, email, full_name, role)
        `, { count: 'exact' });

      if (enquiryId) {
        query = query.eq('enquiry_id', enquiryId);
      }

      if (staffId && staffId !== 'all') {
        query = query.eq('staff_id', staffId);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (purpose && purpose !== 'all') {
        query = query.eq('visit_purpose', purpose);
      }

      if (dateFrom) {
        query = query.gte('scheduled_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('scheduled_at', dateTo);
      }

      if (search?.trim()) {
        const term = search.trim();
        query = query.or(`title.ilike.%${term}%,customer_contact_person.ilike.%${term}%,outcome_notes.ilike.%${term}%`);
      }

      query = query
        .order('scheduled_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { visits: [], total: 0, error: error.message };
      }

      return {
        visits: (data || []) as FieldVisit[],
        total: count || 0,
        error: null,
      };
    } catch (err: unknown) {
      return {
        visits: [],
        total: 0,
        error: err instanceof Error ? err.message : 'Unable to load visits.',
      };
    }
  }

  /**
   * Update details of an existing field visit.
   */
  async updateVisit(
    id: string,
    input: UpdateVisitInput
  ): Promise<{ visit: FieldVisit | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { visit: null, error: 'Database configuration is unavailable.' };
    }

    try {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (input.title !== undefined) payload.title = input.title.trim();
      if (input.visitPurpose !== undefined) payload.visit_purpose = input.visitPurpose;
      if (input.scheduledAt !== undefined) payload.scheduled_at = input.scheduledAt;
      if (input.staffId !== undefined) payload.staff_id = input.staffId;
      if (input.customerContactPerson !== undefined) payload.customer_contact_person = input.customerContactPerson?.trim() || null;
      if (input.outcomeNotes !== undefined) payload.outcome_notes = input.outcomeNotes?.trim() || null;
      if (input.status !== undefined) payload.status = input.status;

      const { data, error } = await supabase
        .from('field_visits')
        .update(payload)
        .eq('id', id)
        .select(`
          *,
          enquiry:enquiries!field_visits_enquiry_id_fkey(id, name, company, email, phone),
          staff_profile:profiles!field_visits_staff_id_fkey(id, email, full_name, role)
        `)
        .single();

      if (error || !data) {
        return { visit: null, error: error?.message || 'Failed to update visit.' };
      }

      await activityService.recordActivity({
        entityType: 'field_visit',
        entityId: id,
        action: 'VISIT_UPDATED',
        description: `Updated field visit details: "${data.title}"`,
      });

      return { visit: data as FieldVisit, error: null };
    } catch (err: unknown) {
      return {
        visit: null,
        error: err instanceof Error ? err.message : 'Failed to update field visit.',
      };
    }
  }

  /**
   * Cancel an existing field visit with reason.
   */
  async cancelVisit(
    id: string,
    reason?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('field_visits')
        .update({
          status: 'cancelled',
          outcome_notes: reason ? `Cancelled: ${reason.trim()}` : 'Visit cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('title, enquiry_id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'field_visit',
        entityId: id,
        action: 'VISIT_CANCELLED',
        description: `Cancelled field visit "${data?.title || id}"${reason ? `: ${reason.trim()}` : ''}`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to cancel field visit.',
      };
    }
  }

  /**
   * Delete an existing field visit (admin or creator/assigned staff).
   */
  async deleteVisit(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const { data: visit } = await supabase
        .from('field_visits')
        .select('title')
        .eq('id', id)
        .maybeSingle();

      const { error } = await supabase
        .from('field_visits')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'field_visit',
        entityId: id,
        action: 'VISIT_DELETED',
        description: `Permanently deleted field visit "${visit?.title || id}"`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete visit.',
      };
    }
  }
}

export const visitService = new VisitService();
