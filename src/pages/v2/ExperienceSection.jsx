import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EXPERIENCES = [
  {
    title: 'AI Research Assistant',
    company: 'SAIR Lab at UB',
    period: 'Aug 2024 – Present',
    description:
      'Achieved 16× speedup in drone 3D reconstruction by integrating 2D Gaussian Splatting into GPU-accelerated SLAM over video frame sequences, customizing a C++/CUDA surfel rasterizer for real-time aerial mapping. Researching NVIDIA Isaac Lab and developing humanoid robots with vision-language models (VLMs) like InstructBLIP2 and Florence using PyTorch and RL for multimodal perception and decision-making.',
    tech: ['Python', 'C++', 'CUDA', 'PyTorch', 'Gaussian Splatting', 'SLAM', 'Computer Vision', 'Robotics'],
    color: '#6366f1',
  },
  {
    title: 'AI Engineer',
    company: 'Bragr',
    period: 'Aug 2024 – Jan 2025',
    description:
      'Architected and deployed a FastAPI + Azure OpenAI (RAG) backend for a live sports AI chat startup, cutting response time 66% and improving answer quality. Built an async web scraping and semantic search pipeline using Python, aiohttp, and MongoDB, supporting 10+ concurrent users.',
    tech: ['Python', 'FastAPI', 'Azure OpenAI', 'MongoDB', 'aiohttp', 'RAG', 'Microservices'],
    color: '#22d3ee',
  },
  {
    title: 'ML Intern',
    company: 'Captain Cool',
    period: 'Dec 2021 – Feb 2023',
    description:
      'Built a full-stack Python + Flask + PostgreSQL platform for order and inventory management handling 1K+ daily transactions. Developed time-series demand forecasting models using PyTorch and scikit-learn, improving stock prediction accuracy by 18%.',
    tech: ['Python', 'Flask', 'PostgreSQL', 'PyTorch', 'scikit-learn', 'Time Series'],
    color: '#f59e0b',
  },
  {
    title: 'ML Intern',
    company: 'VIT',
    period: 'Jun 2021 – Aug 2021',
    description:
      'Launched an internship portal with a TF-IDF + cosine similarity recommendation system, improving match relevance by 25%. Built a Flask + PostgreSQL backend with SQLAlchemy, integrating scraped Internshala data. Deployed on Azure with Q&A Maker, Blob, Maps, and Speech-to-Text.',
    tech: ['Python', 'Flask', 'PostgreSQL', 'SQLAlchemy', 'TF-IDF', 'Azure'],
    color: '#10b981',
  },
];

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
    <section id="experience" ref={sectionRef} className="py-24 px-6" style={{ background: '#05050a' }}>
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
