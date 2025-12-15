"use client";
import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export default function AudioPlayer({ started }: { started: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (started && audioRef.current && !isPlaying) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay blocked handling - silent fail
        console.log("Autoplay waiting for interaction");
      });
    }
  }, [started]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!started) return null;

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="fixed bottom-6 right-6 z-50"
    >
      <audio ref={audioRef} src="/ambient.mp3" loop />
      <button 
        onClick={toggle}
        className="p-3 rounded-full glass-panel text-rose/70 hover:text-rose hover:scale-105 transition-all"
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </motion.div>
  );
}
