import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LINKS = [
  { label: 'Ask', href: '#ask' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Research', href: '#publications' },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 z-50"
      style={{ left: '50%', transform: 'translateX(-50%)', width: 'min(92vw, 700px)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(5,5,10,0.92)' : 'rgba(5,5,10,0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <span className="font-grotesk font-bold text-white text-sm tracking-tight">DS</span>

        <nav className="hidden sm:flex items-center gap-0.5">
          {LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg font-dm text-sm text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer"
            >
              {label}
            </a>
          ))}
          <a
            href="/v1"
            className="px-3 py-1.5 rounded-lg font-dm text-sm text-slate-500 hover:text-slate-300 transition-colors duration-150 cursor-pointer"
          >
            Classic ↗
          </a>
        </nav>

        <a
          href="https://drive.google.com/file/d/1huA6oTDVo2jL9u24RWxN6DAm_YVkURG2/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-lg font-dm text-xs font-medium text-white cursor-pointer transition-all duration-150 hover:opacity-80"
          style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)' }}
        >
          Resume
        </a>
      </div>
    </motion.header>
  );
}
