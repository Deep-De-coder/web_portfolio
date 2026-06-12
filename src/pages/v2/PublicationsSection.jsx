import React from 'react';
import { motion } from 'framer-motion';

const PUBS = [
  {
    title: 'Gaussian Splatting for Advanced Rendering',
    venue: 'UB Technical Report 2025-09',
    tags: ['3D Rendering', 'Gaussian Splatting', 'Computer Vision'],
    link: 'https://cse.buffalo.edu/tech-reports/2025-09.pdf',
    year: '2025',
    color: '#6366f1',
  },
  {
    title: 'Car Sales Forecasting Using ML Time Series Algorithm',
    venue: 'Springer LNNS',
    tags: ['Time Series', 'LSTM', 'ARIMA'],
    link: 'https://link.springer.com/chapter/10.1007/978-981-99-3982-4_41',
    year: '2023',
    color: '#22d3ee',
  },
  {
    title: 'Music Fiesta the Recommendation System',
    venue: 'IEEE Xplore',
    tags: ['Collaborative Filtering', 'Deep Learning', 'NLP'],
    link: 'https://ieeexplore.ieee.org/document/9936009',
    year: '2022',
    color: '#10b981',
  },
];

function PubCard({ pub, index }) {
  return (
    <motion.a
      href={pub.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ borderColor: `${pub.color}45`, boxShadow: `0 0 28px ${pub.color}15` }}
      className="block rounded-2xl p-5 cursor-pointer transition-all duration-200 group"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)', textDecoration: 'none' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="font-dm text-xs px-2.5 py-1 rounded-full"
              style={{ border: `1px solid ${pub.color}30`, background: `${pub.color}10`, color: pub.color }}
            >
              {pub.year}
            </span>
            <span className="font-dm text-xs text-slate-600">{pub.venue}</span>
          </div>
          <h3
            className="font-grotesk font-semibold text-white leading-snug mb-3 group-hover:text-indigo-300 transition-colors duration-200"
            style={{ fontSize: '1rem' }}
          >
            {pub.title}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {pub.tags.map(t => (
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
        {/* External link arrow */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:opacity-100"
          style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', opacity: 0.5 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <path d="M7 17L17 7M7 7h10v10"/>
          </svg>
        </div>
      </div>
    </motion.a>
  );
}

export default function PublicationsSection() {
  return (
    <section id="publications" className="py-24 px-6" style={{ background: 'transparent' }}>
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
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">06</span>
            <div className="w-6 h-px bg-slate-700" />
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">Research</span>
          </div>
          <h2
            className="font-grotesk font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', letterSpacing: '-0.022em' }}
          >
            Publications
          </h2>
          <p className="font-dm text-slate-500 mt-3 max-w-md" style={{ fontSize: '1rem' }}>
            Peer-reviewed work in computer vision, machine learning, and AI systems.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {PUBS.map((pub, i) => <PubCard key={pub.title} pub={pub} index={i} />)}
        </div>
      </div>
    </section>
  );
}
