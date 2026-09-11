import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { fadeUp, reducedMotionVariants } from '../../animations/variants';
import { VIEWPORT_CONFIG } from '../../animations/config';

interface SectionRevealProps {
  children: ReactNode;
  id?: string;
  className?: string;
  delay?: number;
  once?: boolean;
}

export const SectionReveal: React.FC<SectionRevealProps> = ({
  children,
  id,
  className = '',
  delay = 0,
  once = VIEWPORT_CONFIG.once,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      variants={shouldReduceMotion ? reducedMotionVariants : fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: VIEWPORT_CONFIG.margin }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
};
