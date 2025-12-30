// app/games/shooter/page.tsx - SSR Fixed

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import ShooterGame with no SSR
const ShooterGame = dynamic(() => import('@/components/games/ShooterGame'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-xl font-semibold">Loading Shooter...</p>
        <p className="text-white/60 text-sm mt-2">Initializing game engine</p>
      </div>
    </div>
  ),
});

export default function ShooterPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading...</p>
        </div>
      </div>
    }>
      <ShooterGame />
    </Suspense>
  );
}
