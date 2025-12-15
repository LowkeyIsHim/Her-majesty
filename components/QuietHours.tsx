// components/QuietHours.tsx

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Heart, ChevronRight, Moon, Sparkles, Wand2 } from 'lucide-react';
import { Container, type ISourceOptions } from '@tsparticles/engine';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

// --- Type and State Definitions ---
type FlowStep = 0 | 1 | 2 | 3 | 4;
type InteractiveState = 'initial' | 'smile' | 'comfort' | 'desire';

// --- Framer Motion Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 2.5,
      staggerChildren: 0.3,
      delayChildren: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 1.5 },
  },
};

const textRevealVariants: Variants = {
  hidden: { y: '100%', opacity: 0, filter: 'blur(4px)' },
  visible: {
    y: '0%',
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      duration: 1.5,
    },
  },
};

const buttonVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 0 0px rgba(0,0,0,0)',
    transition: { duration: 0.8 },
  },
  hover: {
    scale: 1.05,
    boxShadow: '0 0 25px rgba(183, 110, 121, 0.5)',
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
  tap: { scale: 0.95 },
};

// --- Particles Configuration ---
const getParticleConfig = (state: InteractiveState): ISourceOptions => {
  const colorMap = {
    initial: '#B76E79',
    smile: '#B76E79',
    comfort: '#4B0082',
    desire: '#B87333',
  };

  const currentColor = colorMap[state] || colorMap.initial;

  return {
    fullScreen: { enable: true, zIndex: -1 },
    background: {
      color: { value: '#0B0A11' },
    },
    particles: {
      number: { 
        value: 30, 
        density: { 
          enable: true,
        } 
      },
      color: { value: currentColor },
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
        value: { min: 0.5, max: 3 },
        animation: { 
          enable: true, 
          speed: 1.5, 
          sync: false 
        },
      },
      links: { enable: false },
      move: {
        enable: true,
        speed: 0.5,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { 
          default: 'out'
        },
      },
    },
    interactivity: { 
      events: { 
        onHover: { 
          enable: true, 
          mode: 'repulse' 
        } 
      } 
    },
    detectRetina: true,
  };
};

// --- Content for STEP 2 ---
const connectionSlides = [
  {
    icon: <Wand2 className="w-6 h-6 inline-block mr-2" />,
    text: "You act like you don't know how special you are. I've always known, **Her Majesty**. Don't be 'Mirror' when I say it.",
  },
  {
    icon: <Sparkles className="w-6 h-6 inline-block mr-2" />,
    text: "Watching you be yourself is my favorite form of quiet chaos, my **Morenikeji** (a twin, meant to be cherished).",
  },
  {
    icon: <Heart className="w-6 h-6 inline-block mr-2" />,
    text: "Even when we're apart, you live here. In the thoughts that keep me grounded and wishing you were closer, **Lovebug**.",
  },
  {
    icon: <Moon className="w-6 h-6 inline-block mr-2" />,
    text: "This distance is just a temporary state. I miss the sound of your silence, **Omalicha**.",
  },
];

// Helper function to parse bold text
const parseText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-rose-gold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

// --- Main Component ---
const QuietHours: React.FC = () => {
  const [step, setStep] = useState<FlowStep>(0);
  const [interactiveState, setInteractiveState] = useState<InteractiveState>('initial');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [particlesInit, setParticlesInit] = useState(false);

  // Initialize particles engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Particles loaded', container);
  };

  // --- Audio Logic ---
  const playAudio = useCallback(() => {
    if (audioRef.current && !isAudioPlaying) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsAudioPlaying(true))
          .catch(error => {
            console.warn('Audio playback blocked/failed silently:', error.message);
            setIsAudioPlaying(false);
          });
      }
    }
  }, [isAudioPlaying]);

  // --- Step 1 Auto-transition ---
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => setStep(2), 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // --- STEP 2 Auto-Cycling Logic ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2) {
      timer = setTimeout(() => {
        const nextIndex = (currentSlideIndex + 1) % connectionSlides.length;
        if (nextIndex === 0 && currentSlideIndex === connectionSlides.length - 1) {
          setStep(3);
        } else {
          setCurrentSlideIndex(nextIndex);
        }
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [step, currentSlideIndex]);

  // --- Event Handlers ---
  const handleUnlock = () => {
    playAudio();
    setStep(1);
  };

  const handleInteractiveClick = (state: InteractiveState) => {
    setInteractiveState(state);
    setStep(3);
  };

  const handleExit = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsExiting(true);
  };

  const getBackgroundColor = (state: InteractiveState): string => {
    switch (state) {
      case 'smile':
        return 'bg-lightness-bg';
      case 'comfort':
        return 'bg-comfort-bg';
      case 'desire':
        return 'bg-desire-bg';
      default:
        return 'bg-transparent';
    }
  };

  // --- Sub-Components ---
  const Step0 = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.h1 className="text-4xl sm:text-6xl font-serif text-rose-gold overflow-hidden mb-6">
        <motion.span variants={textRevealVariants} className="block">
          This is a quiet place I built for you, Silvyn.
        </motion.span>
      </motion.h1>

      <motion.p className="text-sm sm:text-lg font-sans text-white/80 overflow-hidden mb-12">
        <motion.span variants={textRevealVariants} className="block transition-luxury">
          For when the world slows down, and only the thoughts of us remain.
        </motion.span>
      </motion.p>

      <motion.button
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        onClick={handleUnlock}
        className="px-8 py-3 text-lg font-serif bg-rose-gold text-midnight border border-rose-gold rounded-full shadow-lg hover:shadow-[0_0_20px_#B76E79] transition-luxury"
      >
        Unlock the Moment <ChevronRight className="w-5 h-5 inline-block ml-2" />
      </motion.button>
    </motion.div>
  );

  const Step1 = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="overflow-hidden mb-4">
        <motion.p variants={textRevealVariants} className="text-lg sm:text-xl font-sans text-white/70">
          My name is Ayomide.
        </motion.p>
      </div>

      <div className="overflow-hidden mb-8">
        <motion.h2 variants={textRevealVariants} className="text-3xl sm:text-5xl font-serif text-rose-gold mt-2">
          {parseText('And this space, like my heart, is reserved for **my babe**.')}
        </motion.h2>
      </div>

      <div className="overflow-hidden">
        <motion.p variants={textRevealVariants} className="text-md sm:text-lg font-sans text-plum/80 italic mt-4">
          I've always known your orbit. We just have better gravity.
        </motion.p>
      </div>
    </motion.div>
  );

  const Step2 = () => (
    <div className="p-6 text-center h-full flex items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
          className="max-w-xl"
        >
          <p className="text-2xl sm:text-4xl font-serif text-white leading-snug">
            {parseText(connectionSlides[currentSlideIndex].text)}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const Step3And4 = () => {
    const overlayContent = {
      smile: {
        title: 'My Smile (Lightness)',
        text: `I crave the sound of your laugh, **Coconut Head**. That lightness is the sun I didn't know I needed. Let me tell you a joke about a distant relationship. *It only makes the reunion better.*`,
      },
      comfort: {
        title: 'My Comfort (Safety)',
        text: `You are my **Omalicha**, the beautiful one. With you, the world is quiet. I'm building a soft space next to me, just for your head. You don't have to deflect with me.`,
      },
      desire: {
        title: 'My Desire (Explicit Flirtation)',
        text: `I remember the temperature of your skin. If tomorrow lets us, I'm claiming that space again. You are the only competition I'm focused on winning. **I'm claiming every part of you that keeps me awake at night.**`,
      },
    };

    const currentOverlay = overlayContent[interactiveState as keyof typeof overlayContent];

    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        {interactiveState !== 'initial' && currentOverlay && (
          <AnimatePresence>
            <motion.div
              key={interactiveState}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className={`absolute inset-0 flex flex-col justify-center items-center backdrop-blur-sm p-8 z-10 
                          ${getBackgroundColor(interactiveState)}`}
            >
              <h3 className="text-3xl sm:text-5xl font-serif text-rose-gold mb-6">
                {currentOverlay.title}
              </h3>
              <p className="text-xl sm:text-3xl font-sans text-white max-w-2xl leading-relaxed italic">
                {parseText(currentOverlay.text)}
              </p>
            </motion.div>
          </AnimatePresence>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: interactiveState !== 'initial' ? 1.5 : 0, duration: 2 }}
          className={`flex flex-col items-center justify-center relative z-20 transition-all duration-luxury ${interactiveState !== 'initial' ? 'mt-8' : ''}`}
        >
          <h2 className="text-2xl sm:text-4xl font-serif text-white mb-10">
            Tonight, what part of you wants to be seen?
          </h2>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 mb-20">
            <motion.button
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleInteractiveClick('smile')}
              className="px-8 py-3 text-lg font-serif bg-transparent text-rose-gold border-2 border-rose-gold rounded-full transition-all duration-slow hover:bg-rose-gold/20"
            >
              My Smile (Lightness)
            </motion.button>
            <motion.button
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleInteractiveClick('comfort')}
              className="px-8 py-3 text-lg font-serif bg-transparent text-plum border-2 border-plum rounded-full transition-all duration-slow hover:bg-plum/20"
            >
              My Comfort (Safety)
            </motion.button>
            <motion.button
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleInteractiveClick('desire')}
              className="px-8 py-3 text-lg font-serif bg-transparent text-copper border-2 border-copper rounded-full transition-all duration-slow hover:bg-copper/20"
            >
              My Desire (Flirtation)
            </motion.button>
          </div>

          <div className="mt-10">
            <p className="text-lg font-sans text-white/70 max-w-md italic mb-4">
              I built this not to pressure you, but to hold space for you. This is the truth, without noise.
            </p>
            <p className="text-xl font-serif text-rose-gold mb-8">
              — Always, Ayomide.
            </p>

            <div className="flex space-x-6 justify-center">
              <motion.button
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={() => setInteractiveState('initial')}
                className="px-6 py-2 text-md font-sans bg-plum text-white rounded-full transition-slow"
              >
                Revisit the Heart
              </motion.button>
              <motion.button
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={handleExit}
                className="px-6 py-2 text-md font-sans bg-transparent text-white/50 border border-white/20 rounded-full transition-slow hover:border-white"
              >
                Exit / Sleep
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div
      className="min-h-screen w-full bg-midnight relative overflow-hidden font-sans"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 4, ease: 'easeInOut' }}
    >
      <audio ref={audioRef} src="/silvyn.mp3" preload="auto" />

      {particlesInit && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={getParticleConfig(interactiveState)}
        />
      )}

      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: step === 0 ? 1 : 0 }}
        transition={{ duration: 3.5, delay: 0.5, ease: 'easeOut' }}
        className="absolute inset-0 bg-gradient-to-t from-midnight/90 to-midnight z-50 pointer-events-none"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" {...containerVariants}>
              <Step0 />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="step1" {...containerVariants} className="max-w-xl">
              <Step1 />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" {...containerVariants} className="max-w-xl">
              <Step2 />
            </motion.div>
          )}
          {(step === 3 || step === 4) && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="max-w-4xl w-full h-full flex items-center justify-center relative"
            >
              <Step3And4 />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuietHours;
