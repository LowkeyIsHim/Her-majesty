import { motion, Variants } from 'framer-motion';
import React from 'react';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  delay?: number;
}

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i,
      duration: 1.5,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  }),
  tap: { 
    scale: 0.95, 
    filter: 'brightness(1.5)',
    transition: { duration: 0.1 }
  },
};

const ActionButton: React.FC<ActionButtonProps> = ({ children, onClick, className = '', delay = 0 }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative z-30 px-8 py-4 text-lg md:text-xl font-medium rounded-full backdrop-blur-md 
                  transition-all duration-500 ease-in-out shadow-lg overflow-hidden
                  bg-plum-800/60 text-rose-200 border border-rose-500/40 hover:border-rose-300/80
                  hover:shadow-[0_0_20px_rgba(255,192,203,0.5)] 
                  ${className}`}
      variants={buttonVariants}
      initial="hidden"
      animate="visible"
      whileTap="tap"
      custom={delay}
    >
      {/* Subtle Color-Shifting Glow on Hover */}
      <span className="absolute inset-0 bg-transparent opacity-0 transition-opacity duration-500 
                       group-hover:opacity-100 animate-slow-pulse"
            style={{ 
                // Define the slow pulse keyframes in your global CSS or here if using a CSS-in-JS solution
                // For Tailwind, ensure you have an animation utility defined for 'slow-pulse'
            }}
      ></span>
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default ActionButton;

// Note: Ensure you define `animate-slow-pulse` in your Tailwind config/global CSS. 
// Example global CSS (in global.css):
/*
@keyframes slow-pulse {
  0%, 100% { box-shadow: 0 0 15px rgba(255, 105, 180, 0.6); }
  50% { box-shadow: 0 0 30px rgba(138, 43, 226, 0.8); }
}
.animate-slow-pulse {
    animation: slow-pulse 5s infinite ease-in-out;
}
*/
