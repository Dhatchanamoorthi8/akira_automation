/**
 * Animation Configuration & Precision Motion Tokens
 * Inspired by Mitutoyo and high-precision metrology instrumentation:
 * Rapid initial response with smooth, mathematically controlled deceleration.
 */

export const TIMING = {
  micro: 0.2,     // 200ms - micro-interactions, button presses, arrow offsets
  card: 0.35,     // 350ms - card lifts, spotlight shifts, hover transitions
  section: 0.65,  // 650ms - section reveals, content entries
  hero: 0.85,     // 850ms - hero entrance, major visual presentations
  stagger: 0.08,  // 80ms  - interval between staggered sequence items
} as const;

export const EASING = {
  // Custom cubic-bezier: rapid takeoff followed by authoritative deceleration
  precision: [0.16, 1, 0.3, 1] as const,
  // Standard smooth curve for micro-interactions
  smooth: [0.25, 0.1, 0.25, 1] as const,
  // Subtle spring for card interactions
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as const,
} as const;

export const VIEWPORT_CONFIG = {
  once: true,
  margin: '-60px 0px',
  amount: 0.15,
} as const;
