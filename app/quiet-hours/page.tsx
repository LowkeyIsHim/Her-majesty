'use client';
import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Moon, HandHeart, Sparkles } from 'lucide-react';
import ParticlesBackground from '@/components/QuietHours/ParticlesBackground';
import CinematicText from '@/components/QuietHours/CinematicText';
import ActionButton from '@/components/QuietHours/ActionButton';
import TeasingSlides from '@/components/QuietHours/TeasingSlides';

// --- ENUMS & TYPES ---
enum FlowStep {
  INVITATION = 'INVITATION',
  ACKNOWLEDGMENT = 'ACKNOWLEDGMENT',
  DEEPER_CONNECTION = 'DEEPER_CONNECTION',
  INTERACTIVE_HEART = 'INTERACTIVE_HEART',
  SIGN_OFF = 'SIGN_OFF',
}

type HeartOption = 'My Smile' | 'My Comfort' | 'My Desire';

interface HeartContent {
  title: string;
  copy: string;
  icon: React.ElementType;
  color: string;
  particlePreset: string;
}

// --- CONFIGURATION ---
const HEART_MAP: Record<HeartOption, HeartContent> = {
  'My Smile': {
    title: 'The Tease of Lightness',
    copy: "I watch you shine. That smile is a weapon you don't even know you wield. It's the most beautiful kind of trouble.",
    icon: Sparkles,
    color: 'bg-rose-900/10',
    particlePreset: 'bubbles',
  },
  'My Comfort': {
    title: 'The Sanctuary of Softness',
    copy: 'This is the safest place for you to land. I see the world on your shoulders. Let me hold it for a while, my babe.',
    icon: Moon,
    color: 'bg-plum-900/10',
    particlePreset: 'fountain',
  },
  'My Desire': {
    title: 'The Claim of the Future',
    copy: "I remember the temperature of your skin. If tomorrow lets us, I'm claiming that space again. You are always, intensely, chosen.",
    icon: Heart,
    color: 'bg-amber-900/10',
    particlePreset: 'slow-stars',
  },
};

const audioPath = '/silvyn.mp3';

// --- MAIN COMPONENT ---
export default function QuietHours() {
  const [step, setStep] = useState(FlowStep.INVITATION);
  const [selectedHeart, setSelectedHeart] = useState<HeartOption | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useMemo(() => typeof Audio !== 'undefined' ? new Audio(audioPath) : null, []);

  // Controls background particles color/style
  const currentParticlePreset = selectedHeart ? HEART_MAP[selectedHeart].particlePreset : 'default';

  // --- AUDIO HANDLING ---
  const startAudio = useCallback(() => {
    if (audioRef && !isPlaying) {
      audioRef.loop = true;
      audioRef.volume = 0.5; // Subtle volume
      audioRef.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.warn("Audio playback blocked by browser, continuing silently:", error);
        setIsPlaying(false);
      });
    }
  }, [audioRef, isPlaying]);

  const handleUnlock = () => {
    startAudio();
    setStep(FlowStep.ACKNOWLEDGMENT);
  };

  const handleHeartClick = (option: HeartOption) => {
    setSelectedHeart(option);
    // Move to the Sign-off step after interaction
    setTimeout(() => setStep(FlowStep.SIGN_OFF), 2000); 
  };

  const resetState = () => {
    setSelectedHeart(null);
    setStep(FlowStep.INTERACTIVE_HEART);
  };

  const handleExit = () => {
    if (audioRef) audioRef.pause();
    // Cinematic fade out to black
    setStep(FlowStep.INVITATION); // A simple way to trigger the full dark overlay
    setTimeout(() => {
        // Here you would typically navigate away or shut down a modal, 
        // for this demo, we just console log
        console.log("Experience ended. See you soon, Silvyn.");
    }, 3000);
  }

  // Define transition variants
  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: [0.6, -0.05, 0.01, 0.9] } },
    exit: { opacity: 0, transition: { duration: 1.2 } },
  };

  // --- RENDERING SCENES ---

  // STEP 0: INVITATION
  const renderInvitation = () => (
    <>
      <CinematicText 
        primary="This is a quiet place I built for you, Silvyn."
        sub="For when the world slows down, and only the thoughts of us remain."
      />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, transition: { delay: 2.5, duration: 1.5 } }}>
        <ActionButton onClick={handleUnlock}>
          Unlock the Moment
        </ActionButton>
      </motion.div>
    </>
  );

  // STEP 1: THE ACKNOWLEDGEMENT
  const renderAcknowledgment = () => (
    <>
      <CinematicText 
        key="ack-1"
        primary="My name is Ayomide."
        sub=""
        duration={1.5}
        onComplete={() => setTimeout(() => setStep(FlowStep.DEEPER_CONNECTION), 1500)}
      />
      <CinematicText 
        key="ack-2"
        primary="And this space, like my heart, is reserved for my babe."
        sub="I’ve always known your orbit. We just have better gravity."
        duration={2.0}
        initialDelay={2.0}
      />
    </>
  );

  // STEP 2: DEEPER CONNECTION
  const renderDeeperConnection = () => (
    <TeasingSlides onComplete={() => setStep(FlowStep.INTERACTIVE_HEART)} />
  );

  // STEP 3: THE INTERACTIVE HEART
  const renderInteractiveHeart = () => (
    <div className="flex flex-col items-center justify-center min-h-full">
      <CinematicText 
        primary="Tonight, what part of you wants to be seen?"
        sub=""
        duration={1.0}
        alignment="text-center"
      />
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12 px-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.5, delayChildren: 1.0 } } }}
      >
        {(Object.keys(HEART_MAP) as HeartOption[]).map((key, index) => {
          const { icon: Icon, color, title } = HEART_MAP[key];
          return (
            <ActionButton 
              key={key} 
              onClick={() => handleHeartClick(key)}
              className={`border-4 ${color.replace('/10', '/30')} hover:scale-[1.03] transition-transform`}
              delay={index * 0.2}
            >
              <Icon className="w-6 h-6 mr-3 text-rose-300" />
              {key}
            </ActionButton>
          );
        })}
      </motion.div>
    </div>
  );

  // STEP 4: THE SIGN-OFF & Loop
  const renderSignOff = () => (
    <div className="flex flex-col items-center justify-center min-h-full">
      {selectedHeart && (
        <motion.div
          key="reveal-overlay"
          className={`absolute inset-0 p-8 flex flex-col items-center justify-center ${HEART_MAP[selectedHeart].color} backdrop-blur-sm`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 1.5 } }}
          exit={{ opacity: 0, transition: { duration: 1.0 } }}
        >
          <div className="max-w-xl text-center">
            <h2 className="text-4xl md:text-6xl font-serif text-rose-100 mb-6 font-extrabold">{HEART_MAP[selectedHeart].title}</h2>
            <p className="text-xl md:text-3xl text-rose-300 leading-relaxed font-light">{HEART_MAP[selectedHeart].copy}</p>
            <div className="mt-8 flex justify-center">
                <HandHeart className="w-12 h-12 text-rose-400 animate-pulse-slow" />
            </div>
          </div>
        </motion.div>
      )}

      <motion.div 
        className="relative z-10 text-center mt-48 md:mt-0"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0, transition: { delay: selectedHeart ? 2.5 : 0.5, duration: 1.5 } }}
      >
        <p className="text-xl md:text-2xl text-rose-300/80 mb-4">
          I built this not to pressure you, but to hold space for you. This is the truth, without noise.
        </p>
        <p className="text-2xl md:text-3xl font-serif text-rose-100/90 mb-12">
          — Always, Ayomide.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <ActionButton onClick={resetState} className="bg-rose-700/50 hover:bg-rose-600/70 border-rose-500/80">
            Revisit the Heart
          </ActionButton>
          <ActionButton onClick={handleExit} className="bg-transparent border-plum-500/50 hover:bg-plum-900/30 text-plum-300">
            Exit/Sleep
          </ActionButton>
        </div>
      </motion.div>
    </div>
  );

  const renderScene = () => {
    switch (step) {
      case FlowStep.INVITATION:
        return renderInvitation();
      case FlowStep.ACKNOWLEDGMENT:
        // Use a timeout to ensure a clean transition before showing the final sequence
        return <motion.div key="ack-scene">{renderAcknowledgment()}</motion.div>;
      case FlowStep.DEEPER_CONNECTION:
        return <motion.div key="deep-scene" className="min-h-full flex items-center justify-center">{renderDeeperConnection()}</motion.div>;
      case FlowStep.INTERACTIVE_HEART:
        return <motion.div key="interact-scene" className="min-h-full flex items-center justify-center">{renderInteractiveHeart()}</motion.div>;
      case FlowStep.SIGN_OFF:
        return <motion.div key="signoff-scene" className="min-h-full flex items-center justify-center">{renderSignOff()}</motion.div>;
      default:
        return null;
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white font-sans">
      <ParticlesBackground preset={currentParticlePreset} />

      {/* Full-Screen Content Area */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4 md:p-8">
        <div className="w-full h-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              className="w-full h-full"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderScene()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* STEP 0: Cinematic Entry Overlay */}
      <AnimatePresence>
        {step === FlowStep.INVITATION && (
          <motion.div
            className="absolute inset-0 z-50 bg-gradient-to-br from-black to-plum-950/90 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0, transition: { duration: 3.5, ease: 'easeOut' } }}
            exit={{ opacity: 1, transition: { duration: 3.0, ease: 'easeIn' } }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
