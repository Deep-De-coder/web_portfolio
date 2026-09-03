// Canonical experience data — single source of truth shared by
// v1 (src/components/Experience.js) and v2 (src/pages/v2/ExperienceSection.jsx).
//
// Field conventions:
// - `description` / `techStack` are the full versions (rendered by v1).
// - `shortDescription` is the condensed version (rendered by v2).
// - `techHighlights` (optional) is the condensed tech list for v2; when absent
//   the full `techStack` matches what v2 already rendered.
// - `logo` is the v1 image import; `color` is the v2 timeline accent.

import ubLogo from '../assets/Ub logo.jpg';
import vitLogo from '../assets/vit logo.png';
import bragrLogo from '../assets/bragr logo.jpg';
import captainCoolLogo from '../assets/captain cool logo.png';

export const experiences = [
  {
    title: 'AI Research Assistant',
    company: 'SAIR Lab at UB',
    period: 'Aug 2024 – Present',
    description: `Exploring simulation, automation, and intelligent robotics for real-world impact. Achieved 16× speedup in drone 3D reconstruction by integrating 2D Gaussian Splatting into GPU-accelerated SLAM over video frame sequences, customizing a C++/CUDA surfel rasterizer for real-time aerial mapping. Researching NVIDIA Isaac Lab and developing humanoid robots with vision-language models (VLMs) like InstructBLIP2, Florence, etc., using PyTorch and RL for multimodal perception and decision-making.`,
    shortDescription:
      'Achieved 16× speedup in drone 3D reconstruction by integrating 2D Gaussian Splatting into GPU-accelerated SLAM over video frame sequences, customizing a C++/CUDA surfel rasterizer for real-time aerial mapping. Researching NVIDIA Isaac Lab and developing humanoid robots with vision-language models (VLMs) like InstructBLIP2 and Florence using PyTorch and RL for multimodal perception and decision-making.',
    techStack: ['Python', 'C++', 'CUDA', 'PyTorch', 'Gaussian Splatting', 'SLAM', 'Computer Vision', 'Robotics'],
    logo: ubLogo,
    color: '#6366f1',
  },
  {
    title: 'AI Engineer',
    company: 'Bragr',
    period: 'Aug 2024 – Jan 2025',
    description: `Startup developing AI chat solutions for live sports conversations. Architected and deployed a FastAPI + Azure OpenAI (RAG) backend, worked on the data pipeline and iterating prompt templates and system messages and retrieval thresholds, cutting response time 66% and improving answer quality. Built an async web scraping and semantic search pipeline using Python, aiohttp, and MongoDB, supporting 10+ concurrent users. Collaborated with frontend engineers on a microservices chat system, optimizing backend performance and deployment on Azure.`,
    shortDescription:
      'Architected and deployed a FastAPI + Azure OpenAI (RAG) backend for a live sports AI chat startup, cutting response time 66% and improving answer quality. Built an async web scraping and semantic search pipeline using Python, aiohttp, and MongoDB, supporting 10+ concurrent users.',
    techStack: ['Python', 'FastAPI', 'Azure OpenAI', 'MongoDB', 'aiohttp', 'RAG', 'Microservices'],
    logo: bragrLogo,
    color: '#22d3ee',
  },
  {
    title: 'ML Intern',
    company: 'Captain Cool',
    period: 'Dec 2021 – Feb 2023',
    description: `Consumer brand producing packaged ice creams for diverse markets. Built a full-stack Python + Flask + PostgreSQL web platform for order and inventory management, handling 1K+ daily transactions. Developed time-series demand forecasting models using PyTorch and scikit-learn, improving stock prediction accuracy by 18%. Implemented automated data pipelines for real-time syncing between POS systems and the central database.`,
    shortDescription:
      'Built a full-stack Python + Flask + PostgreSQL platform for order and inventory management handling 1K+ daily transactions. Developed time-series demand forecasting models using PyTorch and scikit-learn, improving stock prediction accuracy by 18%.',
    techStack: ['Python', 'Flask', 'PostgreSQL', 'PyTorch', 'scikit-learn', 'Time Series', 'Data Pipelines'],
    techHighlights: ['Python', 'Flask', 'PostgreSQL', 'PyTorch', 'scikit-learn', 'Time Series'],
    logo: captainCoolLogo,
    color: '#f59e0b',
  },
  {
    title: 'ML Intern',
    company: 'VIT',
    period: 'Jun 2021 – Aug 2021',
    description: `Autonomous institution offering cutting-edge engineering and technology programs. Launched an internship portal with a recommendation system using TF-IDF and cosine similarity, improving match relevance by 25% and reducing manual effort. Built a Flask + PostgreSQL backend with SQLAlchemy, integrating scraped Internshala data into a normalized 400+ entry database. Deployed on Azure with Q&A Maker, Blob, Maps, and Speech-to-Text to enhance accessibility and interaction.`,
    shortDescription:
      'Launched an internship portal with a TF-IDF + cosine similarity recommendation system, improving match relevance by 25%. Built a Flask + PostgreSQL backend with SQLAlchemy, integrating scraped Internshala data. Deployed on Azure with Q&A Maker, Blob, Maps, and Speech-to-Text.',
    techStack: ['Python', 'Flask', 'PostgreSQL', 'SQLAlchemy', 'TF-IDF', 'Azure', 'Recommendation Systems'],
    techHighlights: ['Python', 'Flask', 'PostgreSQL', 'SQLAlchemy', 'TF-IDF', 'Azure'],
    logo: vitLogo,
    color: '#10b981',
  },
];
