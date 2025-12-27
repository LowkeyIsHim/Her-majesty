'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Crosshair, Settings, Users } from 'lucide-react';
import { ref, set, onValue, off, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { saveScore, getLeaderboard, generateRoomCode } from '@/lib/gameUtils';
import { sounds } from '@/lib/sounds';

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  angle: number;
  health: number;
  armor: number;
  kills: number;
  deaths: number;
  weapon: 'pistol' | 'rifle' | 'sniper';
  isBot?: boolean;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ownerId: string;
  damage: number;
}

interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GAME_WIDTH = 1200;
const GAME_HEIGHT = 800;
const PLAYER_SIZE = 30;
const MOVE_SPEED = 5;
const BOT_SPEED = 3;

const WEAPONS = {
  pistol: { damage: 25, fireRate: 300, ammo: 12, reloadTime: 1500, bulletSpeed: 15, name: '🔫 Pistol' },
  rifle: { damage: 30, fireRate: 150, ammo: 30, reloadTime: 2000, bulletSpeed: 20, name: '🔫 Rifle' },
  sniper: { damage: 100, fireRate: 1000, ammo: 5, reloadTime: 3000, bulletSpeed: 30, name: '🎯 Sniper' },
};

const MAP_WALLS: Wall[] = [
  // Outer walls
  { x: 0, y: 0, width: GAME_WIDTH, height: 20 },
  { x: 0, y: GAME_HEIGHT - 20, width: GAME_WIDTH, height: 20 },
  { x: 0, y: 0, width: 20, height: GAME_HEIGHT },
  { x: GAME_WIDTH - 20, y: 0, width: 20, height: GAME_HEIGHT },
  
  // Interior walls (cover)
  { x: 200, y: 200, width: 150, height: 20 },
  { x: 600, y: 300, width: 20, height: 200 },
  { x: 400, y: 500, width: 200, height: 20 },
  { x: 800, y: 200, width: 150, height: 20 },
  { x: 300, y: 600, width: 20, height: 150 },
  { x: 900, y: 500, width: 100, height: 20 },
];

const CODMGame: React.FC = () => {
  const [gameMode, setGameMode] = useState<'menu' | 'single' | 'multi'>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  
  const [player, setPlayer] = useState<Player>({
    id: 'local',
    name: 'Player',
    x: 100,
    y: 100,
    angle: 0,
    health: 100,
    armor: 100,
    kills: 0,
    deaths: 0,
    weapon: 'pistol',
  });

  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [bots, setBots] = useState<Player[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ammo, setAmmo] = useState(12);
  const [isReloading, setIsReloading] = useState(false);
  const [lastShot, setLastShot] = useState(0);
  const [killFeed, setKillFeed] = useState<Array<{ killer: string; victim: string; time: number }>>([]);
  const [gameTime, setGameTime] = useState(180); // 3 minutes
  const [highScore, setHighScore] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);
  const bulletIdRef = useRef(0);
  const gameLoopRef = useRef<number>();

  useEffect(() => {
    const leaderboard = getLeaderboard('codm');
    if (leaderboard.length > 0) {
      setHighScore(leaderboard[0].score);
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
      
      // Weapon switching
      if (e.key === '1') setPlayer(p => ({ ...p, weapon: 'pistol' }));
      if (e.key === '2') setPlayer(p => ({ ...p, weapon: 'rifle' }));
      if (e.key === '3') setPlayer(p => ({ ...p, weapon: 'sniper' }));
      
      // Reload
      if (e.key.toLowerCase() === 'r' && !isReloading) {
        reload();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isReloading]);

  // Mouse controls
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleClick = () => {
      shoot();
    };

    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousemove', handleMouseMove);
      canvasRef.current.addEventListener('click', handleClick);
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [ammo, isReloading, lastShot, player]);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && gameTime > 0) {
      interval = setInterval(() => {
        setGameTime(t => {
          if (t <= 1) {
            endGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameTime]);

  // Main game loop
  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = () => {
      // Move player
      setPlayer(p => {
        let newX = p.x;
        let newY = p.y;

        if (keys['w'] || keys['arrowup']) newY -= MOVE_SPEED;
        if (keys['s'] || keys['arrowdown']) newY += MOVE_SPEED;
        if (keys['a'] || keys['arrowleft']) newX -= MOVE_SPEED;
        if (keys['d'] || keys['arrowright']) newX += MOVE_SPEED;

        // Calculate angle to mouse
        const dx = mousePos.x - GAME_WIDTH / 2;
        const dy = mousePos.y - GAME_HEIGHT / 2;
        const angle = Math.atan2(dy, dx);

        // Check wall collisions
        const canMove = !MAP_WALLS.some(wall => 
          checkCollision(newX, newY, PLAYER_SIZE, wall)
        );

        if (!canMove) {
          newX = p.x;
          newY = p.y;
        }

        // Boundary check
        newX = Math.max(PLAYER_SIZE, Math.min(GAME_WIDTH - PLAYER_SIZE, newX));
        newY = Math.max(PLAYER_SIZE, Math.min(GAME_HEIGHT - PLAYER_SIZE, newY));

        return { ...p, x: newX, y: newY, angle };
      });

      // Move bots (AI)
      setBots(prev => prev.map(bot => {
        if (bot.health <= 0) return bot;

        // Simple AI: move toward player and shoot
        const dx = player.x - bot.x;
        const dy = player.y - bot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        let newX = bot.x + (dx / distance) * BOT_SPEED;
        let newY = bot.y + (dy / distance) * BOT_SPEED;

        // Check collisions
        const canMove = !MAP_WALLS.some(wall => 
          checkCollision(newX, newY, PLAYER_SIZE, wall)
        );

        if (!canMove) {
          newX = bot.x;
          newY = bot.y;
        }

        // Bot shoots at player
        if (distance < 300 && Math.random() < 0.02) {
          botShoot(bot);
        }

        return { ...bot, x: newX, y: newY, angle };
      }));

      // Move bullets
      setBullets(prev => {
        return prev.map(bullet => ({
          ...bullet,
          x: bullet.x + bullet.vx,
          y: bullet.y + bullet.vy,
        })).filter(bullet => {
          // Remove out of bounds bullets
          if (bullet.x < 0 || bullet.x > GAME_WIDTH || bullet.y < 0 || bullet.y > GAME_HEIGHT) {
            return false;
          }

          // Check wall collisions
          if (MAP_WALLS.some(wall => checkCollision(bullet.x, bullet.y, 5, wall))) {
            return false;
          }

          // Check player hit
          if (bullet.ownerId !== 'local') {
            const dx = bullet.x - player.x;
            const dy = bullet.y - player.y;
            if (Math.sqrt(dx * dx + dy * dy) < PLAYER_SIZE) {
              hitPlayer(bullet.damage, bullet.ownerId);
              return false;
            }
          }

          // Check bot hits
          bots.forEach((bot, index) => {
            if (bullet.ownerId !== bot.id && bot.health > 0) {
              const dx = bullet.x - bot.x;
              const dy = bullet.y - bot.y;
              if (Math.sqrt(dx * dx + dy * dy) < PLAYER_SIZE) {
                hitBot(index, bullet.damage);
                return false;
              }
            }
          });

          return true;
        });
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, keys, mousePos, player, bots]);

  const checkCollision = (x: number, y: number, size: number, wall: Wall) => {
    return (
      x - size < wall.x + wall.width &&
      x + size > wall.x &&
      y - size < wall.y + wall.height &&
      y + size > wall.y
    );
  };

  const shoot = () => {
    if (!isPlaying || ammo <= 0 || isReloading) return;

    const now = Date.now();
    const weaponStats = WEAPONS[player.weapon];
    
    if (now - lastShot < weaponStats.fireRate) return;

    const angle = player.angle;
    const bulletSpeed = weaponStats.bulletSpeed;

    const newBullet: Bullet = {
      id: `bullet-${bulletIdRef.current++}`,
      x: player.x + Math.cos(angle) * PLAYER_SIZE,
      y: player.y + Math.sin(angle) * PLAYER_SIZE,
      vx: Math.cos(angle) * bulletSpeed,
      vy: Math.sin(angle) * bulletSpeed,
      ownerId: 'local',
      damage: weaponStats.damage,
    };

    setBullets(prev => [...prev, newBullet]);
    setAmmo(a => a - 1);
    setLastShot(now);
    sounds.shoot();
  };

  const botShoot = (bot: Player) => {
    const angle = bot.angle;
    const weaponStats = WEAPONS[bot.weapon];
    const bulletSpeed = weaponStats.bulletSpeed;

    const newBullet: Bullet = {
      id: `bullet-${bulletIdRef.current++}`,
      x: bot.x + Math.cos(angle) * PLAYER_SIZE,
      y: bot.y + Math.sin(angle) * PLAYER_SIZE,
      vx: Math.cos(angle) * bulletSpeed,
      vy: Math.sin(angle) * bulletSpeed,
      ownerId: bot.id,
      damage: weaponStats.damage,
    };

    setBullets(prev => [...prev, newBullet]);
    sounds.shoot();
  };

  const hitPlayer = (damage: number, attackerId: string) => {
    setPlayer(p => {
      let newHealth = p.health;
      let newArmor = p.armor;

      if (newArmor > 0) {
        newArmor -= damage;
        if (newArmor < 0) {
          newHealth += newArmor;
          newArmor = 0;
        }
      } else {
        newHealth -= damage;
      }

      if (newHealth <= 0) {
        sounds.gameOver();
        addKillFeed(attackerId, 'You');
        setPlayer(prev => ({ ...prev, deaths: prev.deaths + 1 }));
        respawnPlayer();
        return { ...p, health: 100, armor: 100 };
      }

      sounds.hit();
      return { ...p, health: newHealth, armor: newArmor };
    });
  };

  const hitBot = (botIndex: number, damage: number) => {
    setBots(prev => {
      const newBots = [...prev];
      const bot = newBots[botIndex];

      let newHealth = bot.health - damage;
      
      if (newHealth <= 0) {
        sounds.collect();
        addKillFeed('You', bot.name);
        setPlayer(p => ({ ...p, kills: p.kills + 1 }));
        
        // Respawn bot
        setTimeout(() => {
          setBots(b => {
            const updated = [...b];
            updated[botIndex] = {
              ...bot,
              health: 100,
              x: Math.random() * (GAME_WIDTH - 200) + 100,
              y: Math.random() * (GAME_HEIGHT - 200) + 100,
            };
            return updated;
          });
        }, 3000);
      } else {
        sounds.hit();
      }

      newBots[botIndex] = { ...bot, health: newHealth };
      return newBots;
    });
  };

  const respawnPlayer = () => {
    setTimeout(() => {
      setPlayer(p => ({
        ...p,
        x: Math.random() * (GAME_WIDTH - 200) + 100,
        y: Math.random() * (GAME_HEIGHT - 200) + 100,
        health: 100,
        armor: 100,
      }));
    }, 2000);
  };

  const addKillFeed = (killer: string, victim: string) => {
    setKillFeed(prev => [...prev, { killer, victim, time: Date.now() }].slice(-5));
  };

  const reload = () => {
    if (isReloading) return;
    
    setIsReloading(true);
    const weaponStats = WEAPONS[player.weapon];
    
    setTimeout(() => {
      setAmmo(weaponStats.ammo);
      setIsReloading(false);
      sounds.collect();
    }, weaponStats.reloadTime);
  };

  const startSinglePlayer = () => {
    const initialBots: Player[] = Array.from({ length: 5 }, (_, i) => ({
      id: `bot-${i}`,
      name: `Bot ${i + 1}`,
      x: Math.random() * (GAME_WIDTH - 200) + 100,
      y: Math.random() * (GAME_HEIGHT - 200) + 100,
      angle: 0,
      health: 100,
      armor: 50,
      kills: 0,
      deaths: 0,
      weapon: ['pistol', 'rifle', 'sniper'][Math.floor(Math.random() * 3)] as any,
      isBot: true,
    }));

    setBots(initialBots);
    setPlayer(p => ({ ...p, x: 100, y: 100, health: 100, armor: 100, kills: 0, deaths: 0 }));
    setGameMode('single');
    setIsPlaying(true);
    setGameTime(180);
    setAmmo(WEAPONS.pistol.ammo);
  };

  const endGame = () => {
    setIsPlaying(false);
    const finalScore = player.kills * 100 - player.deaths * 50;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      saveScore('codm', playerName || 'Player', finalScore);
    }
    sounds.gameOver();
  };

  // Remove old kill feed entries
  useEffect(() => {
    const interval = setInterval(() => {
      setKillFeed(prev => prev.filter(k => Date.now() - k.time < 5000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (gameMode === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">🎮 Combat Zone</h1>
          <p className="text-white/70">Choose your game mode</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startSinglePlayer}
            className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-8 rounded-2xl font-bold text-xl"
          >
            <Crosshair className="w-12 h-12 mx-auto mb-4" />
            Single Player
            <p className="text-sm font-normal mt-2 opacity-80">vs AI Bots</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGameMode('multi')}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-8 rounded-2xl font-bold text-xl"
          >
            <Users className="w-12 h-12 mx-auto mb-4" />
            Multiplayer
            <p className="text-sm font-normal mt-2 opacity-80">Coming Soon</p>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full p-4">
      {/* HUD */}
      <div className="w-full max-w-[1200px] flex items-center justify-between flex-wrap gap-4 bg-black/60 backdrop-blur-sm p-3 rounded-xl">
        {/* Left side - Player stats */}
        <div className="flex gap-4">
          <div>
            <p className="text-white/60 text-xs">Health</p>
            <div className="w-32 h-3 bg-black/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all"
                style={{ width: `${player.health}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-white/60 text-xs">Armor</p>
            <div className="w-32 h-3 bg-black/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${player.armor}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center - Score */}
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-green-400 text-2xl font-bold">{player.kills}</p>
            <p className="text-white/60 text-xs">Kills</p>
          </div>
          <div className="text-center">
            <p className="text-red-400 text-2xl font-bold">{player.deaths}</p>
            <p className="text-white/60 text-xs">Deaths</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-400 text-2xl font-bold">
              {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-white/60 text-xs">Time</p>
          </div>
        </div>

        {/* Right side - Weapon/Ammo */}
        <div className="text-right">
          <p className="text-white text-lg font-bold">{WEAPONS[player.weapon].name}</p>
          <p className={`text-2xl font-mono ${ammo < 5 ? 'text-red-400' : 'text-white'}`}>
            {isReloading ? 'RELOADING...' : `${ammo}/${WEAPONS[player.weapon].ammo}`}
          </p>
        </div>
      </div>

      {/* Game Canvas */}
      <div
        ref={canvasRef}
        className="relative border-4 border-white/20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 cursor-crosshair"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Map Walls */}
        {MAP_WALLS.map((wall, i) => (
          <div
            key={i}
            className="absolute bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-900"
            style={{
              left: wall.x,
              top: wall.y,
              width: wall.width,
              height: wall.height,
            }}
          />
        ))}

        {/* Player (centered) */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{
            left: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
            top: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            transform: `rotate(${player.angle}rad)`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full border-2 border-white shadow-lg" />
          <div className="absolute w-6 h-1 bg-white right-0" style={{ transformOrigin: 'left' }} />
        </motion.div>

        {/* Bots (relative to player) */}
        {bots.map((bot) => {
          if (bot.health <= 0) return null;
          
          const relX = bot.x - player.x + GAME_WIDTH / 2;
          const relY = bot.y - player.y + GAME_HEIGHT / 2;
          
          if (relX < -50 || relX > GAME_WIDTH + 50 || relY < -50 || relY > GAME_HEIGHT + 50) {
            return null;
          }

          return (
            <motion.div
              key={bot.id}
              className="absolute flex items-center justify-center"
              style={{
                left: relX - PLAYER_SIZE / 2,
                top: relY - PLAYER_SIZE / 2,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                transform: `rotate(${bot.angle}rad)`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-r from-red-500 to-orange-600 rounded-full border-2 border-white shadow-lg" />
              <div className="absolute -top-8 bg-black/70 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                {bot.name}
                <div className="w-16 h-1 bg-black/50 rounded mt-1">
                  <div className="h-full bg-red-500" style={{ width: `${bot.health}%` }} />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Bullets */}
        {bullets.map((bullet) => {
          const relX = bullet.x - player.x + GAME_WIDTH / 2;
          const relY = bullet.y - player.y + GAME_HEIGHT / 2;

          return (
            <div
              key={bullet.id}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: relX,
                top: relY,
                boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
              }}
            />
          );
        })}

        {/* Crosshair */}
        <Crosshair
          className="absolute w-8 h-8 text-red-500 pointer-events-none"
          style={{
            left: mousePos.x - 16,
            top: mousePos.y - 16,
          }}
        />

        {/* Kill Feed */}
        <div className="absolute top-4 right-4 space-y-1">
          {killFeed.map((kill, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="bg-black/70 px-3 py-1 rounded text-sm text-white"
            >
              <span className="text-green-400">{kill.killer}</span>
              {' 💀 '}
              <span className="text-red-400">{kill.victim}</span>
            </motion.div>
          ))}
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded text-xs text-white/70">
          <p>WASD: Move | Mouse: Aim | Click: Shoot | R: Reload</p>
          <p>1/2/3: Switch Weapons</p>
        </div>
      </div>

      {/* Weapon selector */}
      <div className="flex gap-3">
        {(['pistol', 'rifle', 'sniper'] as const).map((w, i) => (
          <motion.button
            key={w}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPlayer(p => ({ ...p, weapon: w }))}
            className={`px-6 py-3 rounded-xl font-bold ${
              player.weapon === w
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                : 'bg-white/10 text-white/70'
            }`}
          >
            {i + 1}. {WEAPONS[w].name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CODMGame;
