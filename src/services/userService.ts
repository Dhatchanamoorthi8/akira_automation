import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Profile,
  UserRole,
  UserFilters,
  CreateStaffUserInput,
  UpdateUserInput,
  StaffProfile,
} from '../types/database';
import { activityService } from './activityService';

export class UserService {
  /**
   * List user profiles with multi-field search and role/status filtering.
   */
  async getUsers(filters: UserFilters = {}): Promise<{
    users: Profile[];
    total: number;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { users: [], total: 0, error: 'Database configuration is unavailable.' };
    }

    const {
      search,
      role,
      active,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
    } = filters;

    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (search?.trim()) {
        const term = search.trim();
        query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
      }

      if (role && role !== 'all') {
        query = query.eq('role', role);
      }

      if (typeof active === 'boolean') {
        query = query.eq('active', active);
      }

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { users: [], total: 0, error: error.message };
      }

      return {
        users: (data || []) as Profile[],
        total: count || 0,
        error: null,
      };
    } catch (err: unknown) {
      return {
        users: [],
        total: 0,
        error: err instanceof Error ? err.message : 'Unable to load user profiles.',
      };
    }
  }

  /**
   * Retrieve single user profile by UUID.
   */
  async getUserById(id: string): Promise<{ user: Profile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        return { user: null, error: error?.message || 'User profile not found.' };
      }

      return { user: data as Profile, error: null };
    } catch (err: unknown) {
      return {
        user: null,
        error: err instanceof Error ? err.message : 'Unable to fetch user profile.',
      };
    }
  }

  /**
   * Update user role (e.g. 'staff' <-> 'admin').
   */
  async updateUserRole(
    id: string,
    newRole: UserRole,
    oldRole?: UserRole
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    const canonicalRole = (newRole?.toLowerCase() || 'staff') as UserRole;
    if (!['admin', 'staff', 'sales', 'manager', 'editor', 'viewer'].includes(canonicalRole)) {
      return { success: false, error: 'Invalid user role requested.' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: canonicalRole })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Record audit log
      await activityService.recordActivity({
        entityType: 'profile',
        entityId: id,
        action: 'USER_ROLE_CHANGED',
        oldValue: oldRole ? { role: oldRole.toLowerCase() } : undefined,
        newValue: { role: canonicalRole },
        description: `User role modified to ${canonicalRole.toUpperCase()}`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error updating user role.',
      };
    }
  }

  /**
   * Activate or deactivate a user profile.
   */
  async toggleUserStatus(
    id: string,
    active: boolean
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Record audit log
      await activityService.recordActivity({
        entityType: 'profile',
        entityId: id,
        action: active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        newValue: { active },
        description: active ? 'User account activated' : 'User account deactivated',
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error toggling user status.',
      };
    }
  }

  /**
   * Check user relationships (assigned enquiries, followups) before deletion.
   */
  async getUserDependencies(id: string): Promise<{
    enquiriesCount: number;
    followupsCount: number;
    hasDependencies: boolean;
  }> {
    if (!isSupabaseConfigured()) {
      return { enquiriesCount: 0, followupsCount: 0, hasDependencies: false };
    }

    try {
      const [enqRes, folRes] = await Promise.all([
        supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('assigned_to', id),
        supabase.from('followups').select('id', { count: 'exact', head: true }).eq('assigned_to', id),
      ]);

      const enquiriesCount = enqRes.count || 0;
      const followupsCount = folRes.count || 0;

      return {
        enquiriesCount,
        followupsCount,
        hasDependencies: enquiriesCount > 0 || followupsCount > 0,
      };
    } catch {
      return { enquiriesCount: 0, followupsCount: 0, hasDependencies: false };
    }
  }

  /**
   * Safe user deletion: blocks hard deletion if historical CRM records exist.
   * Prompts for deactivation instead to preserve database foreign keys and audit trail.
   */
  async deleteUser(
    id: string,
    userEmail?: string,
    userName?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      // Step 1: Check dependencies
      const deps = await this.getUserDependencies(id);
      if (deps.hasDependencies) {
        return {
          success: false,
          error: `Cannot delete user: account is associated with ${deps.enquiriesCount} enquiry assignments and ${deps.followupsCount} scheduled follow-ups. Please deactivate the user instead to preserve historical records.`,
        };
      }

      // Step 2: Delete profile row (will cascade to or clean profile data)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Step 3: Record audit log
      await activityService.recordActivity({
        entityType: 'profile',
        entityId: id,
        action: 'USER_DELETED',
        oldValue: { email: userEmail, fullName: userName },
        description: `Permanently deleted user: ${userName || userEmail || id}`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error deleting user profile.',
      };
    }
  }

  /**
   * Update full name, role, or active status.
   */
  async updateUser(
    id: string,
    updates: UpdateUserInput,
    oldData?: Partial<Profile>
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const payload: Record<string, unknown> = {};
      if (updates.fullName !== undefined) payload.full_name = updates.fullName.trim();
      if (updates.role !== undefined) payload.role = updates.role.toLowerCase();
      if (updates.active !== undefined) payload.active = updates.active;

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Record audit logs
      if (updates.role && oldData?.role && updates.role.toLowerCase() !== oldData.role.toLowerCase()) {
        await activityService.recordActivity({
          entityType: 'profile',
          entityId: id,
          action: 'USER_ROLE_CHANGED',
          oldValue: { role: oldData.role.toLowerCase(), active: oldData.active },
          newValue: { role: updates.role.toLowerCase(), active: updates.active ?? oldData.active },
          metadata: {
            target_user_id: id,
            target_email: oldData.email,
            old_role: oldData.role.toLowerCase(),
            new_role: updates.role.toLowerCase(),
            old_status: oldData.active ? 'active' : 'inactive',
            new_status: (updates.active ?? oldData.active) ? 'active' : 'inactive',
          },
          description: `Role changed from ${oldData.role.toUpperCase()} to ${updates.role.toUpperCase()}`,
        });
      }

      if (updates.active !== undefined && oldData?.active !== undefined && updates.active !== oldData.active) {
        await activityService.recordActivity({
          entityType: 'profile',
          entityId: id,
          action: updates.active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
          oldValue: { active: oldData.active, role: oldData.role },
          newValue: { active: updates.active, role: updates.role ?? oldData.role },
          metadata: {
            target_user_id: id,
            target_email: oldData.email,
            old_status: oldData.active ? 'active' : 'inactive',
            new_status: updates.active ? 'active' : 'inactive',
            role: (updates.role ?? oldData.role)?.toLowerCase(),
          },
          description: updates.active ? 'User account activated' : 'User account deactivated',
        });
      }

      if (updates.fullName && oldData?.full_name && updates.fullName.trim() !== oldData.full_name) {
        await activityService.recordActivity({
          entityType: 'profile',
          entityId: id,
          action: 'USER_UPDATED',
          oldValue: { full_name: oldData.full_name },
          newValue: { full_name: updates.fullName.trim() },
          metadata: {
            target_user_id: id,
            target_email: oldData.email,
            updated_fields: ['full_name'],
          },
          description: `Profile name updated to ${updates.fullName.trim()}`,
        });
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error updating user.',
      };
    }
  }

  /**
   * Create staff user via Edge Function or administrative provisioning.
   * Never exposes service-role credentials to the client.
   */
  async createStaffUser(input: CreateStaffUserInput): Promise<{
    user: Profile | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { user: null, error: 'Database configuration is unavailable.' };
    }

    if (!input.email?.trim()) {
      return { user: null, error: 'Email address is required.' };
    }

    if (!input.fullName?.trim()) {
      return { user: null, error: 'Full name is required.' };
    }

    const assignedRole = input.role || 'staff';
    const password = input.password || 'AkiraStaff@2026';

    try {
      // Step 1: Attempt Edge Function invocation if available
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
          'create-staff-user',
          {
            body: {
              email: input.email.trim(),
              fullName: input.fullName.trim(),
              password,
              role: assignedRole,
            },
          }
        );

        if (!edgeError && edgeData?.user) {
          await activityService.recordActivity({
            entityType: 'profile',
            entityId: edgeData.user.id,
            action: 'USER_CREATED',
            newValue: { email: input.email, role: assignedRole },
            description: `Created new staff user: ${input.fullName.trim()} (${assignedRole.toUpperCase()})`,
          });
          return { user: edgeData.user as Profile, error: null };
        }
      } catch {
        // Edge function unconfigured or offline, fall back to standard auth sign up
      }

      // Step 2: Fallback auth sign up mechanism
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: input.email.trim(),
        password,
        options: {
          data: {
            full_name: input.fullName.trim(),
          },
        },
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user authentication record.' };
      }

      // Step 3: Ensure profile role is set to requested role (default trigger sets 'viewer')
      const { data: profileData, error: profError } = await supabase
        .from('profiles')
        .update({
          full_name: input.fullName.trim(),
          role: assignedRole,
          active: true,
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (profError) {
        // Even if update failed, fetch current profile
        const { data: fallbackProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        return { user: (fallbackProf || null) as Profile | null, error: null };
      }

      // Audit log
      await activityService.recordActivity({
        entityType: 'profile',
        entityId: authData.user.id,
        action: 'USER_CREATED',
        newValue: { email: input.email, role: assignedRole },
        description: `Created new user: ${input.fullName.trim()} (${assignedRole.toUpperCase()})`,
      });

      return { user: profileData as Profile, error: null };
    } catch (err: unknown) {
      return {
        user: null,
        error: err instanceof Error ? err.message : 'Failed to provision staff user account.',
      };
    }
  }

  /**
   * Get active staff and admin profiles for task assignments.
   */
  async getAssignableStaff(): Promise<StaffProfile[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('active', true)
        .in('role', ['admin', 'manager', 'sales', 'staff'])
        .order('full_name', { ascending: true });

      if (error || !data) return [];
      return data as StaffProfile[];
    } catch {
      return [];
    }
  }
}

export const userService = new UserService();
