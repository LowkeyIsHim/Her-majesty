// components/QuietHours.tsx

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
// FIX: Using IParticlesProps for correct typing
import type { IParticlesProps } from '@tsparticles/react';
import { Heart, ChevronRight, Moon, Sparkles, Wand2 } from 'lucide-react';

// Conditional import to ensure no SSR/hydration errors with a client-only library
// Note: Lazy loading is used because Particles uses client-side APIs.
const Particles = React.lazy(() => import('@tsparticles/react'));

// --- Type and State Definitions ---
type FlowStep = 0 | 1 | 2 | 3 | 4; // 0: Invitation, 1: Acknowledgment, 2: Deep Connection, 3: Interactive Heart, 4: Sign-Off
type InteractiveState = 'initial' | 'smile' | 'comfort' | 'desire';

// --- Framer Motion Variants (The Cinematic Feel) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 2.5, // Slow entry
      staggerChildren: 0.3,
      delayChildren: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 1.5 }, // Slow exit
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
      duration: 1.5, // Core luxury animation duration
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
    boxShadow: '0 0 25px rgba(183, 110, 121, 0.5)', // Subtle Rose Gold/Copper glow
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
  tap: { scale: 0.95 },
};

// --- Particles Configuration (Subtle, Luxurious Background) ---
const getParticleConfig = (state: InteractiveState): IParticlesProps['options'] => {
  const colorMap = {
    initial: '#B76E79', // Rose Gold
    smile: '#B76E79',
    comfort: '#4B0082', // Royal Plum
    desire: '#B87333',  // Copper
  };

  const currentColor = colorMap[state] || colorMap.initial;

  return {
    fullScreen: { enable: true, zIndex: -1 },
    background: {
      color: { value: '#0B0A11' }, // Deepest Midnight Black
    },
    particles: {
      number: { 
        value: 30, 
        density: { 
          enable: true, 
          // FIX-APPLY: Removed the incompatible 'value_area' (and 'area') property.
          // The current version of IParticlesDensity does not accept this property 
          // directly. Relying on the default density calculation is the safest path 
          // to fix the type error.
        } 
      },
      color: { value: currentColor },
      shape: { type: 'circle' },
      opacity: {
        value: 0.5,
        random: true,
        animation: { enable: true, speed: 0.5, minimumValue: 0.1, sync: false }, // FIX: Changed 'anim' to 'animation' and 'opacity_min' to 'minimumValue'
      },
      size: {
        value: 3,
        random: true,
        animation: { enable: true, speed: 1.5, minimumValue: 0.5, sync: false }, // FIX: Changed 'anim' to 'animation' and 'size_min' to 'minimumValue'
      },
      // FIX: Changed deprecated 'line_linked' to 'links'
      links: { enable: false },
      move: {
        enable: true,
        speed: 0.5, // Very slow, gentle drift
        direction: 'none',
        random: true,
        straight: false,
        // FIX: Changed deprecated 'out_mode' to 'outModes'
        outModes: { 
          default: 'out'
        },
        bounce: false,
        attract: { enable: false, rotateX: 600, rotateY: 1200 },
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

// --- Content for STEP 2 (Deeper Connection) ---
const connectionSlides = [
  {
    icon: <Wand2 className="w-6 h-6 inline-block mr-2" />,
    text: "You act like you don’t know how special you are. I’ve always known, **Her Majesty**. Don't be 'Mirror' when I say it.",
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

// --- Main Component ---
const QuietHours: React.FC = () => {
  // --- State Management ---
  const [step, setStep] = useState<FlowStep>(0);
  const [interactiveState, setInteractiveState] = useState<InteractiveState>('initial');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  // --- Audio Logic (Fail Silently) ---
  const playAudio = useCallback(() => {
    if (audioRef.current && !isAudioPlaying) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4; // Subtle volume
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsAudioPlaying(true))
          .catch(error => {
            // Audio was blocked (e.g., by browser policy). Fail silently.
            console.warn('Audio playback blocked/failed silently:', error.message);
            setIsAudioPlaying(false);
          });
      }
    }
  }, [isAudioPlaying]);

  // --- STEP 2 Auto-Cycling Logic ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2) {
      timer = setTimeout(() => {
        const nextIndex = (currentSlideIndex + 1) % connectionSlides.length;
        // Check if we have looped once, then transition to STEP 3
        if (nextIndex === 0 && currentSlideIndex === connectionSlides.length - 1) {
            setStep(3);
        } else {
            setCurrentSlideIndex(nextIndex);
        }
      }, 5000); // Hold each slide for 5s
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
    setStep(3); // Ensure we stay on or return to the interactive heart step
  };

  const handleExit = () => {
    if (audioRef.current) {
        audioRef.current.pause();
    }
    setIsExiting(true);
  }

  // Determine the dynamic background based on the interactive state
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

  // --- Conditional Rendering of Content Blocks (Sub-Components in Place) ---

  // STEP 0: INVITATION & Cinematic Entry
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

  // STEP 1: THE Acknowledgment
  const Step1 = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onAnimationComplete={() => setTimeout(() => setStep(2), 5000)} // Hold for 5s before going to step 2
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="overflow-hidden mb-4">
        <motion.p variants={textRevealVariants} className="text-lg sm:text-xl font-sans text-white/70">
            My name is Ayomide.
        </motion.p>
      </div>

      <div className="overflow-hidden mb-8">
        <motion.h2 variants={textRevealVariants} className="text-3xl sm:text-5xl font-serif text-rose-gold mt-2">
            And this space, like my heart, is reserved for **my babe**.
        </motion.h2>
      </div>

      <div className="overflow-hidden">
        <motion.p variants={textRevealVariants} className="text-md sm:text-lg font-sans text-plum/80 italic mt-4">
            I’ve always known your orbit. We just have better gravity.
        </motion.p>
      </div>
    </motion.div>
  );

  // STEP 2: DEEPER CONNECTION (Animated Slides)
  const Step2 = () => (
    <div className="p-6 text-center h-full flex items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }} // Slow slide transition
          className="max-w-xl"
        >
          <p
            className="text-2xl sm:text-4xl font-serif text-white leading-snug"
            dangerouslySetInnerHTML={{ __html: connectionSlides[currentSlideIndex].text }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // STEP 3 & 4: THE INTERACTIVE HEART & SIGN-OFF
  const Step3And4 = () => {
    // Content for the dynamic overlay
    const overlayContent = {
        smile: {
            title: 'My Smile (Lightness)',
            text: `I crave the sound of your laugh, **Coconut Head**. That lightness is the sun I didn’t know I needed. Let me tell you a joke about a distant relationship. *It only makes the reunion better.*`,
        },
        comfort: {
            title: 'My Comfort (Safety)',
            text: `You are my **Omalicha**, the beautiful one. With you, the world is quiet. I'm building a soft space next to me, just for your head. You don't have to deflect with me.`,
        },
        desire: {
            title: 'My Desire (Explicit Flirtation)',
            text: `I remember the temperature of your skin. If tomorrow lets us, I’m claiming that space again. You are the only competition I'm focused on winning. **I'm claiming every part of you that keeps me awake at night.**`,
        },
    };

    const currentOverlay = overlayContent[interactiveState as keyof typeof overlayContent];

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
            {/* The Dynamic Overlay triggered by the interactive state */}
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
                            {currentOverlay.text}
                        </p>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Core Interactive Prompt and Buttons */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: interactiveState !== 'initial' ? 1.5 : 0, duration: 2 }} // Fade in slowly
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

                {/* SIGN-OFF & Loop */}
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
                            onClick={() => setInteractiveState('initial')} // Back to prompt and hide overlay
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


  // --- Main Render & Exit Animation ---
  return (
    // Outer container for the cinematic fade-out on exit
    <motion.div
        className="min-h-screen w-full bg-midnight relative overflow-hidden font-sans"
        initial={{ opacity: 1 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 4, ease: 'easeInOut' }} // Super slow exit fade
    >
      {/* Audio Element: Fails silently if playback is blocked */}
      <audio ref={audioRef} src="/silvyn.mp3" preload="auto" />

      {/* Particles Background (Must use React.lazy for SSR safety) */}
      <React.Suspense fallback={null}>
        {/* Added key={interactiveState} to force re-render/re-initialization of particles
            when the interactive state changes, ensuring the color update. */}
        <Particles key={interactiveState} options={getParticleConfig(interactiveState)} />
      </React.Suspense>

      {/* Cinematic Loading Overlay (Fades slowly on entry) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: step === 0 ? 1 : 0 }}
        transition={{ duration: 3.5, delay: 0.5, ease: 'easeOut' }} // Extra slow, luxurious fade
        className="absolute inset-0 bg-gradient-to-t from-midnight/90 to-midnight z-50 pointer-events-none"
      />
      
      {/* Main Content Area */}
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
