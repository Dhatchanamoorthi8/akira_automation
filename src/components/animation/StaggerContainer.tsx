import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { staggerContainer, reducedMotionVariants } from '../../animations/variants';
import { VIEWPORT_CONFIG } from '../../animations/config';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
  once?: boolean;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  delayChildren = 0.05,
  staggerChildren = 0.08,
  once = VIEWPORT_CONFIG.once,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <motion.div
        variants={reducedMotionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: VIEWPORT_CONFIG.margin }}
      transition={{ delayChildren, staggerChildren }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
