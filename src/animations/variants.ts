import { Variants } from 'motion/react';
import { TIMING, EASING } from './config';

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.section,
      ease: EASING.precision,
    },
  },
};

export const fadeDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.section,
      ease: EASING.precision,
    },
  },
};

export const fadeLeft: Variants = {
  hidden: {
    opacity: 0,
    x: 28,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.section,
      ease: EASING.precision,
    },
  },
};

export const fadeRight: Variants = {
  hidden: {
    opacity: 0,
    x: -28,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.section,
      ease: EASING.precision,
    },
  },
};

export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: TIMING.section,
      ease: EASING.smooth,
    },
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.section,
      ease: EASING.precision,
    },
  },
};

export const heroImageReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.05,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.hero,
      ease: EASING.precision,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: TIMING.stagger,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.card,
      ease: EASING.precision,
    },
  },
};

// Accessible reduced-motion variant (pure opacity, zero spatial displacement)
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

// Micro-interaction hover variants
export const buttonHover = {
  hover: { scale: 1.02, transition: { duration: TIMING.micro, ease: EASING.smooth } },
  tap: { scale: 0.98, transition: { duration: 0.1, ease: EASING.smooth } },
};

export const arrowHover = {
  rest: { x: 0 },
  hover: { x: 4, transition: { duration: TIMING.micro, ease: EASING.smooth } },
};
