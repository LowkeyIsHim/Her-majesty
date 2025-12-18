'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ParticlesBackground from '@/components/ParticlesBackground';

export default function HomePage() {
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
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
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="max-w-6xl w-full"
            >
              <motion.div
                className="text-center mb-16"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="font-serif text-6xl sm:text-8xl mb-4 animate-glow">
                  <span className="gradient-text">Welcome</span>
                </h1>
                <p className="text-xl sm:text-2xl text-white/70">
                  Choose your experience
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Games Door */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => router.push('/games')}
                  className="group relative cursor-pointer"
                >
                  <div className="relative h-[400px] glass rounded-3xl p-8 flex flex-col items-center justify-center overflow-hidden border-2 border-white/10 hover:border-yellow-400/50 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 text-center">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="mb-6"
                      >
                        <Gamepad2 className="w-24 h-24 text-yellow-400 mx-auto" />
                      </motion.div>
                      
                      <h2 className="font-serif text-4xl text-white mb-4 group-hover:text-yellow-400 transition-colors">
                        Play Games
                      </h2>
                      <p className="text-white/70 mb-8 text-lg">
                        Single & multiplayer games for everyone
                      </p>
                      
                      <div className="flex items-center justify-center gap-2 text-yellow-400 font-semibold">
                        <span>Enter Arcade</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Silvyn's Space Door */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => router.push('/landing')}
                  className="group relative cursor-pointer"
                >
                  <div className="relative h-[400px] glass rounded-3xl p-8 flex flex-col items-center justify-center overflow-hidden border-2 border-white/10 hover:border-soft-pink/50 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-soft-pink/20 via-rose-gold/20 to-plum/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 text-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="mb-6"
                      >
                        <Heart className="w-24 h-24 text-soft-pink mx-auto" fill="currentColor" />
                      </motion.div>
                      
                      <h2 className="font-serif text-4xl text-white mb-4 group-hover:text-soft-pink transition-colors">
                        Silvyn's Space
                      </h2>
                      <p className="text-white/70 mb-4 text-lg">
                        Private section - Password required
                      </p>
                      <p className="text-white/50 text-sm italic mb-8">
                        A quiet place built just for you
                      </p>
                      
                      <div className="flex items-center justify-center gap-2 text-soft-pink font-semibold">
                        <span>Enter</span>
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.p
                className="text-center mt-16 text-white/30 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Built with love by Ayomide
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
                    }
