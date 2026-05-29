import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    x: 28,
    rotateY: -10,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    x: -28,
    rotateY: 10,
    scale: 0.98,
  },
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
  mass: 0.8,
};

/**
 * Wraps nested routes with a 3D-style enter/exit transition when navigating
 * between tabs (e.g. Dashboard → Users).
 */
export const AnimatedOutlet: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ transformPerspective: 1400, transformStyle: 'preserve-3d' }}
        className="w-full"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedOutlet;
