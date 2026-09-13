import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './authService';
import { supabase } from '../lib/supabase';
import * as supabaseLib from '../lib/supabase';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns generic error message on invalid credentials to prevent account enumeration', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 },
    } as any);

    const result = await authService.signIn('engineer@akira.com', 'wrongpassword');
    expect(result.user).toBeNull();
    expect(result.error).toContain('Invalid login credentials');
  });

  it('rejects authentication if user does not possess active admin role', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: {
        user: { id: 'user-viewer-123', email: 'viewer@akira.com' },
        session: {} as any,
      },
      error: null,
    } as any);

    vi.spyOn(authService, 'getUserProfile').mockResolvedValueOnce({
      id: 'user-viewer-123',
      email: 'viewer@akira.com',
      full_name: 'Viewer User',
      role: 'viewer',
      active: true,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    });

    const signOutSpy = vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({} as any);

    const result = await authService.signIn('viewer@akira.com', 'password123');
    expect(result.user).toBeNull();
    expect(result.error).toContain('administrator privileges');
    expect(signOutSpy).toHaveBeenCalled();
  });

  it('authenticates successfully for verified active admin', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: {
        user: { id: 'admin-uuid-1', email: 'admin@akira.com' },
        session: {} as any,
      },
      error: null,
    } as any);

    vi.spyOn(authService, 'getUserProfile').mockResolvedValueOnce({
      id: 'admin-uuid-1',
      email: 'admin@akira.com',
      full_name: 'Lead Metrology Admin',
      role: 'admin',
      active: true,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    });

    const result = await authService.signIn('admin@akira.com', 'correctpassword');
    expect(result.user).toBeDefined();
    expect(result.user?.id).toBe('admin-uuid-1');
    expect(result.error).toBeNull();
  });

  it('fails gracefully when Supabase is unconfigured', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(false);

    const result = await authService.signIn('admin@akira.com', 'pass');
    expect(result.user).toBeNull();
    expect(result.error).toContain('Database configuration is unavailable');
  });
});
