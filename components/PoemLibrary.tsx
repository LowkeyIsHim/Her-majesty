'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Heart, BookOpen, Sparkles, X, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { poems, type Poem } from '@/data/poems';
import ParticlesBackground from './ParticlesBackground';

const moodColors: Record<string, string> = {
  romantic: '#f7a4c8',
  playful: '#fbbf24',
  spicy: '#dc2626',
  comfort: '#8b5cf6',
  deep: '#4b0082',
  longing: '#b76e79',
  honest: '#10b981',
  empowering: '#f59e0b',
  gentle: '#a78bfa',
  intimate: '#ec4899',
  confident: '#ef4444',
  peaceful: '#6366f1',
  hopeful: '#14b8a6',
  teasing: '#fb923c',
  'late-night': '#312e81',
  direct: '#dc2626',
  safe: '#10b981',
  light: '#fbbf24',
  joyful: '#f59e0b',
  future: '#06b6d4',
  committed: '#6366f1',
  persistent: '#8b5cf6',
  cosmic: '#4c1d95',
  fated: '#581c87',
  reflective: '#6b21a8',
  possessive: '#be123c',
  anticipatory: '#ea580c',
  heated: '#b91c1c',
  admiring: '#f472b6',
  genuine: '#22c55e',
  curious: '#06b6d4',
  steadfast: '#1e40af',
  tender: '#ec4899',
  patient: '#7c3aed',
  competitive: '#dc2626',
  passionate: '#e11d48',
  determined: '#c2410c',
  vulnerable: '#a78bfa',
  inviting: '#f9a8d4',
  accepting: '#86efac',
  adoring: '#fda4af',
  proving: '#fb7185',
  certain: '#1e3a8a',
  forward: '#0e7490',
  final: '#4c0519',
};

// Map moods to audio files
const moodAudio: Record<string, string> = {
  romantic: '/sounds/romantic.mp3',
  playful: '/sounds/playful.mp3',
  spicy: '/sounds/spicy.mp3',
  comfort: '/sounds/comfort.mp3',
  deep: '/sounds/deep.mp3',
  longing: '/sounds/romantic.mp3',
  honest: '/sounds/deep.mp3',
  empowering: '/sounds/playful.mp3',
  gentle: '/sounds/comfort.mp3',
  intimate: '/sounds/spicy.mp3',
  confident: '/sounds/spicy.mp3',
  peaceful: '/sounds/comfort.mp3',
  hopeful: '/sounds/romantic.mp3',
  teasing: '/sounds/playful.mp3',
  'late-night': '/sounds/deep.mp3',
  direct: '/sounds/spicy.mp3',
  safe: '/sounds/comfort.mp3',
  light: '/sounds/playful.mp3',
  joyful: '/sounds/playful.mp3',
  future: '/sounds/romantic.mp3',
  committed: '/sounds/romantic.mp3',
  persistent: '/sounds/deep.mp3',
  cosmic: '/sounds/deep.mp3',
  fated: '/sounds/romantic.mp3',
  reflective: '/sounds/deep.mp3',
  possessive: '/sounds/spicy.mp3',
  anticipatory: '/sounds/spicy.mp3',
  heated: '/sounds/spicy.mp3',
  admiring: '/sounds/romantic.mp3',
  genuine: '/sounds/romantic.mp3',
  curious: '/sounds/playful.mp3',
  steadfast: '/sounds/deep.mp3',
  tender: '/sounds/romantic.mp3',
  patient: '/sounds/comfort.mp3',
  competitive: '/sounds/spicy.mp3',
  passionate: '/sounds/spicy.mp3',
  determined: '/sounds/spicy.mp3',
  vulnerable: '/sounds/comfort.mp3',
  inviting: '/sounds/romantic.mp3',
  accepting: '/sounds/comfort.mp3',
  adoring: '/sounds/romantic.mp3',
  proving: '/sounds/spicy.mp3',
  certain: '/sounds/deep.mp3',
  forward: '/sounds/romantic.mp3',
  final: '/sounds/deep.mp3',
};

const PoemLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Get all unique moods
  const allMoods = useMemo(() => {
    const moodSet = new Set<string>();
    poems.forEach((poem) => poem.mood.forEach((m) => moodSet.add(m)));
    return Array.from(moodSet).sort();
  }, []);

  // Filter poems based on search and mood
  const filteredPoems = useMemo(() => {
    return poems.filter((poem) => {
      const matchesSearch =
        searchQuery === '' ||
        poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poem.mood.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMood = selectedMood === null || poem.mood.includes(selectedMood);

      return matchesSearch && matchesMood;
    });
  }, [searchQuery, selectedMood]);

  const getMoodColor = (mood: string) => moodColors[mood] || '#f7a4c8';

  // Get audio file for poem based on primary mood
  const getPoemAudio = (poem: Poem): string => {
    const primaryMood = poem.mood[0];
    return moodAudio[primaryMood] || '/sounds/romantic.mp3';
  };

  // Play audio when poem is selected
  useEffect(() => {
    if (selectedPoem && !isMuted) {
      const audioSrc = getPoemAudio(selectedPoem);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = audioSrc;
        audioRef.current.volume = 0.3;
        audioRef.current.loop = true;
        
        audioRef.current.play().catch((error) => {
          console.warn('Audio playback failed:', error);
        });
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedPoem, isMuted]);

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      if (!isMuted) {
        audioRef.current.pause();
      } else if (selectedPoem) {
        audioRef.current.play().catch(console.warn);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-midnight via-deep-purple to-midnight">
      <ParticlesBackground color={selectedMood ? getMoodColor(selectedMood) : '#f7a4c8'} density={25} />

      {/* Audio element */}
      <audio ref={audioRef} preload="auto" />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 glass rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-smooth"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Home</span>
      </motion.button>

      {/* Mute toggle button */}
      {selectedPoem && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={toggleMute}
          className="absolute top-8 right-8 z-50 p-3 glass rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-smooth"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </motion.button>
      )}

      <div className="relative z-10 px-4 py-20">
        {/* Header */}
        <motion.div
          className="max-w-6xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-soft-pink" />
            <h1 className="font-serif text-5xl sm:text-7xl gradient-text">Poem Library</h1>
          </div>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            Words written for you, Silvyn. Each poem has its own soundtrack—just click to read and listen.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          className="max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search poems, moods, or words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-soft-pink/50 transition-smooth"
            />
          </div>
        </motion.div>

        {/* Mood filters */}
        <motion.div
          className="max-w-6xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedMood(null)}
              className={`px-6 py-2 rounded-full font-medium transition-smooth ${
                selectedMood === null
                  ? 'bg-soft-pink text-midnight'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              All Moods
            </button>
            {allMoods.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                style={{
                  backgroundColor: selectedMood === mood ? getMoodColor(mood) : undefined,
                  color: selectedMood === mood ? '#ffffff' : undefined,
                }}
                className={`px-6 py-2 rounded-full font-medium capitalize transition-smooth ${
                  selectedMood === mood ? '' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Poems grid */}
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {filteredPoems.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-xl text-white/40">No poems match your search. Try a different mood or keyword.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPoems.map((poem, index) => (
                <motion.button
                  key={poem.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedPoem(poem)}
                  className="group relative p-6 glass rounded-2xl text-left hover:bg-white/10 transition-smooth overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-soft-pink/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-slow" />
                  
                  <div className="relative z-10">
                    <Heart className="w-6 h-6 text-soft-pink mb-3" />
                    <h3 className="font-serif text-2xl text-white mb-2 group-hover:text-soft-pink transition-smooth">
                      {poem.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-3 line-clamp-3">
                      {poem.content.substring(0, 120)}...
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {poem.mood.slice(0, 3).map((mood) => (
                        <span
                          key={mood}
                          style={{ backgroundColor: getMoodColor(mood) + '40' }}
                          className="px-3 py-1 rounded-full text-xs text-white/80 capitalize"
                        >
                          {mood}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Poem count */}
        <motion.p
          className="text-center mt-12 text-white/40 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Showing {filteredPoems.length} of {poems.length} poems • Each with its own soundtrack
        </motion.p>
      </div>

      {/* Poem modal */}
      <AnimatePresence>
        {selectedPoem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedPoem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-deep-purple/90 to-midnight/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedPoem(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-smooth"
              >
                <X className="w-6 h-6 text-white/70" />
              </button>

              {/* Poem content */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-10 h-10 text-soft-pink" fill="currentColor" />
                    {!isMuted && <Volume2 className="w-6 h-6 text-soft-pink/60 animate-pulse" />}
                  </div>
                  <h2 className="font-serif text-4xl sm:text-5xl text-white mb-2">{selectedPoem.title}</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedPoem.mood.map((mood) => (
                      <span
                        key={mood}
                        style={{ backgroundColor: getMoodColor(mood) }}
                        className="px-4 py-1 rounded-full text-sm text-white capitalize"
                      >
                        {mood}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-lg sm:text-xl text-white/90 leading-relaxed whitespace-pre-line font-light">
                    {selectedPoem.content}
                  </p>
                </div>

                {selectedPoem.dedication && (
                  <div className="pt-6 border-t border-white/10">
                    <p className="font-script text-xl text-soft-pink/80 italic">{selectedPoem.dedication}</p>
                  </div>
                )}

                <div className="pt-6">
                  <p className="font-script text-2xl text-white/60">— {selectedPoem.author}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PoemLibrary;
