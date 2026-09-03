import React, { useState, useEffect } from 'react';
import './Experience.css';
import { experiences } from '../data/experience';

const Experience = () => {
  return (
    <div id="experience">
      <h1>Experience</h1>
      <div className="experience-container">
        {experiences.map((exp, index) => (
          <ExperienceCard key={index} experience={exp} />
        ))}
      </div>
    </div>
  );
};

const MOBILE_QUERY = '(max-width: 767px)'; // matches the previous innerWidth < 768 check

const ExperienceCard = ({ experience }) => {
  const [expanded, setExpanded] = useState(false);
  const [viewMore, setViewMore] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const maxLength = 200; // Limit for collapsed text

  // Update isMobile when the breakpoint is crossed (fires only on change,
  // unlike a per-card resize listener)
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => setIsMobile(event.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={`experience-card ${expanded ? "expanded" : ""}`}>
      {/* Mobile View: Entire Bar is Clickable */}
      {isMobile ? (
        <div
          className="mobile-view"
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded(!expanded);
            }
          }}
        >
          <img src={experience.logo} alt={`${experience.company} Logo`} className="company-logo" />
          <div className="company-info">
            <h3 className="company-name">{experience.company}</h3>
            <h2 className="position">{experience.title}</h2>
          </div>
          <span className="toggle-icon">{expanded ? "▲" : "▼"}</span>
        </div>
      ) : (
        /* Web View: Always Visible */
        <div className="web-view">
          <img src={experience.logo} alt={`${experience.company} Logo`} className="company-logo" />
          <div className="company-info">
            <h3 className="company-name">{experience.company}</h3>
            <h2 className="position">{experience.title}</h2>
          </div>
        </div>
      )}

      {/* Content - Initially Hidden in Mobile, Expands on Click */}
      <div className={`content ${isMobile && !expanded ? "hide" : "show"}`}>
        <p className="period">{experience.period}</p>

        {/* Description with View More / Less */}
        <p className="description">
          {viewMore ? experience.description : `${experience.description.substring(0, maxLength)}...`}
        </p>
        <button className="view-more-btn" onClick={(e) => {
          e.stopPropagation(); // Prevent collapsing when clicking "View More"
          setViewMore(!viewMore);
        }}>
          {viewMore ? "View Less" : "View More"}
        </button>

        <div className="tech-stack">
          {experience.techStack.map((tech, idx) => (
            <span key={idx} className="tech-badge">{tech}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Experience;
