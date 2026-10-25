import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import {
  FiMessageSquare,
  FiBookOpen,
  FiBriefcase,
  FiFileText,
  FiGrid,
  FiTool,
  FiLayers,
} from "react-icons/fi";

const GITHUB_URL = "https://github.com/Deep-De-coder";
const LINKEDIN_URL = "https://www.linkedin.com/in/deep-shahane/";

const MOBILE_QUERY = "(max-width: 767px)"; // matches the previous innerWidth < 768 check

// Outline icons keep the rail legible at 88px wide, where a text-only label
// would have to shrink past readable.
const SECTIONS = [
  { id: "ask", label: "Ask", Icon: FiMessageSquare },
  { id: "education", label: "Education", Icon: FiBookOpen },
  { id: "experience", label: "Experience", Icon: FiBriefcase },
  { id: "publications", label: "Research", Icon: FiFileText },
  { id: "projects", label: "Projects", Icon: FiGrid },
  { id: "skillset", label: "Skills", Icon: FiTool },
];

const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [activeId, setActiveId] = useState(null);

  // Detect screen size changes (media query "change" fires only at the breakpoint)
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const updateMedia = (event) => setIsMobile(event.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateMedia);
    return () => mediaQuery.removeEventListener("change", updateMedia);
  }, []);

  // Light up whichever section owns the middle of the screen. The rail scrolls
  // the page rather than routing, so without this nothing ever reads as current.
  useEffect(() => {
    if (isMobile) return undefined;
    const targets = SECTIONS.map(({ id }) => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return undefined;

    const scroller = document.querySelector(".main-content");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActiveId(visible.length ? visible[0].target.id : null);
      },
      { root: scroller || null, rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isMobile]);

  // Smooth scrolling to sections
  const handleScrollTo = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isMobile) {
    return (
      <nav className="sidebar mobile-navbar">
        <div className="nav-buttons">
          {SECTIONS.map(({ id, label }) => (
            <button key={id} onClick={() => handleScrollTo(id)}>
              {label}
            </button>
          ))}
          <Link to="/v2" style={{ textDecoration: "none" }}>
            <button>V2</button>
          </Link>
        </div>

        <div className="name-bar">
          <h3 className="sidebar-name">Deep Shahane</h3>
          <div className="mobile-icons">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="rail" aria-label="Sections">
      <button
        type="button"
        className="rail__mark"
        onClick={() => handleScrollTo("ask")}
        aria-label="Deep Shahane, back to top"
        title="Deep Shahane"
      >
        DS
      </button>

      <ul className="rail__list">
        {SECTIONS.map(({ id, label, Icon }) => (
          <li key={id}>
            <button
              type="button"
              className="rail__item"
              data-active={activeId === id}
              aria-current={activeId === id ? "true" : undefined}
              onClick={() => handleScrollTo(id)}
            >
              <Icon className="rail__icon" aria-hidden="true" />
              <span className="rail__label">{label}</span>
            </button>
          </li>
        ))}
      </ul>

      <hr className="rail__divider" />

      <Link to="/v2" className="rail__item rail__item--link">
        <FiLayers className="rail__icon" aria-hidden="true" />
        <span className="rail__label">V2</span>
      </Link>

      <div className="rail__social">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <FaGithub />
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <FaLinkedin />
        </a>
      </div>
    </nav>
  );
};

export default Sidebar;
