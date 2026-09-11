import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { staggerItem, reducedMotionVariants } from '../../animations/variants';

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
      className={className}
    >
      {children}
    </motion.div>
  );
};
