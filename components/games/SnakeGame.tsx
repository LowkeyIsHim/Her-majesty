'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { saveScore, getLeaderboard } from '@/lib/gameUtils';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const leaderboard = getLeaderboard('snake');
    if (leaderboard.length > 0) {
      setHighScore(leaderboard[0].score);
    }
  }, []);

  const generateFood = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  const checkCollision = useCallback((head: Position, snakeBody: Position[]): boolean => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    return snakeBody.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      switch (directionRef.current) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      if (checkCollision(head, prevSnake)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            saveScore('snake', 'Player', newScore);
          }
          return newScore;
        });
        setFood(generateFood());
        setSpeed(prev => Math.max(50, prev - 5));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, highScore, checkCollision, generateFood]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [isPlaying, gameOver, speed, moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      const key = e.key.toLowerCase();
      const newDirection = 
        key === 'arrowup' || key === 'w' ? 'UP' :
        key === 'arrowdown' || key === 's' ? 'DOWN' :
        key === 'arrowleft' || key === 'a' ? 'LEFT' :
        key === 'arrowright' || key === 'd' ? 'RIGHT' : null;

      if (newDirection) {
        const opposites: Record<Direction, Direction> = {
          UP: 'DOWN',
          DOWN: 'UP',
          LEFT: 'RIGHT',
          RIGHT: 'LEFT',
        };

        if (opposites[directionRef.current] !== newDirection) {
          directionRef.current = newDirection;
          setDirection(newDirection);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setSpeed(INITIAL_SPEED);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex gap-8 items-center">
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Score</p>
          <p className="text-4xl font-bold text-white">{score}</p>
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
        className="relative border-4 border-white/20 rounded-2xl overflow-hidden bg-gradient-to-br from-green-900/20 to-emerald-900/20"
        style={{ 
          width: GRID_SIZE * CELL_SIZE, 
          height: GRID_SIZE * CELL_SIZE 
        }}
      >
        {snake.map((segment, index) => (
          <motion.div
            key={index}
            className={`absolute ${
              index === 0 ? 'bg-green-400' : 'bg-green-500'
            } rounded-sm`}
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          />
        ))}

        <motion.div
          className="absolute bg-red-500 rounded-full"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: food.x * CELL_SIZE + 2,
            top: food.y * CELL_SIZE + 2,
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-4">Game Over!</p>
                <p className="text-xl text-white/70 mb-6">Score: {score}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-3 bg-green-500 text-white rounded-full font-semibold flex items-center gap-2 mx-auto"
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
                className="px-12 py-4 bg-green-500 text-white rounded-full font-bold text-xl flex items-center gap-3"
              >
                <Play className="w-6 h-6" fill="currentColor" />
                Start Game
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center text-white/60 text-sm">
        <p>Use Arrow Keys or WASD to move</p>
        <p className="mt-1">Eat the red dots to grow!</p>
      </div>
    </div>
  );
};

export default SnakeGame;
