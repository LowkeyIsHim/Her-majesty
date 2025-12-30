// lib/weapons.ts - Weapon configurations and mechanics

import { Weapon } from './shooterTypes';

export const WEAPONS: Record<string, Weapon> = {
  AR: {
    id: 'AR',
    name: 'M4A1 Assault Rifle',
    type: 'AR',
    damage: 25,
    fireRate: 10, // shots per second (600 RPM)
    reloadTime: 2000, // milliseconds
    magazineSize: 30,
    reserveAmmo: 120,
    range: 600,
    accuracy: 0.92, // 0-1 (higher = more accurate)
    recoil: 3, // pixels of spread per shot
    bulletSpeed: 1200,
    penetration: false,
  },
  SMG: {
    id: 'SMG',
    name: 'MP5 SMG',
    type: 'SMG',
    damage: 18,
    fireRate: 15, // shots per second (900 RPM)
    reloadTime: 1500,
    magazineSize: 25,
    reserveAmmo: 100,
    range: 400,
    accuracy: 0.85,
    recoil: 4,
    bulletSpeed: 1000,
    penetration: false,
  },
  SNIPER: {
    id: 'SNIPER',
    name: 'AWP Sniper',
    type: 'SNIPER',
    damage: 90,
    fireRate: 0.8, // shots per second (bolt-action)
    reloadTime: 2500,
    magazineSize: 5,
    reserveAmmo: 20,
    range: 1000,
    accuracy: 0.98,
    recoil: 8,
    bulletSpeed: 2000,
    penetration: true,
  },
};

export const getWeaponById = (id: string): Weapon => {
  return WEAPONS[id] || WEAPONS.AR;
};

export const getAllWeapons = (): Weapon[] => {
  return Object.values(WEAPONS);
};

// Calculate bullet spread based on weapon accuracy and player state
export const calculateSpread = (
  weapon: Weapon,
  isMoving: boolean,
  isSprinting: boolean,
  isCrouching: boolean,
  isAiming: boolean
): number => {
  let spreadMultiplier = 1;

  // Movement affects accuracy
  if (isSprinting) {
    spreadMultiplier *= 2.5;
  } else if (isMoving) {
    spreadMultiplier *= 1.5;
  }

  // Crouching improves accuracy
  if (isCrouching) {
    spreadMultiplier *= 0.7;
  }

  // Aiming (ADS) improves accuracy
  if (isAiming) {
    spreadMultiplier *= 0.5;
  }

  // Base spread from weapon inaccuracy
  const baseSpread = (1 - weapon.accuracy) * 30; // Max 30 degrees of spread
  
  return baseSpread * spreadMultiplier;
};

// Calculate damage based on distance (range falloff)
export const calculateDamage = (weapon: Weapon, distance: number): number => {
  if (distance <= weapon.range * 0.5) {
    // Full damage at close range
    return weapon.damage;
  } else if (distance <= weapon.range) {
    // Linear falloff from 50% to max range
    const falloffPercent = (distance - weapon.range * 0.5) / (weapon.range * 0.5);
    return Math.floor(weapon.damage * (1 - falloffPercent * 0.5));
  } else {
    // Minimum damage beyond max range
    return Math.floor(weapon.damage * 0.3);
  }
};

// Generate muzzle flash effect
export const createMuzzleFlash = () => {
  return {
    size: 20 + Math.random() * 15,
    opacity: 0.8 + Math.random() * 0.2,
    duration: 50 + Math.random() * 50, // milliseconds
  };
};

// Generate shell casing ejection
export interface ShellCasing {
  id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  lifetime: number;
}

export const createShellCasing = (
  playerPos: { x: number; y: number },
  playerRotation: number
): ShellCasing => {
  // Eject shell to the right side of the weapon
  const ejectAngle = playerRotation + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
  const ejectSpeed = 100 + Math.random() * 50;

  return {
    id: `shell_${Date.now()}_${Math.random()}`,
    position: {
      x: playerPos.x + Math.cos(playerRotation) * 20,
      y: playerPos.y + Math.sin(playerRotation) * 20,
    },
    velocity: {
      x: Math.cos(ejectAngle) * ejectSpeed,
      y: Math.sin(ejectAngle) * ejectSpeed,
    },
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 10,
    lifetime: 1000, // milliseconds
  };
};

// Weapon switching logic
export const getNextWeapon = (currentWeaponId: string): Weapon => {
  const weaponIds = Object.keys(WEAPONS);
  const currentIndex = weaponIds.indexOf(currentWeaponId);
  const nextIndex = (currentIndex + 1) % weaponIds.length;
  return WEAPONS[weaponIds[nextIndex]];
};

export const getPreviousWeapon = (currentWeaponId: string): Weapon => {
  const weaponIds = Object.keys(WEAPONS);
  const currentIndex = weaponIds.indexOf(currentWeaponId);
  const prevIndex = (currentIndex - 1 + weaponIds.length) % weaponIds.length;
  return WEAPONS[weaponIds[prevIndex]];
};

// Recoil pattern generation
export const applyRecoil = (
  currentRotation: number,
  weapon: Weapon,
  shotsFired: number
): number => {
  // Recoil increases with consecutive shots
  const recoilMultiplier = Math.min(1 + shotsFired * 0.1, 2);
  const recoilAmount = (weapon.recoil / 100) * recoilMultiplier;
  
  // Random recoil direction with slight upward bias
  const recoilAngle = (Math.random() - 0.3) * recoilAmount;
  
  return currentRotation + recoilAngle;
};
