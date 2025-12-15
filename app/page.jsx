"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Background from "@/components/Background";
import AudioPlayer from "@/components/AudioPlayer";
import { ArrowRight, Sparkles, Heart, Moon, Sun } from "lucide-react";

// --- CONTENT DATA ---

const NICKNAMES = [
  "My Lovebug",
  "Her Majesty",
  "Omalicha",
  "Coconut Head",
  "Silvyn"
];

const RANDOM_COMPLIMENTS = [
    "You have a way of being calm and dangerous at the same time.",
    "The way your mind works? Pure art.",
    "You act like you don't know how rare you are.",
    "Even your silence speaks a language I miss.",
    "Smart, stubborn, and softer than you admit."
];

// --- MAIN COMPONENT ---

export default function Page() {
  const [step, setStep] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [choice, setChoice] = useState<null | 'smile' | 'comfort' | 'desire'>(null);

  const nextStep = () => setStep((p) => p + 1);

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative font-sans text-starlight selection:bg-rose/30">
      <Background />
      <AudioPlayer started={hasStarted} />

      <AnimatePresence mode="wait">
        
        {/* STEP 0: INVITATION */}
        {step === 0 && (
          <motion.div key="intro" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center max-w-md">
            <h1 className="text-3xl md:text-5xl font-serif text-rose/90 mb-6 tracking-wide">
              Silvyn...
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-12 font-light leading-relaxed">
              This is for when the world gets quiet.<br/>
              You don’t have to do anything.<br/>
              Just be here.
            </p>
            <button 
              onClick={() => { setHasStarted(true); nextStep(); }}
              className="group flex items-center gap-3 mx-auto px-8 py-3 rounded-full glass-panel text-white/80 hover:bg-rose/20 transition-all duration-500"
            >
              Come sit with me
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <IdentitySequence onComplete={nextStep} />
        )}

        {/* STEP 2: DISTANCE */}
        {step === 2 && (
          <motion.div key="distance" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center max-w-lg">
             <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-rose/50 to-transparent mx-auto mb-8" />
            <p className="text-2xl font-serif mb-4 text-white/90">
              I know we orbit differently now.
            </p>
            <p className="text-white/60 leading-relaxed mb-8">
              But gravity doesn't care about labels, distance, or time.<br/>
              Some things just... remain.
            </p>
            <button onClick={nextStep} className="text-rose/70 hover:text-rose transition-colors text-sm tracking-widest uppercase">
              ( Continue )
            </button>
          </motion.div>
        )}

        {/* STEP 3: PLAYFUL / RANDOMIZED */}
        {step === 3 && (
            <RandomCompliment onNext={nextStep} />
        )}

        {/* STEP 4: INTERACTIVE CHOICE */}
        {step === 4 && !choice && (
          <motion.div key="choice" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center w-full max-w-xl">
            <h2 className="text-3xl font-serif mb-2">What does your heart need?</h2>
            <p className="text-white/40 mb-10 text-sm">Be honest.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChoiceButton 
                icon={<Sun className="w-5 h-5 text-gold" />} 
                label="To Smile" 
                onClick={() => setChoice('smile')} 
              />
              <ChoiceButton 
                icon={<Moon className="w-5 h-5 text-purple-300" />} 
                label="Comfort" 
                onClick={() => setChoice('comfort')} 
              />
              <ChoiceButton 
                icon={<Heart className="w-5 h-5 text-rose" />} 
                label="To be Wanted" 
                onClick={() => setChoice('desire')} 
              />
            </div>
          </motion.div>
        )}

        {/* STEP 4.5: CHOICE REVEAL */}
        {choice && step === 4 && (
            <ChoiceReveal type={choice} onReset={() => setChoice(null)} onNext={nextStep} />
        )}

        {/* STEP 5: FUTURE */}
        {step === 5 && (
          <motion.div key="future" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center max-w-md">
            <p className="text-xl md:text-2xl font-serif text-white/90 mb-6">
              I don’t know what tomorrow looks like.
            </p>
            <p className="text-white/60 leading-relaxed mb-10">
              But if our paths ever lean toward each other again...<br/>
              <span className="text-rose/80">I would recognize you instantly.</span><br/>
              In the dark. In a crowd. Anywhere.
            </p>
            <button onClick={nextStep} className="animate-pulse-slow text-white/30 hover:text-white transition-colors">
              One last thing
            </button>
          </motion.div>
        )}

        {/* STEP 6: CLOSING */}
        {step === 6 && (
          <motion.div key="closing" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center">
            <h2 className="text-2xl font-serif mb-4">Whenever the night feels long...</h2>
            <p className="text-white/50 mb-8">
              This space is yours. <br/>
              It will still be here. And quietly, so will I.
            </p>
            <div className="text-sm font-medium tracking-widest text-rose/60 mt-12">
              — FROM SOMEONE WHO STILL SEES YOU
            </div>
            
            <button 
                onClick={() => setStep(4)} 
                className="mt-16 text-xs text-white/20 hover:text-white/50 transition-colors uppercase tracking-widest"
            >
                Start Over
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}

// --- SUB COMPONENTS ---

function ChoiceButton({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-3 p-6 glass-panel rounded-xl hover:bg-white/5 hover:scale-105 transition-all duration-300 group"
        >
            <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                {icon}
            </div>
            <span className="text-sm font-medium tracking-wide text-white/80">{label}</span>
        </button>
    )
}

function IdentitySequence({ onComplete }: { onComplete: () => void }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < NICKNAMES.length) {
            const timer = setTimeout(() => {
                setIndex(prev => prev + 1);
            }, index === NICKNAMES.length - 1 ? 3500 : 2000); // Last one stays longer
            return () => clearTimeout(timer);
        } else {
            onComplete();
        }
    }, [index, onComplete]);

    const currentName = index < NICKNAMES.length ? NICKNAMES[index] : "";

    return (
        <motion.div 
            key="identity"
            className="h-64 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
           <AnimatePresence mode="wait">
                <motion.h2 
                    key={index}
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.8 }}
                    className="text-3xl md:text-5xl font-serif text-rose/90"
                >
                    {currentName}
                </motion.h2>
           </AnimatePresence>
           {index === NICKNAMES.length - 1 && (
               <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 1 }}
                className="mt-6 text-white/50"
               >
                   Different names. Same magic.
               </motion.p>
           )}
        </motion.div>
    );
}

function RandomCompliment({ onNext }: { onNext: () => void }) {
    // Select a random compliment only on mount to avoid hydration mismatch
    const [compliment, setCompliment] = useState("");

    useEffect(() => {
        const random = RANDOM_COMPLIMENTS[Math.floor(Math.random() * RANDOM_COMPLIMENTS.length)];
        setCompliment(random);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center max-w-lg"
        >
            <div className="mb-6 text-4xl text-rose/40">❝</div>
            <h3 className="text-xl md:text-2xl font-serif italic leading-relaxed text-white/90">
                {compliment}
            </h3>
            <div className="mt-6 text-4xl text-rose/40">❞</div>
            
            <button onClick={onNext} className="mt-12 px-6 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors text-sm">
                I've always known
            </button>
        </motion.div>
    )
}

function ChoiceReveal({ type, onReset, onNext }: { type: 'smile' | 'comfort' | 'desire', onReset: () => void, onNext: () => void }) {
    
    let content = {
        title: "",
        body: "",
        action: "Back to choices"
    };

    if (type === 'smile') {
        content.title = "There's that look.";
        content.body = "You know the one. The one where you try to hide a smile but your eyes give it away. I miss being the reason for that.";
    } else if (type === 'comfort') {
        content.title = "Breathe, Silvyn.";
        content.body = "You carry so much. Just for a moment, set it down. You are safe here. You are enough, just as you are right now.";
    } else if (type === 'desire') {
        content.title = "I still feel it too.";
        content.body = "The magnetic pull. The electricity in the quiet moments. Closeness isn't just physical... it's how you haunt my mind in the best way.";
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="glass-panel p-8 md:p-12 rounded-2xl max-w-lg text-center border-rose/10 border"
        >
            <h3 className="text-2xl font-serif text-rose/80 mb-6">{content.title}</h3>
            <p className="text-white/70 leading-relaxed mb-8">{content.body}</p>
            
            <div className="flex gap-4 justify-center">
                <button onClick={onReset} className="text-xs uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                    Choose Again
                </button>
                <div className="w-[1px] h-4 bg-white/10"></div>
                <button onClick={onNext} className="text-xs uppercase tracking-widest text-rose/60 hover:text-rose transition-colors">
                    Continue
                </button>
            </div>
        </motion.div>
    )
}
