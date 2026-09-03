import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { projects } from '../../data/projects';

gsap.registerPlugin(ScrollTrigger);

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

function ProjectCard({ project, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="proj-card rounded-2xl overflow-hidden cursor-pointer"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}
      whileHover={{ borderColor: 'rgba(99,102,241,0.35)', boxShadow: '0 0 28px rgba(99,102,241,0.12)' }}
      transition={{ duration: 0.2 }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="relative overflow-hidden" style={{ height: project.featured ? '200px' : '160px' }}>
        <img
          src={project.img}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: expanded ? 'scale(1.04)' : 'scale(1)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(5,5,10,0.85) 100%)' }}
        />
        {/* Links overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="px-2.5 py-1 rounded-lg font-dm text-[10px] font-medium text-white cursor-pointer transition-opacity duration-150 hover:opacity-80"
              style={{ background: 'rgba(99,102,241,0.8)', backdropFilter: 'blur(8px)' }}
            >
              Demo
            </a>
          )}
          {project.code && (
            <a
              href={project.code}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="px-2.5 py-1 rounded-lg font-dm text-[10px] font-medium text-white cursor-pointer transition-opacity duration-150 hover:opacity-80"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Code
            </a>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-grotesk font-semibold text-white mb-1 leading-snug" style={{ fontSize: '0.95rem' }}>
          {project.title}
        </h3>
        <p className="font-dm text-[11px] text-slate-600 mb-2">{project.period}</p>
        <p className="font-dm text-sm text-slate-400 leading-relaxed mb-3" style={{ fontSize: '0.82rem' }}>
          {expanded ? project.summary : `${project.summary.slice(0, 100)}...`}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, expanded ? undefined : 3).map(t => (
            <span
              key={t}
              className="font-dm text-[10px] px-2 py-1 rounded-full"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', background: 'rgba(255,255,255,0.03)' }}
            >
              {t}
            </span>
          ))}
          {!expanded && project.tech.length > 3 && (
            <span className="font-dm text-[10px] px-2 py-1 text-slate-600">+{project.tech.length - 3} more</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    gsap.set('.proj-card', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.proj-card', {
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }),
      start: 'top 88%',
    });
  }, { scope: sectionRef });

  const featured = PROJECTS.filter(p => p.featured);
  const rest = PROJECTS.filter(p => !p.featured);

  return (
    <section id="projects" ref={sectionRef} className="py-24 px-6" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">02</span>
            <div className="w-6 h-px bg-slate-700" />
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">Work</span>
          </div>
          <h2
            className="font-grotesk font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', letterSpacing: '-0.022em' }}
          >
            Projects
          </h2>
          <p className="font-dm text-slate-500 mt-3 max-w-lg" style={{ fontSize: '1rem' }}>
            12 projects spanning computer vision, LLMs, full-stack, and mobile.
          </p>
        </motion.div>

        {/* Featured row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {featured.map((p, i) => <ProjectCard key={p.title} project={p} index={i} />)}
        </div>

        {/* Rest grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((p, i) => <ProjectCard key={p.title} project={p} index={i + 3} />)}
        </div>
      </div>
    </section>
  );
}
