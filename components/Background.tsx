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
      {/* Deep Breathing Gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-midnight via-[#1a0f1a] to-[#0f0510]"
        animate={{
            background: [
                "linear-gradient(to bottom right, #0F0C15, #1a0f1a, #0f0510)",
                "linear-gradient(to bottom right, #0F0C15, #2D1B2E, #0F0C15)",
                "linear-gradient(to bottom right, #0F0C15, #1a0f1a, #0f0510)"
            ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle Glow Orb */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose/10 rounded-full blur-[100px]"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
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
              // --- FIX APPLIED HERE ---
              opacity: { 
                value: { min: 0.1, max: 0.3 }, // Define the pulsing range
                animation: { 
                  enable: true, 
                  speed: 0.5,
                  sync: false 
                } 
              },
              // -----------------------
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
