import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ROLES = [
  'AI Researcher at SAIR Lab, UB',
  'Building AI that runs in your browser',
  'Computer Vision · LLMs · WebGPU',
  '16× speedup in drone 3D reconstruction',
];

export default function HeroSection() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = ROLES[roleIdx];
    let t;
    if (!deleting && displayed.length < current.length) {
      t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 45);
    } else if (!deleting && displayed.length === current.length) {
      t = setTimeout(() => setDeleting(true), 2500);
    } else if (deleting && displayed.length > 0) {
      t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 22);
    } else {
      setDeleting(false);
      setRoleIdx(i => (i + 1) % ROLES.length);
    }
    return () => clearTimeout(t);
  }, [displayed, deleting, roleIdx]);

  const name = 'Deep Shahane';

  return (
    <section
      id="home"
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: '100vh', background: '#05050a' }}
    >
      {/* Indigo glow top-center */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          top: '-5%', left: '10%', width: '80%', height: '75%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.13) 0%, transparent 68%)',
          filter: 'blur(48px)',
        }}
      />
      {/* Cyan glow bottom-right */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          bottom: '-10%', right: '0%', width: '45%', height: '55%',
          background: 'radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 70%)',
          filter: 'blur(64px)',
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.18,
        }}
      />

      <div className="relative z-10 text-center px-6 w-full max-w-5xl mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-dm text-xs font-medium tracking-[0.2em] text-indigo-400 uppercase mb-7"
        >
          MS Computer Science · University at Buffalo
        </motion.p>

        {/* Name — letter stagger */}
        <h1
          className="font-grotesk font-bold text-white leading-none mb-6 select-none"
          style={{ fontSize: 'clamp(3rem, 10vw, 7.5rem)', letterSpacing: '-0.025em' }}
        >
          {name.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 56, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 0.55,
                delay: 0.35 + i * 0.035,
                type: 'spring',
                stiffness: 170,
                damping: 18,
              }}
              style={{ display: char === ' ' ? 'inline' : 'inline-block', whiteSpace: 'pre' }}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.4 }}
          className="font-dm mb-10"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', color: '#94a3b8', minHeight: '2rem' }}
        >
          {displayed}
          <span style={{ color: '#818cf8', animation: 'hero-blink 1s step-end infinite' }}>|</span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 mb-10"
        >
          <a
            href="#ask"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-dm font-medium text-sm text-white cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 0 36px rgba(99,102,241,0.38)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            Try the In-Browser AI
          </a>
          <a
            href="#projects"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-dm font-medium text-sm cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
            style={{ border: '1px solid rgba(255,255,255,0.14)', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)' }}
          >
            View Projects
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </motion.div>

        {/* Status badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-dm text-xs"
            style={{ border: '1px solid rgba(34,211,238,0.25)', background: 'rgba(34,211,238,0.06)', color: '#22d3ee' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"
              style={{ animation: 'hero-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}
            />
            WebGPU Powered
          </span>
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-dm text-xs"
            style={{ border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)', color: '#64748b' }}
          >
            LLM runs locally · No data leaves your device
          </span>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.7 }}
        className="absolute bottom-8 flex flex-col items-center gap-2"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
        aria-hidden="true"
      >
        <span className="font-dm text-[10px] tracking-[0.22em] uppercase text-slate-700">scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut' }}
          className="w-px h-8"
          style={{ background: 'linear-gradient(to bottom, #334155, transparent)' }}
        />
      </motion.div>

      <style>{`
        @keyframes hero-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes hero-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </section>
  );
}
