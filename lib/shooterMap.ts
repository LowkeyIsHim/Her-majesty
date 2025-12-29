// lib/shooterMap.ts - Map layouts and configurations

import { MapData, Obstacle } from './shooterTypes';

// Default map configuration
export const createDefaultMap = (width: number, height: number): MapData => {
  const obstacles: Obstacle[] = [
    // Outer walls
    { position: { x: 0, y: 0 }, width: width, height: 20, type: 'wall', destructible: false },
    { position: { x: 0, y: height - 20 }, width: width, height: 20, type: 'wall', destructible: false },
    { position: { x: 0, y: 0 }, width: 20, height: height, type: 'wall', destructible: false },
    { position: { x: width - 20, y: 0 }, width: 20, height: height, type: 'wall', destructible: false },

    // Center cover
    { position: { x: width / 2 - 60, y: height / 2 - 60 }, width: 120, height: 120, type: 'cover', destructible: false },

    // Corner covers
    { position: { x: 100, y: 100 }, width: 80, height: 80, type: 'cover', destructible: false },
    { position: { x: width - 180, y: 100 }, width: 80, height: 80, type: 'cover', destructible: false },
    { position: { x: 100, y: height - 180 }, width: 80, height: 80, type: 'cover', destructible: false },
    { position: { x: width - 180, y: height - 180 }, width: 80, height: 80, type: 'cover', destructible: false },

    // Mid-lane covers
    { position: { x: width / 2 - 40, y: 200 }, width: 80, height: 40, type: 'barrel', destructible: true, health: 100 },
    { position: { x: width / 2 - 40, y: height - 240 }, width: 80, height: 40, type: 'barrel', destructible: true, health: 100 },

    // Side covers
    { position: { x: 250, y: height / 2 - 40 }, width: 40, height: 80, type: 'cover', destructible: false },
    { position: { x: width - 290, y: height / 2 - 40 }, width: 40, height: 80, type: 'cover', destructible: false },
  ];

  return {
    width,
    height,
    obstacles,
    spawnPoints: {
      red: [
        { x: 100, y: height / 2 },
        { x: 150, y: 150 },
        { x: 150, y: height - 150 },
      ],
      blue: [
        { x: width - 100, y: height / 2 },
        { x: width - 150, y: 150 },
        { x: width - 150, y: height - 150 },
      ],
      ffa: [
        { x: width / 4, y: height / 4 },
        { x: (3 * width) / 4, y: height / 4 },
        { x: width / 4, y: (3 * height) / 4 },
        { x: (3 * width) / 4, y: (3 * height) / 4 },
        { x: width / 2, y: height / 4 },
        { x: width / 2, y: (3 * height) / 4 },
      ],
    },
  };
};

// Urban map with more complex layout
export const createUrbanMap = (width: number, height: number): MapData => {
  const obstacles: Obstacle[] = [
    // Outer walls
    { position: { x: 0, y: 0 }, width: width, height: 20, type: 'wall', destructible: false },
    { position: { x: 0, y: height - 20 }, width: width, height: 20, type: 'wall', destructible: false },
    { position: { x: 0, y: 0 }, width: 20, height: height, type: 'wall', destructible: false },
    { position: { x: width - 20, y: 0 }, width: 20, height: height, type: 'wall', destructible: false },

    // Buildings (large rectangles)
    { position: { x: 150, y: 150 }, width: 200, height: 150, type: 'wall', destructible: false },
    { position: { x: width - 350, y: 150 }, width: 200, height: 150, type: 'wall', destructible: false },
    { position: { x: 150, y: height - 300 }, width: 200, height: 150, type: 'wall', destructible: false },
    { position: { x: width - 350, y: height - 300 }, width: 200, height: 150, type: 'wall', destructible: false },

    // Street barriers
    { position: { x: width / 2 - 100, y: height / 2 - 20 }, width: 200, height: 40, type: 'cover', destructible: false },
    { position: { x: width / 2 - 20, y: height / 2 - 100 }, width: 40, height: 200, type: 'cover', destructible: false },

    // Destructible objects
    { position: { x: 400, y: 300 }, width: 50, height: 50, type: 'barrel', destructible: true, health: 100 },
    { position: { x: width - 450, y: 300 }, width: 50, height: 50, type: 'barrel', destructible: true, health: 100 },
  ];

  return {
    width,
    height,
    obstacles,
    spawnPoints: {
      red: [
        { x: 80, y: 80 },
        { x: 80, y: height - 80 },
        { x: 250, y: height / 2 },
      ],
      blue: [
        { x: width - 80, y: 80 },
        { x: width - 80, y: height - 80 },
        { x: width - 250, y: height / 2 },
      ],
      ffa: [
        { x: width / 4, y: height / 4 },
        { x: (3 * width) / 4, y: height / 4 },
        { x: width / 4, y: (3 * height) / 4 },
        { x: (3 * width) / 4, y: (3 * height) / 4 },
        { x: width / 2, y: 100 },
        { x: width / 2, y: height - 100 },
      ],
    },
  };
};

export const MAP_PRESETS = {
  default: createDefaultMap,
  urban: createUrbanMap,
};
