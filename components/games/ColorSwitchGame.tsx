'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { saveScore, getLeaderboard } from '@/lib/gameUtils';
import { sounds } from '@/lib/sounds';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#eab308'];
const COLOR_NAMES = ['Red', 'Blue', 'Green', 'Yellow'];

const ColorSwitchGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentColor, setCurrentColor] = useState(0);
  const [targetColor, setTargetColor] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const leaderboard = getLeaderboard('colorswitch');
    if (leaderboard.length > 0) {
      setHighScore(leaderboard[0].score);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setGameOver(false);
    generateNewTarget();
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      saveScore('colorswitch', 'Player', score);
    }
    sounds.gameOver();
  };

  const generateNewTarget = () => {
    const newTarget = Math.floor(Math.random() * 4);
    setTargetColor(newTarget);
  };

  const handleColorClick = (colorIndex: number) => {
    if (!isPlaying) return;

    if (colorIndex === targetColor) {
      const points = 10 + (streak * 2);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      sounds.collect();
      generateNewTarget();
    } else {
      setStreak(0);
      sounds.miss();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full h-full p-4">
      {/* Score Display */}
      <div className="flex gap-6 items-center">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-xl">
          <p className="text-white/60 text-sm mb-1">Score</p>
          <p className="text-4xl font-bold text-white">{score}</p>
        </div>
        <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-xl">
          <p className="text-white/60 text-sm mb-1">Time</p>
          <p className="text-4xl font-bold text-orange-400">{timeLeft}s</p>
        </div>
        <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-xl">
          <p className="text-white/60 text-sm mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Best
          </p>
          <p className="text-4xl font-bold text-yellow-400">{highScore}</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative">
        {/* Target Display */}
        {isPlaying && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-8 text-center bg-black/60 backdrop-blur-sm p-8 rounded-2xl"
          >
            <p className="text-white/60 text-lg mb-4">Tap this color:</p>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-32 h-32 mx-auto rounded-2xl shadow-2xl"
              style={{ backgroundColor: COLORS[targetColor] }}
            />
            <p className="text-white text-3xl font-bold mt-4">{COLOR_NAMES[targetColor]}</p>
            {streak > 0 && (
              <p className="text-yellow-400 text-sm mt-2">🔥 Streak: {streak}</p>
            )}
          </motion.div>
        )}

        {/* Color Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {COLORS.map((color, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleColorClick(index)}
              disabled={!isPlaying}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl shadow-2xl transition-all disabled:opacity-50"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <div className="text-center p-6">
                <p className="text-4xl font-bold text-white mb-4">Time Up! 🎨</p>
                <p className="text-xl text-white/70 mb-6">Score: {score}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 text-white rounded-full font-semibold flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Screen */}
        <AnimatePresence>
          {!isPlaying && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <div className="text-center p-6">
                <h3 className="text-3xl font-bold text-white mb-4">Color Switch</h3>
                <p className="text-white/70 mb-6">Tap the matching color as fast as you can!</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-12 py-4 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 text-white rounded-full font-bold text-xl flex items-center gap-3 mx-auto"
                >
                  <Play className="w-6 h-6" fill="currentColor" />
                  Start Game
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ColorSwitchGame;
