import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SceneBackground from './v2/SceneBackground';
import ChipCanvas from './v2/ChipCanvas';
import NavBar from './v2/NavBar';
import HeroSection from './v2/HeroSection';
import ChipAssemblySection from './v2/ChipAssemblySection';
import AboutSection from './v2/AboutSection';
import AskSection from './v2/AskSection';
import ProjectsSection from './v2/ProjectsSection';
import ExperienceSection from './v2/ExperienceSection';
import EducationSection from './v2/EducationSection';
import SkillsSection from './v2/SkillsSection';
import PublicationsSection from './v2/PublicationsSection';
import './v2/theme.css';

const FOOTER_LINKS = [
  { label: 'Email', href: 'mailto:esotericdeep@gmail.com', external: false },
  { label: 'GitHub', href: 'https://github.com/Deep-De-coder', external: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/deep-shahane/', external: true },
];

export default function V2() {
  // App.css sets overflow:hidden + height:100% on html/body for the old layout.
  // Override those for the V2 scroll-driven page and restore on unmount.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;

    // NOTE: use 'visible', not 'auto'. When BOTH html and body are overflow:auto,
    // Chromium creates two scroll containers and `position: sticky` silently
    // stops pinning (breaks ChipAssemblySection). 'visible' still scrolls fine.
    html.style.overflow = 'visible';
    html.style.height = 'auto';
    body.style.overflow = 'visible';
    body.style.height = 'auto';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.height = prevHtmlHeight;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
    };
  }, []);

  // The constellation belongs to the hero. Once the reader is into the content
  // it becomes noise behind body copy, so a veil fades it back over the first
  // viewport of scroll. Driven off raw scrollY (not progress) so it stays
  // correct regardless of how tall the page grows.
  const { scrollY } = useScroll();
  const veilOpacity = useTransform(scrollY, [320, 1100], [0, 0.92]);

  return (
    <div className="v2" style={{ position: 'relative' }}>
      <SceneBackground />
      <ChipCanvas />

      {/* Recedes the live scene behind the content sections. */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5,
          pointerEvents: 'none',
          opacity: veilOpacity,
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(6,6,10,0.55) 0%, rgba(6,6,10,0.92) 55%, #06060a 100%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <NavBar />
        <HeroSection />
        <ChipAssemblySection />
        <AboutSection />
        <AskSection />
        <ProjectsSection />
        <ExperienceSection />
        <EducationSection />
        <SkillsSection />
        <PublicationsSection />

        <footer style={{ position: 'relative', paddingBlock: 'clamp(3rem, 7vh, 5rem)' }}>
          <div className="v2-container">
            <hr className="v2-rule" style={{ marginBottom: 'clamp(2rem, 5vh, 3.5rem)' }} />
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '1.75rem',
              }}
            >
              <div>
                <p
                  className="v2-h3"
                  style={{ fontSize: '1.125rem', marginBottom: '0.4375rem' }}
                >
                  Deep Shahane
                </p>
                <p className="v2-meta" style={{ margin: 0 }}>
                  AI Engineer · Founding Engineer @ NILA · MS CS @ University at Buffalo
                </p>
              </div>

              <nav
                aria-label="Footer"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '1.75rem' }}
              >
                {FOOTER_LINKS.map(({ label, href, external }) => (
                  <a
                    key={label}
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="v2-footer-link"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            <p
              className="v2-meta"
              style={{ marginTop: 'clamp(2rem, 5vh, 3rem)', color: 'var(--v2-text-4)' }}
            >
              Built with React, Three.js and WebLLM. The assistant on this page runs on your own GPU.
            </p>
          </div>
        </footer>
      </div>

      {/* Film grain, sits above everything, purely optical. */}
      <div className="v2-grain" aria-hidden="true" />
    </div>
  );
}
