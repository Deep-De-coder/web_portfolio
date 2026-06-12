import React from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  {
    title: 'Deep Learning & AI',
    icon: '◈',
    span: 'wide',
    color: '#6366f1',
    skills: ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'LangChain', 'Transformers'],
  },
  {
    title: 'Frontend',
    icon: '◻',
    span: 'square',
    color: '#22d3ee',
    skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Figma'],
  },
  {
    title: 'Backend',
    icon: '◈',
    span: 'square',
    color: '#10b981',
    skills: ['Python', 'FastAPI', 'Flask', 'Node.js', 'Express.js', 'Hugging Face'],
  },
  {
    title: 'Databases',
    icon: '◻',
    span: 'wide',
    color: '#f59e0b',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQL Server', 'SQLAlchemy', 'FAISS'],
  },
  {
    title: 'Cloud & DevOps',
    icon: '◈',
    span: 'wide',
    color: '#818cf8',
    skills: ['AWS (EC2, S3)', 'GCP (Compute Engine)', 'Azure (OpenAI, Blob, Maps)', 'Docker', 'Linux', 'ROS'],
  },
  {
    title: 'Mobile',
    icon: '◻',
    span: 'square',
    color: '#f43f5e',
    skills: ['Kotlin', 'Android SDK', 'Flutter', 'Firebase', 'Material UI'],
  },
  {
    title: 'Soft Skills',
    icon: '◈',
    span: 'square',
    color: '#a78bfa',
    skills: ['Research', 'Leadership', 'Critical Thinking', 'Communication'],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
  }),
};

function SkillCard({ cat }) {
  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl p-5 h-full"
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.025)',
        gridColumn: cat.span === 'wide' ? 'span 2' : 'span 1',
      }}
      whileHover={{ borderColor: `${cat.color}50`, boxShadow: `0 0 24px ${cat.color}18` }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-lg" style={{ color: cat.color }} aria-hidden="true">{cat.icon}</span>
        <h3 className="font-grotesk font-semibold text-white text-sm">{cat.title}</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cat.skills.map((skill, i) => (
          <motion.span
            key={skill}
            custom={i}
            variants={pillVariants}
            className="font-dm text-xs px-2.5 py-1.5 rounded-full cursor-default"
            style={{ border: `1px solid ${cat.color}28`, color: '#94a3b8', background: `${cat.color}0a` }}
            whileHover={{ color: '#f1f5f9', borderColor: `${cat.color}60`, background: `${cat.color}18` }}
            transition={{ duration: 0.15 }}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export default function SkillsSection() {
  return (
    <section id="skills" className="py-24 px-6" style={{ background: 'transparent' }}>
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
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">05</span>
            <div className="w-6 h-px bg-slate-700" />
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">Toolkit</span>
          </div>
          <h2
            className="font-grotesk font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', letterSpacing: '-0.022em' }}
          >
            Skills
          </h2>
          <p className="font-dm text-slate-500 mt-3 max-w-md" style={{ fontSize: '1rem' }}>
            From GPU-accelerated deep learning to full-stack deployment.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          {CATEGORIES.map(cat => (
            <SkillCard key={cat.title} cat={cat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
