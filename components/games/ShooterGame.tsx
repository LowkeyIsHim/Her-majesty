'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Crosshair, Heart } from 'lucide-react';
import { saveScore, getLeaderboard, calculateAccuracy } from '@/lib/gameUtils';
import { sounds } from '@/lib/sounds';

interface Enemy {
  id: number;
  x: number;
  y: number;
  size: number;
  health: number;
  speed: number;
  type: 'normal' | 'fast' | 'tank';
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  angle: number;
}

const GAME_WIDTH = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 800) : 800;
const GAME_HEIGHT = typeof window !== 'undefined' ? Math.min(window.innerHeight - 200, 600) : 600;
const GAME_DURATION = 60;

const ShooterGame: React.FC = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [kills, setKills] = useState(0);
  const [shots, setShots] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [ammo, setAmmo] = useState(30);
  const [isReloading, setIsReloading] = useState(false);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const enemyIdRef = useRef(0);
  const bulletIdRef = useRef(0);
  const crosshairRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });

  useEffect(() => {
    const leaderboard = getLeaderboard('shooter');
    if (leaderboard.length > 0) {
      setHighScore(leaderboard[0].score);
    }
  }, []);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0 && playerHealth > 0) {
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
  }, [isPlaying, timeLeft, playerHealth]);

  // Spawn enemies
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playerHealth > 0) {
      interval = setInterval(() => {
        spawnEnemy();
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playerHealth]);

  // Move enemies
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playerHealth > 0) {
      interval = setInterval(() => {
        setEnemies(prev => {
          return prev.map(enemy => {
            const centerX = GAME_WIDTH / 2;
            const centerY = GAME_HEIGHT / 2;
            const dx = centerX - enemy.x;
            const dy = centerY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50) {
              setPlayerHealth(h => Math.max(0, h - 10));
              sounds.hit();
              return { ...enemy, x: -1000 }; // Remove enemy
            }
            
            const moveX = (dx / distance) * enemy.speed;
            const moveY = (dy / distance) * enemy.speed;
            
            return {
              ...enemy,
              x: enemy.x + moveX,
              y: enemy.y + moveY,
            };
          }).filter(e => e.x > -100);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playerHealth]);

  // Move bullets
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setBullets(prev => {
          return prev.map(bullet => ({
            ...bullet,
            x: bullet.x + Math.cos(bullet.angle) * 15,
            y: bullet.y + Math.sin(bullet.angle) * 15,
          })).filter(b => b.x > 0 && b.x < GAME_WIDTH && b.y > 0 && b.y < GAME_HEIGHT);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Check bullet collisions
  useEffect(() => {
    bullets.forEach(bullet => {
      enemies.forEach(enemy => {
        const dx = bullet.x - (enemy.x + enemy.size / 2);
        const dy = bullet.y - (enemy.y + enemy.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < enemy.size / 2) {
          sounds.hit();
          setEnemies(prev => {
            return prev.map(e => {
              if (e.id === enemy.id) {
                const newHealth = e.health - 1;
                if (newHealth <= 0) {
                  setKills(k => k + 1);
                  const points = e.type === 'tank' ? 30 : e.type === 'fast' ? 20 : 10;
                  setScore(s => s + points);
                  sounds.collect();
                  return { ...e, x: -1000 };
                }
                return { ...e, health: newHealth };
              }
              return e;
            });
          });
          setBullets(prev => prev.filter(b => b.id !== bullet.id));
        }
      });
    });
  }, [bullets, enemies]);

  const spawnEnemy = () => {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    
    switch(side) {
      case 0: // top
        x = Math.random() * GAME_WIDTH;
        y = -50;
        break;
      case 1: // right
        x = GAME_WIDTH + 50;
        y = Math.random() * GAME_HEIGHT;
        break;
      case 2: // bottom
        x = Math.random() * GAME_WIDTH;
        y = GAME_HEIGHT + 50;
        break;
      case 3: // left
        x = -50;
        y = Math.random() * GAME_HEIGHT;
        break;
    }

    const rand = Math.random();
    const type: Enemy['type'] = rand > 0.8 ? 'tank' : rand > 0.6 ? 'fast' : 'normal';
    
    const newEnemy: Enemy = {
      id: enemyIdRef.current++,
      x, y,
      size: type === 'tank' ? 60 : type === 'fast' ? 30 : 40,
      health: type === 'tank' ? 3 : 1,
      speed: type === 'fast' ? 3 : type === 'tank' ? 1 : 2,
      type,
    };

    setEnemies(prev => [...prev, newEnemy]);
  };

  const shoot = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying || playerHealth <= 0 || ammo <= 0 || isReloading) return;
    
    const rect = gameRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    
    const angle = Math.atan2(clickY - centerY, clickX - centerX);
    
    const newBullet: Bullet = {
      id: bulletIdRef.current++,
      x: centerX,
      y: centerY,
      angle,
    };

    setBullets(prev => [...prev, newBullet]);
    setAmmo(a => a - 1);
    setShots(s => s + 1);
    sounds.shoot();
  };

  const reload = () => {
    if (isReloading || ammo === 30) return;
    setIsReloading(true);
    setTimeout(() => {
      setAmmo(30);
      setIsReloading(false);
      sounds.collect();
    }, 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = gameRef.current?.getBoundingClientRect();
    if (!rect) return;
    crosshairRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startGame = () => {
    setEnemies([]);
    setBullets([]);
    setScore(0);
    setKills(0);
    setShots(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setGameOver(false);
    setPlayerHealth(100);
    setAmmo(30);
    setIsReloading(false);
    enemyIdRef.current = 0;
    bulletIdRef.current = 0;
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      saveScore('shooter', 'Player', score);
    }
    sounds.gameOver();
  };

  useEffect(() => {
    if (playerHealth <= 0 && isPlaying) {
      endGame();
    }
  }, [playerHealth]);

  const accuracy = calculateAccuracy(kills, shots);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full p-4">
      {/* HUD */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-4 items-center">
          <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white/60 text-xs">Score</p>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
          <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white/60 text-xs">Time</p>
            <p className="text-2xl font-bold text-orange-400">{timeLeft}s</p>
          </div>
          <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white/60 text-xs flex items-center gap-1">
              <Heart className="w-3 h-3" fill={playerHealth > 30 ? 'currentColor' : 'none'} />
              HP
            </p>
            <p className={`text-2xl font-bold ${playerHealth > 30 ? 'text-green-400' : 'text-red-400'}`}>
              {playerHealth}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white/60 text-xs">Ammo</p>
            <p className={`text-2xl font-bold ${ammo < 10 ? 'text-red-400' : 'text-yellow-400'}`}>
              {ammo}/30
            </p>
          </div>
          <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white/60 text-xs">Kills</p>
            <p className="text-2xl font-bold text-white">{kills}</p>
          </div>
          <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white/60 text-xs flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Best
            </p>
            <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameRef}
        onClick={shoot}
        onMouseMove={handleMouseMove}
        className="relative border-4 border-white/20 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 cursor-none"
        style={{ 
          width: GAME_WIDTH, 
          height: GAME_HEIGHT,
          touchAction: 'none'
        }}
      >
        {/* Enemies */}
        <AnimatePresence>
          {enemies.map((enemy) => (
            <motion.div
              key={enemy.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute rounded-full flex items-center justify-center font-bold ${
                enemy.type === 'tank' ? 'bg-gradient-to-br from-purple-600 to-purple-800' :
                enemy.type === 'fast' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                'bg-gradient-to-br from-red-500 to-red-700'
              }`}
              style={{
                left: enemy.x,
                top: enemy.y,
                width: enemy.size,
                height: enemy.size,
              }}
            >
              <span className="text-white text-xs">{enemy.health > 1 ? enemy.health : ''}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Bullets */}
        {bullets.map((bullet) => (
          <motion.div
            key={bullet.id}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: bullet.x - 4,
              top: bullet.y - 4,
              boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)'
            }}
          />
        ))}

        {/* Player (center) */}
        <div
          className="absolute w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center border-2 border-white/50"
          style={{
            left: GAME_WIDTH / 2 - 24,
            top: GAME_HEIGHT / 2 - 24,
          }}
        >
          <Crosshair className="w-6 h-6 text-white" />
        </div>

        {/* Crosshair (follows mouse) */}
        <Crosshair 
          className="absolute w-8 h-8 text-red-500 pointer-events-none"
          style={{
            left: crosshairRef.current.x - 16,
            top: crosshairRef.current.y - 16,
          }}
        />

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
                <p className="text-4xl font-bold text-white mb-4">
                  {playerHealth <= 0 ? 'Defeated!' : 'Time Up!'}
                </p>
                <p className="text-xl text-white/70 mb-2">Score: {score}</p>
                <p className="text-lg text-white/60 mb-2">Kills: {kills}</p>
                <p className="text-md text-white/50 mb-6">Accuracy: {accuracy}%</p>
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
                <Crosshair className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-white mb-4">Aim Trainer</h3>
                <p className="text-white/70 mb-2">🎯 Click to shoot enemies</p>
                <p className="text-white/70 mb-2">💚 Protect your health</p>
                <p className="text-white/70 mb-6">🔫 Reload when out of ammo</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-12 py-4 bg-red-500 text-white rounded-full font-bold text-xl flex items-center gap-3 mx-auto"
                >
                  <Play className="w-6 h-6" fill="currentColor" />
                  Start Game
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reload Button */}
      {isPlaying && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reload}
          disabled={isReloading || ammo === 30}
          className="px-8 py-3 bg-yellow-500 text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isReloading ? 'Reloading...' : `Reload (${ammo}/30)`}
        </motion.button>
      )}
    </div>
  );
};

export default ShooterGame;
