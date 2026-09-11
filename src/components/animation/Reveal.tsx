import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { fadeUp, fadeDown, fadeLeft, fadeRight, fadeIn, reducedMotionVariants } from '../../animations/variants';
import { TIMING } from '../../animations/config';

interface RevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = TIMING.section,
  className = '',
  once = true,
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

  const getVariant = () => {
    switch (direction) {
      case 'down':
        return fadeDown;
      case 'left':
        return fadeLeft;
      case 'right':
        return fadeRight;
      case 'none':
        return fadeIn;
      case 'up':
      default:
        return fadeUp;
    }
  };

  return (
    <motion.div
      variants={getVariant()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px 0px' }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
