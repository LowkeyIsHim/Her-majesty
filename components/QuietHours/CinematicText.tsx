import { motion, Variants } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface CinematicTextProps {
  primary: string;
  sub: string;
  duration?: number;
  initialDelay?: number;
  onComplete?: () => void;
  alignment?: 'text-center' | 'text-left';
}

// Parent container variant for stagger effect
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.5,
    },
  },
};

// Child element variant (Text Unveil)
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.5, // Slow, luxurious duration
      ease: [0.6, -0.05, 0.01, 0.99], // Emotional "sink and skip"
    },
  },
};

const CinematicText: React.FC<CinematicTextProps> = ({
  primary,
  sub,
  duration = 2.0,
  initialDelay = 0,
  onComplete,
  alignment = 'text-center',
}) => {
  const [showPrimary, setShowPrimary] = useState(false);
  const [showSub, setShowSub] = useState(false);

  useEffect(() => {
    // Reveal Primary Text
    const timer1 = setTimeout(() => {
      setShowPrimary(true);
    }, initialDelay * 1000);

    // Reveal Subtext
    const timer2 = setTimeout(() => {
      if (sub) {
        setShowSub(true);
      }
    }, (initialDelay + duration * 0.5) * 1000);

    // On Complete Callback
    const timer3 = setTimeout(() => {
      onComplete && onComplete();
    }, (initialDelay + duration * 1.5) * 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [primary, sub, duration, initialDelay, onComplete]);

  // Function to split text for character/word-based staggered animation (if desired)
  // For simplicity and smoother reveal, we use block-level staggered animation here.

  return (
    <motion.div
      className={`relative z-20 max-w-4xl mx-auto ${alignment}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-4xl md:text-7xl font-serif text-rose-100 mb-4 overflow-hidden"
        variants={itemVariants}
      >
        {primary}
      </motion.h1>
      {sub && (
        <motion.p
          className="text-xl md:text-3xl text-rose-300/80 font-light overflow-hidden mt-4"
          variants={itemVariants}
        >
          {sub}
        </motion.p>
      )}
    </motion.div>
  );
};

export default CinematicText;
