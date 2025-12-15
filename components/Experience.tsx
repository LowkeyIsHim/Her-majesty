'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Home, Flame, Coffee, Moon as MoonIcon, Smile, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ParticlesBackground from './ParticlesBackground';

type Mood = 'initial' | 'romantic' | 'playful' | 'spicy' | 'comfort' | 'deep';

interface MoodContent {
  title: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  messages: string[];
}

const Experience: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<Mood>('initial');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const moodContent: Record<Exclude<Mood, 'initial'>, MoodContent> = {
    romantic: {
      title: 'My Heart Speaks',
      icon: <Heart className="w-8 h-8" fill="currentColor" />,
      color: '#f7a4c8',
      gradient: 'from-soft-pink via-rose-gold to-plum',
      messages: [
        "Lovebug, you know what's wild? I can be in the middle of something completely random, and suddenly I'll think about the way you laugh. That unfiltered, genuine sound that makes everything else fade.",
        "Distance is temporary. But the way you've carved out space in my heart? That's permanent, Omalicha. You're the beautiful one—inside and out.",
        "Her Majesty, I don't say this lightly: you're the kind of person poetry gets written about. And I'm just here, grateful I get to witness it firsthand.",
        "Every time we talk, I find something new about you that I want to protect, celebrate, or just sit with quietly. You're layered like that, Morenikeji.",
        "I miss the silence with you. That comfortable quiet where we don't need words because the presence is enough. Build that space next to me again soon?",
      ],
    },
    playful: {
      title: 'Coconut Head Chronicles',
      icon: <Smile className="w-8 h-8" />,
      color: '#fbbf24',
      gradient: 'from-yellow-400 via-orange-400 to-rose-gold',
      messages: [
        "Coconut Head, you really think you're slick when you deflect my compliments, don't you? Mirror mode activated. But I see right through it. You're extraordinary, and I'm not letting you forget it.",
        "You know what's funny? Long distance relationships. We're out here missing each other like we're in a tragic romance novel, but the reunion? Chef's kiss. Worth every second.",
        "I bet you're reading this with that little smirk you do when you're trying not to smile. Yeah, I know that face. It's one of my favorites.",
        "Remember when I said you're my favorite person to do absolutely nothing with? Still true. Let's do nothing together soon, yeah?",
        "Your vibe is unmatched, Silvyn. You're like that perfect playlist that hits different every single time. How do you do that?",
      ],
    },
    spicy: {
      title: 'Unfiltered Thoughts',
      icon: <Flame className="w-8 h-8" />,
      color: '#dc2626',
      gradient: 'from-red-500 via-rose-600 to-plum',
      messages: [
        "I remember the warmth of your skin, the way you fit perfectly in that space I'm always subconsciously saving for you. If tomorrow lets us, I'm claiming all of it again.",
        "You know what keeps me up at night? The thought of you. Not in some poetic, distant way—but in the I-need-you-close-to-me kind of way. Raw, honest, and completely yours.",
        "Mirror, stop deflecting. You know exactly what you do to me. That confidence? That energy? It's magnetic, and I'm not even trying to resist.",
        "Let me be clear: you're not just a thought. You're the craving I can't shake, the one competition I'm laser-focused on winning. And I will.",
        "I don't do subtle when it comes to you, Silvyn. You're mine in my head, and I'm working on making sure reality catches up. Soon.",
      ],
    },
    comfort: {
      title: 'Safe Space',
      icon: <Coffee className="w-8 h-8" />,
      color: '#8b5cf6',
      gradient: 'from-purple-400 via-plum to-deep-purple',
      messages: [
        "Omalicha, the world can be chaotic and loud, but with you, it's quiet. You're my reset button, my safe space, my 'everything's going to be okay.'",
        "You don't have to perform for me, you know? No deflecting, no shields, no Mirror mode. Just you. That's more than enough—it's everything.",
        "I'm building a soft space next to me, and it has your name on it. Come rest here whenever you need to, Lovebug. It's yours.",
        "Sometimes I just want to exist in the same room as you. No words, no pressure—just proximity. That kind of peace is rare, and you give it to me effortlessly.",
        "Her Majesty, you deserve to be cherished quietly, deeply, and without expectation. That's what I'm here for—always.",
      ],
    },
    deep: {
      title: 'Late Night Truths',
      icon: <MoonIcon className="w-8 h-8" />,
      color: '#4b0082',
      gradient: 'from-deep-purple via-plum to-midnight',
      messages: [
        "Morenikeji, a twin meant to be cherished. That's what you are to me. Not just someone I talk to—but someone I see, fully, and choose every single time.",
        "I've always known your orbit, Silvyn. We just have better gravity now. It's like the universe finally said, 'Yeah, those two make sense.'",
        "This distance? It's just a test. I'm convinced of it. Because what we have doesn't make sense logically—it just is. And I'm okay with that.",
        "You live in the thoughts that keep me grounded. Even when we're apart, you're here—in the quiet decisions I make, the little things I notice, the way I move through the world.",
        "I built this space not to pressure you, but to hold space for you. This is the truth, Silvyn. Without noise, without games. Just me, showing up for you.",
      ],
    },
  };

  useEffect(() => {
    if (currentMood !== 'initial' && messageIndex < moodContent[currentMood].messages.length - 1) {
      const timer = setTimeout(() => {
        setMessageIndex((prev) => prev + 1);
      }, 8000); // Change message every 8 seconds
      return () => clearTimeout(timer);
    }
  }, [currentMood, messageIndex, moodContent]);

  const playAudio = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleMoodClick = (mood: Exclude<Mood, 'initial'>) => {
    setCurrentMood(mood);
    setMessageIndex(0);
    playAudio();
  };

  const resetExperience = () => {
    setCurrentMood('initial');
    setMessageIndex(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const currentContent = currentMood !== 'initial' ? moodContent[currentMood] : null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-midnight via-deep-purple to-midnight">
      <ParticlesBackground color={currentContent?.color || '#f7a4c8'} density={30} />

      {/* Audio element */}
      <audio ref={audioRef} src="/silvyn.mp3" loop preload="auto" />

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

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20">
        <AnimatePresence mode="wait">
          {currentMood === 'initial' ? (
            <motion.div
              key="mood-selector"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              className="max-w-5xl w-full text-center"
            >
              <motion.h1
                className="font-serif text-4xl sm:text-6xl lg:text-7xl mb-6 gradient-text"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Tonight, Silvyn
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl text-white/70 mb-16 max-w-2xl mx-auto"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                What part of you wants to be seen? Choose your vibe, and let me meet you there.
              </motion.p>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {/* Romantic */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodClick('romantic')}
                  className="group relative p-8 glass rounded-2xl hover:bg-white/10 transition-smooth overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-soft-pink/20 to-rose-gold/20 opacity-0 group-hover:opacity-100 transition-smooth" />
                  <div className="relative z-10">
                    <Heart className="w-12 h-12 text-soft-pink mx-auto mb-4" fill="currentColor" />
                    <h3 className="font-serif text-2xl text-white mb-2">Romantic</h3>
                    <p className="text-sm text-white/60">Soft words, deep feelings</p>
                  </div>
                </motion.button>

                {/* Playful */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodClick('playful')}
                  className="group relative p-8 glass rounded-2xl hover:bg-white/10 transition-smooth overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-smooth" />
                  <div className="relative z-10">
                    <Smile className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="font-serif text-2xl text-white mb-2">Playful</h3>
                    <p className="text-sm text-white/60">Jokes, teasing, lightness</p>
                  </div>
                </motion.button>

                {/* Spicy */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodClick('spicy')}
                  className="group relative p-8 glass rounded-2xl hover:bg-white/10 transition-smooth overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-smooth" />
                  <div className="relative z-10">
                    <Flame className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="font-serif text-2xl text-white mb-2">Spicy</h3>
                    <p className="text-sm text-white/60">Unfiltered, direct, heated</p>
                  </div>
                </motion.button>

                {/* Comfort */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodClick('comfort')}
                  className="group relative p-8 glass rounded-2xl hover:bg-white/10 transition-smooth overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-plum/20 opacity-0 group-hover:opacity-100 transition-smooth" />
                  <div className="relative z-10">
                    <Coffee className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="font-serif text-2xl text-white mb-2">Comfort</h3>
                    <p className="text-sm text-white/60">Safe, warm, peaceful</p>
                  </div>
                </motion.button>

                {/* Deep */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodClick('deep')}
                  className="group relative p-8 glass rounded-2xl hover:bg-white/10 transition-smooth overflow-hidden sm:col-span-2 lg:col-span-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-plum/20 to-midnight/20 opacity-0 group-hover:opacity-100 transition-smooth" />
                  <div className="relative z-10">
                    <MoonIcon className="w-12 h-12 text-plum mx-auto mb-4" />
                    <h3 className="font-serif text-2xl text-white mb-2">Deep</h3>
                    <p className="text-sm text-white/60">Honest, vulnerable, real</p>
                  </div>
                </motion.button>
              </motion.div>

              <motion.p
                className="mt-12 text-sm text-white/40 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                No pressure, Lovebug. Just vibes.
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key={`mood-${currentMood}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 1 }}
              className="max-w-4xl w-full text-center px-6"
            >
              {/* Mood icon and title */}
              <motion.div
                className="mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <div className={`inline-block p-4 rounded-full bg-gradient-to-br ${currentContent.gradient} mb-4`}>
                  {currentContent.icon}
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl gradient-text">
                  {currentContent.title}
                </h2>
              </motion.div>

              {/* Animated messages */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={messageIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 1.2 }}
                  className="mb-12"
                >
                  <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 leading-relaxed font-light">
                    {currentContent.messages[messageIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress indicator */}
              <div className="flex justify-center gap-2 mb-8">
                {currentContent.messages.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === messageIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetExperience}
                  className="px-8 py-3 glass rounded-full text-white hover:bg-white/10 transition-smooth"
                >
                  Change Vibe
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMessageIndex((prev) => (prev + 1) % currentContent.messages.length)}
                  className={`px-8 py-3 bg-gradient-to-r ${currentContent.gradient} rounded-full text-white font-semibold shadow-lg`}
                >
                  Next Message
                </motion.button>
              </motion.div>

              {/* Signature */}
              <motion.p
                className="mt-16 font-script text-2xl text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                — Always, Ayomide
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Experience;
