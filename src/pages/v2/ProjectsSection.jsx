import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { projects } from '../../data/projects';
import './theme.css';

// Adapter: map the shared canonical records onto the compact shape this
// section renders (condensed summary/tech, shorter field names).
const PROJECTS = projects.map(p => ({
  title: p.title,
  period: p.period,
  summary: p.shortSummary,
  tech: p.techHighlights,
  demo: p.demoLink,
  code: p.codeLink,
  img: p.thumbnail,
  featured: p.featured,
}));

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

/* ------------------------------------------------------------------ icons */

const ICON = {
  width: 13,
  height: 13,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const ArrowIcon = () => (
  <svg {...ICON}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const CodeIcon = () => (
  <svg {...ICON}>
    <path d="m9 6-5 6 5 6M15 6l5 6-5 6" />
  </svg>
);

/* ------------------------------------------------------------- thumbnails */

/* Every capture is normalised to one ratio and cropped from the centre, so a
   wall of raw screenshots reads as a deliberate set rather than an album. The
   scrim keeps the lower edge dark enough for the card seam to stay visible
   under bright captures. */
function Thumbnail({ src, title, reduced, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: 'var(--v2-surface-2)' }}>
      <img
        src={src}
        alt={`${title} — interface screenshot`}
        loading="lazy"
        decoding="async"
        // Most captures are bright, light-UI screenshots. Held at full
        // strength they punch holes in a dark page and each card competes with
        // the next; damped at rest and restored on hover, the wall settles and
        // the card you point at comes forward.
        className={`absolute inset-0 h-full w-full object-cover object-center brightness-[0.72] saturate-[0.88] ${
          reduced
            ? ''
            : 'transition-[transform,filter] duration-[600ms] group-hover:scale-[1.04] group-focus-within:scale-[1.04] group-hover:brightness-100 group-hover:saturate-100 group-focus-within:brightness-100 group-focus-within:saturate-100'
        }`}
        style={{ transformOrigin: 'center', transitionTimingFunction: 'var(--v2-ease)' }}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          reduced ? '' : 'transition-opacity duration-[600ms] group-hover:opacity-70 group-focus-within:opacity-70'
        }`}
        style={{
          background:
            'linear-gradient(180deg, rgba(6,6,10,0.28) 0%, rgba(6,6,10,0.18) 40%, rgba(6,6,10,0.58) 74%, rgba(6,6,10,0.94) 100%)',
          transitionTimingFunction: 'var(--v2-ease)',
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 0 0 1px var(--v2-line-weak)', borderRadius: 'inherit' }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ pieces */

/* Capped so a tag row can never run past two lines and throw the grid out of
   alignment. The remainder stays discoverable through the +N chip's tooltip. */
function TagRow({ tech, limit }) {
  const shown = tech.slice(0, limit);
  const hidden = tech.slice(limit);

  return (
    <ul className="flex list-none flex-wrap items-center gap-1.5" style={{ margin: 0, padding: 0 }}>
      {shown.map(t => (
        <li key={t} className="v2-tag">{t}</li>
      ))}
      {hidden.length > 0 && (
        <li className="v2-tag" style={{ borderStyle: 'dashed' }} title={hidden.join(', ')}>
          +{hidden.length}
        </li>
      )}
    </ul>
  );
}

const LINK_BASE =
  'inline-flex items-center gap-[0.4375rem] rounded-full border px-[0.875rem] py-[0.5625rem] ' +
  'font-dm text-[0.8125rem] font-medium leading-none no-underline ' +
  'transition-colors duration-200 ease-[var(--v2-ease)]';

const LINK_PRIMARY =
  'border-[rgba(99,102,241,0.32)] bg-[rgba(99,102,241,0.14)] text-[var(--v2-text)] ' +
  'hover:border-[rgba(99,102,241,0.55)] hover:bg-[rgba(99,102,241,0.26)]';

const LINK_GHOST =
  'border-[var(--v2-line)] bg-[var(--v2-surface-1)] text-[var(--v2-text-2)] ' +
  'hover:border-[var(--v2-line-strong)] hover:bg-[var(--v2-surface-2)] hover:text-[var(--v2-text)]';

/* The first link is stretched over the whole card through its ::after, so the
   entire surface is clickable from exactly one anchor — no nested interactive
   elements, and the card is reachable by keyboard through that same link. A
   second link is lifted above the overlay so it stays independently clickable. */
function LinkRow({ project }) {
  const links = [];
  if (project.demo) links.push({ href: project.demo, label: 'Demo', Icon: ArrowIcon });
  if (project.code) links.push({ href: project.code, label: 'Code', Icon: CodeIcon });
  if (!links.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map(({ href, label, Icon }, i) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} — ${project.title} (opens in a new tab)`}
          className={[
            LINK_BASE,
            i === 0 ? LINK_PRIMARY : LINK_GHOST,
            i === 0
              ? "after:absolute after:inset-0 after:z-[1] after:rounded-[var(--v2-r-lg)] after:content-['']"
              : 'relative z-[2]',
          ].join(' ')}
        >
          {label}
          <Icon />
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- cards */

/* The lead: one project gets a full-width, image-beside-copy treatment so the
   section opens on a focal point instead of an even field of equal cards. */
function LeadCard({ project, reduced }) {
  return (
    <motion.article
      {...rise(reduced)}
      className="v2-card v2-card--interactive group grid lg:grid-cols-[minmax(0,1.06fr)_minmax(0,1fr)]"
    >
      <Thumbnail
        src={project.img}
        title={project.title}
        reduced={reduced}
        className="aspect-[16/10] rounded-tl-[var(--v2-r-lg)] rounded-tr-[var(--v2-r-lg)] lg:aspect-auto lg:rounded-tr-none lg:rounded-bl-[var(--v2-r-lg)]"
      />

      <div className="flex flex-col justify-center gap-[1.125rem] p-6 sm:p-8 lg:min-h-[330px]">
        <div>
          <h3 className="v2-h3" style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.625rem)', lineHeight: 1.2 }}>
            {project.title}
          </h3>
          <p className="v2-meta" style={{ margin: '0.625rem 0 0' }}>{project.period}</p>
        </div>

        <p className="v2-body line-clamp-4">{project.summary}</p>

        <TagRow tech={project.tech} limit={4} />
        <LinkRow project={project} />
      </div>
    </motion.article>
  );
}

/* Every other card shares one anatomy — fixed-ratio thumbnail, then a body that
   pins tags and links to the bottom so rows align whatever the copy does. */
function ProjectCard({ project, reduced, index }) {
  return (
    <motion.article {...rise(reduced, index)} className="v2-card v2-card--interactive group flex flex-col">
      <Thumbnail
        src={project.img}
        title={project.title}
        reduced={reduced}
        className="aspect-[16/10] rounded-t-[var(--v2-r-lg)]"
      />

      <div className="flex flex-1 flex-col gap-3.5 p-5 sm:p-6">
        <div>
          <h3 className="v2-h3">{project.title}</h3>
          <p className="v2-meta" style={{ margin: '0.5rem 0 0' }}>{project.period}</p>
        </div>

        <p className="v2-body line-clamp-3" style={{ fontSize: '0.875rem' }}>{project.summary}</p>

        <div className="mt-auto flex flex-col gap-3.5 pt-1">
          <TagRow tech={project.tech} limit={3} />
          <LinkRow project={project} />
        </div>
      </div>
    </motion.article>
  );
}

/* ----------------------------------------------------------------- section */

const [LEAD, ...SECONDARY] = PROJECTS.filter(p => p.featured);
const REST = PROJECTS.filter(p => !p.featured);

export default function ProjectsSection() {
  const reduced = useReducedMotion();

  return (
    <section id="projects" className="v2-section" style={{ background: 'transparent' }}>
      <div className="v2-container">
        <motion.header {...rise(reduced)} className="mb-12 sm:mb-14">
          <p className="v2-eyebrow" style={{ margin: 0 }}>
            <span className="v2-eyebrow__index">02</span>
            <span className="v2-eyebrow__line shrink-0" aria-hidden="true" />
            Work
          </p>
          <h2 className="v2-h2">Projects</h2>
          <p className="v2-lede">
            {PROJECTS.length} projects spanning computer vision, LLMs, full-stack, and mobile.
          </p>
        </motion.header>

        {/* Featured: one lead card, then the remaining featured work paired. */}
        <div className="flex flex-col gap-5">
          {LEAD && <LeadCard project={LEAD} reduced={reduced} />}

          {SECONDARY.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              {SECONDARY.map((p, i) => (
                <ProjectCard key={p.title} project={p} reduced={reduced} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Everything else, on a uniform grid. */}
        {REST.length > 0 && (
          <>
            <motion.div {...rise(reduced)} className="mt-16 mb-8 sm:mt-20">
              <hr className="v2-rule" />
              <p className="v2-eyebrow" style={{ margin: '2rem 0 0' }}>
                <span className="v2-eyebrow__index">{String(REST.length).padStart(2, '0')}</span>
                <span className="v2-eyebrow__line shrink-0" aria-hidden="true" />
                More projects
              </p>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {REST.map((p, i) => (
                // Stagger resets per row so no card waits on the row above it.
                <ProjectCard key={p.title} project={p} reduced={reduced} index={i % 3} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
