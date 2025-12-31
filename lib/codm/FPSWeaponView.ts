// lib/codm/FPSWeaponView.ts - First Person Weapon Rendering (CoDM Style)

import { Weapon } from '../shooterTypes';

export interface WeaponAnimationState {
  type: 'idle' | 'shoot' | 'reload' | 'inspect' | 'sprint';
  progress: number; // 0 to 1
  frame: number;
}

export class FPSWeaponView {
  private animation: WeaponAnimationState = {
    type: 'idle',
    progress: 0,
    frame: 0,
  };
  
  private recoilOffset: number = 0;
  private swayX: number = 0;
  private swayY: number = 0;
  private sprintBob: number = 0;

  // Draw weapon in first person view (like CoDM)
  drawWeapon(
    ctx: CanvasRenderingContext2D,
    weapon: Weapon,
    isAiming: boolean,
    isSprinting: boolean,
    isReloading: boolean,
    reloadProgress: number,
    canvasWidth: number,
    canvasHeight: number,
    cameraRecoil: number
  ) {
    ctx.save();

    // Weapon position (bottom-right in FPP)
    let weaponX = canvasWidth - 200;
    let weaponY = canvasHeight - 150;

    // ADS position (centered when aiming)
    if (isAiming) {
      weaponX = canvasWidth / 2 - 50;
      weaponY = canvasHeight / 2 + 80;
      this.swayX *= 0.3;
      this.swayY *= 0.3;
    }

    // Sprint animation
    if (isSprinting) {
      weaponY -= 50;
      weaponX += 30;
      this.sprintBob = Math.sin(Date.now() * 0.01) * 15;
      weaponY += this.sprintBob;
    }

    // Apply weapon sway (subtle movement)
    weaponX += this.swayX;
    weaponY += this.swayY;

    // Recoil kick
    weaponY -= this.recoilOffset;
    weaponX -= this.recoilOffset * 0.5;

    // Camera recoil affects weapon
    weaponY -= cameraRecoil * 2;

    ctx.translate(weaponX, weaponY);

    // Reload animation
    if (isReloading) {
      this.drawReloadAnimation(ctx, weapon, reloadProgress);
    } else {
      // Draw weapon based on type
      switch (weapon.type) {
        case 'AR':
          this.drawAssaultRifleFPS(ctx, weapon, isAiming);
          break;
        case 'SMG':
          this.drawSMGFPS(ctx, weapon, isAiming);
          break;
        case 'SNIPER':
          this.drawSniperFPS(ctx, weapon, isAiming);
          break;
      }
    }

    ctx.restore();
  }

  private drawAssaultRifleFPS(
    ctx: CanvasRenderingContext2D,
    weapon: Weapon,
    isAiming: boolean
  ) {
    const scale = isAiming ? 1.2 : 1.5;

    // Receiver (main body)
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(-30 * scale, -10 * scale, 100 * scale, 20 * scale);

    // Barrel (long)
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(70 * scale, -5 * scale, 80 * scale, 10 * scale);

    // Barrel tip
    ctx.fillStyle = '#000';
    ctx.fillRect(148 * scale, -6 * scale, 5 * scale, 12 * scale);

    // Handguard
    ctx.fillStyle = '#374151';
    ctx.fillRect(20 * scale, -8 * scale, 50 * scale, 16 * scale);

    // Rails (top)
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, -12 * scale, 70 * scale, 3 * scale);

    // Magazine
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(10 * scale, 10 * scale, 20 * scale, 40 * scale);
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 2;
    ctx.strokeRect(10 * scale, 10 * scale, 20 * scale, 40 * scale);

    // Stock
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(-60 * scale, -8 * scale, 30 * scale, 16 * scale);

    // Grip (visible from bottom)
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(-5 * scale, 10 * scale, 15 * scale, 30 * scale);

    // Red dot sight
    if (!isAiming) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(30 * scale, -20 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(30 * scale, -20 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Trigger
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(0, 5 * scale, 5 * scale, 8 * scale);

    // Details/scratches
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40 * scale, -5 * scale);
    ctx.lineTo(60 * scale, -5 * scale);
    ctx.stroke();
  }

  private drawSMGFPS(
    ctx: CanvasRenderingContext2D,
    weapon: Weapon,
    isAiming: boolean
  ) {
    const scale = isAiming ? 1.2 : 1.4;

    // Compact body
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(-25 * scale, -8 * scale, 70 * scale, 16 * scale);

    // Short barrel
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(45 * scale, -5 * scale, 50 * scale, 10 * scale);

    // Suppressor
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(93 * scale, -6 * scale, 25 * scale, 12 * scale);

    // Magazine (smaller)
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(10 * scale, 8 * scale, 15 * scale, 30 * scale);

    // Folding stock
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(-25 * scale, 0);
    ctx.lineTo(-50 * scale, -5 * scale);
    ctx.lineTo(-50 * scale, 5 * scale);
    ctx.stroke();

    // Grip
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(-5 * scale, 8 * scale, 12 * scale, 25 * scale);

    // Iron sights
    if (!isAiming) {
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(15 * scale, -10 * scale, 3 * scale, 5 * scale);
      ctx.fillRect(35 * scale, -10 * scale, 3 * scale, 5 * scale);
    }
  }

  private drawSniperFPS(
    ctx: CanvasRenderingContext2D,
    weapon: Weapon,
    isAiming: boolean
  ) {
    const scale = isAiming ? 1.0 : 1.3;

    // Long rifle body
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-40 * scale, -8 * scale, 120 * scale, 16 * scale);

    // Extra long barrel
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(80 * scale, -5 * scale, 100 * scale, 10 * scale);

    // Barrel tip
    ctx.fillStyle = '#000';
    ctx.fillRect(178 * scale, -7 * scale, 5 * scale, 14 * scale);

    // Bolt (side)
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(30 * scale, -12 * scale, 15 * scale, 8 * scale);

    // Large scope
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(20 * scale, -25 * scale, 60 * scale, 15 * scale);
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(20 * scale, -25 * scale, 60 * scale, 15 * scale);

    // Scope reticle (when not ADS)
    if (!isAiming) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40 * scale, -17.5 * scale);
      ctx.lineTo(60 * scale, -17.5 * scale);
      ctx.moveTo(50 * scale, -25 * scale);
      ctx.lineTo(50 * scale, -10 * scale);
      ctx.stroke();
    }

    // Bipod legs
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(60 * scale, 8 * scale);
    ctx.lineTo(60 * scale, 30 * scale);
    ctx.moveTo(80 * scale, 8 * scale);
    ctx.lineTo(80 * scale, 30 * scale);
    ctx.stroke();

    // Stock
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-70 * scale, -10 * scale, 30 * scale, 20 * scale);
  }

  private drawReloadAnimation(
    ctx: CanvasRenderingContext2D,
    weapon: Weapon,
    progress: number
  ) {
    const scale = 1.2;

    // Magazine dropping out (first 30% of reload)
    if (progress < 0.3) {
      const dropOffset = (progress / 0.3) * 80;
      
      ctx.fillStyle = '#2d3748';
      ctx.globalAlpha = 1 - progress / 0.3;
      ctx.fillRect(10 * scale, 10 * scale + dropOffset, 20 * scale, 40 * scale);
      ctx.globalAlpha = 1;
    }

    // New magazine coming in (last 50% of reload)
    if (progress > 0.5) {
      const insertOffset = (1 - (progress - 0.5) / 0.5) * 80;
      
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(10 * scale, -70 * scale + insertOffset, 20 * scale, 40 * scale);
    }

    // Weapon body (stays visible)
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(-30 * scale, -10 * scale, 100 * scale, 20 * scale);

    // Reload text
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`RELOADING... ${Math.floor(progress * 100)}%`, 35 * scale, -30);
  }

  // Update weapon animations
  update(deltaTime: number, isShooting: boolean, mouseMovementX: number = 0, mouseMovementY: number = 0) {
    // Weapon sway from mouse movement
    this.swayX += mouseMovementX * 0.1;
    this.swayY += mouseMovementY * 0.1;

    // Smooth sway decay
    this.swayX *= 0.9;
    this.swayY *= 0.9;

    // Clamp sway
    this.swayX = Math.max(-10, Math.min(10, this.swayX));
    this.swayY = Math.max(-10, Math.min(10, this.swayY));

    // Recoil decay
    if (this.recoilOffset > 0) {
      this.recoilOffset *= 0.8;
      if (this.recoilOffset < 0.5) {
        this.recoilOffset = 0;
      }
    }
  }

  // Trigger recoil animation
  triggerRecoil(amount: number) {
    this.recoilOffset = Math.min(this.recoilOffset + amount, 20);
  }

  // Draw muzzle flash in FPP
  drawMuzzleFlash(
    ctx: CanvasRenderingContext2D,
    weapon: Weapon,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const flashX = canvasWidth - 50;
    const flashY = canvasHeight - 130;

    ctx.save();
    ctx.translate(flashX, flashY);

    // Bright flash
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 200, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
