import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/database';
import { authService } from './authService';
import { activityService } from '../services/activityService';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isStaff: boolean;
  role: Profile['role'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  isProfileLoading: boolean;
  isConfigured: boolean;
  sessionExpired: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; profile?: Profile | null; error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const isConfigured = isSupabaseConfigured();

  const loadProfile = useCallback(async (userId: string) => {
    setIsProfileLoading(true);
    try {
      const prof = await authService.getUserProfile(userId);
      setProfile(prof);
      return prof;
    } catch {
      setProfile(null);
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Load initial session
    authService.getSession().then(async (initialSession) => {
      if (!isMounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        await loadProfile(initialSession.user.id);
      }
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    // Listen to Supabase auth lifecycle events
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        switch (event) {
          case 'SIGNED_IN':
          case 'INITIAL_SESSION':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            setSessionExpired(false);
            if (currentSession?.user) {
              await loadProfile(currentSession.user.id);
            }
            break;

          case 'SIGNED_OUT':
            setProfile(null);
            break;

          default:
            break;
        }

        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [isConfigured, loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setSessionExpired(false);
    const result = await authService.signIn(email, password);
    let loadedProfile: Profile | null = null;
    if (result.user) {
      setUser(result.user);
      try {
        loadedProfile = await authService.getUserProfile(result.user.id);
        setProfile(loadedProfile);
      } catch {
        setProfile(null);
      }
      activityService.recordActivity({
        entityType: 'auth',
        entityId: result.user.id,
        action: 'AUTH_LOGIN',
        newValue: { email: result.user.email, role: loadedProfile?.role },
        description: `User ${result.user.email} signed in`,
        performedBy: result.user.id,
      }).catch(() => {});
    }
    setIsLoading(false);
    return { ...result, profile: loadedProfile };
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    if (user) {
      try {
        await activityService.recordActivity({
          entityType: 'auth',
          entityId: user.id,
          action: 'AUTH_LOGOUT',
          description: `User ${user.email} signed out`,
          performedBy: user.id,
        });
      } catch {
        // Safe fail
      }
    }
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setSessionExpired(false);
    setIsLoading(false);
  }, [user]);

  const isAdmin = useMemo(() => {
    return Boolean(profile?.role === 'admin' && profile.active);
  }, [profile]);

  const isStaff = useMemo(() => {
    return Boolean(
      (profile?.role === 'staff' || profile?.role === 'sales' || profile?.role === 'manager') &&
      profile.active
    );
  }, [profile]);

  const role = useMemo(() => {
    return profile?.role ?? null;
  }, [profile]);

  const isAuthenticated = useMemo(() => {
    return Boolean(user && session);
  }, [user, session]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    profile,
    isAdmin,
    isStaff,
    role,
    isAuthenticated,
    isLoading,
    loading: isLoading,
    isProfileLoading,
    isConfigured,
    sessionExpired,
    signIn,
    signOut,
    refreshProfile,
    clearSessionExpired,
  }), [
    user,
    session,
    profile,
    isAdmin,
    isStaff,
    role,
    isAuthenticated,
    isLoading,
    isProfileLoading,
    isConfigured,
    sessionExpired,
    signIn,
    signOut,
    refreshProfile,
    clearSessionExpired,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
