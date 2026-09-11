import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { fadeIn, reducedMotionVariants } from '../../animations/variants';
import { VIEWPORT_CONFIG } from '../../animations/config';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
  once = VIEWPORT_CONFIG.once,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? reducedMotionVariants : fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
