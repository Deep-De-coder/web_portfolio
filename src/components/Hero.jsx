import React from 'react';
import { motion } from 'framer-motion';

const wordVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const firstLineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.45 } },
};

const aiLineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.82 } },
};

export default function Hero() {
  const scrollToAsk = () => {
    document.getElementById('ask')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080808]">

      {/* Layer 1: Indigo dot grid */}
      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Layer 1b: Radial vignette — collapses grid at edges */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, #080808 75%)',
        }}
      />

      {/* Layer 2: Breathing glow orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-indigo-700/10 blur-[140px] pointer-events-none"
        animate={{ scale: [1, 1.07, 1], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Layer 3: Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl w-full">

        {/* Eyebrow pill */}
        <motion.span
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8 inline-block text-xs font-mono tracking-[0.3em] uppercase text-zinc-500 border border-zinc-800 rounded-full px-4 py-1.5"
        >
          Deep Shahane
        </motion.span>

        {/* Headline line 1: Engineer. Builder. */}
        <motion.div
          variants={firstLineVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-x-[0.3em] text-white font-bold tracking-tight leading-none"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 7.5rem)' }}
        >
          {['Engineer.', 'Builder.'].map((word) => (
            <motion.span key={word} variants={wordVariant}>
              {word}
            </motion.span>
          ))}
        </motion.div>

        {/* Headline line 2: The AI runs here. — gradient + glow */}
        <motion.div
          variants={aiLineVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-x-[0.3em] mt-2 font-bold tracking-tight leading-none"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 7.5rem)' }}
        >
          {['The', 'AI', 'runs', 'here.'].map((word) => (
            <motion.span
              key={word}
              variants={wordVariant}
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400"
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-8 text-zinc-400 text-base sm:text-lg max-w-lg leading-relaxed"
        >
          WebGPU-powered language model.{' '}
          <span className="text-zinc-200 font-medium">No API. No cloud.</span>{' '}
          Your browser.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={scrollToAsk}
            className="group flex items-center gap-2 px-7 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-all duration-200"
          >
            Talk to the AI
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </button>

          <button
            onClick={scrollDown}
            className="group flex items-center gap-2 px-7 py-3 rounded-full border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-200 transition-all duration-200"
          >
            See the work
            <span className="transition-transform duration-200 group-hover:translate-y-0.5">↓</span>
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator — traveling line */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.5 }}
      >
        <div className="relative w-px h-12 overflow-hidden">
          <motion.div
            className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-zinc-500 to-transparent"
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
