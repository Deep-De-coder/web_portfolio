import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { skillCategories as CATEGORIES } from '../../data/skills';
import './theme.css';

const EASE = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-80px' };

// The first entries of each list are the headline tools; they sit one step
// brighter than the rest so a category can be read at a glance.
const PRIMARY_COUNT = 2;

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

/* Per-item hover has to be real CSS: framer-motion on ~40 chips would rerender
   the section on every pointer move, and a Tailwind `hover:` utility loses the
   specificity tie with the design system's `.v2-card:hover .v2-tag` rule.
   Tokens only, no new colours, radii or curves. */
const SKILL_CSS = `
.v2-skill {
  transition:
    transform var(--v2-t-fast) var(--v2-ease),
    color var(--v2-t-fast) var(--v2-ease),
    border-color var(--v2-t-fast) var(--v2-ease),
    background-color var(--v2-t-fast) var(--v2-ease);
}
.v2-card .v2-skill--primary {
  color: var(--v2-text-2);
  border-color: var(--v2-line);
  background: var(--v2-surface-2);
}
.v2-card .v2-skill:hover {
  color: var(--v2-text);
  border-color: var(--v2-line-strong);
  background: var(--v2-surface-3);
  transform: translateY(-1px);
}
@media (prefers-reduced-motion: reduce) {
  .v2-card .v2-skill:hover { transform: none; }
}
`;

function CategoryCard({ cat, index, reduced }) {
  return (
    <motion.article
      {...rise(reduced, index)}
      className={`v2-card h-full${cat.span === 'wide' ? ' sm:col-span-2' : ''}`}
    >
      <div className="flex h-full flex-col gap-5 p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-[0.75rem]"
            style={{
              borderRadius: 'var(--v2-r-sm)',
              border: '1px solid var(--v2-line-weak)',
              background: 'var(--v2-surface-2)',
              color: 'var(--v2-accent-bright)',
            }}
          >
            {cat.icon}
          </span>
          <h3 className="v2-h3 min-w-0 flex-1" style={{ fontSize: '0.9375rem' }}>
            {cat.title}
          </h3>
          <span className="v2-meta shrink-0" style={{ fontSize: '0.6875rem' }}>
            {String(cat.skills.length).padStart(2, '0')}
          </span>
        </div>

        <div className="h-px w-full shrink-0" style={{ background: 'var(--v2-line-weak)' }} />

        <ul className="flex list-none flex-wrap gap-2" style={{ margin: 0, padding: 0 }}>
          {cat.skills.map((skill, i) => (
            <li
              key={skill}
              className={`v2-tag v2-skill${i < PRIMARY_COUNT ? ' v2-skill--primary' : ''}`}
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export default function SkillsSection() {
  const reduced = useReducedMotion();

  return (
    <section id="skills" className="v2-section" style={{ background: 'transparent' }}>
      <div className="v2-container">
        <motion.header {...rise(reduced)} className="mb-12 sm:mb-14">
          <p className="v2-eyebrow" style={{ margin: 0 }}>
            <span className="v2-eyebrow__index">06</span>
            <span className="v2-eyebrow__line shrink-0" aria-hidden="true" />
            Toolkit
          </p>
          <h2 className="v2-h2">Skills</h2>
          <p className="v2-lede">
            From GPU-accelerated deep learning to full-stack deployment.
          </p>
        </motion.header>

        {/* Two columns, with the data's `wide` categories taking the full
            measure. That alternation is the rhythm, every row stays filled,
            so the grid never ends on a hole. */}
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.title} cat={cat} index={i} reduced={reduced} />
          ))}
        </div>
      </div>

      <style>{SKILL_CSS}</style>
    </section>
  );
}
