import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { copyToClipboard } from '../../utils/copyToClipboard';

// Lazy so the type paints before the 3D layer is parsed; the reserved box
// keeps the layout from shifting when it arrives.
const Avatar = lazy(() => import('./Avatar'));

const AVATAR_SIZE = 150;
const EASE = [0.16, 1, 0.3, 1];

const RESUME = {
  label: 'Resume',
  href: 'https://drive.google.com/file/d/1q9-9VMk70cHw87K7mhuZKY6eKp7_j10X/view?usp=sharing',
};

// Each of these is one control with two jobs: the label opens it, the icon
// beside it copies the address. Kept as a single bordered unit so it never
// reads as two unrelated buttons.
const PROFILES = [
  {
    key: 'github',
    label: 'GitHub',
    href: 'https://github.com/Deep-De-coder',
    copy: 'https://github.com/Deep-De-coder',
    external: true,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/deep-shahane/',
    copy: 'https://www.linkedin.com/in/deep-shahane/',
    external: true,
  },
  {
    key: 'email',
    label: 'Email',
    href: 'mailto:esotericdeep@gmail.com',
    // The address, not the mailto: scheme, is what anyone pasting wants,
    // so the control says so rather than calling it a link.
    copy: 'esotericdeep@gmail.com',
    copyNoun: 'email address',
    external: false,
  },
];

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ProfileControl({ profile }) {
  const [state, setState] = useState(null); // 'ok' | 'fail' | null
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onCopy = async () => {
    const ok = await copyToClipboard(profile.copy);
    setState(ok ? 'ok' : 'fail');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState(null), 1800);
  };

  const noun = profile.copyNoun || `${profile.label} link`;
  const status =
    state === 'ok'
      ? 'Copied'
      : state === 'fail'
        ? 'Copy failed, select the text instead'
        : `Copy ${noun}`;

  return (
    <span className="v2-split" data-state={state || 'idle'}>
      <a
        href={profile.href}
        className="v2-split__link"
        {...(profile.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {profile.label}
      </a>
      <button type="button" className="v2-split__copy" onClick={onCopy} aria-label={status} title={status}>
        {state === 'ok' ? <CheckIcon /> : <CopyIcon />}
      </button>
    </span>
  );
}

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

            {/* Two beats. The first carries full-strength ink so the
                claim and the qualification read as a pair, not a run-on. */}
            <motion.p {...rise(0.28)} className="v2-lede" style={{ maxWidth: '44ch' }}>
              <span style={{ color: 'var(--v2-text)' }}>Shipping AI is the easy half.</span>{' '}
              Proving it holds up is the rest.
            </motion.p>

            <motion.p {...rise(0.32)} className="v2-meta" style={{ margin: '0.75rem 0 0' }}>
              Founding Engineer · NILA · MS CS, University at Buffalo
            </motion.p>

            <motion.hr {...rise(0.36)} className="v2-rule" style={{ margin: '1.75rem 0' }} />

            <motion.div
              {...rise(0.4)}
              style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.625rem' }}
            >
              <a
                href={RESUME.href}
                className="v2-btn v2-btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {RESUME.label}
              </a>
              {PROFILES.map(p => (
                <ProfileControl key={p.key} profile={p} />
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
