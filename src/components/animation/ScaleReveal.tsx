import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { scaleIn, reducedMotionVariants } from '../../animations/variants';
import { VIEWPORT_CONFIG } from '../../animations/config';

interface ScaleRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

export const ScaleReveal: React.FC<ScaleRevealProps> = ({
  children,
  delay = 0,
  className = '',
  once = VIEWPORT_CONFIG.once,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? reducedMotionVariants : scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
