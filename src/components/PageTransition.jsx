import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.96,
    filter: 'blur(8px)',
    y: 20
  },
  in: { 
    opacity: 1, 
    scale: 1,
    filter: 'blur(0px)',
    y: 0
  },
  out: { 
    opacity: 0, 
    scale: 1.04,
    filter: 'blur(8px)',
    y: -20
  }
};

const pageTransition = {
  type: "tween",
  ease: [0.25, 0.1, 0.25, 1], // Custom cubic bezier for smooth, premium feel
  duration: 0.4
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex-1 flex flex-col w-full h-full min-h-screen origin-center"
    >
      {children}
    </motion.div>
  );
}
