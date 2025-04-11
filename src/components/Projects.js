import React, { useState, useEffect } from 'react';
import './Projects.css';
import cubesImage from '../assets/projects/cubes.png';
import langTranslationImg from '../assets/projects/langtranslation.png';
import roadextract from '../assets/projects/roadextract.png';
import gdp from '../assets/projects/gdp.png';
import novelchatbot from '../assets/projects/novelchatbot.png';

const Projects = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const projects = [
    {
      title: "Language Translation",
      period: "Feb 2024 - Apr 2024",
      demoLink: "",
      codeLink: "https://github.com/Deep-De-coder/deep_learning_project",
      summary: "Developed a language translation system for English to French using the Europarl Parallel Corpus with over 1 million rows. Fine-tuned Google T5 and Facebook M2M-100 models, creating 20 custom Transformers with unique positional encodings. Achieved a METEOR score of 0.109 and explored BLEU and COMET metrics. Deployed on Gradio for real-time interaction.",
      techStack: ["PyTorch", "Google T5", "Facebook M2M-100", "Gradio"],
      thumbnail: langTranslationImg,
    },
    {
      title: "Road Extraction From Satellite Images",
      period: "Sep 2023 - Nov 2023",
      demoLink: "",
      codeLink: "https://github.com/Deep-De-coder/road_extraction_using_satellite_images",
      summary: "Applied advanced preprocessing techniques to refine the Kaggle Satellite Road images dataset. Engineered a fusion model combining ResNet50 and VGG with three preprocessing techniques, achieving 95.2% training and 95.3% validation accuracy. Merged post-processing techniques such as Edge Detection to enhance output accuracy.",
      techStack: ["OpenCV", "Google Colab", "VGG", "ResNet", "UNet"],
      thumbnail: roadextract,
    },
    {
      title: "Novel Chatbot",
      period: "Oct 2023 - Nov 2023",
      demoLink: "",
      codeLink: "https://github.com/Deep-De-coder/novel_chatbot_RAG",
      summary: "Developed a full-stack Flask chatbot using 15 Gutenberg novels, supporting both novel-specific and chitchat queries via a Random Forest multi-label classifier with TF-IDF and OneVsRest. Integrated Hugging Face zero-shot models, BlenderBot, and OpenAI GPT-3.5 for dynamic responses, with TF-IDF-based cosine similarity for context retrieval. Deployed on Google Cloud Platform, achieving mean response times of 1.48s (chitchat) and 25s (summaries), with real-time dashboards for performance metrics and session handling.",
      techStack: ["RAG", "Random Forest", "Hugging Face", "OpenAI GPT-3.5", "Google Cloud Platform"],
      thumbnail: novelchatbot,
    },
    {
      title: "GDP Prediction System",
      period: "Feb 2024 - Apr 2024",
      demoLink: "https://gdp-prediction-app.onrender.com/",
      codeLink: "https://github.com/Deep-De-coder/gdp_prediction",
      summary: "Developed a GDP prediction system leveraging XGBoost and Linear Regression models. Used energy consumption and production data to forecast GDP trends. Implemented feature selection techniques to optimize model accuracy. Designed a user-friendly Flask-based GUI for real-time predictions.",
      techStack: ["XGBoost", "Linear Regression", "Flask", "Python"],
      thumbnail: gdp,
    },
    {
      title: "Auto Envision",
      period: "Sep 2022 - Apr 2023",
      demoLink: "", // Replace with actual link
      codeLink: "https://github.com/Deep-De-coder/Auto-Envision", // Replace with actual link
      summary: "Completed sales forecasting using ARIMA, LSTM, and FB Prophet. Led data cleaning for a dataset of 100,000+ rows. Conducting research under Dr. Chen Wang focusing on Gaussian Splatting for advanced rendering techniques. Developing methodologies to improve the efficiency and quality of rendering processes.",
      techStack: ["Python", "Google Colab", "Time Series Algorithm"],
      thumbnail: "/images/auto_envision.png",
    },
    {
      title: "Car Price EDA",
      period: "Sep 2022 - Nov 2022",
      demoLink: "", 
      codeLink: "https://github.com/Deep-De-coder/EDA-on-car-price-prediction", 
      summary: "Performed in-depth EDA on a car price dataset with 11,900 rows and 16 columns. Used Matplotlib and Seaborn for data visualization.",
      techStack: ["Pandas", "NumPy", "Google Colab"],
      thumbnail: "/images/car_price_eda.png",
    },
    {
      title: "Flying Cubes",
      period: "Oct 2022 - Jan 2023",
      demoLink: "", 
      codeLink: "https://github.com/Deep-De-coder/FLying_Cubes", 
      summary: "Developed an AR application allowing real-time manipulation of ascending cubes. Demonstrated Unity and AR proficiency.",
      techStack: ["AR", "Unity", "C#"],
      thumbnail: cubesImage,
    },
  ];

  // Detect mobile view for correct behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle expanded state for clicked project
  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div id="projects">
      <h1>Projects</h1>
      <div className="projects-container">
        {projects.map((proj, index) => {
          // Determine whether to show full summary or truncated
          const isExpanded = expandedIndex === index;
          const maxLength = 100; // Character limit before "View More"
          const displayedSummary = isExpanded || isMobile
            ? proj.summary
            : `${proj.summary.substring(0, maxLength)}...`;

          return (
            <div
              key={index}
              className={`project-card ${isExpanded ? 'expanded' : ''}`}
              onClick={() => isMobile && toggleExpand(index)} // Only toggle in mobile view
            >
              {/* Thumbnail + Name in a row */}
              <div className="project-header">
                <img src={proj.thumbnail} alt={`${proj.title} Thumbnail`} className="project-thumbnail" />
                <div className="project-info">
                  <h3 className="project-name">{proj.title}</h3>

                  {/* DEMO and CODE links */}
                  <div className="project-links">
                    {proj.demoLink && (
                      <a href={proj.demoLink} target="_blank" rel="noopener noreferrer" className="project-link">[DEMO]</a>
                    )}
                    {proj.codeLink && (
                      <a href={proj.codeLink} target="_blank" rel="noopener noreferrer" className="project-link">[CODE]</a>
                    )}
                  </div>


                  {/* Project Duration */}
                  <p className="project-duration">{proj.period}</p>
                </div>
                {/* Toggle Icon for Mobile */}
                {isMobile && <span className="toggle-icon">{isExpanded ? "▲" : "▼"}</span>}
              </div>

              {/* Project Summary (Truncated for Web, Dropdown for Mobile) */}
              <p className="project-summary">{displayedSummary}</p>

              {/* View More Button for Web and Mobile */}
              <button
                className="view-more-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click from triggering mobile dropdown
                  toggleExpand(index);
                }}
              >
                {isExpanded ? "View Less" : "View More"}
              </button>

              {/* Tech Stack */}
              <div className="tech-stack">
                {proj.techStack.map((tech, idx) => (
                  <span key={idx} className="tech-badge">{tech}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Projects;
