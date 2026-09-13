import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userService } from './userService';
import { supabase } from '../lib/supabase';
import * as supabaseLib from '../lib/supabase';
import { activityService } from './activityService';

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(activityService, 'recordActivity').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists users with search, role and active filters', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockProfiles = [
      {
        id: 'u-1',
        email: 'staff1@akiraautomation.com',
        full_name: 'Staff Member One',
        role: 'staff',
        active: true,
        created_at: '2026-09-01T00:00:00Z',
      },
      {
        id: 'u-2',
        email: 'admin@akiraautomation.com',
        full_name: 'Lead Admin',
        role: 'admin',
        active: true,
        created_at: '2026-08-01T00:00:00Z',
      },
    ];

    const mockRange = vi.fn().mockResolvedValue({
      data: mockProfiles,
      error: null,
      count: 2,
    });
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
    const mockEqActive = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEqRole = vi.fn().mockReturnValue({ eq: mockEqActive });
    const mockOr = vi.fn().mockReturnValue({ eq: mockEqRole });
    const mockSelect = vi.fn().mockReturnValue({ or: mockOr });

    vi.spyOn(supabase, 'from').mockReturnValue({ select: mockSelect } as any);

    const result = await userService.getUsers({
      search: 'staff',
      role: 'staff',
      active: true,
      limit: 10,
      offset: 0,
    });

    expect(result.users).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.error).toBeNull();
  });

  it('fetches single user profile by id', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockUser = {
      id: 'u-1',
      email: 'staff@akiraautomation.com',
      full_name: 'Staff Specialist',
      role: 'staff',
      active: true,
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabase, 'from').mockReturnValue({ select: mockSelect } as any);

    const result = await userService.getUserById('u-1');
    expect(result.user).toEqual(mockUser);
    expect(result.error).toBeNull();
  });

  it('updates user role and records activity audit log', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabase, 'from').mockReturnValue({ update: mockUpdate } as any);

    const result = await userService.updateUserRole('u-1', 'admin', 'staff');
    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(activityService.recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'profile',
        entityId: 'u-1',
        action: 'USER_ROLE_CHANGED',
      })
    );
  });

  it('toggles user active status and logs activation event', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabase, 'from').mockReturnValue({ update: mockUpdate } as any);

    const result = await userService.toggleUserStatus('u-1', false);
    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(activityService.recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'profile',
        entityId: 'u-1',
        action: 'USER_DEACTIVATED',
      })
    );
  });

  it('retrieves assignable staff members list', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockStaff = [
      { id: 's-1', email: 'staff1@akira.com', full_name: 'Arun Kumar', role: 'staff' },
      { id: 's-2', email: 'admin@akira.com', full_name: 'Lead Admin', role: 'admin' },
    ];

    const mockOrder = vi.fn().mockResolvedValue({ data: mockStaff, error: null });
    const mockIn = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEq = vi.fn().mockReturnValue({ in: mockIn });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabase, 'from').mockReturnValue({ select: mockSelect } as any);

    const staffList = await userService.getAssignableStaff();
    expect(staffList).toHaveLength(2);
    expect(staffList[0].full_name).toBe('Arun Kumar');
  });

  it('handles database unconfigured safely for all methods', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(false);

    const usersRes = await userService.getUsers();
    expect(usersRes.error).toContain('configuration is unavailable');

    const userRes = await userService.getUserById('any-id');
    expect(userRes.error).toContain('configuration is unavailable');

    const roleRes = await userService.updateUserRole('any-id', 'staff');
    expect(roleRes.success).toBe(false);

    const staffList = await userService.getAssignableStaff();
    expect(staffList).toEqual([]);
  });
});
