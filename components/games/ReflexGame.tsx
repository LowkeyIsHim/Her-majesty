'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Target } from 'lucide-react';
import { saveScore, getLeaderboard, calculateAccuracy } from '@/lib/gameUtils';

interface TargetType {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const GAME_DURATION = 30; // seconds

const ReflexGame: React.FC = () => {
  const [targets, setTargets] = useState<TargetType[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [hits, setHits] = useState(0);
  const [shots, setShots] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);

  useEffect(() => {
    const leaderboard = getLeaderboard('reflex');
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        spawnTarget();
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const spawnTarget = () => {
    const size = 40 + Math.random() * 30;
    const newTarget: TargetType = {
      id: targetIdRef.current++,
      x: Math.random() * (GAME_WIDTH - size),
      y: Math.random() * (GAME_HEIGHT - size),
      size,
      speed: 1 + Math.random() * 2,
    };

    setTargets(prev => [...prev, newTarget]);

    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== newTarget.id));
    }, 2000);
  };

  const handleTargetHit = (targetId: number) => {
    setTargets(prev => prev.filter(t => t.id !== targetId));
    setScore(prev => prev + 10);
    setHits(prev => prev + 1);
    setShots(prev => prev + 1);
  };

  const handleMiss = () => {
    setShots(prev => prev + 1);
  };

  const startGame = () => {
    setTargets([]);
    setScore(0);
    setHits(0);
    setShots(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setGameOver(false);
    targetIdRef.current = 0;
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      saveScore('reflex', 'Player', score);
    }
  };

  const accuracy = calculateAccuracy(hits, shots);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex gap-8 items-center flex-wrap justify-center">
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Score</p>
          <p className="text-4xl font-bold text-white">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Time</p>
          <p className="text-4xl font-bold text-orange-400">{timeLeft}s</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Accuracy</p>
          <p className="text-4xl font-bold text-green-400">{accuracy}%</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            High Score
          </p>
          <p className="text-4xl font-bold text-yellow-400">{highScore}</p>
        </div>
      </div>

      <div
        ref={gameRef}
        onClick={handleMiss}
        className="relative border-4 border-white/20 rounded-2xl overflow-hidden bg-gradient-to-br from-red-900/20 to-orange-900/20 cursor-crosshair"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        <AnimatePresence>
          {targets.map((target) => (
            <motion.button
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                handleTargetHit(target.id);
              }}
              className="absolute rounded-full bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 flex items-center justify-center shadow-lg"
              style={{
                left: target.x,
                top: target.y,
                width: target.size,
                height: target.size,
              }}
            >
              <Target className="w-1/2 h-1/2 text-white" />
            </motion.button>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-4">Times Up! 🎯</p>
                <p className="text-xl text-white/70 mb-2">Score: {score}</p>
                <p className="text-lg text-white/60 mb-2">Accuracy: {accuracy}%</p>
                <p className="text-md text-white/50 mb-6">Hits: {hits}/{shots}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-3 bg-red-500 text-white rounded-full font-semibold flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isPlaying && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-12 py-4 bg-red-500 text-white rounded-full font-bold text-xl flex items-center gap-3"
              >
                <Play className="w-6 h-6" fill="currentColor" />
                Start Game
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center text-white/60 text-sm">
        <p>Click targets as fast as you can!</p>
        <p className="mt-1">Free Fire aim training mode 🔥</p>
      </div>
    </div>
  );
};

export default ReflexGame;
