"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion } from "framer-motion";

export default function Background() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Deep Aurora Gradient - Uses the new Tailwind Keyframe */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-deep-indigo via-rich-plum/50 to-deep-indigo"
        animate={{
            // Slow, perpetual drift for the Aurora effect
            x: ["0%", "-5%"], 
            y: ["0%", "-5%"]
        }}
        transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut", 
            repeatType: "mirror" 
        }}
      />
      
      {/* Subtle Glow Orb (Amber focus) */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-soft-amber/10 rounded-full blur-[120px] opacity-50"
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />


      {init && (
        <Particles
          id="tsparticles"
          options={{
            fpsLimit: 120,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "bubble" },
              },
              modes: {
                bubble: { distance: 200, duration: 2, size: 0, opacity: 0 },
              },
            },
            particles: {
              color: { value: "#ffffff" },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "out" },
                random: true,
                speed: 0.3,
                straight: false,
              },
              number: { density: { enable: true }, value: 60 },
              // Corrected V3 opacity animation structure:
              opacity: { 
                value: { min: 0.1, max: 0.3 }, 
                animation: { 
                  enable: true, 
                  speed: 0.5,
                  sync: false 
                } 
              },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 2 } },
            },
            detectRetina: true,
          }}
        />
      )}
    </div>
  );
}
