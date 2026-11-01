import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LINKS = [
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Ask', href: '#ask', id: 'ask' },
  { label: 'Work', href: '#projects', id: 'projects' },
  { label: 'Experience', href: '#experience', id: 'experience' },
  { label: 'Skills', href: '#skills', id: 'skills' },
  { label: 'Research', href: '#publications', id: 'publications' },
];

const RESUME_URL =
  'https://drive.google.com/file/d/1q9-9VMk70cHw87K7mhuZKY6eKp7_j10X/view?usp=sharing';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll spy. The band is a horizontal slice across the middle of the
  // viewport, so a section becomes current when it owns the centre of the
  // screen rather than the moment its top edge appears.
  useEffect(() => {
    const targets = LINKS.map(({ id }) => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActiveId(visible.length ? visible[0].target.id : null);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    const onClick = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [menuOpen]);

  return (
    <header
      ref={barRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        // A masthead rule rather than a floating pill: on paper, a detached
        // capsule reads as app chrome, a ruled band reads as a publication.
        background: scrolled ? 'rgba(242, 239, 236, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--v2-line)' : 'transparent'}`,
        transition: 'background-color 240ms var(--v2-ease), border-color 240ms var(--v2-ease)',
      }}
    >
      <div
        className="v2-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBlock: '0.875rem',
        }}
      >
        <a
          href="#home"
          aria-label="Deep Shahane, back to top"
          style={{
            fontFamily: 'var(--v2-display)',
            fontSize: '1.0625rem',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: 'var(--v2-text)',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          Deep Shahane
        </a>

        <nav aria-label="Sections" className="v2-nav-desktop">
          {LINKS.map(({ label, href, id }) => (
            <a
              key={href}
              href={href}
              className="v2-nav-link"
              data-active={activeId === id}
              aria-current={activeId === id ? 'true' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <a href="/" className="v2-nav-link v2-nav-classic" style={{ color: 'var(--v2-text-4)' }}>
            Classic
          </a>
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="v2-btn v2-btn--primary"
            style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
          >
            Resume
          </a>

          <button
            type="button"
            className="v2-nav-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Sections"
            className="v2-nav-sheet"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="v2-container" style={{ paddingBlock: '0.5rem 1rem' }}>
              {LINKS.map(({ label, href, id }) => (
                <a
                  key={href}
                  href={href}
                  className="v2-nav-link"
                  data-active={activeId === id}
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '0.625rem 0' }}
                >
                  {label}
                </a>
              ))}
              <a href="/" className="v2-nav-link" style={{ display: 'block', padding: '0.625rem 0', color: 'var(--v2-text-4)' }}>
                Classic portfolio
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <style>{`
        .v2-nav-desktop { display: flex; align-items: center; gap: 0.125rem; }
        .v2-nav-toggle { display: none; }
        .v2-nav-sheet {
          background: rgba(242, 239, 236, 0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--v2-line);
        }
        @media (max-width: 860px) {
          .v2-nav-desktop, .v2-nav-classic { display: none; }
          .v2-nav-toggle {
            display: inline-flex; align-items: center; justify-content: center;
            width: 32px; height: 32px; padding: 0;
            border: 1px solid var(--v2-line); border-radius: var(--v2-r-sm);
            background: transparent; color: var(--v2-text-2); cursor: pointer;
          }
        }
        @media (min-width: 861px) { .v2-nav-sheet { display: none; } }
      `}</style>
    </header>
  );
}
