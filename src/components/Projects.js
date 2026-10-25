import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CardContainer, CardBody, CardItem } from './ui/3d-card';
import { Meteors } from './ui/meteors';
import './Projects.css';
import { projects } from '../data/projects';

// `hidden` retires a card from the page while keeping its record and image in
// the data file, so bringing one back is a one-word change.
const VISIBLE_PROJECTS = projects.filter(p => !p.hidden);

gsap.registerPlugin(ScrollTrigger);

const MOBILE_QUERY = '(max-width: 767px)'; // matches the previous innerWidth < 768 check

const Projects = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const spotlightFrameRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => setIsMobile(event.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Cancel any pending spotlight frame on unmount
  useEffect(() => {
    return () => {
      if (spotlightFrameRef.current !== null) {
        cancelAnimationFrame(spotlightFrameRef.current);
        spotlightFrameRef.current = null;
      }
    };
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };

  const handleSpotlight = useCallback((e) => {
    if (spotlightFrameRef.current !== null) return; // frame already pending
    const el = e.currentTarget;
    const { clientX, clientY } = e;
    spotlightFrameRef.current = requestAnimationFrame(() => {
      spotlightFrameRef.current = null;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mouse-x', `${clientX - rect.left}px`);
      el.style.setProperty('--mouse-y', `${clientY - rect.top}px`);
    });
  }, []);

  const handleSpotlightLeave = useCallback((e) => {
    if (spotlightFrameRef.current !== null) {
      cancelAnimationFrame(spotlightFrameRef.current);
      spotlightFrameRef.current = null;
    }
    e.currentTarget.style.setProperty('--mouse-x', '-400px');
    e.currentTarget.style.setProperty('--mouse-y', '-400px');
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const scroller = document.querySelector('.main-content');
    if (!scroller || !sectionRef.current) return;

    const triggers = [];
    try {
      const heading = sectionRef.current.querySelector('.projects-heading');
      const chars = sectionRef.current.querySelectorAll('.projects-heading .char');
      if (heading && chars.length) {
        triggers.push(
          gsap.fromTo(
            Array.from(chars),
            { opacity: 0, y: -24 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.04,
              duration: 0.5,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: heading,
                start: 'top 85%',
                scroller,
              },
            }
          )
        );
      }

      const cards = cardsRef.current.filter(Boolean);
      if (cards.length > 0) {
        gsap.set(cards, { opacity: 0, y: 50 });
        // ScrollTrigger.batch returns an array of triggers, spread so each
        // one is killed individually on cleanup
        triggers.push(
          ...ScrollTrigger.batch(cards, {
            onEnter: (batch) => {
              gsap.to(batch, { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: 'power3.out' });
            },
            start: 'top 90%',
            scroller,
          })
        );
      }
    } catch (_) {}

    return () => {
      // Kill only this component's tween/triggers, a global
      // ScrollTrigger.getAll() kill would destroy other components' triggers
      triggers.forEach(t => t && t.kill && t.kill());
    };
  }, []);

  return (
    <div id="projects" ref={sectionRef}>
      {/* Meteors streaking across the section background */}
      <div className="meteors-bg">
        <Meteors number={15} />
      </div>

      <h1 className="projects-heading">
        {'Projects'.split('').map((char, i) => (
          <span key={i} className="char">{char}</span>
        ))}
      </h1>

      <div className="projects-grid">
        {VISIBLE_PROJECTS.map((proj, index) => {
          const isExpanded = expandedIndex === index;
          // The tagline always shows; only the paragraph under it collapses.
          const maxLength = 150;
          const displayedSummary = isExpanded || isMobile || proj.summary.length <= maxLength
            ? proj.summary
            : `${proj.summary.substring(0, maxLength)}...`;
          const needsToggle = !isMobile && proj.summary.length > maxLength;

          return (
            <div
              key={index}
              ref={el => { cardsRef.current[index] = el; }}
              className="card-gsap-wrapper"
            >
              <CardContainer containerClassName="w-full p-0" className="w-full">
                <CardBody className="w-full">
                  <div
                    className={`project-card${isExpanded ? ' expanded' : ''}`}
                    onClick={() => isMobile && toggleExpand(index)}
                    role={isMobile ? 'button' : undefined}
                    tabIndex={isMobile ? 0 : undefined}
                    aria-expanded={isMobile ? isExpanded : undefined}
                    onKeyDown={isMobile ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpand(index);
                      }
                    } : undefined}
                    onMouseMove={handleSpotlight}
                    onMouseLeave={handleSpotlightLeave}
                  >
                    <CardItem translateZ={30} className="w-full">
                      <div className="project-header">
                        {proj.thumbnail && (
                          <img
                            src={proj.thumbnail}
                            alt={proj.thumbnailAlt || `${proj.title} Thumbnail`}
                            className="project-thumbnail"
                          />
                        )}
                        <div className="project-info">
                          <h3 className="project-name">{proj.title}</h3>
                          <div className="project-links">
                            {proj.demoLink && (
                              <a
                                href={proj.demoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-link"
                                onClick={e => e.stopPropagation()}
                              >
                                [{(proj.demoLabel || 'Demo').toUpperCase()}]
                              </a>
                            )}
                            {proj.codeLink && (
                              <a
                                href={proj.codeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-link"
                                onClick={e => e.stopPropagation()}
                              >
                                [CODE]
                              </a>
                            )}
                          </div>
                        </div>
                        {isMobile && (
                          <span className="toggle-icon">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </CardItem>

                    <CardItem translateZ={15} className="w-full">
                      <p className="project-tagline">{proj.tagline}</p>
                      <p className="project-summary">{displayedSummary}</p>
                    </CardItem>

                    {needsToggle && (
                      <CardItem translateZ={10} className="w-fit">
                        <button
                          className="view-more-btn"
                          onClick={e => {
                            e.stopPropagation();
                            toggleExpand(index);
                          }}
                        >
                          {isExpanded ? 'View Less' : 'View More'}
                        </button>
                      </CardItem>
                    )}

                    <CardItem translateZ={20} className="w-full">
                      <div className="tech-stack">
                        {(proj.techStack || []).map((tech, idx) => (
                          <span key={idx} className="tech-badge">{tech}</span>
                        ))}
                      </div>
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Projects;
