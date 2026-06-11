import React, { useEffect } from 'react';
import NavBar from './v2/NavBar';
import HeroSection from './v2/HeroSection';
import AskSection from './v2/AskSection';
import ProjectsSection from './v2/ProjectsSection';
import ExperienceSection from './v2/ExperienceSection';
import EducationSection from './v2/EducationSection';
import SkillsSection from './v2/SkillsSection';
import PublicationsSection from './v2/PublicationsSection';

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

    html.style.overflow = 'auto';
    html.style.height = 'auto';
    body.style.overflow = 'auto';
    body.style.height = 'auto';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.height = prevHtmlHeight;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
    };
  }, []);

  return (
    <div style={{ background: '#05050a', color: '#f1f5f9' }}>
      <NavBar />
      <HeroSection />
      <AskSection />
      <ProjectsSection />
      <ExperienceSection />
      <EducationSection />
      <SkillsSection />
      <PublicationsSection />

      <footer className="py-14 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#05050a' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-grotesk font-bold text-white text-lg">Deep Shahane</span>
            <p className="font-dm text-xs text-slate-600 mt-1">AI Researcher · MS CS @ University at Buffalo</p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="mailto:esotericdeep@gmail.com"
              className="font-dm text-sm text-slate-600 hover:text-slate-300 transition-colors duration-150 cursor-pointer"
            >
              Email
            </a>
            <a
              href="https://github.com/Deep-De-coder"
              target="_blank"
              rel="noopener noreferrer"
              className="font-dm text-sm text-slate-600 hover:text-slate-300 transition-colors duration-150 cursor-pointer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/deepshahane/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-dm text-sm text-slate-600 hover:text-slate-300 transition-colors duration-150 cursor-pointer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
