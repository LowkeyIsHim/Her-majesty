'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ShooterGame from '@/components/games/ShooterGame';

export default function ShooterPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900">
      {/* NO PARTICLES - Clean gaming experience */}

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
        <ShooterGame />
      </div>
    </div>
  );
}
