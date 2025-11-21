import React, { useState, useEffect } from 'react';
import './Experience.css';
import ub_logo from '../assets/Ub logo.jpg';
import vit_logo from '../assets/vit logo.png';
import bragr_logo from '../assets/bragr logo.jpg';
import captain_cool_logo from '../assets/captain cool logo.png';

const Experience = () => {
  const experiences = [
    {
      title: "AI Research Assistant",
      company: "SAIR LAB at UB",
      period: "Aug 2024 - Present",
      description: `Exploring simulation, automation, and intelligent robotics for real-world impact. Achieved 16× speedup in drone 3D reconstruction by integrating 2D Gaussian Splatting into GPU-accelerated SLAM over video frame sequences, customizing a C++/CUDA surfel rasterizer for real-time aerial mapping. Researching NVIDIA Isaac Lab and developing humanoid robots with vision-language models (VLMs) like InstructBLIP2, Florence, etc., using PyTorch and RL for multimodal perception and decision-making.`,
      techStack: ["Python", "C++", "CUDA", "PyTorch", "Gaussian Splatting", "SLAM", "Computer Vision", "Robotics"],
      logo: ub_logo,
    },
    {
      title: "AI Engineer",
      company: "Bragr",
      period: "Aug 2024 - Jan 2025",
      description: `Startup developing AI chat solutions for live sports conversations. Architected and deployed a FastAPI + Azure OpenAI (RAG) backend, wokred on data pipeline and iterating prompt templates and system messages and retrieval thresholds, cutting response time 66% and improving answer quality. Built an async web scraping and semantic search pipeline using Python, aiohttp, and MongoDB, supporting 10+ concurrent users. Collaborated with frontend engineers on a microservices chat system, optimizing backend performance and deployment on Azure.`,
      techStack: ["Python", "FastAPI", "Azure OpenAI", "MongoDB", "aiohttp", "RAG", "Microservices"],
      logo: bragr_logo,
    },
    {
      title: "ML Intern",
      company: "Captain Cool",
      period: "Dec 2021 - Feb 2023",
      description: `Consumer brand producing packaged ice creams for diverse markets. Built a full-stack Python + Flask + PostgreSQL web platform for order and inventory management, handling 1K+ daily transactions. Developed time-series demand forecasting models using PyTorch and scikit-learn, improving stock prediction accuracy by 18%. Implemented automated data pipelines for real-time syncing between POS systems and the central database.`,
      techStack: ["Python", "Flask", "PostgreSQL", "PyTorch", "scikit-learn", "Time Series", "Data Pipelines"],
      logo: captain_cool_logo,
    },
    {
      title: "ML Intern",
      company: "VIT",
      period: "Jun 2021 - Aug 2021",
      description: `Autonomous institution offering cutting-edge engineering and technology programs. Launched an internship portal with a recommendation system using TF-IDF and cosine similarity, improving match relevance by 25% and reducing manual effort. Built a Flask + PostgreSQL backend with SQLAlchemy, integrating scraped Internshala data into a normalized 400+ entry database. Deployed on Azure with Q&A Maker, Blob, Maps, and Speech-to-Text to enhance accessibility and interaction.`,
      techStack: ["Python", "Flask", "PostgreSQL", "SQLAlchemy", "TF-IDF", "Azure", "Recommendation Systems"],
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
