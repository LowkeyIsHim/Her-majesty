'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Heart, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ParticlesBackground from './ParticlesBackground';

const CORRECT_PASSWORD = 'Lovebug'; // CHANGE THIS PASSWORD

interface PasswordGateProps {
  onSuccess: () => void;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('silvyn_authenticated');
    if (isAuthenticated === 'true') {
      onSuccess();
    }
  }, [onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem('silvyn_authenticated', 'true');
      setError('');
      onSuccess();
    } else {
      setError('Wrong password, try again Lovebug');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-midnight via-deep-purple to-midnight">
      <ParticlesBackground color="#f7a4c8" />

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 glass rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-smooth"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </motion.button>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="max-w-md w-full"
        >
          <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="flex justify-center mb-6"
            >
              <Heart className="w-20 h-20 text-soft-pink" fill="currentColor" />
            </motion.div>

            <h2 className="font-serif text-4xl text-center text-white mb-3">
              Silvyn's Space
            </h2>
            <p className="text-center text-white/60 mb-8">
              This space is reserved for you, Her Majesty
            </p>

            <form onSubmit={handleSubmit}>
              <motion.div
                animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="relative mb-6"
              >
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-soft-pink/50 transition-smooth"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-smooth"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm text-center mb-4"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-soft-pink to-rose-gold rounded-2xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Unlock
              </motion.button>
            </form>

            <p className="text-center text-white/30 text-xs mt-6 italic">
              Hint: You already know this one 💕
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PasswordGate;
