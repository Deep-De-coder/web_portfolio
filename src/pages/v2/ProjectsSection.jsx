import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import dresserImg from '../../assets/projects/dresser.png';
import lowlightImg from '../../assets/projects/lowlightdiffusion.png';
import healthcareImg from '../../assets/projects/healthcare.png';
import roadImg from '../../assets/projects/roadextract.png';
import transformersImg from '../../assets/projects/transformersdeeplearning.png';
import novelImg from '../../assets/projects/novelchatbot.png';
import gdpImg from '../../assets/projects/gdp.png';
import autoImg from '../../assets/projects/autoenvision.png';
import musicImg from '../../assets/projects/musicfiesta.png';
import carpImg from '../../assets/projects/carpriceeda.png';
import cubesImg from '../../assets/projects/cubes.png';
import coineeImg from '../../assets/projects/coinee.png';

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
  {
    title: 'Dresser Smart Wardrobe App',
    period: 'Jun 2025 – Aug 2025',
    summary: 'Production-ready wardrobe app with AI outfit suggestions and real-time photo analysis. Next.js 14, Azure Vision, and a private Ollama LLM via Fly.io HTTPS proxy with API-key auth.',
    tech: ['Next.js', 'TypeScript', 'Azure Vision', 'Ollama', 'Vercel'],
    demo: 'https://dresser-pi.vercel.app/',
    code: '',
    img: dresserImg,
    featured: true,
  },
  {
    title: 'Lowlight Diffusion Restoration',
    period: 'Dec 2025 – Present',
    summary: 'Camera-style pipeline restoring dark/noisy photos using diffusion img2img fine-tuned with LoRA on LOL/SID. Includes benchmarking, inference optimizations, and profiling tools.',
    tech: ['PyTorch', 'Diffusers', 'LoRA (PEFT)', 'Stable Diffusion 2.1', 'CUDA'],
    demo: '',
    code: 'https://github.com/Deep-De-coder/lowlight_diffusion_restoration',
    img: lowlightImg,
    featured: true,
  },
  {
    title: 'Efficient Multimodal LLM Agent',
    period: 'Feb 2025 – May 2025',
    summary: 'Multimodal medical assistant using RAG + vLLM for radiology reports and X-rays. Reduced LLM latency 40% (920ms→540ms) with FlashAttention + PagedAttention; 88% accuracy on clinical QA.',
    tech: ['vLLM', 'FlashAttention', 'RAG', 'FAISS', 'LLaMA-2', 'CLIP'],
    demo: '',
    code: 'https://github.com/Deep-De-coder/efficient-multimodal-healthcare-llm-agent',
    img: healthcareImg,
    featured: true,
  },
  {
    title: 'Road Extraction From Satellite Images',
    period: 'Sep 2023 – Nov 2023',
    summary: 'Fusion model combining ResNet50 and VGG with advanced preprocessing, achieving 95.3% validation accuracy. Post-processing via Edge Detection for enhanced output quality.',
    tech: ['OpenCV', 'VGG', 'ResNet', 'UNet', 'Google Colab'],
    demo: '',
    code: 'https://github.com/Deep-De-coder/road_extraction_using_satellite_images',
    img: roadImg,
    featured: false,
  },
  {
    title: 'Transformers Deep Learning',
    period: 'Feb 2024 – Apr 2024',
    summary: 'English→French translation system on 1M+ row Europarl corpus. 20 custom Transformers with unique positional encodings; deployed on Gradio for real-time interaction.',
    tech: ['PyTorch', 'Google T5', 'Facebook M2M-100', 'Gradio'],
    demo: '',
    code: 'https://github.com/Deep-De-coder/Transformers_deeplearning',
    img: transformersImg,
    featured: false,
  },
  {
    title: 'Novel Chatbot (RAG)',
    period: 'Oct 2023 – Nov 2023',
    summary: 'Flask chatbot trained on 15 Gutenberg novels. Random Forest classifier routes queries; integrates BlenderBot, GPT-3.5, and TF-IDF cosine similarity for context retrieval. Deployed on GCP.',
    tech: ['RAG', 'Random Forest', 'Hugging Face', 'GPT-3.5', 'GCP'],
    demo: '',
    code: 'https://github.com/Deep-De-coder/novel_chatbot_RAG',
    img: novelImg,
    featured: false,
  },
  {
    title: 'GDP Prediction System',
    period: 'Feb 2024 – Apr 2024',
    summary: 'XGBoost + Linear Regression GDP forecasting from energy consumption data. Flask GUI for real-time predictions with feature selection optimization.',
    tech: ['XGBoost', 'Linear Regression', 'Flask', 'Python'],
    demo: 'https://gdp-prediction-app.onrender.com/',
    code: 'https://github.com/Deep-De-coder/gdp_prediction',
    img: gdpImg,
    featured: false,
  },
  {
    title: 'Auto Envision',
    period: 'Sep 2022 – Apr 2023',
    summary: 'Sales forecasting using ARIMA, LSTM, and FB Prophet on 100K+ rows. Published research on Gaussian Splatting for advanced rendering at Springer.',
    tech: ['Python', 'ARIMA', 'LSTM', 'FB Prophet'],
    demo: 'https://doi.org/10.1007/978-981-99-3982-4_41',
    code: 'https://github.com/Deep-De-coder/Auto-Envision',
    img: autoImg,
    featured: false,
  },
  {
    title: 'Music Fiesta — Recommendation System',
    period: 'Sep 2021 – Apr 2022',
    summary: 'Full-stack Flask music recommendation app with popularity, content-based, and SVD collaborative filtering. Published at IEEE; includes user auth, SQLite, built-in player.',
    tech: ['Flask', 'SQLite', 'SVD Collaborative Filtering', 'TF-IDF'],
    demo: 'https://ieeexplore.ieee.org/document/9936009',
    code: 'https://github.com/Deep-De-coder/Music-Recommendation',
    img: musicImg,
    featured: false,
  },
  {
    title: 'Car Price EDA',
    period: 'Sep 2022 – Nov 2022',
    summary: 'In-depth EDA on 11,900-row car price dataset with 16 features. Comprehensive Matplotlib/Seaborn visualizations and statistical analysis.',
    tech: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
    demo: '',
    code: 'https://github.com/Deep-De-coder/EDA-on-car-price-prediction',
    img: carpImg,
    featured: false,
  },
  {
    title: 'Flying Cubes (AR)',
    period: 'Oct 2022 – Jan 2023',
    summary: 'AR application enabling real-time manipulation of ascending cubes. Demonstrates Unity + ARCore proficiency for interactive mixed-reality experiences.',
    tech: ['AR', 'Unity', 'C#', 'ARCore'],
    demo: '',
    code: 'https://github.com/Deep-De-coder/FLying_Cubes',
    img: cubesImg,
    featured: false,
  },
  {
    title: 'Coinee',
    period: 'Oct 2024 – Jan 2025',
    summary: 'Privacy-safe Android app browsing 300+ coins from 15+ countries. Optimized for offline use with fast on-device search and Material UI. On Google Play.',
    tech: ['Android', 'Kotlin', 'Java', 'Material Components'],
    demo: 'https://play.google.com/store/apps/details?id=com.deepshahane.coines&hl=en_US',
    code: '',
    img: coineeImg,
    featured: false,
  },
];

function ProjectCard({ project, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="proj-card rounded-2xl overflow-hidden cursor-pointer"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}
      whileHover={{ borderColor: 'rgba(99,102,241,0.35)', boxShadow: '0 0 28px rgba(99,102,241,0.12)' }}
      transition={{ duration: 0.2 }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="relative overflow-hidden" style={{ height: project.featured ? '200px' : '160px' }}>
        <img
          src={project.img}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: expanded ? 'scale(1.04)' : 'scale(1)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(5,5,10,0.85) 100%)' }}
        />
        {/* Links overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="px-2.5 py-1 rounded-lg font-dm text-[10px] font-medium text-white cursor-pointer transition-opacity duration-150 hover:opacity-80"
              style={{ background: 'rgba(99,102,241,0.8)', backdropFilter: 'blur(8px)' }}
            >
              Demo
            </a>
          )}
          {project.code && (
            <a
              href={project.code}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="px-2.5 py-1 rounded-lg font-dm text-[10px] font-medium text-white cursor-pointer transition-opacity duration-150 hover:opacity-80"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Code
            </a>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-grotesk font-semibold text-white mb-1 leading-snug" style={{ fontSize: '0.95rem' }}>
          {project.title}
        </h3>
        <p className="font-dm text-[11px] text-slate-600 mb-2">{project.period}</p>
        <p className="font-dm text-sm text-slate-400 leading-relaxed mb-3" style={{ fontSize: '0.82rem' }}>
          {expanded ? project.summary : `${project.summary.slice(0, 100)}...`}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, expanded ? undefined : 3).map(t => (
            <span
              key={t}
              className="font-dm text-[10px] px-2 py-1 rounded-full"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', background: 'rgba(255,255,255,0.03)' }}
            >
              {t}
            </span>
          ))}
          {!expanded && project.tech.length > 3 && (
            <span className="font-dm text-[10px] px-2 py-1 text-slate-600">+{project.tech.length - 3} more</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    gsap.set('.proj-card', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.proj-card', {
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }),
      start: 'top 88%',
    });
  }, { scope: sectionRef });

  const featured = PROJECTS.filter(p => p.featured);
  const rest = PROJECTS.filter(p => !p.featured);

  return (
    <section id="projects" ref={sectionRef} className="py-24 px-6" style={{ background: '#07070f' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">02</span>
            <div className="w-6 h-px bg-slate-700" />
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">Work</span>
          </div>
          <h2
            className="font-grotesk font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', letterSpacing: '-0.022em' }}
          >
            Projects
          </h2>
          <p className="font-dm text-slate-500 mt-3 max-w-lg" style={{ fontSize: '1rem' }}>
            12 projects spanning computer vision, LLMs, full-stack, and mobile.
          </p>
        </motion.div>

        {/* Featured row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {featured.map((p, i) => <ProjectCard key={p.title} project={p} index={i} />)}
        </div>

        {/* Rest grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((p, i) => <ProjectCard key={p.title} project={p} index={i + 3} />)}
        </div>
      </div>
    </section>
  );
}
