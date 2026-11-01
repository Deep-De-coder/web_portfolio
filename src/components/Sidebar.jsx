import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import { FaGithub, FaLinkedin, FaCopy, FaCheck } from "react-icons/fa";
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
const SOCIALS = [
  { key: "github", label: "GitHub", href: GITHUB_URL, Icon: FaGithub },
  { key: "linkedin", label: "LinkedIn", href: LINKEDIN_URL, Icon: FaLinkedin },
];

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
  // { key, ok } so a failed copy can say so instead of looking like a dead button.
  const [copyState, setCopyState] = useState(null);
  const copyResetRef = useRef(null);

  // Clear the pending "Copied" reset so it cannot fire after unmount.
  useEffect(() => () => clearTimeout(copyResetRef.current), []);

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

  // The async clipboard API needs a secure context and permission, and is
  // refused outright in some embedded views. Fall back to the legacy path
  // before giving up, and report failure rather than doing nothing.
  const writeClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      // fall through to the legacy path
    }
    try {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "-1000px";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(field);
      return ok;
    } catch (err) {
      return false;
    }
  };

  const handleCopyLink = async (key, url) => {
    const ok = await writeClipboard(url);
    setCopyState({ key, ok });
    clearTimeout(copyResetRef.current);
    copyResetRef.current = setTimeout(() => setCopyState(null), 2000);
  };

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
      <div className="rail__social" role="group" aria-label="Profiles">
        {SOCIALS.map(({ key, label, href, Icon }) => (
          <div className="rail__social-item" key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rail__social-link"
              aria-label={label}
              title={label}
            >
              <Icon />
            </a>
            <button
              type="button"
              className="rail__copy"
              data-copied={copyState?.key === key && copyState.ok}
              data-failed={copyState?.key === key && !copyState.ok}
              onClick={() => handleCopyLink(key, href)}
              aria-label={
                copyState?.key === key
                  ? copyState.ok
                    ? `${label} link copied`
                    : `Could not copy ${label} link`
                  : `Copy ${label} link`
              }
              title={
                copyState?.key === key
                  ? copyState.ok
                    ? "Copied"
                    : "Copy failed, open the link instead"
                  : `Copy ${label} link`
              }
            >
              {copyState?.key === key && copyState.ok ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
        ))}
      </div>

      <hr className="rail__divider" />

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
    </nav>
  );
};

export default Sidebar;
