'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ParticlesBackground from '@/components/ParticlesBackground';
import TicTacToeGame from '@/components/games/TicTacToeGame';

export default function TicTacToePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-midnight via-deep-purple to-midnight">
      <ParticlesBackground color="#3b82f6" density={20} />

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => router.push('/games')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 glass rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-smooth"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Games</span>
      </motion.button>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-3xl"
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-5xl sm:text-6xl gradient-text mb-2">
              ❌ Tic-Tac-Toe
            </h1>
            <p className="text-white/60">Real-time multiplayer battle</p>
          </div>

          <TicTacToeGame />
        </motion.div>
      </div>
    </div>
  );
}
