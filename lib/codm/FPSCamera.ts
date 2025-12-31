// lib/codm/FPSCamera.ts - First Person Shooter Camera System

import { Player, Vector2 } from '../shooterTypes';

export interface CameraState {
  position: Vector2;
  rotation: number;
  fov: number; // Field of view
  viewDistance: number;
  bob: number; // Head bob when moving
  recoilKick: number; // Camera kick from recoil
  adsZoom: number; // Aim down sights zoom
}

export class FPSCamera {
  private camera: CameraState;
  private bobTimer: number = 0;
  private recoilDecay: number = 0;
  
  // CoDM-style camera settings
  private readonly BASE_FOV = 90;
  private readonly ADS_FOV = 65;
  private readonly VIEW_DISTANCE = 800;
  private readonly BOB_SPEED = 8;
  private readonly BOB_AMOUNT = 2;

  constructor() {
    this.camera = {
      position: { x: 0, y: 0 },
      rotation: 0,
      fov: this.BASE_FOV,
      viewDistance: this.VIEW_DISTANCE,
      bob: 0,
      recoilKick: 0,
      adsZoom: 1,
    };
  }

  // Update camera based on player state
  update(player: Player, isAiming: boolean, deltaTime: number) {
    // Position matches player
    this.camera.position = { ...player.position };
    this.camera.rotation = player.rotation;

    // ADS zoom
    if (isAiming) {
      this.camera.adsZoom = 0.7; // Zoomed in
      this.camera.fov = this.ADS_FOV;
    } else {
      this.camera.adsZoom = 1.0;
      this.camera.fov = this.BASE_FOV;
    }

    // Head bob when moving
    if (player.isMoving && !isAiming) {
      this.bobTimer += deltaTime * this.BOB_SPEED;
      this.camera.bob = Math.sin(this.bobTimer) * this.BOB_AMOUNT;
      
      // Sprint increases bob
      if (player.isSprinting) {
        this.camera.bob *= 1.5;
      }
    } else {
      this.bobTimer = 0;
      this.camera.bob *= 0.9; // Smooth decay
    }

    // Recoil decay
    if (this.camera.recoilKick > 0) {
      this.camera.recoilKick *= 0.85;
      if (this.camera.recoilKick < 0.1) {
        this.camera.recoilKick = 0;
      }
    }
  }

  // Apply recoil kick (called when shooting)
  applyRecoil(amount: number) {
    this.camera.recoilKick = Math.min(this.camera.recoilKick + amount, 15);
  }

  // Get camera transformation for rendering
  getTransform() {
    return {
      x: this.camera.position.x,
      y: this.camera.position.y,
      rotation: this.camera.rotation,
      bob: this.camera.bob,
      recoil: this.camera.recoilKick,
      zoom: this.camera.adsZoom,
    };
  }

  // Project 3D world point to screen (for other players)
  worldToScreen(
    worldX: number,
    worldY: number,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; y: number; distance: number; visible: boolean } {
    // Vector from camera to point
    const dx = worldX - this.camera.position.x;
    const dy = worldY - this.camera.position.y;

    // Distance
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Angle from camera forward direction
    const angleToPoint = Math.atan2(dy, dx);
    const relativeAngle = angleToPoint - this.camera.rotation;

    // Normalize angle to -PI to PI
    let normalizedAngle = relativeAngle;
    while (normalizedAngle > Math.PI) normalizedAngle -= Math.PI * 2;
    while (normalizedAngle < -Math.PI) normalizedAngle += Math.PI * 2;

    // Check if point is in front of camera
    const halfFOV = (this.camera.fov * Math.PI) / 180 / 2;
    const visible = Math.abs(normalizedAngle) < halfFOV && distance < this.VIEW_DISTANCE;

    // Project to screen
    const screenX = canvasWidth / 2 + (normalizedAngle / halfFOV) * (canvasWidth / 2);
    
    // Y position based on distance (closer = lower on screen)
    const depthFactor = 1 - distance / this.VIEW_DISTANCE;
    const screenY = canvasHeight / 2 + (1 - depthFactor) * (canvasHeight / 4) + this.camera.bob;

    return {
      x: screenX,
      y: screenY,
      distance,
      visible,
    };
  }

  // Get view frustum for culling
  getViewFrustum() {
    const halfFOV = (this.camera.fov * Math.PI) / 180 / 2;
    return {
      leftAngle: this.camera.rotation - halfFOV,
      rightAngle: this.camera.rotation + halfFOV,
      maxDistance: this.VIEW_DISTANCE,
    };
  }

  getState(): CameraState {
    return { ...this.camera };
  }
}
