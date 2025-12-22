'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { saveScore, getLeaderboard } from '@/lib/gameUtils';
import { sounds } from '@/lib/sounds';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 40;
const PIPE_WIDTH = 80;
const PIPE_GAP = 200;
const GRAVITY = 0.6;
const JUMP_STRENGTH = -10;

interface Pipe {
  id: number;
  x: number;
  topHeight: number;
  scored: boolean;
}

const FlappyGame: React.FC = () => {
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const pipeIdRef = useRef(0);

  useEffect(() => {
    const leaderboard = getLeaderboard('flappy');
    if (leaderboard.length > 0) {
      setHighScore(leaderboard[0].score);
    }
  }, []);

  // Game loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        // Update bird position
        setBirdY(prev => {
          const newY = prev + birdVelocity;
          if (newY < 0 || newY > GAME_HEIGHT - BIRD_SIZE) {
            endGame();
            return prev;
          }
          return newY;
        });

        // Update bird velocity
        setBirdVelocity(prev => prev + GRAVITY);

        // Move pipes
        setPipes(prev => {
          const updated = prev.map(pipe => ({
            ...pipe,
            x: pipe.x - 3,
          }));

          // Check scoring
          updated.forEach(pipe => {
            if (!pipe.scored && pipe.x + PIPE_WIDTH < GAME_WIDTH / 2 - BIRD_SIZE / 2) {
              pipe.scored = true;
              setScore(s => s + 1);
              sounds.collect();
            }
          });

          // Remove off-screen pipes
          return updated.filter(pipe => pipe.x > -PIPE_WIDTH);
        });
      }, 1000 / 60); // 60 FPS
    }
    return () => clearInterval(interval);
  }, [isPlaying, birdVelocity]);

  // Spawn pipes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
        setPipes(prev => [
          ...prev,
          {
            id: pipeIdRef.current++,
            x: GAME_WIDTH,
            topHeight,
            scored: false,
          },
        ]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Check collisions
  useEffect(() => {
    if (!isPlaying) return;

    const birdLeft = GAME_WIDTH / 2 - BIRD_SIZE / 2;
    const birdRight = birdLeft + BIRD_SIZE;
    const birdTop = birdY;
    const birdBottom = birdY + BIRD_SIZE;

    pipes.forEach(pipe => {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      // Check if bird is within pipe x range
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        // Check if bird hits top or bottom pipe
        if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
          endGame();
        }
      }
    });
  }, [birdY, pipes, isPlaying]);

  const jump = () => {
    if (!isPlaying) return;
    setBirdVelocity(JUMP_STRENGTH);
    sounds.shoot();
  };

  const startGame = () => {
    setBirdY(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setIsPlaying(true);
    setGameOver(false);
    pipeIdRef.current = 0;
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      saveScore('flappy', 'Player', score);
    }
    sounds.gameOver();
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
          <p className="text-white/60 text-sm mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Best
          </p>
          <p className="text-4xl font-bold text-yellow-400">{highScore}</p>
        </div>
      </div>

      {/* Game Area */}
      <div
        onClick={jump}
        onTouchStart={jump}
        className="relative border-4 border-white/20 rounded-2xl overflow-hidden bg-gradient-to-b from-cyan-400 to-blue-500 cursor-pointer"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Bird */}
        <motion.div
          className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl"
          style={{
            left: GAME_WIDTH / 2 - BIRD_SIZE / 2,
            top: birdY,
          }}
          animate={{ rotate: birdVelocity * 3 }}
        >
          ⚽
        </motion.div>

        {/* Pipes */}
        {pipes.map(pipe => (
          <React.Fragment key={pipe.id}>
            {/* Top Pipe */}
            <motion.div
              className="absolute bg-gradient-to-r from-green-600 to-green-700 border-r-4 border-green-800"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.topHeight,
              }}
            />
            {/* Bottom Pipe */}
            <motion.div
              className="absolute bg-gradient-to-r from-green-600 to-green-700 border-r-4 border-green-800"
              style={{
                left: pipe.x,
                top: pipe.topHeight + PIPE_GAP,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP,
              }}
            />
          </React.Fragment>
        ))}

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="text-center p-6">
                <p className="text-4xl font-bold text-white mb-4">Game Over! ⚽</p>
                <p className="text-xl text-white/70 mb-6">Score: {score}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="px-8 py-3 bg-yellow-500 text-white rounded-full font-semibold flex items-center gap-2 mx-auto"
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
              className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="text-center p-6">
                <h3 className="text-3xl font-bold text-white mb-4">Flappy Ball</h3>
                <p className="text-white/70 mb-6">Tap to jump and avoid pipes!</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="px-12 py-4 bg-yellow-500 text-white rounded-full font-bold text-xl flex items-center gap-3 mx-auto"
                >
                  <Play className="w-6 h-6" fill="currentColor" />
                  Start Game
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-white/60 text-sm">Tap or click to jump!</p>
    </div>
  );
};

export default FlappyGame;
