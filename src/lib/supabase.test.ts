import { describe, it, expect } from 'vitest';
import { isSupabaseConfigured, supabase } from './supabase';

describe('Supabase Client Foundation', () => {
  it('exports a valid Supabase client instance', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.storage.from).toBe('function');
  });

  it('isSupabaseConfigured returns a boolean without throwing', () => {
    const result = isSupabaseConfigured();
    expect(typeof result).toBe('boolean');
  });
});
