'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

const SECRET_PASSWORD = 'X2'; // CHANGE THIS TO YOUR PASSWORD

export default function HomePage() {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem('site_access') === 'granted';
    if (isAuth) {
      setAuthenticated(true);
      // Show the real homepage after authentication
    }
  }, []);

  const handleSecretClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 2) { // Triple click to show password prompt
      setShowPasswordPrompt(true);
      setClickCount(0);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      localStorage.setItem('site_access', 'granted');
      setAuthenticated(true);
      setShowPasswordPrompt(false);
    } else {
      alert('Wrong password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('site_access');
    setAuthenticated(false);
  };

  // If authenticated, show the REAL homepage
  if (authenticated) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-midnight via-deep-purple to-midnight">
        {/* Logout button (hidden, only you know about it) */}
        <button
          onClick={handleLogout}
          className="fixed bottom-4 right-4 p-2 bg-white/5 rounded-full opacity-0 hover:opacity-100 transition-opacity"
        >
          <Lock className="w-4 h-4 text-white/40" />
        </button>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="max-w-6xl w-full"
          >
            {/* Main Title */}
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

            {/* Two Doors */}
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
                      className="mb-6 text-6xl"
                    >
                      🎮
                    </motion.div>
                    
                    <h2 className="font-serif text-4xl text-white mb-4 group-hover:text-yellow-400 transition-colors">
                      Play Games
                    </h2>
                    <p className="text-white/70 mb-8 text-lg">
                      Single & multiplayer games for everyone
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 text-yellow-400 font-semibold">
                      <span>Enter Arcade</span>
                      <span className="group-hover:translate-x-2 transition-transform">→</span>
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
                      className="mb-6 text-6xl"
                    >
                      💝
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
                      <span className="group-hover:rotate-12 transition-transform">✨</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.p
              className="text-center mt-16 text-white/30 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Built with love by Ayomide
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show "izz gone" to everyone else
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-midnight via-deep-purple to-midnight overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content - Triple click to unlock */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 text-center px-4"
        onClick={handleSecretClick}
        style={{ cursor: 'default', userSelect: 'none' }}
      >
        <motion.p
          className="font-script text-6xl sm:text-8xl md:text-9xl gradient-text"
          animate={{
            textShadow: [
              "0 0 20px rgba(247, 164, 200, 0.5)",
              "0 0 40px rgba(247, 164, 200, 0.8)",
              "0 0 20px rgba(247, 164, 200, 0.5)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          izz gone🫢🥀
        </motion.p>

        {/* Subtle hint (almost invisible) */}
        {clickCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="text-white/10 text-xs mt-8"
          >
            {3 - clickCount} more...
          </motion.p>
        )}
      </motion.div>

      {/* Secret Password Prompt */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex justify-center mb-4">
                <Lock className="w-12 h-12 text-soft-pink" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 text-center">
                Access Required
              </h3>
              <p className="text-white/60 text-sm text-center mb-6">
                Enter password to access🫰🏼🤓
              </p>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-soft-pink mb-4"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-soft-pink to-rose-gold text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  Unlock Site
                </button>
              </form>
              <button
                onClick={() => setShowPasswordPrompt(false)}
                className="w-full mt-3 py-2 text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
