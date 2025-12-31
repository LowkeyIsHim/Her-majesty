// lib/codm/MapRenderer.ts - Realistic Map Rendering (Nuketown, Crossfire style)

import { MapData, Obstacle } from '../shooterTypes';

export class MapRenderer {
  private groundTexture: ImageData | null = null;

  // Draw ground with texture
  drawGround(
    ctx: CanvasRenderingContext2D,
    mapData: MapData,
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ) {
    ctx.save();
    ctx.translate(cameraX, cameraY);

    // Base ground color (desert/urban)
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(0, 0, mapData.width, mapData.height);

    // Grid pattern (like CoDM tactical map)
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 1;

    const gridSize = 100;
    for (let x = 0; x <= mapData.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mapData.height);
      ctx.stroke();
    }
    for (let y = 0; y <= mapData.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mapData.width, y);
      ctx.stroke();
    }

    // Dirt patches
    ctx.fillStyle = 'rgba(60, 50, 40, 0.3)';
    for (let i = 0; i < 20; i++) {
      const x = (Math.sin(i * 123) * 0.5 + 0.5) * mapData.width;
      const y = (Math.cos(i * 456) * 0.5 + 0.5) * mapData.height;
      const size = 30 + Math.sin(i * 789) * 20;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw obstacles with realistic textures
  drawObstacles(
    ctx: CanvasRenderingContext2D,
    mapData: MapData,
    cameraX: number,
    cameraY: number
  ) {
    ctx.save();
    ctx.translate(cameraX, cameraY);

    mapData.obstacles.forEach((obstacle) => {
      this.drawObstacle(ctx, obstacle);
    });

    ctx.restore();
  }

  private drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const { position, width, height, type } = obstacle;

    ctx.save();

    switch (type) {
      case 'wall':
        this.drawWall(ctx, position.x, position.y, width, height);
        break;
      case 'cover':
        this.drawCover(ctx, position.x, position.y, width, height);
        break;
      case 'barrel':
        this.drawBarrel(ctx, position.x, position.y, width, height);
        break;
    }

    ctx.restore();
  }

  private drawWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // Concrete wall with details
    
    // Base
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(x, y, w, h);

    // Shadow side
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(x + w - 5, y, 5, h);
    ctx.fillRect(x, y + h - 5, w, 5);

    // Brick pattern
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 2;
    
    const brickHeight = 20;
    const brickWidth = 40;
    
    for (let by = y; by < y + h; by += brickHeight) {
      const offset = (Math.floor((by - y) / brickHeight) % 2) * (brickWidth / 2);
      for (let bx = x - offset; bx < x + w; bx += brickWidth) {
        ctx.strokeRect(bx, by, brickWidth, brickHeight);
      }
    }

    // Damage/cracks
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y + h * 0.2);
    ctx.lineTo(x + w * 0.4, y + h * 0.4);
    ctx.moveTo(x + w * 0.6, y + h * 0.5);
    ctx.lineTo(x + w * 0.7, y + h * 0.7);
    ctx.stroke();

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
  }

  private drawCover(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // Sandbag barriers (CoDM style)
    
    const sandbagHeight = 15;
    const numSandbags = Math.floor(h / sandbagHeight);

    for (let i = 0; i < numSandbags; i++) {
      const sandbagY = y + i * sandbagHeight;
      const offset = i % 2 === 0 ? 0 : 10;

      // Base sandbag
      ctx.fillStyle = '#8b7355';
      ctx.fillRect(x + offset, sandbagY, w - offset, sandbagHeight - 2);

      // Texture
      ctx.fillStyle = '#6b5745';
      ctx.fillRect(x + offset + 2, sandbagY + 2, w - offset - 4, 3);
      ctx.fillRect(x + offset + 2, sandbagY + 8, w - offset - 4, 3);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x + offset, sandbagY + sandbagHeight - 3, w - offset, 3);

      // Outline
      ctx.strokeStyle = '#4a3f35';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + offset, sandbagY, w - offset, sandbagHeight - 2);
    }
  }

  private drawBarrel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // Explosive barrel (red)
    
    // Barrel body
    const gradient = ctx.createRadialGradient(
      x + w / 2, y + h / 2, 0,
      x + w / 2, y + h / 2, w / 2
    );
    gradient.addColorStop(0, '#dc2626');
    gradient.addColorStop(0.7, '#991b1b');
    gradient.addColorStop(1, '#7f1d1d');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);

    // Hazard stripes
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x, y + h * 0.3, w, h * 0.15);
    ctx.fillRect(x, y + h * 0.6, w, h * 0.15);

    // Warning symbol
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠', x + w / 2, y + h / 2 + 5);

    // Metallic rim
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + 2, y + 2, w * 0.3, h * 0.4);
  }

  // Draw spawn zones (blue/red zones)
  drawSpawnZones(
    ctx: CanvasRenderingContext2D,
    mapData: MapData,
    cameraX: number,
    cameraY: number
  ) {
    ctx.save();
    ctx.translate(cameraX, cameraY);

    // Blue team spawn (translucent blue zone)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    
    mapData.spawnPoints.blue.forEach(spawn => {
      ctx.beginPath();
      ctx.arc(spawn.x, spawn.y, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Red team spawn
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    
    mapData.spawnPoints.red.forEach(spawn => {
      ctx.beginPath();
      ctx.arc(spawn.x, spawn.y, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.setLineDash([]);
    ctx.restore();
  }

  // Draw minimap in corner
  drawMinimap(
    ctx: CanvasRenderingContext2D,
    mapData: MapData,
    playerX: number,
    playerY: number,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const minimapSize = 150;
    const minimapX = canvasWidth - minimapSize - 20;
    const minimapY = 20;
    const scale = minimapSize / Math.max(mapData.width, mapData.height);

    ctx.save();

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);

    // Border
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 3;
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

    // Draw map elements
    ctx.save();
    ctx.translate(minimapX, minimapY);

    // Obstacles
    ctx.fillStyle = '#4a5568';
    mapData.obstacles.forEach(obs => {
      ctx.fillRect(
        obs.position.x * scale,
        obs.position.y * scale,
        obs.width * scale,
        obs.height * scale
      );
    });

    // Player dot
    ctx.fillStyle = '#22c55e';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#22c55e';
    ctx.beginPath();
    ctx.arc(playerX * scale, playerY * scale, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
    ctx.restore();
  }
}
