import React, { ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';

interface ShinyTextProps {
  children: ReactNode;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={`inline-block ${className}`}>{children}</span>;
  }

  return (
    <span
      className={`inline-block relative overflow-hidden bg-gradient-to-r from-sky-300 via-white to-sky-300 bg-[length:200%_100%] bg-clip-text text-transparent ${className}`}
      style={{
        animation: 'shimmer 4s infinite linear',
      }}
    >
      {children}
    </span>
  );
};
