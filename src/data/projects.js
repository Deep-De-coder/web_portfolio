// Canonical project data, single source of truth shared by
// v1 (src/components/Projects.js) and v2 (src/pages/v2/ProjectsSection.jsx).
//
// Field conventions:
// - `tagline` is the one-line statement of what the project is. It leads every
//   card, so it has to read on its own without the paragraph under it.
// - `summary` is the short intro paragraph that follows.
// - `techStack` is the full list (v1); `techHighlights` the condensed one (v2).
// - `thumbnail` is the shared image import; `featured` drives the v2 layout.
// - `hidden` retires an entry from both routes while keeping its record here.

import dresserImg from '../assets/projects/dresser.png';
import wardreamImg from '../assets/projects/wardream.png';
import agmImg from '../assets/projects/agentguardmemory.png';
import parsImg from '../assets/projects/parsfrontier.webp';
import lowlightdiffusionImg from '../assets/projects/lowlightdiffusion.png';
import healthcareImg from '../assets/projects/healthcare.png';
import roadextract from '../assets/projects/roadextract.png';
import transformersImg from '../assets/projects/transformersdeeplearning.png';
import novelchatbot from '../assets/projects/novelchatbot.png';
import gdp from '../assets/projects/gdp.png';
import autoenvisionImg from '../assets/projects/autoenvision.png';
import musicfiesta from '../assets/projects/musicfiesta.png';
import carpriceedaImg from '../assets/projects/carpriceeda.png';
import cubesImage from '../assets/projects/cubes.png';
import coineeImg from '../assets/projects/coinee.png';

export const projects = [
  {
    title: 'Dresser',
    demoLink: 'https://dresser-pi.vercel.app/',
    codeLink: '',
    tagline: 'An AI outfit recommender built around retrieval and evals.',
    summary:
      'CLIP top-3 accuracy moved from 73% to 96% and MRR from 0.690 to 0.905. A tagger regression that had dropped accuracy from 74% to 55% was caught and rebuilt to 89%, and weather rule violations went from 7.2% to 0%, backed by 551 tests.',
    techStack: ['Next.js', 'TypeScript', 'Node.js', 'Azure Vision', 'Ollama', 'Tailwind', 'Vercel'],
    techHighlights: ['Next.js', 'TypeScript', 'Azure Vision', 'Ollama', 'Vercel'],
    thumbnail: dresserImg,
    featured: true,
  },
  {
    title: 'WarDream',
    demoLink: '',
    codeLink: '',
    tagline: 'Learning battle tactics, and the instrumentation to tell a tactic from an exploit.',
    summary:
      'A turn-based tactics environment where units carry health, morale, tech tier and ammo as separate state, so a force breaks before it dies. A shared per-unit policy cloned from a hand-written doctrine beats its teacher 67.2% to 57.2% over 400 paired episodes, across four training seeds, using 40% fewer parameters than a monolithic net. Every run is fingerprinted against the reward constants and scored for action diversity, which is how a higher-scoring PPO run was caught as a corner-camping exploit and withdrawn rather than published.',
    techStack: ['Python', 'PyTorch', 'NumPy', 'CMA-ES', 'pygame', 'pytest', 'JavaScript', 'Canvas'],
    techHighlights: ['Python', 'PyTorch', 'NumPy', 'CMA-ES', 'pygame'],
    thumbnail: wardreamImg,
    featured: true,
  },
  {
    title: 'Agent Guard Memory',
    demoLink: 'https://pypi.org/project/agm-memory-mcp',
    demoLabel: 'PyPI',
    codeLink: '',
    tagline: 'An MCP memory server for AI agents, published on PyPI.',
    summary:
      'Every memory is stored with a content hash so storage integrity is verified rather than assumed, each agent carries a trust score, and violations are tracked as they happen. The immunology panel runs periodic DCA scans over agent behaviour, weighing danger signals such as reasoning break and write surge against safe ones such as corroboration rate and source diversity, then returns a verdict. An attacks console exercises that detection against forgery, poisoning, phantom-proxy, echo and sleeper agents.',
    techStack: ['MCP', 'Python'],
    techHighlights: ['MCP', 'Python'],
    thumbnail: agmImg,
    // Dark dashboard capture: skip the brightness damping meant for light UIs.
    darkThumbnail: true,
    thumbnailAlt:
      'The Agent Guard Memory dashboard: memory, agent and violation counts above an immunology control panel listing danger and safe signals with a SAFE verdict.',
    featured: true,
  },
  {
    title: 'PARS Frontier',
    demoLink: '',
    codeLink: 'https://github.com/deep-de-coder/pars-simulator',
    tagline: 'A survival colony and its daily reasoning, running in the browser.',
    summary:
      "With an AI coding assistant, I built a 3D survival-colony simulator where survivors start anywhere from a tsunami-struck coast to Mars with a deliberately flawed handbook. The engine knows the hidden truth; the colony's rule-based planner works mainly from its own beliefs, correcting them from experience. Without being told, most colonies in sandy places learned that foraging on sand yields about half what grass does. Keeping only the changes that paired games showed did no harm, four rounds of fixes raised year-end self-sufficiency from 69% to 82% of colonies across 240 games.",
    techStack: ['JavaScript', 'three.js'],
    techHighlights: ['JavaScript', 'three.js'],
    thumbnail: parsImg,
    // Mid-dark capture (mean luminance 82/255): the damping meant for bright
    // light-UI screenshots would crush it, same as the AGM dashboard.
    darkThumbnail: true,
    thumbnailAlt:
      "PARS Frontier in a browser on day 201 of the After the Wave scenario: a low-poly 3D colony with a river, crop fields, water wheels and log cabins, next to the Colony mind panel listing needs, stores, today's thinking and who does what.",
    featured: true,
  },
  {
    title: '2DGS SLAM (research)',
    demoLink: 'https://cse.buffalo.edu/tech-reports/2025-09.pdf',
    demoLabel: 'Tech report',
    codeLink: '',
    tagline: 'Real-time 3D reconstruction, 16x faster than a 3DGS baseline (39 vs 2.4 FPS).',
    summary:
      'A 2D Gaussian Splatting SLAM system with analytical SE(3) Jacobians and custom CUDA backward kernels, profiled with nsys and Nsight Compute. Written up as a University at Buffalo technical report.',
    techStack: ['C++', 'CUDA', 'Gaussian Splatting', 'SLAM'],
    techHighlights: ['C++', 'CUDA', 'Gaussian Splatting', 'SLAM'],
    featured: true,
  },
  {
    title: 'Lowlight Diffusion Restoration',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/lowlight_diffusion_restoration',
    tagline: 'A camera-style pipeline that restores dark, noisy photos.',
    summary:
      'Built on a diffusion img2img backbone fine-tuned with LoRA on LOL and SID, with optional edge-guided conditioning to reduce artifacts and keep structure intact. Benchmarking, inference optimizations and profiling tools are part of the project, so it is engineered as a measurable system rather than a demo.',
    techStack: ['PyTorch', 'Diffusers', 'LoRA (PEFT)', 'Stable Diffusion 2.1', 'Accelerate', 'CUDA', 'PyTorch Profiler', 'NVIDIA Nsight', 'OpenCV'],
    techHighlights: ['PyTorch', 'Diffusers', 'LoRA (PEFT)', 'Stable Diffusion 2.1', 'CUDA'],
    thumbnail: lowlightdiffusionImg,
    featured: false,
  },
  {
    title: 'Efficient Multimodal LLM Agent',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/efficient-multimodal-healthcare-llm-agent',
    tagline: 'A multimodal medical assistant for radiology reports and X-rays.',
    summary:
      'Uses RAG and vLLM with LLaMA-2, CLIP and FAISS over 50K embeddings for semantic retrieval. FlashAttention and PagedAttention cut LLM latency 40%, from 920ms to 540ms, while holding 88% accuracy on a 100-sample clinical QA set. LoRA adapters were fine-tuned on 5K QA pairs with PyTorch Lightning and DeepSpeed, training in 6 hours on A100 GPUs.',
    techStack: ['Python', 'vLLM', 'FlashAttention', 'RAG', 'PyTorch', 'FAISS', 'LLaMA-2', 'CLIP'],
    techHighlights: ['vLLM', 'FlashAttention', 'RAG', 'FAISS', 'LLaMA-2', 'CLIP'],
    thumbnail: healthcareImg,
    featured: false,
  },
  {
    title: 'Road Extraction From Satellite Images',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/road_extraction_using_satellite_images',
    tagline: 'Road segmentation from satellite imagery.',
    summary:
      'A fusion model combining ResNet50 and VGG with three preprocessing techniques, reaching 95.2% training and 95.3% validation accuracy on the Kaggle satellite road dataset. Edge detection in post-processing sharpens the result.',
    techStack: ['OpenCV', 'Google Colab', 'VGG', 'ResNet', 'UNet'],
    techHighlights: ['OpenCV', 'VGG', 'ResNet', 'UNet', 'Google Colab'],
    thumbnail: roadextract,
    featured: false,
  },
  {
    title: 'Transformers Deep Learning',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/Transformers_deeplearning',
    tagline: 'An English to French translation system.',
    summary:
      'Built on the Europarl parallel corpus of over a million rows, fine-tuning Google T5 and Facebook M2M-100 and creating 20 custom Transformers with unique positional encodings. Scored a METEOR of 0.109 alongside BLEU and COMET, and deployed on Gradio for real-time interaction.',
    techStack: ['PyTorch', 'Google T5', 'Facebook M2M-100', 'Gradio'],
    techHighlights: ['PyTorch', 'Google T5', 'Facebook M2M-100', 'Gradio'],
    thumbnail: transformersImg,
    featured: false,
  },
  {
    title: 'Novel Chatbot (RAG)',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/novel_chatbot_RAG',
    tagline: 'A chatbot that answers from 15 Gutenberg novels.',
    summary:
      'A Random Forest multi-label classifier with TF-IDF and OneVsRest routes between novel-specific and chitchat queries, while Hugging Face zero-shot models, BlenderBot and GPT-3.5 generate responses and TF-IDF cosine similarity retrieves context. Deployed on Google Cloud with mean response times of 1.48s for chitchat and 25s for summaries.',
    techStack: ['RAG', 'Random Forest', 'Hugging Face', 'OpenAI GPT-3.5', 'Google Cloud Platform'],
    techHighlights: ['RAG', 'Random Forest', 'Hugging Face', 'GPT-3.5', 'GCP'],
    thumbnail: novelchatbot,
    featured: false,
  },
  {
    title: 'GDP Prediction System',
    demoLink: 'https://gdp-prediction-app.onrender.com/',
    codeLink: 'https://github.com/Deep-De-coder/gdp_prediction',
    tagline: 'GDP forecasting from energy consumption data.',
    summary:
      'XGBoost and Linear Regression models forecast GDP trends from energy consumption and production data, with feature selection tuning accuracy. A Flask GUI serves real-time predictions.',
    techStack: ['XGBoost', 'Linear Regression', 'Flask', 'Python'],
    techHighlights: ['XGBoost', 'Linear Regression', 'Flask', 'Python'],
    thumbnail: gdp,
    featured: false,
  },
  {
    title: 'Auto Envision',
    demoLink: 'https://doi.org/10.1007/978-981-99-3982-4_41',
    codeLink: 'https://github.com/Deep-De-coder/Auto-Envision',
    tagline: 'Car sales forecasting, published at Springer.',
    summary:
      'Sales forecasting with ARIMA, LSTM and FB Prophet over a cleaned dataset of more than 100,000 rows.',
    techStack: ['Python', 'Google Colab', 'Time Series Algorithm'],
    techHighlights: ['Python', 'ARIMA', 'LSTM', 'FB Prophet'],
    thumbnail: autoenvisionImg,
    featured: false,
  },
  {
    title: 'Music Fiesta, Recommendation System',
    hidden: true,
    demoLink: 'https://ieeexplore.ieee.org/document/9936009',
    codeLink: 'https://github.com/Deep-De-coder/Music-Recommendation',
    tagline: 'A music recommendation app, published at IEEE.',
    summary:
      'A full-stack Flask app that ingests a genre-labeled dataset, extracts audio features and serves real-time suggestions from a hybrid of popularity, content-based and SVD collaborative filtering. Includes user auth, a SQLite and SQLAlchemy backend and a built-in web player.',
    techStack: ['Python', 'Flask', 'SQLite', 'SQLAlchemy', 'Popularity Filtering', 'Content-Based Filtering', 'SVD Collaborative Filtering'],
    techHighlights: ['Flask', 'SQLite', 'SVD Collaborative Filtering', 'TF-IDF'],
    thumbnail: musicfiesta,
    featured: false,
  },
  {
    title: 'Car Price EDA',
    hidden: true,
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/EDA-on-car-price-prediction',
    tagline: 'Exploratory analysis of a car price dataset.',
    summary:
      'In-depth EDA across 11,900 rows and 16 columns, visualised with Matplotlib and Seaborn.',
    techStack: ['Pandas', 'NumPy', 'Google Colab'],
    techHighlights: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
    thumbnail: carpriceedaImg,
    featured: false,
  },
  {
    title: 'Flying Cubes (AR)',
    hidden: true,
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/FLying_Cubes',
    tagline: 'An AR app for manipulating ascending cubes in real time.',
    summary: 'Built in Unity to demonstrate AR interaction in a mixed-reality scene.',
    techStack: ['AR', 'Unity', 'C#'],
    techHighlights: ['AR', 'Unity', 'C#', 'ARCore'],
    thumbnail: cubesImage,
    featured: false,
  },
  {
    title: 'Coinee',
    hidden: true,
    demoLink: 'https://play.google.com/store/apps/details?id=com.deepshahane.coines&hl=en_US',
    codeLink: '',
    tagline: 'A privacy-safe Android app for browsing world coins.',
    summary:
      'Covers 300+ coins from 15+ countries with fast on-device search, category filters and a Material UI, optimized for offline use with no sign-in and no tracking. Published on Google Play.',
    techStack: ['Android', 'Kotlin', 'Java', 'Android SDK', 'Material Components'],
    techHighlights: ['Android', 'Kotlin', 'Java', 'Material Components'],
    thumbnail: coineeImg,
    featured: false,
  },
];
