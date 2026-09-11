import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('joins multiple string classes with a space', () => {
    expect(cn('btn', 'btn-primary', 'shadow-sm')).toBe('btn btn-primary shadow-sm');
  });

  it('filters out falsy values like undefined, null, and false', () => {
    expect(cn('base', false && 'hidden', null, undefined, 'active')).toBe('base active');
  });

  it('handles empty inputs gracefully', () => {
    expect(cn()).toBe('');
  });
});
