// components/games/ShooterGame.tsx - Stage 1: Core Engine & Controls

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  Player, 
  Controls, 
  Joystick, 
  Vector2, 
  GameConfig,
  MapData 
} from '@/lib/shooterTypes';
import { ShooterEngine } from '@/lib/shooterEngine';
import { createDefaultMap } from '@/lib/shooterMap';

const GAME_CONFIG: GameConfig = {
  mapWidth: 1200,
  mapHeight: 800,
  playerSize: 15,
  playerSpeed: 200,
  sprintMultiplier: 1.5,
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
    position: { x: 200, y: 400 },
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
    currentWeapon: 0,
    ammo: 30,
    maxAmmo: 30,
    reserveAmmo: 90,
    isReloading: false,
    size: GAME_CONFIG.playerSize,
    speed: GAME_CONFIG.playerSpeed,
    sprintSpeed: GAME_CONFIG.playerSpeed * GAME_CONFIG.sprintMultiplier,
    crouchSpeed: GAME_CONFIG.playerSpeed * GAME_CONFIG.crouchMultiplier,
  });

  const [mapData] = useState<MapData>(() => 
    createDefaultMap(GAME_CONFIG.mapWidth, GAME_CONFIG.mapHeight)
  );
  
  const [engine] = useState(() => new ShooterEngine(GAME_CONFIG, mapData));

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
      }

      touchesRef.current.delete(touch.identifier);
    });
  }, []);

  // ===== GAME LOOP =====
  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // Update player
    const updatedPlayer = engine.updatePlayer(player, controlsRef.current, deltaTime);
    setPlayer(updatedPlayer);

    // Render
    render(updatedPlayer);

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [player, engine]);

  // ===== RENDERING =====
  const render = (currentPlayer: Player) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate camera offset (follow player)
    const cameraX = canvas.width / 2 - currentPlayer.position.x;
    const cameraY = canvas.height / 2 - currentPlayer.position.y;

    ctx.save();
    ctx.translate(cameraX, cameraY);

    // Draw map grid
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GAME_CONFIG.mapWidth; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_CONFIG.mapHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_CONFIG.mapHeight; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_CONFIG.mapWidth, y);
      ctx.stroke();
    }

    // Draw obstacles
    mapData.obstacles.forEach((obstacle) => {
      if (obstacle.type === 'wall') {
        ctx.fillStyle = '#4a4a4a';
      } else if (obstacle.type === 'cover') {
        ctx.fillStyle = '#666666';
      } else {
        ctx.fillStyle = '#8b4513';
      }
      ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
      
      // Border
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.strokeRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
    });

    // Draw player
    ctx.save();
    ctx.translate(currentPlayer.position.x, currentPlayer.position.y);
    ctx.rotate(currentPlayer.rotation);

    // Player body
    ctx.fillStyle = currentPlayer.team === 'blue' ? '#3b82f6' : '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, currentPlayer.size, 0, Math.PI * 2);
    ctx.fill();

    // Player direction indicator
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(currentPlayer.size, 0);
    ctx.lineTo(currentPlayer.size - 5, -3);
    ctx.lineTo(currentPlayer.size - 5, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Health bar above player
    const barWidth = 40;
    const barHeight = 5;
    const barX = currentPlayer.position.x - barWidth / 2;
    const barY = currentPlayer.position.y - currentPlayer.size - 15;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#22c55e';
    const healthWidth = (currentPlayer.health / currentPlayer.maxHealth) * barWidth;
    ctx.fillRect(barX, barY, healthWidth, barHeight);

    ctx.restore();

    // Draw joysticks
    drawJoystick(ctx, leftJoystick, 'left');
    drawJoystick(ctx, rightJoystick, 'right');

    // Draw HUD
    drawHUD(ctx, currentPlayer);
  };

  const drawJoystick = (ctx: CanvasRenderingContext2D, joystick: Joystick, side: 'left' | 'right') => {
    if (!joystick.active) return;

    const { startPos, currentPos, distance } = joystick;
    const maxDistance = 60;

    // Outer circle
    ctx.strokeStyle = side === 'left' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(startPos.x, startPos.y, maxDistance, 0, Math.PI * 2);
    ctx.stroke();

    // Inner circle (stick)
    const stickX = startPos.x + joystick.direction.x * Math.min(distance, maxDistance);
    const stickY = startPos.y + joystick.direction.y * Math.min(distance, maxDistance);
    
    ctx.fillStyle = side === 'left' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)';
    ctx.beginPath();
    ctx.arc(stickX, stickY, 25, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawHUD = (ctx: CanvasRenderingContext2D, currentPlayer: Player) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';

    // Health
    ctx.fillText(`HP: ${Math.round(currentPlayer.health)}`, 20, 30);

    // Position (debug)
    ctx.font = '12px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText(
      `X: ${Math.round(currentPlayer.position.x)} Y: ${Math.round(currentPlayer.position.y)}`,
      20,
      50
    );

    // Speed indicator
    if (currentPlayer.isSprinting) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText('SPRINTING', 20, 70);
    } else if (currentPlayer.isCrouching) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('CROUCHING', 20, 70);
    }
  };

  // ===== LIFECYCLE =====
  useEffect(() => {
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
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/games')}
          className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Exit</span>
        </button>
        <div className="text-white font-bold text-lg">
          SHOOTER - STAGE 1: CONTROLS TEST
        </div>
        <div className="text-green-400 font-mono text-sm">
          K: {player.kills} | D: {player.deaths}
        </div>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - 64}
          className="w-full h-full touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />

        {/* Instructions */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-lg text-center">
          <p className="font-bold mb-1">🎮 STAGE 1: TEST CONTROLS</p>
          <p className="text-sm">Left joystick: Move | Right joystick: Aim</p>
        </div>
      </div>
    </div>
  );
}
