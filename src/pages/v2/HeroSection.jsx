import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

// Lazy so the type paints before the 3D layer is parsed; the reserved box
// keeps the layout from shifting when it arrives.
const Avatar = lazy(() => import('./Avatar'));

const AVATAR_SIZE = 150;
const EASE = [0.16, 1, 0.3, 1];

const LINKS = [
  {
    label: 'Resume',
    href: 'https://drive.google.com/file/d/1q9-9VMk70cHw87K7mhuZKY6eKp7_j10X/view?usp=sharing',
    external: true,
    primary: true,
  },
  { label: 'GitHub', href: 'https://github.com/Deep-De-coder', external: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/deep-shahane/', external: true },
  { label: 'Email', href: 'mailto:esotericdeep@gmail.com', external: false },
];

export default function HeroSection() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const rise = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section
      id="home"
      className="v2-section"
      style={{ paddingTop: 'clamp(7rem, 14vh, 10rem)', paddingBottom: 'clamp(3.5rem, 8vh, 5.5rem)' }}
    >
      <div className="v2-container">
        <div className="hero-grid">
          <motion.div {...rise(0.05)} style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}>
            <Suspense fallback={<div style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} />}>
              <Avatar size={AVATAR_SIZE} />
            </Suspense>
          </motion.div>

          <div style={{ minWidth: 0 }}>
            <motion.p
              {...rise(0.1)}
              style={{
                margin: 0,
                fontFamily: 'var(--v2-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--v2-accent)',
              }}
            >
              Production AI Engineer
            </motion.p>

            <motion.h1 {...rise(0.16)} className="v2-display" style={{ margin: '0.75rem 0 0' }}>
              Deep Shahane
            </motion.h1>

            <motion.p
              {...rise(0.22)}
              style={{
                margin: '0.5rem 0 0',
                fontFamily: 'var(--v2-display)',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(1.0625rem, 2.1vw, 1.375rem)',
                lineHeight: 1.35,
                color: 'var(--v2-text-3)',
              }}
            >
              Agents, pipelines, and systems that ship.
            </motion.p>

            <motion.p {...rise(0.28)} className="v2-lede" style={{ maxWidth: '46ch' }}>
              I build AI that holds up in production, and I keep the evidence that it does.
            </motion.p>

            <motion.p {...rise(0.32)} className="v2-meta" style={{ margin: '0.75rem 0 0' }}>
              Founding Engineer · NILA · MS CS, University at Buffalo
            </motion.p>

            <motion.hr {...rise(0.36)} className="v2-rule" style={{ margin: '1.75rem 0' }} />

            <motion.div
              {...rise(0.4)}
              style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.625rem' }}
            >
              {LINKS.map(({ label, href, external, primary }) => (
                <a
                  key={label}
                  href={href}
                  className={`v2-btn ${primary ? 'v2-btn--primary' : 'v2-btn--ghost'}`}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {label}
                </a>
              ))}
            </motion.div>

            <motion.p {...rise(0.46)} style={{ margin: '1.25rem 0 0' }}>
              <span
                className="v2-tag v2-tag--live"
                style={{ gap: '0.5rem', padding: '0.4375rem 0.625rem', whiteSpace: 'normal' }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'var(--v2-live)',
                    flexShrink: 0,
                  }}
                />
                WebGPU · the assistant on this page runs on your GPU
              </span>
            </motion.p>
          </div>
        </div>
      </div>

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: clamp(1.5rem, 4vw, 3rem);
          align-items: center;
        }
        @media (max-width: 720px) {
          .hero-grid { grid-template-columns: 1fr; justify-items: start; }
        }
      `}</style>
    </section>
  );
}
