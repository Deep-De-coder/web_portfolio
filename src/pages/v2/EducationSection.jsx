import React from 'react';
import { motion } from 'framer-motion';
import { education } from '../../data/education';

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

function EduCard({ edu, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-6 flex-1"
      style={{ background: edu.accent, border: `1px solid ${edu.border}`, minWidth: 0 }}
    >
      {/* Monogram */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 font-grotesk font-bold text-white text-lg"
        style={{ background: edu.color, boxShadow: `0 0 24px ${edu.color}60` }}
      >
        {edu.short}
      </div>

      <h3 className="font-grotesk font-semibold text-white leading-snug mb-1" style={{ fontSize: '1.05rem' }}>
        {edu.institution}
      </h3>
      <p className="font-dm text-sm mb-1" style={{ color: edu.color }}>{edu.degree}</p>
      <p className="font-dm text-xs text-slate-500 mb-4">{edu.period}</p>

      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-dm text-xs mb-4"
        style={{ border: `1px solid ${edu.border}`, color: edu.color, background: 'rgba(0,0,0,0.2)' }}
      >
        GPA {edu.gpa}
      </div>

      <div>
        <p className="font-dm text-[10px] tracking-[0.14em] text-slate-600 uppercase mb-2">Relevant Courses</p>
        <div className="flex flex-wrap gap-1.5">
          {edu.courses.map(c => (
            <span
              key={c}
              className="font-dm text-[11px] px-2.5 py-1 rounded-full"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', background: 'rgba(255,255,255,0.03)' }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function EducationSection() {
  return (
    <section id="education" className="py-24 px-6" style={{ background: 'transparent' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">04</span>
            <div className="w-6 h-px bg-slate-700" />
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">Background</span>
          </div>
          <h2
            className="font-grotesk font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', letterSpacing: '-0.022em' }}
          >
            Education
          </h2>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4">
          {EDU.map((edu, i) => <EduCard key={edu.short} edu={edu} index={i} />)}
        </div>
      </div>
    </section>
  );
}
