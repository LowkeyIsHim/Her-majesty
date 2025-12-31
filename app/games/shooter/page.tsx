// app/games/shooter/page.tsx - CoDM Entry Point

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import CoDM Game with no SSR
const ShooterGameCODM = dynamic(() => import('@/components/games/ShooterGameCODM'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-red-500 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
          CALL OF DUTY
        </h2>
        <p className="text-white text-xl font-semibold mb-2">MOBILE</p>
        <p className="text-gray-400 text-sm">Loading multiplayer...</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  ),
});

export default function ShooterPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <ShooterGameCODM />
    </Suspense>
  );
}
