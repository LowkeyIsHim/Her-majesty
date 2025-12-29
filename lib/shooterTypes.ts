// lib/shooterTypes.ts - Type definitions for shooter game

export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  position: Vector2;
  rotation: number; // angle in radians
  velocity: Vector2;
  health: number;
  maxHealth: number;
  team: 'red' | 'blue' | 'none';
  isMoving: boolean;
  isSprinting: boolean;
  isCrouching: boolean;
  isDead: boolean;
  kills: number;
  deaths: number;
  currentWeapon: number; // index in weapons array
  ammo: number;
  maxAmmo: number;
  reserveAmmo: number;
  isReloading: boolean;
  size: number;
  speed: number;
  sprintSpeed: number;
  crouchSpeed: number;
}

export interface Weapon {
  id: string;
  name: string;
  type: 'AR' | 'SMG' | 'SNIPER' | 'SHOTGUN';
  damage: number;
  fireRate: number; // shots per second
  reloadTime: number; // milliseconds
  magazineSize: number;
  reserveAmmo: number;
  range: number;
  accuracy: number; // 0-1
  recoil: number;
  bulletSpeed: number;
  penetration: boolean;
  burstCount?: number; // for burst weapons
}

export interface Bullet {
  id: string;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  ownerId: string;
  ownerTeam: 'red' | 'blue' | 'none';
  distanceTraveled: number;
  maxRange: number;
  size: number;
}

export interface GameState {
  players: Map<string, Player>;
  bullets: Bullet[];
  playerId: string;
  gameMode: 'TDM' | 'FFA' | 'PRACTICE';
  isMultiplayer: boolean;
  matchTime: number; // seconds remaining
  maxTime: number;
  redScore: number;
  blueScore: number;
  scoreLimit: number;
  isPaused: boolean;
  isGameOver: boolean;
  winner?: 'red' | 'blue' | null;
}

export interface Controls {
  movement: Vector2; // normalized direction from joystick
  aim: Vector2; // direction player is aiming
  isShooting: boolean;
  isAiming: boolean; // ADS
  isSprinting: boolean;
  isCrouching: boolean;
  isReloading: boolean;
  weaponSwitch: boolean;
}

export interface Joystick {
  active: boolean;
  startPos: Vector2;
  currentPos: Vector2;
  direction: Vector2;
  distance: number;
}

export interface MapData {
  width: number;
  height: number;
  obstacles: Obstacle[];
  spawnPoints: {
    red: Vector2[];
    blue: Vector2[];
    ffa: Vector2[];
  };
}

export interface Obstacle {
  position: Vector2;
  width: number;
  height: number;
  type: 'wall' | 'cover' | 'barrel';
  destructible: boolean;
  health?: number;
}

export interface KillFeedItem {
  killer: string;
  victim: string;
  weapon: string;
  timestamp: number;
  isHeadshot?: boolean;
}

export interface GameConfig {
  mapWidth: number;
  mapHeight: number;
  playerSize: number;
  playerSpeed: number;
  sprintMultiplier: number;
  crouchMultiplier: number;
  maxHealth: number;
  respawnTime: number;
  killstreakThreshold: [number, number, number]; // [UAV, Airstrike, Chopper]
}
