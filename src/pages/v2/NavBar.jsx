import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LINKS = [
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Ask', href: '#ask', id: 'ask' },
  { label: 'Projects', href: '#projects', id: 'projects' },
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
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll spy. The rootMargin band is a horizontal slice across the middle of
  // the viewport, so a section becomes "current" when it owns the centre of the
  // screen rather than the moment its top edge appears.
  useEffect(() => {
    const targets = LINKS.map(({ id }) => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        // Clear when nothing owns the centre band (hero, chip sequence,
        // footer), otherwise the last match stays lit on unrelated screens.
        setActiveId(visible.length ? visible[0].target.id : null);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Close the mobile sheet on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [menuOpen]);

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="fixed top-3 sm:top-4 z-50"
      // Centre with auto margins, NOT translateX(-50%): framer-motion writes
      // its own `transform` for the entrance animation and would clobber it,
      // leaving the bar pushed a half-width to the right.
      style={{ left: 0, right: 0, marginInline: 'auto', width: 'min(94vw, 760px)' }}
      ref={menuRef}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.5rem 0.5rem 0.5rem 1rem',
          borderRadius: '16px',
          border: `1px solid ${scrolled ? 'var(--v2-line)' : 'var(--v2-line-weak)'}`,
          background: scrolled ? 'rgba(6,6,10,0.82)' : 'rgba(6,6,10,0.42)',
          backdropFilter: 'blur(28px) saturate(140%)',
          WebkitBackdropFilter: 'blur(28px) saturate(140%)',
          boxShadow: scrolled ? 'var(--v2-shadow)' : 'none',
          transition:
            'background-color var(--v2-t) var(--v2-ease), border-color var(--v2-t) var(--v2-ease), box-shadow var(--v2-t) var(--v2-ease)',
        }}
      >
        <a
          href="#home"
          aria-label="Back to top"
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: '0.875rem',
            letterSpacing: '-0.02em',
            color: 'var(--v2-text)',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          DS
        </a>

        <nav
          aria-label="Sections"
          className="hidden md:flex"
          style={{ alignItems: 'center', gap: '0.125rem' }}
        >
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
          <span
            aria-hidden="true"
            style={{
              width: 1,
              height: 16,
              margin: '0 0.375rem',
              background: 'var(--v2-line)',
            }}
          />
          <a href="/" className="v2-nav-link" style={{ color: 'var(--v2-text-4)' }}>
            Classic
          </a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '0.8125rem',
              fontWeight: 500,
              lineHeight: 1,
              padding: '0.5625rem 0.9375rem',
              borderRadius: '10px',
              color: 'var(--v2-text)',
              textDecoration: 'none',
              background: 'rgba(99,102,241,0.16)',
              border: '1px solid rgba(99,102,241,0.32)',
              transition:
                'background-color var(--v2-t-fast) var(--v2-ease), border-color var(--v2-t-fast) var(--v2-ease)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.26)';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.16)';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.32)';
            }}
          >
            Resume
          </a>

          <button
            type="button"
            // Display comes from the utility classes, never inline: an inline
            // `display` wins over `md:hidden` and the trigger would survive
            // into the desktop bar.
            className="inline-flex md:hidden items-center justify-center"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              border: '1px solid var(--v2-line-weak)',
              background: 'var(--v2-surface-1)',
              color: 'var(--v2-text-2)',
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Sections"
            className="grid md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              borderRadius: '16px',
              border: '1px solid var(--v2-line)',
              background: 'rgba(6,6,10,0.94)',
              backdropFilter: 'blur(28px) saturate(140%)',
              WebkitBackdropFilter: 'blur(28px) saturate(140%)',
              boxShadow: 'var(--v2-shadow-lg)',
              gap: '0.125rem',
            }}
          >
            {LINKS.map(({ label, href, id }) => (
              <a
                key={href}
                href={href}
                className="v2-nav-link"
                data-active={activeId === id}
                onClick={() => setMenuOpen(false)}
                style={{ padding: '0.6875rem 0.75rem', fontSize: '0.875rem' }}
              >
                {label}
              </a>
            ))}
            <hr className="v2-rule" style={{ margin: '0.25rem 0' }} />
            <a
              href="/"
              className="v2-nav-link"
              style={{ padding: '0.6875rem 0.75rem', fontSize: '0.875rem', color: 'var(--v2-text-4)' }}
            >
              Classic portfolio
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
