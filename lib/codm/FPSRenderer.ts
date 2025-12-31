// lib/codm/FPSRenderer.ts - First Person 3D World Renderer

import { Player, Bullet, MapData, Obstacle } from '../shooterTypes';
import { FPSCamera } from './FPSCamera';

export class FPSRenderer {
  private camera: FPSCamera;

  constructor(camera: FPSCamera) {
    this.camera = camera;
  }

  // Draw 3D world from first person perspective
  drawWorld(
    ctx: CanvasRenderingContext2D,
    mapData: MapData,
    localPlayer: Player,
    otherPlayers: Player[],
    bullets: Bullet[],
    canvasWidth: number,
    canvasHeight: number
  ) {
    // Sky/ceiling
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight / 2);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight / 2);

    // Ground
    const groundGradient = ctx.createLinearGradient(0, canvasHeight / 2, 0, canvasHeight);
    groundGradient.addColorStop(0, '#2a2a2a');
    groundGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);

    // Draw world elements sorted by distance
    const renderQueue: Array<{
      distance: number;
      draw: () => void;
    }> = [];

    // Add obstacles to render queue
    mapData.obstacles.forEach(obstacle => {
      const distance = this.getDistanceToObstacle(obstacle, localPlayer.position);
      renderQueue.push({
        distance,
        draw: () => this.drawObstacle3D(ctx, obstacle, canvasWidth, canvasHeight),
      });
    });

    // Add other players to render queue
    otherPlayers.forEach(player => {
      const distance = this.getDistance(localPlayer.position, player.position);
      renderQueue.push({
        distance,
        draw: () => this.drawPlayer3D(ctx, player, canvasWidth, canvasHeight),
      });
    });

    // Add bullets to render queue
    bullets.forEach(bullet => {
      const distance = this.getDistance(localPlayer.position, bullet.position);
      renderQueue.push({
        distance,
        draw: () => this.drawBullet3D(ctx, bullet, canvasWidth, canvasHeight),
      });
    });

    // Sort by distance (far to near)
    renderQueue.sort((a, b) => b.distance - a.distance);

    // Draw everything
    renderQueue.forEach(item => item.draw());
  }

  // Draw obstacle in 3D perspective
  private drawObstacle3D(
    ctx: CanvasRenderingContext2D,
    obstacle: Obstacle,
    canvasWidth: number,
    canvasHeight: number
  ) {
    // Get corners of obstacle
    const corners = [
      { x: obstacle.position.x, y: obstacle.position.y },
      { x: obstacle.position.x + obstacle.width, y: obstacle.position.y },
      { x: obstacle.position.x + obstacle.width, y: obstacle.position.y + obstacle.height },
      { x: obstacle.position.x, y: obstacle.position.y + obstacle.height },
    ];

    // Project corners to screen
    const projectedCorners = corners.map(corner => 
      this.camera.worldToScreen(corner.x, corner.y, canvasWidth, canvasHeight)
    );

    // Check if any corner is visible
    const visible = projectedCorners.some(p => p.visible);
    if (!visible) return;

    // Draw based on obstacle type
    const avgDistance = projectedCorners.reduce((sum, p) => sum + p.distance, 0) / 4;
    const scale = Math.max(0.2, 1 - avgDistance / 800);

    ctx.save();

    // Color based on type
    if (obstacle.type === 'wall') {
      ctx.fillStyle = '#4a5568';
    } else if (obstacle.type === 'cover') {
      ctx.fillStyle = '#6b5d4f';
    } else {
      ctx.fillStyle = '#dc2626';
    }

    // Draw as perspective quad
    ctx.beginPath();
    ctx.moveTo(projectedCorners[0].x, projectedCorners[0].y);
    ctx.lineTo(projectedCorners[1].x, projectedCorners[1].y);
    ctx.lineTo(projectedCorners[2].x, projectedCorners[2].y);
    ctx.lineTo(projectedCorners[3].x, projectedCorners[3].y);
    ctx.closePath();
    ctx.fill();

    // Shadow/depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  // Draw other player in 3D
  private drawPlayer3D(
    ctx: CanvasRenderingContext2D,
    player: Player,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const screenPos = this.camera.worldToScreen(
      player.position.x,
      player.position.y,
      canvasWidth,
      canvasHeight
    );

    if (!screenPos.visible) return;

    // Size based on distance
    const scale = Math.max(0.3, 1 - screenPos.distance / 600);
    const playerHeight = 80 * scale;
    const playerWidth = 30 * scale;

    ctx.save();

    // Draw soldier model
    const x = screenPos.x;
    const y = screenPos.y;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + playerHeight / 2, playerWidth / 2, 10 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const teamColor = player.team === 'blue' ? '#3b82f6' : '#ef4444';
    ctx.fillStyle = teamColor;
    ctx.fillRect(x - playerWidth / 2, y - playerHeight / 2, playerWidth, playerHeight * 0.6);

    // Head
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.arc(x, y - playerHeight / 2 - 10 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Weapon (simple line)
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(x + playerWidth / 2, y);
    ctx.lineTo(x + playerWidth / 2 + 20 * scale, y);
    ctx.stroke();

    // Name tag
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 40 * scale, y - playerHeight / 2 - 30 * scale, 80 * scale, 15 * scale);
    
    ctx.fillStyle = teamColor;
    ctx.font = `bold ${10 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(player.name, x, y - playerHeight / 2 - 20 * scale);

    // Health bar
    const barWidth = 40 * scale;
    const barHeight = 4 * scale;
    const healthPercent = player.health / player.maxHealth;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - barWidth / 2, y - playerHeight / 2 - 40 * scale, barWidth, barHeight);

    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(x - barWidth / 2, y - playerHeight / 2 - 40 * scale, barWidth * healthPercent, barHeight);

    ctx.restore();
  }

  // Draw bullet in 3D
  private drawBullet3D(
    ctx: CanvasRenderingContext2D,
    bullet: Bullet,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const screenPos = this.camera.worldToScreen(
      bullet.position.x,
      bullet.position.y,
      canvasWidth,
      canvasHeight
    );

    if (!screenPos.visible) return;

    const scale = Math.max(0.5, 1 - screenPos.distance / 400);

    ctx.save();

    // Bullet trail
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3 * scale;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fbbf24';
    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    const trailEnd = this.camera.worldToScreen(
      bullet.position.x - bullet.velocity.x * 0.02,
      bullet.position.y - bullet.velocity.y * 0.02,
      canvasWidth,
      canvasHeight
    );
    ctx.lineTo(trailEnd.x, trailEnd.y);
    ctx.stroke();

    // Bullet core
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#fbbf24';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Helper: Get distance to obstacle
  private getDistanceToObstacle(obstacle: Obstacle, playerPos: { x: number; y: number }): number {
    const centerX = obstacle.position.x + obstacle.width / 2;
    const centerY = obstacle.position.y + obstacle.height / 2;
    return this.getDistance(playerPos, { x: centerX, y: centerY });
  }

  // Helper: Get distance between points
  private getDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
