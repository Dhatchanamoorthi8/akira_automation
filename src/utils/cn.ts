/**
 * Lightweight, zero-dependency class name joiner.
 * Filters out falsy values and joins valid classes.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
