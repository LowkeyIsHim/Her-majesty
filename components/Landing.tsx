'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ParticlesBackground from './ParticlesBackground';

const Landing: React.FC = () => {
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-midnight via-deep-purple to-midnight">
      <ParticlesBackground />
      
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="max-w-4xl text-center"
            >
              {/* Floating hearts decoration */}
              <motion.div
                className="absolute -top-20 left-1/2 -translate-x-1/2"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart className="w-12 h-12 text-soft-pink opacity-30" fill="currentColor" />
              </motion.div>

              {/* Main title */}
              <motion.h1
                className="font-serif text-5xl sm:text-7xl lg:text-8xl mb-6 animate-glow"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
              >
                <span className="gradient-text">Silvyn</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="font-script text-2xl sm:text-3xl lg:text-4xl text-lavender mb-4"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
              >
                Her Majesty
              </motion.p>

              {/* Description */}
              <motion.p
                className="text-base sm:text-lg lg:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 1 }}
              >
                This is a quiet space I built for you. When the world gets loud and the distance feels heavy,
                come here. This is where my thoughts of you live—unfiltered, unguarded, and completely yours.
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(247, 164, 200, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/experience')}
                  className="group relative px-10 py-4 bg-gradient-to-r from-soft-pink to-rose-gold rounded-full font-semibold text-lg text-midnight shadow-lg transition-smooth overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Enter Our Space
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-smooth" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/poems')}
                  className="px-10 py-4 border-2 border-lavender/50 rounded-full font-semibold text-lg text-lavender hover:bg-lavender/10 transition-smooth flex items-center gap-2"
                >
                  <Moon className="w-5 h-5" />
                  Poem Library
                </motion.button>
              </motion.div>

              {/* Footer note */}
              <motion.p
                className="mt-16 text-sm text-white/40 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 1 }}
              >
                Built with love by Ayomide, for the one who lives in every quiet thought.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Landing;
