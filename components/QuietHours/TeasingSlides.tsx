import { motion, AnimatePresence, Variants } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { HandHeart } from 'lucide-react';

interface TeasingSlidesProps {
  onComplete: () => void;
}

const SLIDES = [
  { text: "You act like you don’t know how special you are. I’ve always known, Your Majesty.", icon: null },
  { text: "Watching you be yourself is my favorite form of quiet chaos.", icon: null },
  { text: "Even when we're apart, you live here.", icon: HandHeart },
];

const slideVariants: Variants = {
  enter: { 
    opacity: 0, 
    y: 50,
    transition: { 
      duration: 1.5, 
      ease: [0.6, 0.01, 0.01, 0.9] 
    } 
  },
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.8,
      ease: [0.6, -0.05, 0.01, 0.99], // Luxurious slow animation
      delay: 0.5,
    }
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: { duration: 1.0, ease: "easeOut" }
  }
};

const TeasingSlides: React.FC<TeasingSlidesProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const totalSlides = SLIDES.length;
  const slideDuration = 6000; // 6 seconds per slide

  useEffect(() => {
    if (index < totalSlides) {
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, slideDuration);
      return () => clearTimeout(timer);
    } else {
      // Transition to the next step after the last slide
      const finalTimer = setTimeout(onComplete, 2000); 
      return () => clearTimeout(finalTimer);
    }
  }, [index, totalSlides, onComplete]);

  const currentSlide = SLIDES[index];

  if (!currentSlide) return null;

  return (
    <div className="w-full max-w-4xl h-[200px] flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute text-center p-4"
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <p className="text-2xl md:text-4xl font-light text-rose-300/90 leading-snug">
            {currentSlide.text}
          </p>
          {currentSlide.icon && (
            <motion.div 
                className="mt-6 flex justify-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 1.5, delay: 1.0 } }}
            >
                <currentSlide.icon className="w-8 h-8 text-rose-400" />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TeasingSlides;
