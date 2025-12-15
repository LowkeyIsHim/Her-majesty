"use client";

import { useState, useEffect } from "react";
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
    "You act like you don’t know how special you are. I’ve always known.",
    "Your quiet is more profound than most people's noise.",
    "Smart, stubborn, and softer than you admit."
];

// --- UTILITY COMPONENT: TYPEWRITER (For high-impact text) ---
function TypewriterText({ text, delay = 0.05, className = "" }: { text: string, delay?: number, className?: string }) {
    const chars = text.split("");
    return (
        <p className={`whitespace-pre-wrap ${className}`}>
            {chars.map((char, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.01, delay: index * delay }}
                >
                    {char}
                </motion.span>
            ))}
        </p>
    );
}


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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative font-sans text-starlight selection:bg-desire-rose/30">
      <Background />
      <AudioPlayer started={hasStarted} />

      <AnimatePresence mode="wait">
        
        {/* STEP 0: INVITATION */}
        {step === 0 && (
          <motion.div key="intro" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center max-w-lg">
            <h1 className="text-4xl md:text-6xl font-serif text-desire-rose mb-6 tracking-wide">
              To Silvyn, after the noise sleeps.
            </h1>
            <p className="text-xl md:text-2xl text-starlight/70 mb-12 font-light leading-relaxed">
              This is for when the world gets quiet.<br/>
              You don’t have to do anything. Just **breathe** here.
            </p>
            <button 
              onClick={() => { setHasStarted(true); nextStep(); }}
              className="group liquid-button flex items-center gap-3 mx-auto px-10 py-4 rounded-full glass-panel font-medium text-soft-amber border-2 border-soft-amber/30 hover:border-soft-amber/60 hover:shadow-lg hover:shadow-soft-amber/10 transition-all duration-500"
            >
              Come sit with me
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
             <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-desire-rose/50 to-transparent mx-auto mb-8" />
            <p className="text-2xl md:text-3xl font-serif mb-4 text-starlight/90">
              I know we orbit differently now.
            </p>
            <p className="text-starlight/60 leading-relaxed text-lg mb-8">
              But gravity doesn't care about labels, distance, or time.<br/>
              Some things just... **remain**.
            </p>
            <button onClick={nextStep} className="text-soft-amber/70 hover:text-soft-amber transition-colors text-sm tracking-widest uppercase mt-4">
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
            <h2 className="text-4xl font-serif mb-4 text-soft-amber">What does your soul lean toward?</h2>
            <p className="text-starlight/40 mb-12 text-sm">Your secret answer is safe here.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChoiceButton 
                icon={<Sparkles className="w-6 h-6 text-soft-amber" />} 
                label="I want to smile" 
                onClick={() => setChoice('smile')} 
              />
              <ChoiceButton 
                icon={<Moon className="w-6 h-6 text-starlight" />} 
                label="I want comfort" 
                onClick={() => setChoice('comfort')} 
              />
              <ChoiceButton 
                icon={<Heart className="w-6 h-6 text-desire-rose" />} 
                label="I want to be wanted" 
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
          <motion.div key="future" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center max-w-lg">
            <TypewriterText 
                text={"I don’t know what tomorrow looks like."} 
                className="text-3xl md:text-4xl font-serif text-starlight/90 mb-8"
            />
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}>
                <p className="text-starlight/70 leading-relaxed mb-10 text-lg">
                    But if our paths ever lean toward each other again...<br/>
                    <span className="text-desire-rose font-medium tracking-wide">I would recognize you instantly.</span><br/>
                    In the dark. In a crowd. Anywhere.
                </p>
            </motion.div>
            
            <button onClick={nextStep} className="animate-pulse-slow text-starlight/30 hover:text-starlight transition-colors mt-6">
              One last thing
            </button>
          </motion.div>
        )}

        {/* STEP 6: CLOSING */}
        {step === 6 && (
          <motion.div key="closing" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center">
            <h2 className="text-3xl font-serif mb-4 text-soft-amber">Whenever the night feels long...</h2>
            <p className="text-starlight/60 mb-8 text-lg">
              This space is yours. <br/>
              It will still be here. And quietly, so will I.
            </p>
            <div className="text-base font-medium tracking-widest text-desire-rose mt-12">
              — FROM SOMEONE WHO STILL SEES YOU
            </div>
            
            <button 
                onClick={() => setStep(4)} 
                className="mt-16 text-xs text-starlight/20 hover:text-starlight/50 transition-colors uppercase tracking-widest"
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
            className="flex flex-col items-center justify-center gap-3 p-6 glass-panel rounded-xl hover:bg-rich-plum/80 hover:scale-[1.03] transition-all duration-300 group liquid-button"
        >
            <div className="p-3 bg-white/5 rounded-full group-hover:bg-soft-amber/10 transition-colors">
                {icon}
            </div>
            <span className="text-base font-medium tracking-wide text-starlight/90">{label}</span>
        </button>
    )
}

function IdentitySequence({ onComplete }: { onComplete: () => void }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < NICKNAMES.length) {
            const timer = setTimeout(() => {
                setIndex(prev => prev + 1);
            }, index === NICKNAMES.length - 1 ? 3500 : 2000); 
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
                    className="text-4xl md:text-6xl font-serif text-soft-amber/90"
                >
                    {currentName}
                </motion.h2>
           </AnimatePresence>
           {index === NICKNAMES.length - 1 && (
               <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 1 }}
                className="mt-6 text-starlight/60 text-lg"
               >
                   Different names. Same magic.
               </motion.p>
           )}
        </motion.div>
    );
}

function RandomCompliment({ onNext }: { onNext: () => void }) {
    const [compliment, setCompliment] = useState("");

    useEffect(() => {
        const random = RANDOM_COMPLIMENTS[Math.floor(Math.random() * RANDOM_COMPLIMENTS.length)];
        setCompliment(random);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center max-w-lg glass-panel p-8 rounded-2xl border-soft-amber/10 border"
        >
            <div className="mb-6 text-5xl text-desire-rose/70">❝</div>
            <h3 className="text-xl md:text-3xl font-serif italic leading-relaxed text-starlight/90">
                <TypewriterText text={compliment} delay={0.03} />
            </h3>
            <div className="mt-6 text-5xl text-desire-rose/70">❞</div>
            
            <button onClick={onNext} className="mt-12 px-8 py-3 bg-desire-rose/20 rounded-full hover:bg-desire-rose/30 transition-colors text-starlight/90 text-sm font-medium liquid-button">
                I've always known
            </button>
        </motion.div>
    )
}

function ChoiceReveal({ type, onReset, onNext }: { type: 'smile' | 'comfort' | 'desire', onReset: () => void, onNext: () => void }) {
    
    let content = {
        title: "",
        body: "",
    };

    if (type === 'smile') {
        content.title = "There's that look.";
        content.body = "You know the one. The one where you try to hide a smile but your eyes give it away. I miss being the reason for that.";
    } else if (type === 'comfort') {
        content.title = "Breathe, Silvyn. Set it down.";
        content.body = "You carry so much. Just for a moment, set it down. You are safe here. You are enough, just as you are right now.";
    } else if (type === 'desire') {
        content.title = "I still feel the pull.";
        content.body = "The magnetic pull. The electricity in the quiet moments. Closeness isn't just physical... it's how you haunt my mind in the best way.";
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="glass-panel p-8 md:p-12 rounded-2xl max-w-lg text-center border-desire-rose/10 border shadow-2xl shadow-rich-plum/50"
        >
            <h3 className="text-3xl font-serif text-soft-amber mb-6">{content.title}</h3>
            <p className="text-starlight/70 leading-relaxed text-lg mb-8">{content.body}</p>
            
            <div className="flex gap-4 justify-center mt-6">
                <button onClick={onReset} className="text-xs uppercase tracking-widest text-starlight/40 hover:text-starlight/80 transition-colors">
                    Choose Again
                </button>
                <div className="w-[1px] h-4 bg-starlight/20"></div>
                <button onClick={onNext} className="text-xs uppercase tracking-widest text-desire-rose hover:text-soft-amber transition-colors">
                    Continue to the End
                </button>
            </div>
        </motion.div>
    )
}
