import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ROLES = ['Agents, pipelines, and systems that ship.'];

const SUB_LINE = 'Founding Engineer @ NILA · MS CS @ University at Buffalo';

const LINKS = [
  { label: 'Resume', href: 'https://drive.google.com/file/d/1q9-9VMk70cHw87K7mhuZKY6eKp7_j10X/view?usp=sharing', external: true },
  { label: 'GitHub', href: 'https://github.com/Deep-De-coder', external: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/deep-shahane/', external: true },
  { label: 'Email', href: 'mailto:esotericdeep@gmail.com', external: false },
];

const EASE = [0.16, 1, 0.3, 1];

export default function HeroSection() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || ROLES.length < 2) return; // nothing to cycle through
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
  }, [displayed, deleting, roleIdx, reduceMotion]);

  const words = 'Deep Shahane'.split(' ');

  return (
    <section
      id="home"
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: '100svh', background: 'transparent' }}
    >
      {/* Soft key light behind the wordmark, gives the type something to sit
          in front of so it reads as lit rather than pasted on. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '46%',
          width: 'min(120vw, 1100px)',
          height: 'min(70vh, 560px)',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(99,102,241,0.13) 0%, rgba(99,102,241,0.05) 42%, transparent 72%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="relative text-center w-full"
        style={{ zIndex: 3, maxWidth: '68rem', margin: '0 auto', padding: '0 var(--v2-gutter)' }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: 'clamp(1.25rem, 3vh, 2rem)',
          }}
        >
          <span
            aria-hidden="true"
            style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, var(--v2-accent-bright))' }}
          />
          <span
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--v2-accent-bright)',
            }}
          >
            AI Engineer
          </span>
          <span
            aria-hidden="true"
            style={{ width: 28, height: 1, background: 'linear-gradient(90deg, var(--v2-accent-bright), transparent)' }}
          />
        </motion.div>

        {/* Wordmark, each word rises out of its own mask. A clipped reveal
            reads more considered than a blur-in, and it keeps the baseline
            perfectly stable while it animates. */}
        <h1
          className="v2-display"
          style={{ margin: '0 0 clamp(1rem, 2.5vh, 1.75rem)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.28em' }}
        >
          {words.map((word, i) => (
            <span key={word} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
              <motion.span
                style={{ display: 'block' }}
                initial={reduceMotion ? false : { y: '105%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, delay: 0.3 + i * 0.09, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Typewriter. min-height is reserved so the CTAs never shift as the
            line grows and deletes. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 'clamp(1rem, 2.1vw, 1.25rem)',
            lineHeight: 1.5,
            color: 'var(--v2-text-2)',
            minHeight: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'clamp(1.75rem, 4vh, 2.75rem)',
          }}
        >
          <span>
            {reduceMotion || ROLES.length < 2 ? ROLES[0] : displayed}
            {!reduceMotion && ROLES.length > 1 && (
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '1.5px',
                  height: '1.1em',
                  marginLeft: '3px',
                  verticalAlign: 'text-bottom',
                  background: 'var(--v2-accent-bright)',
                  animation: 'hero-blink 1.05s step-end infinite',
                }}
              />
            )}
          </span>
        </motion.div>

        {/* Sub line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.5 }}
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)',
            color: 'var(--v2-text-3)',
            margin: '0 0 clamp(1.75rem, 4vh, 2.5rem)',
          }}
        >
          {SUB_LINE}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7, ease: EASE }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: 'clamp(1.75rem, 4vh, 2.5rem)',
          }}
        >
          {LINKS.map(({ label, href, external }, i) => (
            <a
              key={label}
              href={href}
              className={`v2-btn ${i === 0 ? 'v2-btn--primary' : 'v2-btn--ghost'}`}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {label}
            </a>
          ))}
        </motion.div>

        {/* Proof chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35, duration: 0.6 }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <span className="v2-tag v2-tag--live" style={{ gap: '0.4375rem', padding: '0.5rem 0.75rem' }}>
            <span
              aria-hidden="true"
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--v2-live)',
                boxShadow: '0 0 8px rgba(34,211,238,0.9)',
                animation: 'hero-pulse 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
              }}
            />
            WebGPU powered
          </span>
          <span className="v2-tag" style={{ padding: '0.5rem 0.75rem' }}>
            Runs locally · no data leaves your device
          </span>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.1, duration: 0.8 }}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 'clamp(1.5rem, 4vh, 2.5rem)',
          // Auto-margin centring rather than translateX(-50%), so a future
          // transform animation on this element can't knock it off-centre.
          left: 0,
          right: 0,
          marginInline: 'auto',
          width: 'fit-content',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.625rem',
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '0.625rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--v2-text-4)',
          }}
        >
          Scroll
        </span>
        <div style={{ position: 'relative', width: 1, height: 40, background: 'var(--v2-line)', overflow: 'hidden' }}>
          {!reduceMotion && (
            <motion.div
              animate={{ y: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2.1, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: '0 0 auto',
                height: '50%',
                background: 'linear-gradient(to bottom, transparent, var(--v2-accent-bright))',
              }}
            />
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes hero-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes hero-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>
    </section>
  );
}
