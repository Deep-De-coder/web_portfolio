import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { experiences } from '../../data/experience';

gsap.registerPlugin(ScrollTrigger);

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

function ExpCard({ exp, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="exp-item relative pl-12 pb-14 last:pb-0"
    >
      {/* Dot on timeline */}
      <div
        className="absolute left-0 top-1 w-3 h-3 rounded-full flex-shrink-0"
        style={{
          background: exp.color,
          boxShadow: `0 0 12px ${exp.color}80`,
          transform: 'translateX(calc(-50% + 1px))',
          marginLeft: '0.5px',
        }}
      />

      {/* Content card */}
      <div
        className="rounded-2xl p-5 transition-all duration-200 hover:border-white/[0.12]"
        style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-grotesk font-semibold text-white" style={{ fontSize: '1.05rem' }}>{exp.title}</h3>
            <p className="font-dm text-sm mt-0.5" style={{ color: exp.color }}>{exp.company}</p>
          </div>
          <span
            className="font-dm text-xs px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.09)', color: '#64748b', background: 'rgba(255,255,255,0.03)' }}
          >
            {exp.period}
          </span>
        </div>
        <p className="font-dm text-slate-400 leading-relaxed mb-4" style={{ fontSize: '0.9rem' }}>
          {exp.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {exp.tech.map(t => (
            <span
              key={t}
              className="font-dm text-[10px] px-2 py-1 rounded-full"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', background: 'rgba(255,255,255,0.03)' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ExperienceSection() {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    if (!lineRef.current) return;

    gsap.fromTo(
      lineRef.current,
      { scaleY: 0, transformOrigin: 'top center' },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'bottom 80%',
          scrub: 0.4,
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section id="experience" ref={sectionRef} className="py-24 px-6" style={{ background: 'transparent' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">03</span>
            <div className="w-6 h-px bg-slate-700" />
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">Career</span>
          </div>
          <h2
            className="font-grotesk font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', letterSpacing: '-0.022em' }}
          >
            Experience
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            ref={lineRef}
            className="absolute top-0 bottom-0"
            style={{
              left: '0',
              width: '1px',
              background: 'linear-gradient(to bottom, rgba(99,102,241,0.5), rgba(99,102,241,0.1))',
              transformOrigin: 'top center',
            }}
          />
          <div className="space-y-0">
            {EXPERIENCES.map((exp, i) => (
              <ExpCard key={exp.company} exp={exp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
