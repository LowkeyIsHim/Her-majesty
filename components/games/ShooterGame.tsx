// components/games/ShooterGameCODM.tsx - Call of Duty Mobile Game

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Users, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ShooterGameCODM() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple initialization
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading CoDM...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800/90 backdrop-blur-sm border-2 border-blue-500/50 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
            CALL OF DUTY
          </h1>
          <p className="text-center text-gray-400 mb-8">MOBILE MULTIPLAYER</p>

          <div className="text-center text-white mb-6">
            <p className="text-lg mb-4">🎮 Game is loading...</p>
            <p className="text-sm text-gray-400">
              Advanced features initializing
            </p>
          </div>

          <button
            onClick={() => router.push('/games')}
            className="w-full py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Games
          </button>
        </div>
      </div>
    </div>
  );
}
