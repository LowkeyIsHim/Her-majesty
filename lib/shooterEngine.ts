// lib/shooterEngine.ts - Core game engine

import { 
  Vector2, 
  Player, 
  Bullet, 
  GameState, 
  Controls, 
  MapData,
  Obstacle,
  GameConfig 
} from './shooterTypes';

export class ShooterEngine {
  private config: GameConfig;
  private mapData: MapData;

  constructor(config: GameConfig, mapData: MapData) {
    this.config = config;
    this.mapData = mapData;
  }

  // ===== PLAYER MOVEMENT =====
  updatePlayer(player: Player, controls: Controls, deltaTime: number): Player {
    if (player.isDead) return player;

    const updated = { ...player };

    // Handle sprinting and crouching
    updated.isSprinting = controls.isSprinting && !controls.isCrouching;
    updated.isCrouching = controls.isCrouching;

    // Calculate speed based on state
    let currentSpeed = this.config.playerSpeed;
    if (updated.isSprinting) {
      currentSpeed *= this.config.sprintMultiplier;
    } else if (updated.isCrouching) {
      currentSpeed *= this.config.crouchMultiplier;
    }

    // Update movement
    if (controls.movement.x !== 0 || controls.movement.y !== 0) {
      updated.isMoving = true;
      
      // Normalize movement vector
      const magnitude = Math.sqrt(
        controls.movement.x ** 2 + controls.movement.y ** 2
      );
      
      const normalizedMovement = {
        x: controls.movement.x / magnitude,
        y: controls.movement.y / magnitude
      };

      // Apply velocity
      updated.velocity = {
        x: normalizedMovement.x * currentSpeed,
        y: normalizedMovement.y * currentSpeed
      };

      // Calculate new position
      const newPosition = {
        x: player.position.x + updated.velocity.x * deltaTime,
        y: player.position.y + updated.velocity.y * deltaTime
      };

      // Check collisions before moving
      if (!this.checkCollision(newPosition, player.size)) {
        updated.position = newPosition;
      } else {
        // Try sliding along walls
        const slideX = {
          x: player.position.x + updated.velocity.x * deltaTime,
          y: player.position.y
        };
        const slideY = {
          x: player.position.x,
          y: player.position.y + updated.velocity.y * deltaTime
        };

        if (!this.checkCollision(slideX, player.size)) {
          updated.position = slideX;
        } else if (!this.checkCollision(slideY, player.size)) {
          updated.position = slideY;
        }
      }
    } else {
      updated.isMoving = false;
      updated.velocity = { x: 0, y: 0 };
    }

    // Update rotation (aim direction)
    if (controls.aim.x !== 0 || controls.aim.y !== 0) {
      updated.rotation = Math.atan2(controls.aim.y, controls.aim.x);
    }

    // Keep player in bounds
    updated.position.x = Math.max(
      player.size,
      Math.min(this.config.mapWidth - player.size, updated.position.x)
    );
    updated.position.y = Math.max(
      player.size,
      Math.min(this.config.mapHeight - player.size, updated.position.y)
    );

    return updated;
  }

  // ===== COLLISION DETECTION =====
  checkCollision(position: Vector2, size: number): boolean {
    // Check map boundaries
    if (
      position.x - size < 0 ||
      position.x + size > this.config.mapWidth ||
      position.y - size < 0 ||
      position.y + size > this.config.mapHeight
    ) {
      return true;
    }

    // Check obstacles
    for (const obstacle of this.mapData.obstacles) {
      if (this.circleRectCollision(position, size, obstacle)) {
        return true;
      }
    }

    return false;
  }

  private circleRectCollision(
    circlePos: Vector2,
    radius: number,
    rect: Obstacle
  ): boolean {
    // Find closest point on rectangle to circle
    const closestX = Math.max(
      rect.position.x,
      Math.min(circlePos.x, rect.position.x + rect.width)
    );
    const closestY = Math.max(
      rect.position.y,
      Math.min(circlePos.y, rect.position.y + rect.height)
    );

    // Calculate distance
    const distanceX = circlePos.x - closestX;
    const distanceY = circlePos.y - closestY;
    const distanceSquared = distanceX ** 2 + distanceY ** 2;

    return distanceSquared < radius ** 2;
  }

  // ===== BULLET PHYSICS =====
  updateBullets(bullets: Bullet[], players: Map<string, Player>, deltaTime: number): {
    bullets: Bullet[];
    hits: Array<{ playerId: string; damage: number; bulletOwnerId: string }>;
  } {
    const updatedBullets: Bullet[] = [];
    const hits: Array<{ playerId: string; damage: number; bulletOwnerId: string }> = [];

    for (const bullet of bullets) {
      // Move bullet
      const newPosition = {
        x: bullet.position.x + bullet.velocity.x * deltaTime,
        y: bullet.position.y + bullet.velocity.y * deltaTime
      };

      const distance = Math.sqrt(
        bullet.velocity.x ** 2 + bullet.velocity.y ** 2
      ) * deltaTime;

      bullet.distanceTraveled += distance;

      // Check if bullet exceeded range
      if (bullet.distanceTraveled > bullet.maxRange) {
        continue; // Remove bullet
      }

      // Check map boundaries
      if (
        newPosition.x < 0 ||
        newPosition.x > this.config.mapWidth ||
        newPosition.y < 0 ||
        newPosition.y > this.config.mapHeight
      ) {
        continue; // Remove bullet
      }

      // Check obstacle collision
      let hitObstacle = false;
      for (const obstacle of this.mapData.obstacles) {
        if (this.pointRectCollision(newPosition, obstacle)) {
          hitObstacle = true;
          break;
        }
      }

      if (hitObstacle) {
        continue; // Remove bullet
      }

      // Check player collision
      let hitPlayer = false;
      for (const [playerId, player] of players) {
        // Don't hit own bullets or dead players or teammates
        if (
          playerId === bullet.ownerId ||
          player.isDead ||
          (bullet.ownerTeam !== 'none' && player.team === bullet.ownerTeam)
        ) {
          continue;
        }

        const distance = Math.sqrt(
          (newPosition.x - player.position.x) ** 2 +
          (newPosition.y - player.position.y) ** 2
        );

        if (distance < player.size + bullet.size) {
          hits.push({
            playerId,
            damage: bullet.damage,
            bulletOwnerId: bullet.ownerId
          });
          hitPlayer = true;
          break;
        }
      }

      if (hitPlayer) {
        continue; // Remove bullet
      }

      // Update bullet position
      bullet.position = newPosition;
      updatedBullets.push(bullet);
    }

    return { bullets: updatedBullets, hits };
  }

  private pointRectCollision(point: Vector2, rect: Obstacle): boolean {
    return (
      point.x >= rect.position.x &&
      point.x <= rect.position.x + rect.width &&
      point.y >= rect.position.y &&
      point.y <= rect.position.y + rect.height
    );
  }

  // ===== UTILITY FUNCTIONS =====
  getDistance(pos1: Vector2, pos2: Vector2): number {
    return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2);
  }

  normalizeVector(vector: Vector2): Vector2 {
    const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);
    if (magnitude === 0) return { x: 0, y: 0 };
    return {
      x: vector.x / magnitude,
      y: vector.y / magnitude
    };
  }

  getRandomSpawnPoint(team: 'red' | 'blue' | 'ffa'): Vector2 {
    const spawnPoints = this.mapData.spawnPoints[team];
    const randomIndex = Math.floor(Math.random() * spawnPoints.length);
    return { ...spawnPoints[randomIndex] };
  }

  isLineOfSight(from: Vector2, to: Vector2): boolean {
    // Simple raycasting for line of sight
    const steps = 20;
    const dx = (to.x - from.x) / steps;
    const dy = (to.y - from.y) / steps;

    for (let i = 0; i <= steps; i++) {
      const checkPoint = {
        x: from.x + dx * i,
        y: from.y + dy * i
      };

      for (const obstacle of this.mapData.obstacles) {
        if (this.pointRectCollision(checkPoint, obstacle)) {
          return false;
        }
      }
    }

    return true;
  }
}
