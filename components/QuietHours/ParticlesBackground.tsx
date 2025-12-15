import { useCallback, useMemo } from 'react';
import Particles from '@tsparticles/react';
import type { Container, Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim'; // Required slim bundle

interface ParticlesBackgroundProps {
  preset: string;
}

// Configuration for different particle presets
const getParticleConfig = (preset: string) => {
  const baseOptions = {
    fullScreen: { enable: true, zIndex: 0 },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          links: { opacity: 0.2 },
        },
      },
    },
    particles: {
      links: { enable: false },
      move: {
        direction: 'none',
        enable: true,
        random: true,
        speed: 0.1, // Very slow movement
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 50,
      },
      opacity: {
        value: 0.3,
        anim: {
          enable: true,
          speed: 0.5,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };

  switch (preset) {
    case 'bubbles':
      return {
        ...baseOptions,
        particles: {
          ...baseOptions.particles,
          shape: { type: 'circle' },
          color: { value: '#f9a8d4' }, // Soft Rose
          move: { ...baseOptions.particles.move, speed: 0.3 },
          size: { value: { min: 2, max: 4 } },
        },
      };
    case 'fountain':
      return {
        ...baseOptions,
        particles: {
          ...baseOptions.particles,
          shape: { type: 'star' },
          color: { value: '#e9d5ff' }, // Royal Plum tint
          number: { value: 70 },
          move: { ...baseOptions.particles.move, speed: 0.2 },
        },
      };
    case 'slow-stars':
      return {
        ...baseOptions,
        particles: {
          ...baseOptions.particles,
          shape: { type: 'triangle' },
          color: { value: '#d4af37' }, // Rose Gold/Copper
          number: { value: 30 },
          move: { ...baseOptions.particles.move, speed: 0.1, trail: { enable: true, length: 5, fill: { color: "#d4af37" } } },
        },
      };
    default:
      return {
        ...baseOptions,
        particles: {
          ...baseOptions.particles,
          color: { value: '#e2e8f0' }, // Soft white/grey for default
        },
      };
  }
};

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ preset }) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log("Particles loaded successfully.");
  }, []);

  const options = useMemo(() => getParticleConfig(preset), [preset]);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={options as any} // Cast needed for complex options object
      className="absolute inset-0"
    />
  );
};

export default ParticlesBackground;
