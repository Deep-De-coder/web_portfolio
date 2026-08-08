import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import { FaGithub, FaLinkedin, FaCopy, FaCheck } from "react-icons/fa";

const GITHUB_URL = "https://github.com/Deep-De-coder";
const LINKEDIN_URL = "https://www.linkedin.com/in/deep-shahane/";

const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [copied, setCopied] = useState(false);

  // Detect screen size changes
  useEffect(() => {
    const updateMedia = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  // Smooth scrolling to sections
  const handleScrollTo = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCopyLinks = async () => {
    const text = `GitHub: ${GITHUB_URL}\nLinkedIn: ${LINKEDIN_URL}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy links:", err);
    }
  };

  return (
    <>
      <nav className={`sidebar ${isMobile ? "mobile-navbar" : ""}`}>
        
        {/* ✅ Name in Web View (Inside Sidebar) */}
        {!isMobile && (
          <div className="sidebar-name-container">
            <h3 className="sidebar-name">Deep Shahane</h3>

            {/* ✅ GitHub & LinkedIn Icons (Clickable) */}
            <div className="social-icons">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub size={32} className="icon" />
              </a>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin size={32} className="icon" />
              </a>
            </div>

            {/* ✅ Copy both links */}
            <button
              type="button"
              className={`copy-links-btn ${copied ? "copied" : ""}`}
              onClick={handleCopyLinks}
              aria-label="Copy GitHub and LinkedIn links"
            >
              {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
              {copied ? "Copied!" : "Copy Links"}
            </button>
          </div>
        )}

        {/* ✅ Navbar (Navigation Buttons) */}
        <div className="nav-buttons">
          {["ask", "education", "experience", "publications", "projects", "skillset"].map((sectionId) => (
            <button key={sectionId} onClick={() => handleScrollTo(sectionId)}>
              {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
            </button>
          ))}
          <Link to="/v2" style={{ textDecoration: 'none' }}>
            <button>V2</button>
          </Link>
        </div>


        {/* ✅ Name & Icons in Mobile View (Below Navbar) */}
        {isMobile && (
          <div className="name-bar">
            <h3 className="sidebar-name">Deep Shahane</h3>
            <div className="mobile-icons">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Sidebar;
