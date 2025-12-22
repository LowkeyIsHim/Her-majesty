'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QuickMathGame from '@/components/games/QuickMathGame';

export default function QuickMathPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-purple-900 via-indigo-900 to-midnight">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => router.push('/games')}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white/70 hover:text-white hover:bg-black/80 transition-smooth"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back</span>
      </motion.button>

      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-5xl sm:text-6xl gradient-text mb-2">
              🔢 Quick Math
            </h1>
            <p className="text-white/60">Solve math problems faster than your opponent!</p>
          </div>

          <QuickMathGame />
        </motion.div>
      </div>
    </div>
  );
}
