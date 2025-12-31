// lib/codm/Player3D.ts - 3D Player/Soldier Rendering System

import { Player } from '../shooterTypes';

export interface PlayerAnimation {
  type: 'idle' | 'running' | 'shooting' | 'reloading' | 'dead' | 'crouch';
  frame: number;
  maxFrames: number;
}

export class Player3DRenderer {
  private animationTimer: number = 0;
  private animationSpeed: number = 0.15;

  // Draw realistic soldier from top-down view
  drawSoldier(
    ctx: CanvasRenderingContext2D,
    player: Player,
    cameraX: number,
    cameraY: number
  ) {
    ctx.save();
    
    // Apply camera transform
    const screenX = player.position.x + cameraX;
    const screenY = player.position.y + cameraY;
    
    ctx.translate(screenX, screenY);
    ctx.rotate(player.rotation);

    // Determine animation state
    const animation = this.getAnimationState(player);
    
    // Shadow
    this.drawShadow(ctx, player);
    
    // Body parts (top-down tactical view)
    if (player.isDead) {
      this.drawDeadSoldier(ctx, player);
    } else if (player.isCrouching) {
      this.drawCrouchingSoldier(ctx, player, animation);
    } else {
      this.drawStandingSoldier(ctx, player, animation);
    }

    ctx.restore();
  }

  private drawShadow(ctx: CanvasRenderingContext2D, player: Player) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 5, player.size * 0.8, player.size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawStandingSoldier(
    ctx: CanvasRenderingContext2D,
    player: Player,
    animation: PlayerAnimation
  ) {
    const teamColor = player.team === 'blue' ? '#3b82f6' : '#ef4444';
    const shadowColor = player.team === 'blue' ? '#1e40af' : '#991b1b';

    // Backpack
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(-8, -8, 16, 12);

    // Torso (tactical vest)
    ctx.fillStyle = teamColor;
    ctx.fillRect(-10, -5, 20, 25);
    
    // Vest details
    ctx.fillStyle = shadowColor;
    ctx.fillRect(-8, 0, 7, 3);
    ctx.fillRect(1, 0, 7, 3);
    ctx.fillRect(-8, 6, 7, 3);
    ctx.fillRect(1, 6, 7, 3);

    // Arms
    const armOffset = animation.type === 'running' 
      ? Math.sin(animation.frame * 0.5) * 3 
      : 0;
    
    // Left arm
    ctx.fillStyle = teamColor;
    ctx.fillRect(-12, -2 + armOffset, 5, 15);
    
    // Right arm
    ctx.fillRect(7, -2 - armOffset, 5, 15);

    // Legs (animated when running)
    if (player.isMoving) {
      const legSwing = Math.sin(animation.frame * 0.3) * 4;
      
      // Left leg
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(-6, 18, 5, 12 + legSwing);
      
      // Right leg
      ctx.fillRect(1, 18, 5, 12 - legSwing);
    } else {
      // Standing legs
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(-6, 18, 5, 12);
      ctx.fillRect(1, 18, 5, 12);
    }

    // Head (helmet)
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Helmet details
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -10, 7, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();

    // Face (visible part)
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-4, -8, 8, 6);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(-3, -6, 2, 1);
    ctx.fillRect(1, -6, 2, 1);

    // Weapon attachment point (drawn separately)
  }

  private drawCrouchingSoldier(
    ctx: CanvasRenderingContext2D,
    player: Player,
    animation: PlayerAnimation
  ) {
    const teamColor = player.team === 'blue' ? '#3b82f6' : '#ef4444';
    
    ctx.save();
    ctx.scale(1, 0.7); // Squashed appearance when crouching

    // Similar to standing but compressed
    ctx.fillStyle = teamColor;
    ctx.fillRect(-10, -5, 20, 20);
    
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.arc(0, -8, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawDeadSoldier(ctx: CanvasRenderingContext2D, player: Player) {
    ctx.save();
    ctx.rotate(Math.PI / 2); // Fallen on side
    ctx.globalAlpha = 0.5;

    const teamColor = player.team === 'blue' ? '#3b82f6' : '#ef4444';
    
    ctx.fillStyle = teamColor;
    ctx.fillRect(-10, -5, 20, 25);
    
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Blood pool
    ctx.fillStyle = 'rgba(139, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(15, 0, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private getAnimationState(player: Player): PlayerAnimation {
    this.animationTimer += this.animationSpeed;

    if (player.isDead) {
      return { type: 'dead', frame: 0, maxFrames: 1 };
    }
    
    if (player.isReloading) {
      return { type: 'reloading', frame: this.animationTimer, maxFrames: 30 };
    }

    if (player.isCrouching) {
      return { type: 'crouch', frame: this.animationTimer, maxFrames: 1 };
    }

    if (player.isMoving) {
      return { type: 'running', frame: this.animationTimer, maxFrames: 60 };
    }

    return { type: 'idle', frame: this.animationTimer, maxFrames: 120 };
  }

  // Draw name tag above player
  drawNameTag(
    ctx: CanvasRenderingContext2D,
    player: Player,
    cameraX: number,
    cameraY: number
  ) {
    const screenX = player.position.x + cameraX;
    const screenY = player.position.y + cameraY - player.size - 25;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(screenX - 30, screenY - 15, 60, 12);

    ctx.fillStyle = player.team === 'blue' ? '#3b82f6' : '#ef4444';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, screenX, screenY - 6);
    ctx.restore();
  }

  // Draw health/armor bars
  drawStatusBars(
    ctx: CanvasRenderingContext2D,
    player: Player,
    cameraX: number,
    cameraY: number
  ) {
    const screenX = player.position.x + cameraX;
    const screenY = player.position.y + cameraY - player.size - 35;
    const barWidth = 50;
    const barHeight = 4;

    // Health bar
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(screenX - barWidth / 2, screenY, barWidth, barHeight);

    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = healthPercent > 0.6 ? '#22c55e' : 
                    healthPercent > 0.3 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(screenX - barWidth / 2, screenY, barWidth * healthPercent, barHeight);

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX - barWidth / 2, screenY, barWidth, barHeight);
  }
}
