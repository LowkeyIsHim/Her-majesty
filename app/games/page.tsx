'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, User, Trophy, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ParticlesBackground from '@/components/ParticlesBackground';

const games = {
  singlePlayer: [
    {
      id: 'snake',
      title: 'Snake',
      description: 'Classic arcade game. Eat, grow, survive!',
      emoji: '🐍',
      color: 'from-green-500 to-emerald-600',
      difficulty: 'Easy',
    },
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Find matching pairs. Test your memory!',
      emoji: '🧠',
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Medium',
    },
    {
      id: 'reflex',
      title: 'Reflex Master',
      description: 'Hit targets fast! Free Fire vibes 🔥',
      emoji: '🎯',
      color: 'from-red-500 to-orange-600',
      difficulty: 'Hard',
    },
  ],
  multiPlayer: [
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe',
      description: 'Classic 2-player game. Get 3 in a row!',
      emoji: '❌',
      color: 'from-blue-500 to-cyan-600',
      players: '2 Players',
    },
    {
      id: 'drawing',
      title: 'Drawing Battle',
      description: 'Draw and guess! Like Pictionary.',
      emoji: '🎨',
      color: 'from-pink-500 to-rose-600',
      players: '2-8 Players',
    },
    {
      id: 'wordrace',
      title: 'Word Race',
      description: 'Type the word fastest to win!',
      emoji: '⚡',
      color: 'from-yellow-500 to-amber-600',
      players: '2-6 Players',
    },
  ],
};

export default function GamesLobby() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-midnight via-deep-purple to-midnight">
      <ParticlesBackground color="#fbbf24" density={30} />

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 glass rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-smooth"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Home</span>
      </motion.button>

      <div className="relative z-10 px-4 py-20">
        <motion.div
          className="max-w-6xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block mb-6"
          >
            <Trophy className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <h1 className="font-serif text-5xl sm:text-7xl gradient-text mb-4">
            Game Arcade
          </h1>
          <p className="text-lg sm:text-xl text-white/70">
            Choose your game and have fun!
          </p>
        </motion.div>

        {/* Single Player */}
        <motion.div
          className="max-w-6xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <User className="w-8 h-8 text-white/70" />
            <h2 className="font-serif text-3xl sm:text-4xl text-white">
              Single Player
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.singlePlayer.map((game, index) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/games/${game.id}`)}
                className="group relative glass rounded-2xl p-8 text-left hover:bg-white/10 transition-smooth overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="text-6xl mb-4">{game.emoji}</div>
                  <h3 className="font-serif text-2xl text-white mb-2">
                    {game.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 uppercase">
                      {game.difficulty}
                    </span>
                    <span className="text-white/70 group-hover:text-white transition-colors">
                      Play →
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Multiplayer */}
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-white/70" />
            <h2 className="font-serif text-3xl sm:text-4xl text-white">
              Multiplayer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.multiPlayer.map((game, index) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/games/${game.id}`)}
                className="group relative glass rounded-2xl p-8 text-left hover:bg-white/10 transition-smooth overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="text-6xl mb-4">{game.emoji}</div>
                  <h3 className="font-serif text-2xl text-white mb-2">
                    {game.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 uppercase">
                      {game.players}
                    </span>
                    <span className="text-white/70 group-hover:text-white transition-colors">
                      Play →
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.p
          className="text-center mt-16 text-white/30 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Have fun! Share with friends 🎮
        </motion.p>
      </div>
    </div>
  );
}
