import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Updated Palette for Regal Intimacy
        'deep-indigo': '#0E0B1A', // Deeper, richer base
        'rich-plum': '#2C1B4A',   // Accent for glass panels
        'soft-amber': '#E3B980',  // High-contrast, warm highlight
        'desire-rose': '#D07584', // Primary emotional accent
        'starlight': '#F4F1DE',
      },
      fontFamily: {
        serif: ['var(--font-playfair)'],
        sans: ['var(--font-inter)'],
      },
      animation: {
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 8s ease-in-out infinite",
        "aurora": "aurora 15s ease-in-out infinite alternate", // New slow, deep background movement
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        aurora: { // For the background breathing effect
            "0%": { transform: "translate(0%, 0%)" },
            "100%": { transform: "translate(-5%, -5%)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
