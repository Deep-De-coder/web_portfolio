import React, { useEffect } from 'react';
import NavBar from './v2/NavBar';
import HeroSection from './v2/HeroSection';
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
  // App.css belongs to the classic route: it pins html/body to a dark
  // gradient with overflow hidden. Both have to be lifted here and restored
  // on the way out, or the paper page sits on a dark ground and cannot
  // scroll.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      htmlBackground: html.style.background,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyBackground: body.style.background,
    };

    // 'visible', not 'auto': with both html and body set to auto, Chromium
    // makes two scroll containers and position: sticky stops pinning.
    html.style.overflow = 'visible';
    html.style.height = 'auto';
    body.style.overflow = 'visible';
    body.style.height = 'auto';
    // Covers overscroll and any gap below a short page.
    html.style.background = '#f2efec';
    body.style.background = '#f2efec';

    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
      html.style.background = prev.htmlBackground;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
      body.style.background = prev.bodyBackground;
    };
  }, []);

  return (
    <div className="v2" style={{ position: 'relative', minHeight: '100vh' }}>
      <NavBar />
      <HeroSection />
      <AboutSection />
      <AskSection />
      <ProjectsSection />
      <ExperienceSection />
      <EducationSection />
      <SkillsSection />
      <PublicationsSection />

      <footer style={{ position: 'relative', paddingBlock: 'clamp(3rem, 7vh, 4.5rem)' }}>
        <div className="v2-container">
          <hr className="v2-rule" style={{ marginBottom: 'clamp(1.75rem, 4vh, 2.5rem)' }} />
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
              <p className="v2-h3" style={{ fontSize: '1.25rem', marginBottom: '0.375rem' }}>
                Deep Shahane
              </p>
              <p className="v2-meta" style={{ margin: 0 }}>
                Production AI Engineer · Founding Engineer @ NILA · MS CS @ University at Buffalo
              </p>
            </div>

            <nav aria-label="Footer" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.75rem' }}>
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
            style={{ marginTop: 'clamp(1.75rem, 4vh, 2.5rem)', color: 'var(--v2-text-4)' }}
          >
            Built with React, three.js and WebLLM. Erevna, the assistant on this page, runs on your own GPU.
          </p>
        </div>
      </footer>

      <div className="v2-grain" aria-hidden="true" />
    </div>
  );
}
