// Canonical experience data, single source of truth shared by
// v1 (src/components/Experience.js) and v2 (src/pages/v2/ExperienceSection.jsx).
//
// Field conventions:
// - `summary` is the one-line context for the role.
// - `highlights` are the result-first bullets both routes render.
// - `techStack` is the full list (v1); `techHighlights` the condensed one (v2).
// - `logo` is optional; companies without an asset fall back to a lettermark.
// - `link` is an optional labelled reference rendered under the bullets.
// - `color` is the per-role accent used by the v2 timeline node.

import ubLogo from '../assets/Ub logo.jpg';
import bragrLogo from '../assets/bragr logo.jpg';

export const experiences = [
  {
    title: 'Founding Engineer',
    company: 'NILA Solutions Inc.',
    period: 'May 2026 to Present',
    location: 'Remote',
    summary:
      'Building an AI-native tax platform that automates how CPA firms onboard clients, collect documents and prepare returns. Live with real CPA firms.',
    highlights: [
      'Own the full stack end to end: frontend, backend, AI infrastructure and multi-tenant SaaS with row-level security across 25 tables',
      'Built agentic document intelligence: rule-based parsers plus a 5-check validator that catches errors as small as a $15 taxable income',
      'Built an offline eval harness of 555 tests over 34 real documents, pinning 152 known failures so regressions never reach customers',
      'Caught a provider relabeling a 1098 as a 1099-INT with blank amounts, and added a reconciliation check that reroutes it',
      'Nothing exports until a CPA approves it, with confidence scores and the source highlighted on the original PDF',
      'Improved agent accuracy 22% and cut latency from 4.5s to 900ms through Claude model routing (Haiku per turn, Sonnet for recovery) at under 1 cent per turn',
      'Hybrid RAG with Voyage embeddings, pgvector and reciprocal rank fusion, hardened against 39 prompt-injection tests',
    ],
    techStack: ['Python', 'FastAPI', 'Next.js', 'TypeScript', 'PostgreSQL', 'pgvector', 'Docker', 'Anthropic Claude', 'Voyage'],
    techHighlights: ['Python', 'FastAPI', 'Next.js', 'PostgreSQL', 'pgvector', 'Anthropic Claude'],
    color: '#8b5cf6',
  },
  {
    title: 'Research Assistant',
    company: 'SAIR Lab, University at Buffalo',
    period: 'Aug 2024 to Present',
    location: 'Hybrid',
    summary: 'Research on real-time 3D reconstruction and vision-language models for robotics.',
    highlights: [
      'Built a 2D Gaussian Splatting SLAM system, 16x faster than a 3DGS baseline (39 vs 2.4 FPS), with analytical SE(3) Jacobians and custom CUDA backward kernels, profiled with nsys and Nsight Compute',
      'Prototyped VLM inference with Florence and InstructBLIP2 for instruction grounding in embodied AI',
      'Curating 5.2TB+ of multimodal data for LoRA fine-tuning across 8 GPUs, served with vLLM and TensorRT-LLM at 2.4x throughput and 38% less memory',
      'Built calibration, auto-labeling and benchmarking tools (ATE, PSNR, SSIM, LPIPS) that PhD researchers adopted',
    ],
    link: { label: 'Tech report', href: 'https://cse.buffalo.edu/tech-reports/2025-09.pdf' },
    techStack: ['C++', 'CUDA', 'Python', 'vLLM', 'TensorRT-LLM', 'LoRA', 'Florence', 'InstructBLIP2'],
    techHighlights: ['C++', 'CUDA', 'Python', 'vLLM', 'TensorRT-LLM', 'LoRA'],
    logo: ubLogo,
    color: '#6366f1',
  },
  {
    title: 'AI Engineer',
    company: 'Niti Pharma',
    period: 'May 2025 to Apr 2026',
    location: 'Remote',
    summary:
      "Sole engineer behind the company's first AI platform, automating pharma order and document operations.",
    highlights: [
      'Cut daily manual work from 8 hours to under 2 with production multi-agent pipelines',
      'Handles 500+ orders and 1,000+ documents with automated reconciliation and async workers with retries and dead-letter handling',
      'Cut error rate from 20% to 4% by evaluating 12 AI configurations with structured observability before launch',
      'Worked with 6 stakeholders across operations and finance',
    ],
    techStack: ['Python', 'LangGraph', 'MCP', 'Anthropic Claude'],
    techHighlights: ['Python', 'LangGraph', 'MCP', 'Anthropic Claude'],
    color: '#10b981',
  },
  {
    title: 'AI Engineer',
    company: 'Bragr',
    period: 'Aug 2024 to Jan 2025',
    summary: 'Startup developing AI chat solutions for live sports conversations.',
    highlights: [
      'Cut response latency from 30s to 10s',
      'Set up monitoring and tracing from scratch and built a reusable eval and monitoring service',
      'Implemented role-based access control (RBAC)',
    ],
    techStack: ['Python', 'FastAPI', 'Azure OpenAI', 'MongoDB', 'aiohttp', 'RAG', 'Microservices'],
    techHighlights: ['Python', 'FastAPI', 'Azure OpenAI', 'MongoDB', 'RAG'],
    logo: bragrLogo,
    color: '#22d3ee',
  },
  {
    title: 'Software Engineer',
    company: 'Niti Pharma',
    period: 'Dec 2021 to Feb 2023',
    summary: 'Forecasting, data pipelines and operations tooling for pharma distribution.',
    highlights: [
      'Improved demand forecasting 18% across 10,000+ SKUs, tracked with MLflow',
      'Built Airflow pipelines with retries and recovery',
      'Shipped OCR over 4,000+ documents, cutting manual entry 70%',
      'Built operations dashboards used across 10+ regions',
    ],
    techStack: ['Python', 'MLflow', 'Airflow', 'OCR'],
    techHighlights: ['Python', 'MLflow', 'Airflow', 'OCR'],
    color: '#f59e0b',
  },
];
