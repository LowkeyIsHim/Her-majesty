'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, User, Trophy, Zap, Crosshair, Palette, Brain, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';

const games = {
  singlePlayer: [
    {
      id: 'snake',
      title: 'Snake',
      description: 'Classic arcade. Eat and grow!',
      icon: '🐍',
      color: 'from-green-500 to-emerald-600',
      difficulty: 'Easy',
      IconComponent: Zap,
    },
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Find all matching pairs!',
      icon: '🧠',
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Medium',
      IconComponent: Brain,
    },
    {
      id: 'reflex',
      title: 'Aim Trainer',
      description: 'Free Fire style shooting!',
      icon: '🎯',
      color: 'from-red-500 to-orange-600',
      difficulty: 'Hard',
      IconComponent: Crosshair,
    },
    {
      id: 'colorswitch',
      title: 'Color Switch',
      description: 'Match the colors fast!',
      icon: '🎨',
      color: 'from-blue-500 to-cyan-600',
      difficulty: 'Medium',
      IconComponent: Palette,
    },
    {
      id: 'flappy',
      title: 'Flappy Ball',
      description: 'Dodge the obstacles!',
      icon: '⚽',
      color: 'from-yellow-500 to-amber-600',
      difficulty: 'Hard',
      IconComponent: Timer,
    },
  ],
  multiPlayer: [
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe',
      description: 'Classic 2-player battle',
      icon: '❌',
      color: 'from-blue-500 to-cyan-600',
      players: '2 Players',
    },
    {
      id: 'drawing',
      title: 'Drawing Battle',
      description: 'Draw and guess game',
      icon: '🎨',
      color: 'from-pink-500 to-rose-600',
      players: '2-8 Players',
    },
    {
      id: 'wordrace',
      title: 'Word Race',
      description: 'Type fastest to win!',
      icon: '⚡',
      color: 'from-yellow-500 to-amber-600',
      players: '2-6 Players',
    },
    {
      id: 'quickmath',
      title: 'Quick Math',
      description: 'Solve math problems fast!',
      icon: '🔢',
      color: 'from-indigo-500 to-purple-600',
      players: '2-4 Players',
    },
  ],
};

export default function GamesLobby() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-midnight via-deep-purple to-midnight">
      {/* NO PARTICLES - Clean game lobby */}
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-smooth"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Home</span>
      </motion.button>

      <div className="relative z-10 px-4 py-16 md:py-20">
        <motion.div
          className="max-w-6xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl gradient-text mb-2">
            Game Arcade
          </h1>
          <p className="text-base md:text-lg text-white/70">
            Choose your game and have fun!
          </p>
        </motion.div>

        {/* Single Player */}
        <motion.div
          className="max-w-6xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6 px-2">
            <User className="w-6 h-6 text-white/70" />
            <h2 className="font-serif text-2xl md:text-3xl text-white">
              Single Player
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {games.singlePlayer.map((game, index) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/games/${game.id}`)}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left hover:bg-white/10 transition-all overflow-hidden border border-white/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="text-5xl mb-3">{game.icon}</div>
                  <h3 className="font-serif text-xl text-white mb-1">
                    {game.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-3">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 uppercase tracking-wide">
                      {game.difficulty}
                    </span>
                    <span className="text-white/70 group-hover:text-white text-sm">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-6 px-2">
            <Users className="w-6 h-6 text-white/70" />
            <h2 className="font-serif text-2xl md:text-3xl text-white">
              Multiplayer
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {games.multiPlayer.map((game, index) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/games/${game.id}`)}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left hover:bg-white/10 transition-all overflow-hidden border border-white/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="text-5xl mb-3">{game.icon}</div>
                  <h3 className="font-serif text-xl text-white mb-1">
                    {game.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-3">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 uppercase tracking-wide">
                      {game.players}
                    </span>
                    <span className="text-white/70 group-hover:text-white text-sm">
                      Play →
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
      }
