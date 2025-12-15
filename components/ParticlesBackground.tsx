'use client';

import React, { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container, ISourceOptions } from '@tsparticles/engine';

interface ParticlesBackgroundProps {
  color?: string;
  density?: number;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ 
  color = '#f7a4c8',
  density = 40 
}) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Particles loaded', container);
  };

  const options: ISourceOptions = {
    fullScreen: { enable: true, zIndex: 0 },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { 
        value: density,
        density: { enable: true }
      },
      color: { value: color },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.1, max: 0.5 },
        animation: { 
          enable: true, 
          speed: 0.5, 
          sync: false 
        },
      },
      size: {
        value: { min: 1, max: 3 },
        animation: { 
          enable: true, 
          speed: 1, 
          sync: false 
        },
      },
      links: {
        enable: true,
        distance: 150,
        color: color,
        opacity: 0.2,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'grab' },
        onClick: { enable: true, mode: 'push' },
      },
      modes: {
        grab: { distance: 140, links: { opacity: 0.5 } },
        push: { quantity: 4 },
      },
    },
    detectRetina: true,
  };

  if (!init) return null;

  return (
    <Particles
      id="particles-background"
      particlesLoaded={particlesLoaded}
      options={options}
      className="absolute inset-0"
    />
  );
};

export default ParticlesBackground;
