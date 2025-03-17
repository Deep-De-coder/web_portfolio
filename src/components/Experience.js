import React, { useState, useEffect } from 'react';
import './Experience.css';
import ub_logo from '../assets/Ub logo.jpg';
import vit_logo from '../assets/vit logo.png';
import bragr_logo from '../assets/bragr logo.jpg';

const Experience = () => {
  const experiences = [
    {
      title: "Graduate Teaching Assistant",
      company: "University at Buffalo",
      period: "Jan 2025 - Present",
      description: `Serving as a Student Teaching Assistant for the "Introduction to Pattern Recognition" course. Assisting students with course material, grading assignments.
      Responsible for designing and evaluating coding assignments related to probabilistic models, feature extraction, and classification techniques in pattern recognition.`,
      techStack: ["Python", "Transformers", "Machine Learning", "Pattern Recognition", "Assistance"],
      logo: ub_logo,
    },
    {
      title: "Research Assistant",
      company: "University at Buffalo",
      period: "Jan 2025 - Present",
      description: `Conducting research under Dr. Chen Wang, focusing on implementing Gaussian Splatting in drones to enhance real-time 3D reconstruction and rendering.
      Developing methodologies to improve the efficiency and accuracy of Gaussian Splatting for aerial applications, optimizing computational performance for real-time processing.`,
      techStack: ["Python", "Gaussian Splatting", "Computer Vision", "Drones", "3D Reconstruction"],
      logo: ub_logo,
    },    
    {
      title: "Research Assistant",
      company: "University at Buffalo",
      period: "Jan 2025 - Present",
      description: `Automated the extraction and processing of 100+ journals from Clarivate’s Journal Citation Report using Playwright, efficiently handling dynamic web elements and multi-step interactions, reducing manual effort by 99.97% and improving data accuracy. Built a pipeline to merge extracted XLS files, structuring Journal Impact Factor, JIF Without Self Cites, and Citable Items (2000–2023) for seamless trend analysis and data-driven insights.`,
      techStack: ["Python", "Scrapy", "BeautifulSoup", "Data Collection"],
      logo: ub_logo,
    },
    {
      title: "Artificial Engineer Intern",
      company: "Bragr",
      period: "Aug 2024 - Jan 2025",
      description: `During my ongoing internship at Bragr as an Artificial Engineer Intern, I have architected and implemented a robust FastAPI-driven backend for a chat application.
      This system integrates Azure OpenAI to facilitate dynamic query processing and response generation, efficiently managing both real-time and historical user queries.
      Additionally, I have developed an advanced asynchronous web scraping and search system using Python, aiohttp, and FastAPI, which is designed to handle multiple concurrent requests with high efficiency.
      I've also designed MongoDB database interactions to optimize the storage and retrieval of chat histories and user queries.
      Furthermore, I have been involved in refining the user flow and scaling the frontend of the web-based chat application, enhancing its overall scalability and user experience.`,
      techStack: ["Python", "FastAPI", "Azure OpenAI", "MongoDB"],
      logo: bragr_logo,
    },
    {
      title: "Software Intern",
      company: "VIT",
      period: "June 2021 - Aug 2021",
      description: `During my summer internship at VIT, I played a crucial role in developing the VIT Internship Portal, which significantly improved the internship application process for both students and professors. 
      I engineered an efficient backend system utilizing the Flask framework and SQLite, optimizing the management, storage, organization, and swift retrieval of data to ensure seamless access and updates. 
      Collaborating closely with my team members, I helped design and implement a user-friendly web application using Python, enhancing overall usability. 
      I successfully deployed the project on Azure Cloud, leveraging five free services—Q&A Maker, Azure Blob, Azure Map, Azure Cognitive Speech to Text, and Azure App Service—to enhance accessibility and user experience`,
      techStack: ["Python", "Flask", "Azure", "SQL"],
      logo: vit_logo,
    },
  ];

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

const ExperienceCard = ({ experience }) => {
  const [expanded, setExpanded] = useState(false);
  const [viewMore, setViewMore] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const maxLength = 200; // Limit for collapsed text

  // Update isMobile state when window resizes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`experience-card ${expanded ? "expanded" : ""}`}>
      {/* Mobile View: Entire Bar is Clickable */}
      {isMobile ? (
        <div className="mobile-view" onClick={() => setExpanded(!expanded)}>
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
