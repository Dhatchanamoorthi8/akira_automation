import { Transition } from 'motion/react';
import { TIMING, EASING } from './config';

export const precisionTransition = (duration = TIMING.section, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASING.precision,
});

export const microTransition = (duration = TIMING.micro): Transition => ({
  duration,
  ease: EASING.smooth,
});

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

export const staggerContainerTransition = (
  staggerChildren = TIMING.stagger,
  delayChildren = 0
): Transition => ({
  staggerChildren,
  delayChildren,
});
