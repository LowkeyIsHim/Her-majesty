// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'midnight': '#0B0A11', // Deepest Midnight Black
        'plum': '#4B0082',     // Royal Plum
        'rose-gold': '#B76E79', // Soft Rose Gold/Copper Accent
        'copper': '#B87333',   // A slightly richer Copper
        'lightness-bg': '#B76E7940', // Semi-transparent Rose Gold for interactive state
        'comfort-bg': '#4B008240',   // Semi-transparent Plum for interactive state
        'desire-bg': '#B8733340',    // Semi-transparent Copper for interactive state
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'], // Cinematic, elegant font
        sans: ['"Montserrat"', 'sans-serif'],   // Clean, readable sans-serif
      },
      animation: {
        // Essential for the slow, cinematic feel (1.5s+ duration)
        'slow-pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slow-spin': 'spin 5s linear infinite',
      },
      transitionDuration: {
        'slow': '1500ms', // Custom slow transition duration
        'luxury': '2000ms', // Even slower, for main component transitions
      },
    },
  },
  plugins: [],
};

export default config;
