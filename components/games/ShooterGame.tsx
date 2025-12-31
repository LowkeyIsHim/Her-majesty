// components/games/ShooterGame.tsx - COMPLETE CODM-STYLE SHOOTER

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Crosshair } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  Player, 
  Controls, 
  Joystick, 
  Vector2, 
  GameConfig,
  MapData,
  Bullet
} from '@/lib/shooterTypes';
import { ShooterEngine } from '@/lib/shooterEngine';
import { createDefaultMap } from '@/lib/codm/MapRenderer';
import { WEAPONS } from '@/lib/codm/Weapon3D';

const GAME_CONFIG: GameConfig = {
  mapWidth: 2000,
  mapHeight: 1500,
  playerSize: 20,
  playerSpeed: 250,
  sprintMultiplier: 1.6,
  crouchMultiplier: 0.6,
  maxHealth: 100,
  respawnTime: 3000,
  killstreakThreshold: [3, 5, 7],
};

export default function ShooterGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Game state
  const [player, setPlayer] = useState<Player>({
    id: 'player1',
    name: 'You',
    position: { x: 300, y: 400 },
    rotation: 0,
    velocity: { x: 0, y: 0 },
    health: 100,
    maxHealth: 100,
    team: 'blue',
    isMoving: false,
    isSprinting: false,
    isCrouching: false,
    isDead: false,
    kills: 0,
    deaths: 0,
    currentWeapon: WEAPONS.AR,
    ammo: 30,
    reserveAmmo: 120,
    isReloading: false,
    lastShotTime: 0,
    consecutiveShots: 0,
    size: GAME_CONFIG.playerSize,
    speed: GAME_CONFIG.playerSpeed,
    sprintSpeed: GAME_CONFIG.playerSpeed * GAME_CONFIG.sprintMultiplier,
    crouchSpeed: GAME_CONFIG.playerSpeed * GAME_CONFIG.crouchMultiplier,
  });

  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [mapData] = useState<MapData>(() => 
    createDefaultMap(GAME_CONFIG.mapWidth, GAME_CONFIG.mapHeight)
  );
  const [engine] = useState(() => new ShooterEngine(GAME_CONFIG, mapData));
  const [muzzleFlash, setMuzzleFlash] = useState<{ active: boolean; time: number }>({ 
    active: false, 
    time: 0 
  });

  // Controls state
  const controlsRef = useRef<Controls>({
    movement: { x: 0, y: 0 },
    aim: { x: 1, y: 0 },
    isShooting: false,
    isAiming: false,
    isSprinting: false,
    isCrouching: false,
    isReloading: false,
    weaponSwitch: false,
  });

  // Joystick states
  const [leftJoystick, setLeftJoystick] = useState<Joystick>({
    active: false,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    direction: { x: 0, y: 0 },
    distance: 0,
  });

  const [rightJoystick, setRightJoystick] = useState<Joystick>({
    active: false,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    direction: { x: 0, y: 0 },
    distance: 0,
  });

  const touchesRef = useRef<Map<number, { id: number; side: 'left' | 'right' }>>(new Map());

  // ===== SHOOTING LOGIC =====
  const shoot = useCallback(() => {
    if (!player || player.isDead || player.isReloading) return;
    if (player.ammo <= 0) return;

    const now = Date.now();
    const fireDelay = 1000 / player.currentWeapon.fireRate;

    if (now - player.lastShotTime < fireDelay) return;

    const bullet = engine.createBullet(player, player.currentWeapon, controlsRef.current);
    if (bullet) {
      setBullets(prev => [...prev, bullet]);
      
      setPlayer(prev => ({
        ...prev,
        ammo: prev.ammo - 1,
        lastShotTime: now,
        consecutiveShots: prev.consecutiveShots + 1,
      }));

      // Muzzle flash
      setMuzzleFlash({ active: true, time: now });
      setTimeout(() => setMuzzleFlash({ active: false, time: 0 }), 50);
    }
  }, [player, engine]);

  // Auto-reload
  useEffect(() => {
    if (player.ammo === 0 && !player.isReloading && player.reserveAmmo > 0) {
      startReload();
    }
  }, [player.ammo]);

  const startReload = () => {
    if (player.isReloading || player.reserveAmmo === 0) return;
    if (player.ammo === player.currentWeapon.magazineSize) return;

    setPlayer(prev => ({
      ...prev,
      isReloading: true,
      reloadStartTime: Date.now(),
    }));

    setTimeout(() => {
      setPlayer(prev => {
        const ammoNeeded = prev.currentWeapon.magazineSize - prev.ammo;
        const ammoToAdd = Math.min(ammoNeeded, prev.reserveAmmo);

        return {
          ...prev,
          ammo: prev.ammo + ammoToAdd,
          reserveAmmo: prev.reserveAmmo - ammoToAdd,
          isReloading: false,
          reloadStartTime: undefined,
        };
      });
    }, player.currentWeapon.reloadTime);
  };

  // ===== JOYSTICK HANDLING =====
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;

    Array.from(e.changedTouches).forEach((touch) => {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const side = x < centerX ? 'left' : 'right';

      touchesRef.current.set(touch.identifier, { id: touch.identifier, side });

      if (side === 'left') {
        setLeftJoystick({
          active: true,
          startPos: { x, y },
          currentPos: { x, y },
          direction: { x: 0, y: 0 },
          distance: 0,
        });
      } else {
        setRightJoystick({
          active: true,
          startPos: { x, y },
          currentPos: { x, y },
          direction: { x: 0, y: 0 },
          distance: 0,
        });
      }
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    Array.from(e.changedTouches).forEach((touch) => {
      const touchInfo = touchesRef.current.get(touch.identifier);
      if (!touchInfo) return;

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (touchInfo.side === 'left') {
        setLeftJoystick((prev) => {
          const dx = x - prev.startPos.x;
          const dy = y - prev.startPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 60;
          const clampedDistance = Math.min(distance, maxDistance);
          
          const direction = distance > 0 
            ? { x: dx / distance, y: dy / distance }
            : { x: 0, y: 0 };

          controlsRef.current.movement = direction;

          return {
            ...prev,
            currentPos: { x, y },
            direction,
            distance: clampedDistance,
          };
        });
      } else {
        setRightJoystick((prev) => {
          const dx = x - prev.startPos.x;
          const dy = y - prev.startPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const direction = distance > 10
            ? { x: dx / distance, y: dy / distance }
            : prev.direction;

          controlsRef.current.aim = direction;
          
          // Shoot when joystick pushed far enough
          if (distance > 40) {
            controlsRef.current.isShooting = true;
          } else {
            controlsRef.current.isShooting = false;
          }

          return {
            ...prev,
            currentPos: { x, y },
            direction,
            distance,
          };
        });
      }
    });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    Array.from(e.changedTouches).forEach((touch) => {
      const touchInfo = touchesRef.current.get(touch.identifier);
      if (!touchInfo) return;

      if (touchInfo.side === 'left') {
        setLeftJoystick((prev) => ({
          ...prev,
          active: false,
          direction: { x: 0, y: 0 },
          distance: 0,
        }));
        controlsRef.current.movement = { x: 0, y: 0 };
      } else {
        setRightJoystick((prev) => ({
          ...prev,
          active: false,
        }));
        controlsRef.current.isShooting = false;
      }

      touchesRef.current.delete(touch.identifier);
    });
  }, []);

  // ===== GAME LOOP =====
  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = timestamp;

    // Shoot if shooting button held
    if (controlsRef.current.isShooting) {
      shoot();
    }

    // Reset consecutive shots
    if (!controlsRef.current.isShooting && player.consecutiveShots > 0) {
      setPlayer(prev => ({ ...prev, consecutiveShots: 0 }));
    }

    // Update player
    const updatedPlayer = engine.updatePlayer(player, controlsRef.current, deltaTime);
    
    // Update bullets
    const players = new Map([[player.id, updatedPlayer]]);
    const { bullets: updatedBullets, hits } = engine.updateBullets(bullets, players, deltaTime);
    
    // Handle hits
    let playerHealth = updatedPlayer.health;
    hits.forEach(hit => {
      if (hit.playerId === player.id) {
        playerHealth = Math.max(0, playerHealth - hit.damage);
      }
    });

    setPlayer({ ...updatedPlayer, health: playerHealth });
    setBullets(updatedBullets);

    // Render
    render(updatedPlayer, updatedBullets);

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [player, bullets, engine, shoot]);

  // ===== RENDERING =====
  const render = (currentPlayer: Player, currentBullets: Bullet[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate camera
    const cameraX = canvas.width / 2 - currentPlayer.position.x;
    const cameraY = canvas.height / 2 - currentPlayer.position.y;

    ctx.save();
    ctx.translate(cameraX, cameraY);

    // Draw map grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GAME_CONFIG.mapWidth; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_CONFIG.mapHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_CONFIG.mapHeight; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_CONFIG.mapWidth, y);
      ctx.stroke();
    }

    // Draw obstacles
    mapData.obstacles.forEach((obstacle) => {
      if (obstacle.type === 'wall') {
        ctx.fillStyle = '#2a2a2a';
      } else if (obstacle.type === 'cover') {
        ctx.fillStyle = '#3a3a3a';
      } else {
        ctx.fillStyle = '#8b4513';
      }
      ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
      
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.strokeRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
    });

    // Draw bullets
    currentBullets.forEach((bullet) => {
      // Bullet trail
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.6;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fbbf24';
      
      const trailLength = 30;
      const dx = -bullet.velocity.x / bullet.velocity.x * trailLength;
      const dy = -bullet.velocity.y / bullet.velocity.y * trailLength;
      
      ctx.beginPath();
      ctx.moveTo(bullet.position.x, bullet.position.y);
      ctx.lineTo(bullet.position.x + dx, bullet.position.y + dy);
      ctx.stroke();
      ctx.restore();

      // Bullet core
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fbbf24';
      ctx.beginPath();
      ctx.arc(bullet.position.x, bullet.position.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw player
    ctx.save();
    ctx.translate(currentPlayer.position.x, currentPlayer.position.y);
    
    // Player body (tactical soldier)
    ctx.save();
    ctx.rotate(currentPlayer.rotation);
    
    // Body
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-12, -15, 24, 30);
    
    // Head
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -20, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Weapon
    ctx.fillStyle = '#374151';
    ctx.fillRect(10, -3, 25, 6);
    ctx.fillRect(30, -5, 8, 10);
    
    // Muzzle flash
    if (muzzleFlash.active) {
      ctx.fillStyle = '#fbbf24';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(38, 0);
      ctx.lineTo(48, -8);
      ctx.lineTo(55, 0);
      ctx.lineTo(48, 8);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    ctx.restore();
    ctx.restore();

    // Health bar above player
    const barWidth = 50;
    const barHeight = 6;
    const barX = currentPlayer.position.x - barWidth / 2;
    const barY = currentPlayer.position.y - currentPlayer.size - 25;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    const healthPercent = currentPlayer.health / currentPlayer.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    ctx.restore();

    // Draw HUD
    drawHUD(ctx, currentPlayer, canvas);
    
    // Draw joysticks
    drawJoystick(ctx, leftJoystick, 'left');
    drawJoystick(ctx, rightJoystick, 'right');
  };

  const drawJoystick = (ctx: CanvasRenderingContext2D, joystick: Joystick, side: 'left' | 'right') => {
    if (!joystick.active) return;

    const { startPos, direction, distance } = joystick;
    const maxDistance = 60;

    // Outer circle
    ctx.strokeStyle = side === 'left' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)';
    ctx.fillStyle = side === 'left' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(startPos.x, startPos.y, maxDistance, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner stick
    const stickX = startPos.x + direction.x * Math.min(distance, maxDistance);
    const stickY = startPos.y + direction.y * Math.min(distance, maxDistance);
    
    ctx.fillStyle = side === 'left' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowColor = side === 'left' ? '#3b82f6' : '#ef4444';
    ctx.beginPath();
    ctx.arc(stickX, stickY, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Center dot
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(stickX, stickY, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawHUD = (ctx: CanvasRenderingContext2D, currentPlayer: Player, canvas: HTMLCanvasElement) => {
    // Top-left: Health
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 60);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('HEALTH', 20, 30);
    
    const healthPercent = currentPlayer.health / currentPlayer.maxHealth;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(20, 40, 180, 20);
    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(20, 40, 180 * healthPercent, 20);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(currentPlayer.health).toString(), 110, 56);
    ctx.textAlign = 'left';

    // Bottom-right: Ammo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(canvas.width - 160, canvas.height - 100, 150, 90);
    
    ctx.fillStyle = currentPlayer.ammo === 0 ? '#ef4444' : '#fff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(currentPlayer.ammo.toString(), canvas.width - 20, canvas.height - 50);
    
    ctx.fillStyle = '#888';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`/ ${currentPlayer.reserveAmmo}`, canvas.width - 20, canvas.height - 20);
    
    // Weapon name
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(currentPlayer.currentWeapon.name, canvas.width - 20, canvas.height - 75);
    ctx.textAlign = 'left';

    // Reload bar
    if (currentPlayer.isReloading && currentPlayer.reloadStartTime) {
      const progress = (Date.now() - currentPlayer.reloadStartTime) / currentPlayer.currentWeapon.reloadTime;
      const barWidth = 300;
      const barHeight = 8;
      const barX = canvas.width / 2 - barWidth / 2;
      const barY = canvas.height - 80;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(barX - 10, barY - 30, barWidth + 20, 50);
      
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(barX, barY, barWidth * Math.min(progress, 1), barHeight);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('RELOADING...', canvas.width / 2, barY - 10);
      ctx.textAlign = 'left';
    }

    // Crosshair (center)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const crosshairSize = 15;
    const gap = 5;
    
    ctx.strokeStyle = controlsRef.current.isShooting ? '#ef4444' : '#fff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#000';
    
    // Top
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - gap);
    ctx.lineTo(centerX, centerY - crosshairSize);
    ctx.stroke();
    
    // Bottom
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + gap);
    ctx.lineTo(centerX, centerY + crosshairSize);
    ctx.stroke();
    
    // Left
    ctx.beginPath();
    ctx.moveTo(centerX - gap, centerY);
    ctx.lineTo(centerX - crosshairSize, centerY);
    ctx.stroke();
    
    // Right
    ctx.beginPath();
    ctx.moveTo(centerX + gap, centerY);
    ctx.lineTo(centerX + crosshairSize, centerY);
    ctx.stroke();
    
    ctx.shadowBlur = 0;

    // Center dot
    ctx.fillStyle = controlsRef.current.isShooting ? '#ef4444' : '#fff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  // ===== LIFECYCLE =====
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-3 flex items-center justify-between z-10">
        <button
          onClick={() => router.push('/games')}
          className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Exit</span>
        </button>
        <div className="text-white font-bold text-sm sm:text-base">
          🎮 SHOOTER BETA - STAGE 2
        </div>
        <div className="text-green-400 font-mono text-xs sm:text-sm">
          K: {player.kills} | D: {player.deaths}
        </div>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={typeof window !== 'undefined' ? window.innerWidth : 800}
          height={typeof window !== 'undefined' ? window.innerHeight - 48 : 600}
          className="w-full h-full touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />
      </div>
    </div>
  );
    }
