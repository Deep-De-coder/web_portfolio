import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { FaGithub, FaLinkedin } from "react-icons/fa"; // Import icons

const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  return (
    <>
      <nav className={`sidebar ${isMobile ? "mobile-navbar" : ""}`}>
        
        {/* ✅ Name in Web View (Inside Sidebar) */}
        {!isMobile && (
          <div className="sidebar-name-container">
            <h3 className="sidebar-name">Deep Shahane</h3>

            {/* ✅ GitHub & LinkedIn Icons (Clickable) */}
            <div className="social-icons">
              <a href="https://github.com/Deep-De-coder" target="_blank" rel="noopener noreferrer">
                <FaGithub className="icon" />
              </a>
              <a href="https://www.linkedin.com/in/deep-shahane/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="icon" />
              </a>
            </div>
          </div>
        )}

        {/* ✅ Navbar (Navigation Buttons) */}
        <div className="nav-buttons">
          {["ask", "experience", "education", "publications", "projects", "skillset"].map((sectionId) => (
            <button key={sectionId} onClick={() => handleScrollTo(sectionId)}>
              {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
            </button>
          ))}
        </div>


        {/* ✅ Name & Icons in Mobile View (Below Navbar) */}
        {isMobile && (
          <div className="name-bar">
            <h3 className="sidebar-name">Deep Shahane</h3>
            <div className="mobile-icons">
              <a href="https://github.com/Deep-De-coder" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              <a href="https://www.linkedin.com/in/deep-shahane/" target="_blank" rel="noopener noreferrer">
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
