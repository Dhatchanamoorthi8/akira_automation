import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ActivityLogWithActor, ActivityFilters } from '../types/database';

export interface FieldDiff {
  field: string;
  from: unknown;
  to: unknown;
}

export class ActivityService {
  /**
   * Retrieve chronological activity history for the audit trail.
   * Restricted by RLS to authenticated administrators (and staff for their own activities/enquiries).
   */
  async getActivityHistory(filters: ActivityFilters = {}): Promise<{
    logs: ActivityLogWithActor[];
    total: number;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { logs: [], total: 0, error: 'Database configuration is unavailable.' };
    }

    const {
      limit = 50,
      offset = 0,
      entityType,
      entityId,
      action,
      performedBy,
      search,
      dateFrom,
      dateTo,
    } = filters;

    try {
      let query = supabase
        .from('activity_logs')
        .select('*, actor_profile:profiles!activity_logs_performed_by_fkey(id, email, full_name, role)', { count: 'exact' });

      if (entityType && entityType !== 'all') {
        query = query.eq('entity_type', entityType);
      }

      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      if (action && action !== 'all') {
        query = query.eq('action', action);
      }

      if (performedBy && performedBy !== 'all') {
        query = query.eq('performed_by', performedBy);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      if (search && search.trim()) {
        const term = search.trim();
        query = query.or(`description.ilike.%${term}%,action.ilike.%${term}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { logs: [], total: 0, error: error.message };
      }

      return {
        logs: (data || []) as ActivityLogWithActor[],
        total: count || 0,
        error: null,
      };
    } catch (err: unknown) {
      return {
        logs: [],
        total: 0,
        error: err instanceof Error ? err.message : 'Unable to load activity logs.',
      };
    }
  }

  /**
   * Retrieve audit history records specific to a given entity (e.g. product or enquiry).
   */
  async getEntityHistory(entityType: string, entityId: string): Promise<{ logs: ActivityLogWithActor[]; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { logs: [], error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, actor_profile:profiles!activity_logs_performed_by_fkey(id, email, full_name, role)')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) {
        return { logs: [], error: error.message };
      }

      return { logs: (data || []) as ActivityLogWithActor[], error: null };
    } catch (err: unknown) {
      return {
        logs: [],
        error: err instanceof Error ? err.message : 'Unable to load entity history.',
      };
    }
  }

  /**
   * Controlled internal helper to record operational events.
   * Fail-safe: recording errors will never throw or disrupt the calling transaction.
   */
  async recordActivity(input: {
    entityType: string;
    entityId?: string | null;
    action: string;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
    description?: string | null;
    performedBy?: string | null;
  }): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      let actorId = input.performedBy;
      if (!actorId) {
        const { data: userData } = await supabase.auth.getUser();
        actorId = userData?.user?.id || null;
      }

      await supabase.from('activity_logs').insert({
        entity_type: input.entityType,
        entity_id: input.entityId || null,
        action: input.action,
        old_value: input.oldValue || null,
        new_value: input.newValue || null,
        metadata: input.metadata || null,
        description: input.description || null,
        performed_by: actorId,
      });
    } catch {
      // Activity logging failure should not abort the primary transaction
    }
  }

  /**
   * Helper utility to calculate differences between two objects for audit metadata.
   */
  computeDiff(
    oldObj?: Record<string, unknown> | null,
    newObj?: Record<string, unknown> | null,
    ignoredKeys: string[] = ['updated_at', 'created_at']
  ): FieldDiff[] {
    if (!oldObj || !newObj) return [];
    const diffs: FieldDiff[] = [];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    allKeys.forEach((key) => {
      if (ignoredKeys.includes(key)) return;
      const oldVal = oldObj[key];
      const newVal = newObj[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diffs.push({
          field: key,
          from: oldVal,
          to: newVal,
        });
      }
    });

    return diffs;
  }
}

export const activityService = new ActivityService();
