import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EASING } from '../../animations/config';

interface PrecisionTextProps {
  text: string;
  highlightText?: string;
  className?: string;
  highlightClassName?: string;
  delay?: number;
}

export const PrecisionText: React.FC<PrecisionTextProps> = ({
  text,
  highlightText,
  className = '',
  highlightClassName = 'text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-200',
  delay = 0.1,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, render immediate accessible static text
  if (shouldReduceMotion) {
    return (
      <span className={className}>
        {text}
        {highlightText && (
          <>
            {' '}
            <span className={highlightClassName}>{highlightText}</span>
          </>
        )}
      </span>
    );
  }

  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: EASING.precision,
      },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline-block ${className}`}
      aria-label={highlightText ? `${text} ${highlightText}` : text}
    >
      {words.map((word, idx) => (
        <React.Fragment key={idx}>
          <motion.span
            variants={wordVariants}
            className="inline-block"
          >
            {word}
          </motion.span>
          {idx < words.length - 1 && ' '}
        </React.Fragment>
      ))}
      {highlightText && (
        <>
          {' '}
          <motion.span
            variants={wordVariants}
            className={`inline-block ${highlightClassName}`}
          >
            {highlightText}
          </motion.span>
        </>
      )}
    </motion.span>
  );
};
