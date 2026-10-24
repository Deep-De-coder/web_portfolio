import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { education } from '../../data/education';
import './theme.css';

// Adapter: the shared data is ordered chronologically for the v1 timeline;
// this section shows newest first and renders the condensed name variants.
const EDU = [...education].reverse().map(e => ({
  institution: e.institutionShort || e.institution,
  short: e.short,
  degree: e.degreeShort,
  period: e.period,
  gpa: e.gpa,
  courses: e.courses,
  color: e.color,
  accent: e.accent,
  border: e.border,
}));

const EASE = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-80px' };

// Small-caps field label. Written inline rather than as a class so it can
// never lose a specificity tie with a design-system class.
const MICRO = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '0.625rem',
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--v2-text-3)',
};

const HAIRLINE = 'var(--v2-line-weak)';

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

/* GPA reads as a figure, not as prose: the score is set large in tabular
   numerals and the scale trails it at meta size. */
function Gpa({ value }) {
  const [score, scale] = String(value).split('/').map(s => s.trim());

  return (
    <div className="flex flex-col gap-2">
      <span style={MICRO}>Grade point average</span>
      <p className="flex items-baseline gap-1.5" style={{ margin: 0 }}>
        <span
          className="font-grotesk font-semibold"
          style={{
            fontSize: '1.75rem',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: 'var(--v2-text)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {score}
        </span>
        {scale && <span className="v2-meta">/ {scale}</span>}
      </p>
    </div>
  );
}

function DegreeCard({ edu, index, reduced }) {
  return (
    <motion.article {...rise(reduced, index)} className="v2-card">
      <div className="grid gap-x-10 gap-y-7 p-6 sm:p-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* Identity */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center font-grotesk text-[0.8125rem] font-semibold"
              style={{
                borderRadius: 'var(--v2-r-sm)',
                border: `1px solid ${HAIRLINE}`,
                background: 'var(--v2-surface-2)',
                color: 'var(--v2-text-2)',
                letterSpacing: '0.04em',
              }}
            >
              {edu.short}
            </span>
            <span className="v2-meta">{edu.period}</span>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="v2-h3" style={{ fontSize: 'clamp(1.0625rem, 1.7vw, 1.3125rem)' }}>
              {edu.degree}
            </h3>
            <p className="v2-body" style={{ fontSize: '0.875rem' }}>
              {edu.institution}
            </p>
          </div>
        </div>

        {/* Record, hairline-separated from the identity column on desktop */}
        <div
          className="flex min-w-0 flex-col gap-7 border-t pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0"
          style={{ borderColor: HAIRLINE }}
        >
          <Gpa value={edu.gpa} />

          <div className="flex flex-col gap-3">
            <span style={MICRO}>Relevant coursework</span>
            <ul className="flex list-none flex-wrap gap-2" style={{ margin: 0, padding: 0 }}>
              {edu.courses.map(c => (
                <li key={c} className="v2-tag">{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function EducationSection() {
  const reduced = useReducedMotion();

  return (
    <section id="education" className="v2-section" style={{ background: 'transparent' }}>
      <div className="v2-container">
        <motion.header {...rise(reduced)} className="mb-12 sm:mb-14">
          <p className="v2-eyebrow" style={{ margin: 0 }}>
            <span className="v2-eyebrow__index">05</span>
            <span className="v2-eyebrow__line shrink-0" aria-hidden="true" />
            Background
          </p>
          <h2 className="v2-h2">Education</h2>
          <p className="v2-lede">
            Computer engineering at Mumbai University, then computer science at Buffalo.
          </p>
        </motion.header>

        <div className="flex flex-col gap-5">
          {EDU.map((edu, i) => (
            <DegreeCard key={edu.short} edu={edu} index={i} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}
