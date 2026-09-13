import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/database';
import { Session, User } from '@supabase/supabase-js';

export interface AuthStateResult {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
}

export class AuthService {
  /**
   * Authenticate admin using email and password.
   * Employs generic error messaging to avoid account enumeration.
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return {
        user: null,
        error: 'Database configuration is unavailable. Please check your environment variables.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return {
          user: null,
          error: 'Invalid login credentials. Please check your email and password.',
        };
      }

      if (!data.user) {
        return {
          user: null,
          error: 'Unable to establish session. Please try again.',
        };
      }

      // Check admin or staff profile authorization
      const profile = await this.getUserProfile(data.user.id);
      const isAuthorizedRole =
        profile &&
        ['admin', 'staff', 'sales', 'manager'].includes(profile.role) &&
        profile.active;

      if (!isAuthorizedRole) {
        // Sign out unauthorized user immediately
        await supabase.auth.signOut();
        return {
          user: null,
          error: 'Access denied. You do not possess authorized staff or administrator privileges.',
        };
      }

      return { user: data.user, error: null };
    } catch {
      return {
        user: null,
        error: 'An unexpected network failure occurred during authentication.',
      };
    }
  }

  /**
   * Sign out current user.
   */
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.auth.signOut();
    } catch {
      // safe no-op
    }
  }

  /**
   * Retrieve current session if available.
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  }

  /**
   * Load user profile record from public.profiles table.
   */
  async getUserProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return data as Profile;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
