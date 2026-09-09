import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { experiences } from '../../data/experience';
import './theme.css';

// Adapter: map the shared canonical records onto the compact shape this
// section renders (condensed description, condensed tech list where defined).
const EXPERIENCES = experiences.map(e => ({
  title: e.title,
  company: e.company,
  period: e.period,
  description: e.shortDescription,
  tech: e.techHighlights || e.techStack,
  color: e.color,
}));

const EASE = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-80px' };

// The saturated per-role accents read well as 8px timeline nodes but several
// of them (indigo especially) fall just under 4.5:1 as text on the dark
// ground. Mixing toward white keeps each role identifiable while clearing AA.
function tint(hex, amount = 0.42) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return hex;
  const mix = (c) => Math.round(parseInt(c, 16) + (255 - parseInt(c, 16)) * amount);
  return `rgb(${mix(m[1])}, ${mix(m[2])}, ${mix(m[3])})`;
}

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

/* ------------------------------------------------------------------ spine */

/* The rail is a 1px line at x = 7px, so its centre falls on 7.5px. A 15px node
   pinned to left: 0 centres on that at every breakpoint, which keeps the spine
   true however the copy reflows. The dark ring punches the node out of the
   rail rather than letting the line run through it. */
function Node({ color }) {
  return (
    <span
      aria-hidden="true"
      className="absolute left-0 top-7 block h-[15px] w-[15px] rounded-full md:top-8"
      style={{
        background: 'rgba(6,6,10,0.92)',
        border: `1px solid ${color}`,
        boxShadow: `0 0 0 4px rgba(6,6,10,0.55), 0 0 16px ${color}59`,
      }}
    >
      <span className="absolute inset-[3px] rounded-full" style={{ background: color }} />
    </span>
  );
}

// Fades out at both ends so the spine reads as a continuing thread rather than
// a bar with two hard stops.
const RAIL =
  'linear-gradient(180deg, rgba(99,102,241,0) 0%, rgba(99,102,241,0.45) 12%, ' +
  'rgba(99,102,241,0.26) 52%, rgba(99,102,241,0.1) 88%, rgba(99,102,241,0) 100%)';

/* ------------------------------------------------------------------ entry */

function Role({ exp, index, reduced }) {
  return (
    <motion.li {...rise(reduced, index)} className="relative pl-9 md:pl-14">
      <Node color={exp.color} />

      <article className="v2-card" style={{ padding: 'clamp(1.5rem, 3.5vw, 1.875rem)' }}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
          <div className="min-w-0">
            <h3 className="v2-h3" style={{ fontSize: 'clamp(1.0625rem, 1.7vw, 1.1875rem)' }}>
              {exp.title}
            </h3>
            <p
              style={{
                margin: '0.375rem 0 0',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.005em',
                color: tint(exp.color),
              }}
            >
              {exp.company}
            </p>
          </div>

          {/* ml-auto keeps the period right-aligned even once it wraps to its
              own line on narrow cards. */}
          <span className="v2-meta ml-auto shrink-0" style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
            {exp.period}
          </span>
        </div>

        <p className="v2-body" style={{ margin: '1.125rem 0 0', maxWidth: '64ch', lineHeight: 1.7 }}>
          {exp.description}
        </p>

        <ul className="flex list-none flex-wrap items-center gap-2" style={{ margin: '1.375rem 0 0', padding: 0 }}>
          {exp.tech.map(t => (
            <li key={t} className="v2-tag">{t}</li>
          ))}
        </ul>
      </article>
    </motion.li>
  );
}

/* ----------------------------------------------------------------- section */

export default function ExperienceSection() {
  const reduced = useReducedMotion();

  return (
    <section id="experience" className="v2-section" style={{ background: 'transparent' }}>
      <div className="v2-container">
        <motion.header {...rise(reduced)} className="mb-12 sm:mb-14">
          <p className="v2-eyebrow" style={{ margin: 0 }}>
            <span className="v2-eyebrow__index">03</span>
            <span className="v2-eyebrow__line shrink-0" aria-hidden="true" />
            Career
          </p>
          <h2 className="v2-h2">Experience</h2>
          <p className="v2-lede">
            {EXPERIENCES.length} roles across research labs, startups, and industry.
          </p>
        </motion.header>

        {/* Measure is capped well below the container so descriptions keep a
            readable line length on wide screens. */}
        <div className="relative" style={{ maxWidth: '780px' }}>
          <motion.span
            aria-hidden="true"
            className="absolute bottom-0 left-[7px] top-0 w-px"
            style={{ background: RAIL, transformOrigin: 'top' }}
            {...(reduced
              ? {}
              : {
                  initial: { scaleY: 0 },
                  whileInView: { scaleY: 1 },
                  viewport: VIEWPORT,
                  transition: { duration: 0.6, ease: EASE },
                })}
          />

          <ul className="flex list-none flex-col gap-7 md:gap-8" style={{ margin: 0, padding: 0 }}>
            {EXPERIENCES.map((exp, i) => (
              <Role key={`${exp.company}-${exp.title}`} exp={exp} index={i} reduced={reduced} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
