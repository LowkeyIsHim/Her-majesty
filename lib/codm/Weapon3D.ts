// lib/codm/Weapon3D.ts - 3D Weapon Rendering System

import { Player, Weapon } from '../shooterTypes';

export interface MuzzleFlashEffect {
  active: boolean;
  size: number;
  rotation: number;
  opacity: number;
  startTime: number;
}

export class Weapon3DRenderer {
  private recoilOffset: number = 0;
  private muzzleFlash: MuzzleFlashEffect = {
    active: false,
    size: 0,
    rotation: 0,
    opacity: 0,
    startTime: 0,
  };

  // Draw weapon attached to player
  drawWeapon(
    ctx: CanvasRenderingContext2D,
    player: Player,
    cameraX: number,
    cameraY: number,
    isShooting: boolean
  ) {
    ctx.save();
    
    const screenX = player.position.x + cameraX;
    const screenY = player.position.y + cameraY;
    
    ctx.translate(screenX, screenY);
    ctx.rotate(player.rotation);

    // Apply recoil
    if (isShooting && this.recoilOffset < 5) {
      this.recoilOffset += 1;
    } else if (this.recoilOffset > 0) {
      this.recoilOffset -= 0.5;
    }

    ctx.translate(-this.recoilOffset, 0);

    // Draw weapon based on type
    const weapon = player.currentWeapon;
    
    switch (weapon.type) {
      case 'AR':
        this.drawAssaultRifle(ctx, weapon);
        break;
      case 'SMG':
        this.drawSMG(ctx, weapon);
        break;
      case 'SNIPER':
        this.drawSniper(ctx, weapon);
        break;
      default:
        this.drawAssaultRifle(ctx, weapon);
    }

    // Muzzle flash
    if (this.muzzleFlash.active) {
      this.drawMuzzleFlash(ctx, weapon);
    }

    ctx.restore();
  }

  private drawAssaultRifle(ctx: CanvasRenderingContext2D, weapon: Weapon) {
    // M4A1 style rifle
    
    // Stock
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(-15, -2, 10, 4);

    // Receiver/Body
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(-5, -4, 30, 8);
    
    // Top rail
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, -5, 20, 2);

    // Magazine
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(5, 4, 8, 15);
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 4, 8, 15);

    // Barrel
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(25, -2, 20, 4);
    
    // Barrel tip
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(44, -3, 3, 6);

    // Grip
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 4, 6, 10);

    // Scope/Red dot
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(12, -7, 3, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(12, -7, 1, 0, Math.PI * 2);
    ctx.fill();

    // Details
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, -4);
    ctx.lineTo(10, 4);
    ctx.stroke();
  }

  private drawSMG(ctx: CanvasRenderingContext2D, weapon: Weapon) {
    // MP5 style SMG - smaller, compact
    
    // Stock
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(-12, -2, 8, 4);

    // Body (shorter)
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(-4, -3, 22, 6);

    // Magazine (smaller)
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(4, 3, 6, 12);

    // Barrel (shorter)
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(18, -2, 15, 4);
    
    // Suppressor
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(32, -2.5, 8, 5);

    // Grip
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(2, 3, 5, 8);
  }

  private drawSniper(ctx: CanvasRenderingContext2D, weapon: Weapon) {
    // AWP style sniper - long barrel
    
    // Stock
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-20, -2, 15, 5);

    // Body
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(-5, -3, 35, 6);

    // Long barrel
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(30, -2, 35, 4);
    
    // Barrel tip
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(64, -3, 4, 6);

    // Large scope
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(8, -10, 20, 6);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, -10, 20, 6);
    
    // Crosshair in scope
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, -7);
    ctx.lineTo(21, -7);
    ctx.moveTo(18, -10);
    ctx.lineTo(18, -4);
    ctx.stroke();

    // Bipod
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(25, 3);
    ctx.lineTo(25, 8);
    ctx.moveTo(35, 3);
    ctx.lineTo(35, 8);
    ctx.stroke();
  }

  private drawMuzzleFlash(ctx: CanvasRenderingContext2D, weapon: Weapon) {
    const flashLength = weapon.type === 'SNIPER' ? 40 : 
                        weapon.type === 'SMG' ? 20 : 30;
    const flashWidth = weapon.type === 'SNIPER' ? 15 : 10;

    const barrelTip = weapon.type === 'SNIPER' ? 68 :
                       weapon.type === 'SMG' ? 40 : 47;

    ctx.save();
    ctx.translate(barrelTip, 0);
    ctx.rotate(this.muzzleFlash.rotation);

    // Outer glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flashLength);
    gradient.addColorStop(0, 'rgba(255, 200, 0, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = this.muzzleFlash.opacity;
    
    // Star-burst pattern
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const length = i % 2 === 0 ? flashLength : flashLength * 0.6;
      const x = Math.cos(angle) * length;
      const y = Math.sin(angle) * length;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Bright center
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = this.muzzleFlash.opacity * 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Trigger muzzle flash
  triggerMuzzleFlash() {
    this.muzzleFlash = {
      active: true,
      size: 20 + Math.random() * 10,
      rotation: Math.random() * Math.PI * 2,
      opacity: 0.8 + Math.random() * 0.2,
      startTime: Date.now(),
    };

    setTimeout(() => {
      this.muzzleFlash.active = false;
    }, 80);
  }

  // Draw shell casing ejection
  drawShellCasing(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.fillStyle = '#d4af37';
    ctx.fillRect(-2, -4, 4, 8);
    
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(-2, 4, 4, 2);

    ctx.restore();
  }

  // Update animations
  update(deltaTime: number) {
    // Decay recoil
    if (this.recoilOffset > 0) {
      this.recoilOffset = Math.max(0, this.recoilOffset - deltaTime * 20);
    }

    // Update muzzle flash opacity
    if (this.muzzleFlash.active) {
      const elapsed = Date.now() - this.muzzleFlash.startTime;
      this.muzzleFlash.opacity = Math.max(0, 1 - elapsed / 80);
    }
  }
}
