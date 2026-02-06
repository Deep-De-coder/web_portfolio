import React, { useState, useEffect } from 'react';
import './Projects.css';
import cubesImage from '../assets/projects/cubes.png';
import musicfiesta from '../assets/projects/musicfiesta.png';
import roadextract from '../assets/projects/roadextract.png';
import gdp from '../assets/projects/gdp.png';
import novelchatbot from '../assets/projects/novelchatbot.png';
import dresserImg from '../assets/projects/dresser.png';
import healthcareImg from '../assets/projects/healthcare.png';
import transformersImg from '../assets/projects/transformersdeeplearning.png';
import autoenvisionImg from '../assets/projects/autoenvision.png';
import carpriceedaImg from '../assets/projects/carpriceeda.png';
import coineeImg from '../assets/projects/coinee.png';
import lowlightdiffusionImg from '../assets/projects/lowlightdiffusion.png';

const Projects = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const projects = [
    {
      title: "Dresser Smart Wardrobe App",
      period: "Jun 2025 - Aug 2025",
      demoLink: "https://dresser-pi.vercel.app/",
      codeLink: "",
      summary: "Built a production-ready wardrobe app on Next.js 14 (App Router, TypeScript, Tailwind) with Node serverless API routes on Vercel, delivering AI outfit suggestions and real-time photo analysis. Integrated Azure Vision and a private Ollama LLM (qwen2:1.5b) via a Fly.io HTTPS proxy with API-key auth; added timeouts/retries and server-only secrets for a secure, reliable pipeline. Built a mobile-first UI with drag-and-drop uploads, guardrail category detection, and fallback for low-bandwidth devices.",
      techStack: ["Next.js", "TypeScript", "Node.js", "Azure Vision", "Ollama", "Tailwind", "Vercel"],
      thumbnail: dresserImg,
    },
    {
      title: "Lowlight Diffusion Restoration",
      period: "Dec 2025 - Present",
      demoLink: "",
      codeLink: "https://github.com/Deep-De-coder/lowlight_diffusion_restoration",
      summary: "It is a camera-style pipeline that restores dark, noisy photos into clean, brighter images while preserving sharp details. It builds on a diffusion img2img backbone fine-tuned with LoRA on LOL/SID, with optional edge-guided conditioning to reduce artifacts and keep structure intact. The project also includes benchmarking, performance-focused inference optimizations, and profiling tools so it is  engineered as a measurable system—not just a demo.",
      techStack: ["PyTorch", "Diffusers", "LoRA (PEFT)", "Stable Diffusion 2.1", "Accelerate", "CUDA", "PyTorch Profiler", "NVIDIA Nsight", "OpenCV"],
      thumbnail: lowlightdiffusionImg,
    },
    {
      title: "Efficient Multimodal LLM Agent",
      period: "Feb 2025 - May 2025",
      demoLink: "",
      codeLink: "https://github.com/Deep-De-coder/efficient-multimodal-healthcare-llm-agent",
      summary: "Built a multimodal assistant using RAG + vLLM to answer medical queries from radiology reports and X-rays, leveraging LLaMA-2, CLIP, and FAISS (50K embeddings) for semantic retrieval. Reduced LLM latency by 40% (920ms → 540ms) with FlashAttention + PagedAttention, sustaining 88% accuracy on a 100-sample clinical QA set. Fine-tuned LoRA adapters on 5K QA pairs using PyTorch Lightning + DeepSpeed, completing training in 6 hours on A100 GPUs.",
      techStack: ["Python", "vLLM", "FlashAttention", "RAG", "PyTorch", "FAISS", "LLaMA-2", "CLIP"],
      thumbnail: healthcareImg,
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
      title: "Transformers Deep Learning",
      period: "Feb 2024 - Apr 2024",
      demoLink: "",
      codeLink: "https://github.com/Deep-De-coder/Transformers_deeplearning",
      summary: "Developed a language translation system for English to French using the Europarl Parallel Corpus with over 1 million rows. Fine-tuned Google T5 and Facebook M2M-100 models, creating 20 custom Transformers with unique positional encodings. Achieved a METEOR score of 0.109 and explored BLEU and COMET metrics. Deployed on Gradio for real-time interaction.",
      techStack: ["PyTorch", "Google T5", "Facebook M2M-100", "Gradio"],
      thumbnail: transformersImg,
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
      demoLink: "https://doi.org/10.1007/978-981-99-3982-4_41",
      codeLink: "https://github.com/Deep-De-coder/Auto-Envision",
      summary: "Completed sales forecasting using ARIMA, LSTM, and FB Prophet. Led data cleaning for a dataset of 100,000+ rows. Conducting research under Dr. Chen Wang focusing on Gaussian Splatting for advanced rendering techniques. Developing methodologies to improve the efficiency and quality of rendering processes.",
      techStack: ["Python", "Google Colab", "Time Series Algorithm"],
      thumbnail: autoenvisionImg,
    },
    {
      title: "Music Fiesta - Recommendation System",
      period: "Sep 2021 - Apr 2022",
      demoLink: "https://ieeexplore.ieee.org/document/9936009",
      codeLink: "https://github.com/Deep-De-coder/Music-Recommendation",
      summary: "I built a full-stack Flask music recommendation app that ingests a genre-labeled dataset, extracts audio features, and serves real-time personalized suggestions using a hybrid of popularity, content-based, and SVD collaborative filtering models. It includes user auth, a SQLite/SQLAlchemy backend, a built-in web music player, search/filter UI, and deployment scaffolding (requirements.txt, Procfile), with organized folders for datasets, extracted features/notebooks, and model code for easy reproducibility.",
      techStack: ["Python", "Flask", "SQLite", "SQLAlchemy", "Popularity Filtering", "Content-Based Filtering", "SVD Collaborative Filtering"],
      thumbnail: musicfiesta,
    },
    {
      title: "Car Price EDA",
      period: "Sep 2022 - Nov 2022",
      demoLink: "", 
      codeLink: "https://github.com/Deep-De-coder/EDA-on-car-price-prediction", 
      summary: "Performed in-depth EDA on a car price dataset with 11,900 rows and 16 columns. Used Matplotlib and Seaborn for data visualization.",
      techStack: ["Pandas", "NumPy", "Google Colab"],
      thumbnail: carpriceedaImg,
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
    {
      title: "Coinee",
      period: "Oct 2024 - Jan 2025",
      demoLink: "https://play.google.com/store/apps/details?id=com.deepshahane.coines&hl=en_US", 
      codeLink: "", 
      summary: "Coinee is a privacy-safe Android app to browse 300+ coins from 15+ countries with crisp visuals and concise facts.\nOptimized for offline use with fast on-device search, category filters, and smooth Material UI—no sign-in, no tracking.\nBuilt as a lightweight, read-only viewer to showcase numismatic collections and inspire casual learning.",
      techStack: ["Android", "Kotlin", "Java", "Android SDK", "Material Components"],    
      thumbnail: coineeImg,
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
