import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { publications } from '../../data/publications';
import './theme.css';

// Adapter: the shared data keeps the v1 list order; this section renders
// newest first.
const PUBS = [...publications].sort((a, b) => Number(b.year) - Number(a.year));

const EASE = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-80px' };

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

// One entrance for the whole page: 16px rise, 600ms, the system easing.
// With reduced motion the transform is dropped and only the fade remains.
function rise(reduced, i = 0) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: VIEWPORT,
      transition: { duration: 0.4, ease: EASE },
    };
  }
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.06 },
  };
}

/* The whole citation is one link, so its hover/focus states have to be CSS on
   the anchor rather than per-element handlers. Tokens only, no new colours,
   radii or curves. */
const PUB_CSS = `
.v2-pub {
  display: block;
  text-decoration: none;
  border-radius: var(--v2-r-md);
  transition: background-color var(--v2-t) var(--v2-ease);
}
.v2-pub:hover,
.v2-pub:focus-visible {
  background: var(--v2-surface-1);
}
.v2-pub__title {
  transition: color var(--v2-t-fast) var(--v2-ease);
}
.v2-pub:hover .v2-pub__title,
.v2-pub:focus-visible .v2-pub__title {
  color: var(--v2-accent-bright);
}
.v2-pub__arrow {
  transition:
    transform var(--v2-t) var(--v2-ease),
    color var(--v2-t) var(--v2-ease),
    border-color var(--v2-t) var(--v2-ease),
    background-color var(--v2-t) var(--v2-ease);
}
.v2-pub:hover .v2-pub__arrow,
.v2-pub:focus-visible .v2-pub__arrow {
  color: var(--v2-text);
  border-color: var(--v2-line-strong);
  background: var(--v2-surface-2);
  transform: translate3d(2px, -2px, 0);
}
.v2-pub:hover .v2-tag,
.v2-pub:focus-visible .v2-tag {
  color: var(--v2-text-2);
  border-color: var(--v2-line);
}
.v2-pub:hover .v2-tag--live,
.v2-pub:focus-visible .v2-tag--live {
  color: var(--v2-live);
}
@media (prefers-reduced-motion: reduce) {
  .v2-pub:hover .v2-pub__arrow,
  .v2-pub:focus-visible .v2-pub__arrow { transform: none; }
}
`;

function Citation({ pub, index, reduced }) {
  // Data-driven: an entry flagged as in-progress gets the live/local accent
  // this page reserves for anything still running.
  const ongoing = pub.ongoing === true || pub.status === 'ongoing';

  return (
    <motion.li {...rise(reduced, index)}>
      {index > 0 && <hr className="v2-rule" aria-hidden="true" />}

      <a
        // The hover surface bleeds past the text column, but only from `sm`
        // up: at 390px the negative margin pushed the row wider than its
        // container and the right edge got clipped.
        className="v2-pub sm:-mx-4 sm:px-4"
        href={pub.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${pub.title}, ${pub.venue}, ${pub.year} (opens in a new tab)`}
      >
        <div className="grid items-start gap-x-6 gap-y-4 py-7 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:py-8">
          {/* Year rail */}
          <span className="v2-meta" style={{ paddingTop: '0.1875rem' }}>{pub.year}</span>

          <div className="flex min-w-0 flex-col gap-3">
            <h3
              className="v2-h3 v2-pub__title"
              style={{ fontSize: 'clamp(1.0625rem, 1.5vw, 1.1875rem)' }}
            >
              {pub.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="v2-meta">{pub.venue}</span>
              {ongoing && <span className="v2-tag v2-tag--live">Ongoing</span>}
            </div>

            <ul className="flex list-none flex-wrap gap-2" style={{ margin: 0, padding: 0 }}>
              {pub.tags.map(t => (
                <li key={t} className="v2-tag">{t}</li>
              ))}
            </ul>
          </div>

          {/* Affordance: the arrow is the only thing that moves */}
          <span
            aria-hidden="true"
            className="v2-pub__arrow inline-flex h-9 w-9 shrink-0 items-center justify-center justify-self-start sm:justify-self-end"
            style={{
              borderRadius: 'var(--v2-r-sm)',
              border: '1px solid var(--v2-line-weak)',
              background: 'var(--v2-surface-1)',
              color: 'var(--v2-text-3)',
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </span>
        </div>
      </a>
    </motion.li>
  );
}

export default function PublicationsSection() {
  const reduced = useReducedMotion();

  return (
    <section id="publications" className="v2-section" style={{ background: 'transparent' }}>
      <div className="v2-container">
        <motion.header {...rise(reduced)} className="mb-10 sm:mb-12">
          <p className="v2-eyebrow" style={{ margin: 0 }}>
            <span className="v2-eyebrow__index">07</span>
            <span className="v2-eyebrow__line shrink-0" aria-hidden="true" />
            Research
          </p>
          <h2 className="v2-h2">Publications</h2>
          <p className="v2-lede">
            Published work in time-series forecasting, recommender systems, and 3D vision.
          </p>
        </motion.header>

        {/* A bibliography, not a stack of boxes: hairline-separated citations. */}
        <ol className="flex list-none flex-col" style={{ margin: 0, padding: 0 }}>
          {PUBS.map((pub, i) => (
            <Citation key={pub.title} pub={pub} index={i} reduced={reduced} />
          ))}
        </ol>
      </div>

      <style>{PUB_CSS}</style>
    </section>
  );
}
