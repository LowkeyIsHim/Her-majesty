// components/games/ShooterGameCODM.tsx - COMPLETE CALL OF DUTY MOBILE

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Users, Copy, Check, Radio, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Player, Controls, Joystick, Vector2, Bullet, MapData } from '@/lib/shooterTypes';
import { ShooterEngine } from '@/lib/shooterEngine';
import { createDefaultMap } from '@/lib/shooterMap';
import { WEAPONS } from '@/lib/weapons';
import { FPSCamera } from '@/lib/codm/FPSCamera';
import { FPSWeaponView } from '@/lib/codm/FPSWeaponView';
import { FPSRenderer } from '@/lib/codm/FPSRenderer';
import { MultiplayerSync, MatchSettings, MultiplayerState } from '@/lib/codm/MultiplayerSync';

type GameScreen = 'menu' | 'lobby' | 'playing';

const GAME_CONFIG = {
  mapWidth: 2000,
  mapHeight: 1500,
  playerSize: 20,
  playerSpeed: 250,
  sprintMultiplier: 1.6,
  crouchMultiplier: 0.6,
  maxHealth: 100,
  respawnTime: 5000,
  killstreakThreshold: [3, 5, 7],
};

export default function ShooterGameCODM() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Game state
  const [gameScreen, setGameScreen] = useState<GameScreen>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Match state
  const [matchSettings, setMatchSettings] = useState<MatchSettings>({
    mode: 'TDM',
    maxPlayers: 4,
    scoreLimit: 30,
    timeLimit: 600,
    mapName: 'Nuketown',
  });

  // Player & game state
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<Player[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [killFeed, setKillFeed] = useState<Array<{ killer: string; victim: string; time: number }>>([]);
  const [matchTime, setMatchTime] = useState(600);
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const [hitMarker, setHitMarker] = useState<{ active: boolean; time: number }>({ active: false, time: 0 });
  const [killstreak, setKillstreak] = useState(0);

  // Systems
  const [mapData] = useState<MapData>(() => createDefaultMap(GAME_CONFIG.mapWidth, GAME_CONFIG.mapHeight));
  const [engine] = useState(() => new ShooterEngine(GAME_CONFIG, mapData));
  const [camera] = useState(() => new FPSCamera());
  const [weaponView] = useState(() => new FPSWeaponView());
  const [fpsRenderer] = useState(() => new FPSRenderer(camera));
  const [multiplayer] = useState(() => new MultiplayerSync());

  // Controls
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

  // ===== MULTIPLAYER FUNCTIONS =====
  const createRoom = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    try {
      const code = await multiplayer.createRoom(playerName, matchSettings);
      setRoomCode(code);
      setGameScreen('lobby');
      
      // Subscribe to match updates
      multiplayer.subscribeToMatch(handleMatchUpdate);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Check Firebase config.');
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !inputCode.trim()) {
      alert('Please enter your name and room code');
      return;
    }

    try {
      const success = await multiplayer.joinRoom(inputCode, playerName);
      if (success) {
        setRoomCode(inputCode.toUpperCase());
        setGameScreen('lobby');
        multiplayer.subscribeToMatch(handleMatchUpdate);
      } else {
        alert('Failed to join room');
      }
    } catch (error) {
      console.error('Join error:', error);
      alert('Failed to join room');
    }
  };

  const handleMatchUpdate = (state: MultiplayerState) => {
    // Update local player
    const myPlayer = state.players[multiplayer.getPlayerId()];
    if (myPlayer && localPlayer) {
      setLocalPlayer(prev => prev ? { ...prev, ...myPlayer } : myPlayer);
    } else if (myPlayer && !localPlayer) {
      setLocalPlayer(myPlayer);
    }

    // Update other players
    const others = Object.values(state.players).filter(p => p.id !== multiplayer.getPlayerId());
    setOtherPlayers(others);

    // Update bullets
    setBullets(state.bullets);

    // Update scores
    setRedScore(state.redScore);
    setBlueScore(state.blueScore);
    setMatchTime(state.matchTime);

    // Start game if match started
    if (state.matchStarted && gameScreen === 'lobby') {
      setGameScreen('playing');
    }
  };

  const startMatch = async () => {
    await multiplayer.startMatch();
  };

  // ===== SHOOTING LOGIC =====
  const shoot = useCallback(() => {
    if (!localPlayer || localPlayer.isDead || localPlayer.isReloading) return;
    if (localPlayer.ammo <= 0) return;

    const now = Date.now();
    const fireDelay = 1000 / localPlayer.currentWeapon.fireRate;
    if (now - localPlayer.lastShotTime < fireDelay) return;

    // Create bullet
    const bullet = engine.createBullet(localPlayer, localPlayer.currentWeapon, controlsRef.current);
    if (bullet) {
      // Sync to multiplayer
      multiplayer.shootBullet(bullet);
      
      // Update local state
      setLocalPlayer(prev => prev ? {
        ...prev,
        ammo: prev.ammo - 1,
        lastShotTime: now,
        consecutiveShots: prev.consecutiveShots + 1,
      } : null);

      // Visual effects
      setShowMuzzleFlash(true);
      setTimeout(() => setShowMuzzleFlash(false), 80);
      
      weaponView.triggerRecoil(localPlayer.currentWeapon.recoil);
      camera.applyRecoil(localPlayer.currentWeapon.recoil / 2);

      // Sync player state
      if (localPlayer) {
        multiplayer.updatePlayer({
          ...localPlayer,
          ammo: localPlayer.ammo - 1,
          lastShotTime: now,
        });
      }
    }
  }, [localPlayer, engine, multiplayer, weaponView, camera]);

  // Auto-reload
  useEffect(() => {
    if (localPlayer && localPlayer.ammo === 0 && !localPlayer.isReloading && localPlayer.reserveAmmo > 0) {
      startReload();
    }
  }, [localPlayer?.ammo]);

  const startReload = () => {
    if (!localPlayer || localPlayer.isReloading || localPlayer.reserveAmmo === 0) return;
    if (localPlayer.ammo === localPlayer.currentWeapon.magazineSize) return;

    setLocalPlayer(prev => prev ? {
      ...prev,
      isReloading: true,
      reloadStartTime: Date.now(),
    } : null);

    setTimeout(() => {
      setLocalPlayer(prev => {
        if (!prev) return null;
        const ammoNeeded = prev.currentWeapon.magazineSize - prev.ammo;
        const ammoToAdd = Math.min(ammoNeeded, prev.reserveAmmo);

        const updated = {
          ...prev,
          ammo: prev.ammo + ammoToAdd,
          reserveAmmo: prev.reserveAmmo - ammoToAdd,
          isReloading: false,
          reloadStartTime: undefined,
        };

        multiplayer.updatePlayer(updated);
        return updated;
      });
    }, localPlayer.currentWeapon.reloadTime);
  };

  // ===== TOUCH CONTROLS =====
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
          const maxDistance = 80;
          const clampedDistance = Math.min(distance, maxDistance);
          
          const direction = distance > 0 
            ? { x: dx / distance, y: dy / distance }
            : { x: 0, y: 0 };

          controlsRef.current.movement = direction;
          controlsRef.current.isSprinting = distance > maxDistance * 0.8;

          return { ...prev, currentPos: { x, y }, direction, distance: clampedDistance };
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
          controlsRef.current.isShooting = distance > 50;
          controlsRef.current.isAiming = distance > 30 && distance <= 50;

          return { ...prev, currentPos: { x, y }, direction, distance };
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
        setLeftJoystick((prev) => ({ ...prev, active: false, direction: { x: 0, y: 0 }, distance: 0 }));
        controlsRef.current.movement = { x: 0, y: 0 };
        controlsRef.current.isSprinting = false;
      } else {
        setRightJoystick((prev) => ({ ...prev, active: false }));
        controlsRef.current.isShooting = false;
        controlsRef.current.isAiming = false;
      }

      touchesRef.current.delete(touch.identifier);
    });
  }, []);

  // ===== GAME LOOP =====
  const gameLoop = useCallback((timestamp: number) => {
    if (!localPlayer || gameScreen !== 'playing') {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = timestamp;

    // Shoot
    if (controlsRef.current.isShooting) {
      shoot();
    }

    // Update player
    const updatedPlayer = engine.updatePlayer(localPlayer, controlsRef.current, deltaTime);
    
    // Check bullet hits
    const allPlayers = new Map([[localPlayer.id, updatedPlayer], ...otherPlayers.map(p => [p.id, p] as [string, Player])]);
    const { bullets: updatedBullets, hits } = engine.updateBullets(bullets, allPlayers, deltaTime);
    
    // Handle hits
    hits.forEach(hit => {
      if (hit.playerId === localPlayer.id) {
        updatedPlayer.health = Math.max(0, updatedPlayer.health - hit.damage);
        setHitMarker({ active: true, time: Date.now() });
        setTimeout(() => setHitMarker({ active: false, time: 0 }), 200);
      }
      
      if (hit.bulletOwnerId === localPlayer.id) {
        setHitMarker({ active: true, time: Date.now() });
      }
    });

    setLocalPlayer(updatedPlayer);
    setBullets(updatedBullets);

    // Update camera & weapon
    camera.update(updatedPlayer, controlsRef.current.isAiming, deltaTime);
    weaponView.update(deltaTime, controlsRef.current.isShooting);

    // Sync to multiplayer (throttled)
    if (Math.random() < 0.1) { // 10% chance each frame
      multiplayer.updatePlayer(updatedPlayer);
    }

    // Render
    render(updatedPlayer);

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [localPlayer, otherPlayers, bullets, gameScreen, engine, shoot, camera, weaponView, multiplayer]);

  // ===== RENDERING =====
  const render = (player: Player) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw 3D world
    fpsRenderer.drawWorld(ctx, mapData, player, otherPlayers, bullets, canvas.width, canvas.height);

    // Draw weapon in FPP
    const cameraState = camera.getState();
    weaponView.drawWeapon(
      ctx,
      player.currentWeapon,
      controlsRef.current.isAiming,
      player.isSprinting,
      player.isReloading,
      player.reloadStartTime ? (Date.now() - player.reloadStartTime) / player.currentWeapon.reloadTime : 0,
      canvas.width,
      canvas.height,
      cameraState.recoil
    );

    // Muzzle flash
    if (showMuzzleFlash) {
      weaponView.drawMuzzleFlash(ctx, player.currentWeapon, canvas.width, canvas.height);
    }

    // Draw HUD
    drawHUD(ctx, player, canvas.width, canvas.height);
    
    // Draw joysticks
    drawJoystick(ctx, leftJoystick, 'left');
    drawJoystick(ctx, rightJoystick, 'right');
  };

  const drawHUD = (ctx: CanvasRenderingContext2D, player: Player, w: number, h: number) => {
    // Top bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, w, 60);

    // Health (top-left)
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('HP', 20, 25);
    
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(20, 30, 150, 20);
    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(20, 30, 150 * healthPercent, 20);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(player.health).toString(), 95, 45);
    ctx.textAlign = 'left';

    // Score (top-center)
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    const scoreText = matchSettings.mode === 'TDM' 
      ? `BLUE ${blueScore} - ${redScore} RED`
      : `${player.kills} KILLS`;
    ctx.fillText(scoreText, w / 2, 35);
    
    ctx.font = '14px Arial';
    const timeMin = Math.floor(matchTime / 60);
    const timeSec = matchTime % 60;
    ctx.fillText(`${timeMin}:${timeSec.toString().padStart(2, '0')}`, w / 2, 52);
    ctx.textAlign = 'left';

    // Kill feed (top-right)
    ctx.font = '12px Arial';
    killFeed.slice(-3).forEach((kill, i) => {
      const opacity = 1 - (Date.now() - kill.time) / 5000;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.textAlign = 'right';
      ctx.fillText(`${kill.killer} ☠ ${kill.victim}`, w - 20, 20 + i * 20);
    });
    ctx.textAlign = 'left';

    // Ammo (bottom-right)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(w - 200, h - 120, 190, 110);
    
    ctx.fillStyle = player.ammo === 0 ? '#ef4444' : '#fff';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(player.ammo.toString(), w - 20, h - 50);
    
    ctx.fillStyle = '#888';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`/ ${player.reserveAmmo}`, w - 20, h - 20);
    
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(player.currentWeapon.name, w - 20, h - 85);

    // Crosshair
    const cx = w / 2;
    const cy = h / 2;
    ctx.strokeStyle = hitMarker.active ? '#ef4444' : controlsRef.current.isShooting ? '#fbbf24' : '#fff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#000';

    const size = controlsRef.current.isAiming ? 10 : 15;
    const gap = controlsRef.current.isAiming ? 3 : 5;

    ctx.beginPath();
    ctx.moveTo(cx, cy - gap);
    ctx.lineTo(cx, cy - size);
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + size);
    ctx.moveTo(cx - gap, cy);
    ctx.lineTo(cx - size, cy);
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + size, cy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Hit marker
    if (hitMarker.active) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 15);
      ctx.lineTo(cx - 5, cy - 5);
      ctx.moveTo(cx + 15, cy - 15);
      ctx.lineTo(cx + 5, cy - 5);
      ctx.moveTo(cx - 15, cy + 15);
      ctx.lineTo(cx - 5, cy + 5);
      ctx.moveTo(cx + 15, cy + 15);
      ctx.lineTo(cx + 5, cy + 5);
      ctx.stroke();
    }

    // Killstreak icons
    if (killstreak >= 3) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(w - 100, h / 2 - 100, 80, 200);
      
      ctx.fillStyle = killstreak >= 3 ? '#22c55e' : '#4a5568';
      ctx.fillText('⚡ UAV', w - 60, h / 2 - 70);
      
      ctx.fillStyle = killstreak >= 5 ? '#22c55e' : '#4a5568';
      ctx.fillText('💥 STRIKE', w - 60, h / 2 - 30);
      
      ctx.fillStyle = killstreak >= 7 ? '#22c55e' : '#4a5568';
      ctx.fillText('🚁 HELI', w - 60, h / 2 + 10);
    }
  };

  const drawJoystick = (ctx: CanvasRenderingContext2D, joystick: Joystick, side: 'left' | 'right') => {
    if (!joystick.active) return;

    const maxDistance = 80;
    const color = side === 'left' ? '#3b82f6' : '#ef4444';

    ctx.strokeStyle = `${color}50`;
    ctx.fillStyle = `${color}20`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(joystick.startPos.x, joystick.startPos.y, maxDistance, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const stickX = joystick.startPos.x + joystick.direction.x * Math.min(joystick.distance, maxDistance);
    const stickY = joystick.startPos.y + joystick.direction.y * Math.min(joystick.distance, maxDistance);
    
    ctx.fillStyle = `${color}CC`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(stickX, stickY, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(stickX, stickY, 10, 0, Math.PI * 2);
    ctx.fill();
  };

  // Lifecycle
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameLoop]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ===== UI SCREENS =====
  if (gameScreen === 'menu') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-800/90 backdrop-blur-sm border-2 border-blue-500/50 rounded-3xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              CALL OF DUTY
            </h1>
            <p className="text-center text-gray-400 mb-8">MOBILE MULTIPLAYER</p>

            <input
              type="text"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white mb-6 focus:outline-none focus:border-blue-500"
            />

            <div className="mb-6">
              <label className="text-white text-sm mb-2 block">Game Mode:</label>
              <select
                value={matchSettings.mode}
                onChange={(e) => setMatchSettings(prev => ({ ...prev, mode: e.target.value as 'TDM' | 'FFA' }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="TDM">Team Deathmatch (TDM)</option>
                <option value="FFA">Free-for-All (FFA)</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="text-white text-sm mb-2 block">Max Players:</label>
              <select
                value={matchSettings.maxPlayers}
                onChange={(e) => setMatchSettings(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="2">1v1 (2 players)</option>
                <option value="4">2v2 (4 players)</option>
                <option value="6">3v3 (6 players)</option>
                <option value="8">4v4 (8 players)</option>
                <option value="10">5v5 (10 players)</option>
              </select>
            </div>

            <button
              onClick={createRoom}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-lg mb-4 hover:from-blue-500 hover:to-blue-400 transition-all flex items-center justify-center gap-2"
            >
              <Users size={20} />
              CREATE ROOM
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">or join existing</span>
              </div>
            </div>

            <input
              type="text"
              placeholder="ROOM CODE"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center font-mono text-xl mb-4 focus:outline-none focus:border-red-500"
            />

            <button
              onClick={joinRoom}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-bold text-lg hover:from-red-500 hover:to-red-400 transition-all"
            >
              JOIN ROOM
            </button>
