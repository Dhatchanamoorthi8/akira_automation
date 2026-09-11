import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(0, 85, 165, 0.07)', // Industrial primary blue subtle tint
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Detect coarse pointer (touchscreens) to suppress stuck cursor spotlights
    if (typeof window !== 'undefined') {
      const touchQuery = window.matchMedia('(pointer: coarse)');
      setIsTouchDevice(touchQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setIsTouchDevice(e.matches);
      };

      touchQuery.addEventListener('change', handleChange);
      return () => touchQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || shouldReduceMotion || isTouchDevice) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    if (!shouldReduceMotion && !isTouchDevice) setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={shouldReduceMotion ? undefined : { y: -3, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Precision Industrial Radial Spotlight - disabled on touch devices & reduced motion */}
      {!shouldReduceMotion && !isTouchDevice && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-[inherit] z-10"
          style={{
            opacity,
            background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </motion.div>
  );
};
