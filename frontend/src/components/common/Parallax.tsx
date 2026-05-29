import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * Fixed, scroll-driven background image that moves slower than the page
 * content to create a sense of depth (parallax). A soft light overlay keeps
 * foreground text and cards readable.
 */
export const ParallaxBackground: React.FC<{ image: string }> = ({ image }) => {
  const { scrollY } = useScroll();
  const rawY = useTransform(scrollY, [0, 1200], [0, 220]);
  const y = useSpring(rawY, { stiffness: 80, damping: 30, mass: 0.4 });
  const scale = useTransform(scrollY, [0, 1200], [1.12, 1.28]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        aria-hidden
        style={{ y, scale, backgroundImage: `url(${image})` }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
      />
      {/* Readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/82 via-white/86 to-white/92" />
    </div>
  );
};

/**
 * Wraps a section so it rises and un-tilts in 3D as it scrolls into view,
 * giving the page a layered, three-dimensional scrolling feel.
 */
export const Reveal3D: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1200, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
};
