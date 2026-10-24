// Canonical project data, single source of truth shared by
// v1 (src/components/Projects.js) and v2 (src/pages/v2/ProjectsSection.jsx).
//
// Field conventions:
// - `summary` / `techStack` are the full versions (rendered by v1).
// - `shortSummary` / `techHighlights` are the condensed versions (rendered by v2).
// - `thumbnail` is the shared image import; `featured` drives the v2 layout.

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
    period: 'Jun 2025 to Aug 2025',
    demoLink: 'https://dresser-pi.vercel.app/',
    codeLink: '',
    summary: 'AI outfit recommender with retrieval and evals.',
    shortSummary: 'AI outfit recommender with retrieval and evals.',
    highlights: [
      'CLIP top-3 accuracy 73% to 96%, MRR 0.690 to 0.905',
      'Caught a tagger regression (74% to 55%) and rebuilt it to 89%',
      'Weather rule violations 7.2% to 0%, backed by 551 tests',
    ],
    techStack: ['Next.js', 'TypeScript', 'Node.js', 'Azure Vision', 'Ollama', 'Tailwind', 'Vercel'],
    techHighlights: ['Next.js', 'TypeScript', 'Azure Vision', 'Ollama', 'Vercel'],
    thumbnail: dresserImg,
    featured: true,
  },
  {
    title: 'WarDream',
    demoLink: '',
    codeLink: '',
    summary:
      "WarDream is a turn-based tactics environment and the experiment harness around it, built to test whether a neural policy learns tactics or just finds a hole in the reward. Units carry health, morale, tech tier and ammo as separate state, so a force breaks before it dies and local numerical superiority matters more than global parity. A shared per-unit network (one set of weights applied to each unit's own egocentric view, so it runs at any army size) is trained by behaviour cloning on a hand-written doctrine and ends up beating its teacher: 67.2% win rate against the doctrine's 57.2% over 400 paired episodes, reproduced across four training seeds (p < 0.01, paired bootstrap), using 40% fewer parameters than a monolithic baseline that scores 6 points lower. Every run is fingerprinted against the environment's reward constants and scored for action diversity, which is how a 75.5% PPO result was identified as a corner-camping exploit (92% of its moves on one action) and withdrawn rather than published.",
    shortSummary:
      'A multi-attribute tactics environment: health, morale, tech and terrain, not one health bar, plus the harness that decides whether a result is real. A shared per-unit policy cloned from a hand-written doctrine beats its teacher 67.2% to 57.2% over 400 paired episodes with 40% fewer parameters than a monolithic net; a higher-scoring PPO run was caught as a reward exploit and withdrawn.',
    highlights: [
      "67.2% win rate against the doctrine's 57.2% over 400 paired episodes, reproduced across four training seeds (p < 0.01, paired bootstrap)",
      '40% fewer parameters than a monolithic baseline that scores 6 points lower',
      'Every run is fingerprinted against the reward constants and scored for action diversity, which caught a higher-scoring PPO run as a corner-camping exploit and got it withdrawn',
    ],
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
    summary:
      'Agent Guard Memory is an MCP memory server for AI agents, published on PyPI. Every memory is stored with a content hash so storage integrity can be verified rather than assumed, each agent carries a trust score, and violations are tracked as they happen. A graph view shows how memories and agents relate, rules govern what gets accepted, and a quorum check reports how many agents fully agree. The immunology panel runs periodic DCA scans over agent behaviour, weighing danger signals such as reasoning break, write surge, source collapse, trust cliff cluster and retrieval anomaly against safe ones such as consistent reasoning, low write velocity, source diversity and corroboration rate, then returns a verdict on the current state. An attacks console exercises that detection against adversarial agents covering forgery, poisoning, phantom proxies, echo and sleeper behaviour.',
    shortSummary:
      'An MCP memory server for AI agents, published on PyPI. Every memory carries a content hash for integrity, every agent carries a trust score, and violations are tracked as they happen. Periodic DCA scans weigh danger signals against safe ones and return a verdict on current agent behaviour.',
    highlights: [
      'Every memory stored with a content hash, so storage integrity is verified rather than assumed',
      'Per-agent trust scoring with violation tracking and a quorum check across agents',
      'Periodic DCA scans weigh danger signals (reasoning break, write surge, source collapse) against safe ones (corroboration rate, source diversity) and return a verdict',
      'An attacks console exercises detection against forgery, poisoning, phantom-proxy, echo and sleeper agents',
    ],
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
    summary:
      "With an AI coding assistant, I designed and built PARS Frontier, a browser-based 3D survival-colony simulator (JavaScript, three.js). Survivors start anywhere from a tsunami-struck coast to Mars with a deliberately flawed handbook. The engine knows the hidden truth; the colony's rule-based planner works mainly from its own beliefs, correcting them from experience. The Colony mind panel shows each day's needs, options and assignments. Without being told, most colonies in sandy places learned that foraging on sand yields about half as much as on grass. I kept a change only if paired games (the same random world with and without it) showed no harm. Across 240 fresh paired games in all scenarios, my first four rounds of fixes raised year-end self-sufficiency from 69% to 82% of colonies, mostly on Mars.",
    shortSummary:
      "A browser-based 3D survival-colony simulator where survivors start anywhere from a tsunami-struck coast to Mars with a deliberately flawed handbook. The engine knows the hidden truth; the colony's planner works mainly from its own beliefs and corrects them from experience.",
    highlights: [
      'Year-end self-sufficiency rose from 69% to 82% of colonies across 240 fresh paired games, mostly on Mars',
      'A change was kept only if paired games, the same random world with and without it, showed no harm',
      'Without being told, most colonies in sandy places learned that foraging on sand yields about half what grass does',
    ],
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
    summary: 'Real-time 3D reconstruction, 16x faster than a 3DGS baseline (39 vs 2.4 FPS).',
    shortSummary: 'Real-time 3D reconstruction, 16x faster than a 3DGS baseline (39 vs 2.4 FPS).',
    techStack: ['C++', 'CUDA', 'Gaussian Splatting', 'SLAM'],
    techHighlights: ['C++', 'CUDA', 'Gaussian Splatting', 'SLAM'],
    featured: true,
  },
  {
    title: 'Lowlight Diffusion Restoration',
    period: 'Dec 2025 to Present',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/lowlight_diffusion_restoration',
    summary:
      'It is a camera-style pipeline that restores dark, noisy photos into clean, brighter images while preserving sharp details. It builds on a diffusion img2img backbone fine-tuned with LoRA on LOL/SID, with optional edge-guided conditioning to reduce artifacts and keep structure intact. The project also includes benchmarking, performance-focused inference optimizations, and profiling tools so it is engineered as a measurable system, not just a demo.',
    shortSummary:
      'Camera-style pipeline restoring dark/noisy photos using diffusion img2img fine-tuned with LoRA on LOL/SID. Includes benchmarking, inference optimizations, and profiling tools.',
    techStack: ['PyTorch', 'Diffusers', 'LoRA (PEFT)', 'Stable Diffusion 2.1', 'Accelerate', 'CUDA', 'PyTorch Profiler', 'NVIDIA Nsight', 'OpenCV'],
    techHighlights: ['PyTorch', 'Diffusers', 'LoRA (PEFT)', 'Stable Diffusion 2.1', 'CUDA'],
    thumbnail: lowlightdiffusionImg,
    featured: false,
  },
  {
    title: 'Efficient Multimodal LLM Agent',
    period: 'Feb 2025 to May 2025',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/efficient-multimodal-healthcare-llm-agent',
    summary:
      'Built a multimodal assistant using RAG + vLLM to answer medical queries from radiology reports and X-rays, leveraging LLaMA-2, CLIP, and FAISS (50K embeddings) for semantic retrieval. Reduced LLM latency by 40% (920ms → 540ms) with FlashAttention + PagedAttention, sustaining 88% accuracy on a 100-sample clinical QA set. Fine-tuned LoRA adapters on 5K QA pairs using PyTorch Lightning + DeepSpeed, completing training in 6 hours on A100 GPUs.',
    shortSummary:
      'Multimodal medical assistant using RAG + vLLM for radiology reports and X-rays. Reduced LLM latency 40% (920ms→540ms) with FlashAttention + PagedAttention; 88% accuracy on clinical QA.',
    techStack: ['Python', 'vLLM', 'FlashAttention', 'RAG', 'PyTorch', 'FAISS', 'LLaMA-2', 'CLIP'],
    techHighlights: ['vLLM', 'FlashAttention', 'RAG', 'FAISS', 'LLaMA-2', 'CLIP'],
    thumbnail: healthcareImg,
    featured: false,
  },
  {
    title: 'Road Extraction From Satellite Images',
    period: 'Sep 2023 to Nov 2023',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/road_extraction_using_satellite_images',
    summary:
      'Applied advanced preprocessing techniques to refine the Kaggle Satellite Road images dataset. Engineered a fusion model combining ResNet50 and VGG with three preprocessing techniques, achieving 95.2% training and 95.3% validation accuracy. Merged post-processing techniques such as Edge Detection to enhance output accuracy.',
    shortSummary:
      'Fusion model combining ResNet50 and VGG with advanced preprocessing, achieving 95.3% validation accuracy. Post-processing via Edge Detection for enhanced output quality.',
    techStack: ['OpenCV', 'Google Colab', 'VGG', 'ResNet', 'UNet'],
    techHighlights: ['OpenCV', 'VGG', 'ResNet', 'UNet', 'Google Colab'],
    thumbnail: roadextract,
    featured: false,
  },
  {
    title: 'Transformers Deep Learning',
    period: 'Feb 2024 to Apr 2024',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/Transformers_deeplearning',
    summary:
      'Developed a language translation system for English to French using the Europarl Parallel Corpus with over 1 million rows. Fine-tuned Google T5 and Facebook M2M-100 models, creating 20 custom Transformers with unique positional encodings. Achieved a METEOR score of 0.109 and explored BLEU and COMET metrics. Deployed on Gradio for real-time interaction.',
    shortSummary:
      'English→French translation system on 1M+ row Europarl corpus. 20 custom Transformers with unique positional encodings; deployed on Gradio for real-time interaction.',
    techStack: ['PyTorch', 'Google T5', 'Facebook M2M-100', 'Gradio'],
    techHighlights: ['PyTorch', 'Google T5', 'Facebook M2M-100', 'Gradio'],
    thumbnail: transformersImg,
    featured: false,
  },
  {
    title: 'Novel Chatbot (RAG)',
    period: 'Oct 2023 to Nov 2023',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/novel_chatbot_RAG',
    summary:
      'Developed a full-stack Flask chatbot using 15 Gutenberg novels, supporting both novel-specific and chitchat queries via a Random Forest multi-label classifier with TF-IDF and OneVsRest. Integrated Hugging Face zero-shot models, BlenderBot, and OpenAI GPT-3.5 for dynamic responses, with TF-IDF-based cosine similarity for context retrieval. Deployed on Google Cloud Platform, achieving mean response times of 1.48s (chitchat) and 25s (summaries), with real-time dashboards for performance metrics and session handling.',
    shortSummary:
      'Flask chatbot trained on 15 Gutenberg novels. Random Forest classifier routes queries; integrates BlenderBot, GPT-3.5, and TF-IDF cosine similarity for context retrieval. Deployed on GCP.',
    techStack: ['RAG', 'Random Forest', 'Hugging Face', 'OpenAI GPT-3.5', 'Google Cloud Platform'],
    techHighlights: ['RAG', 'Random Forest', 'Hugging Face', 'GPT-3.5', 'GCP'],
    thumbnail: novelchatbot,
    featured: false,
  },
  {
    title: 'GDP Prediction System',
    period: 'Feb 2024 to Apr 2024',
    demoLink: 'https://gdp-prediction-app.onrender.com/',
    codeLink: 'https://github.com/Deep-De-coder/gdp_prediction',
    summary:
      'Developed a GDP prediction system leveraging XGBoost and Linear Regression models. Used energy consumption and production data to forecast GDP trends. Implemented feature selection techniques to optimize model accuracy. Designed a user-friendly Flask-based GUI for real-time predictions.',
    shortSummary:
      'XGBoost + Linear Regression GDP forecasting from energy consumption data. Flask GUI for real-time predictions with feature selection optimization.',
    techStack: ['XGBoost', 'Linear Regression', 'Flask', 'Python'],
    techHighlights: ['XGBoost', 'Linear Regression', 'Flask', 'Python'],
    thumbnail: gdp,
    featured: false,
  },
  {
    title: 'Auto Envision',
    period: 'Sep 2022 to Apr 2023',
    demoLink: 'https://doi.org/10.1007/978-981-99-3982-4_41',
    codeLink: 'https://github.com/Deep-De-coder/Auto-Envision',
    summary:
      'Completed sales forecasting using ARIMA, LSTM, and FB Prophet. Led data cleaning for a dataset of 100,000+ rows. Conducting research under Dr. Chen Wang focusing on Gaussian Splatting for advanced rendering techniques. Developing methodologies to improve the efficiency and quality of rendering processes.',
    shortSummary:
      'Sales forecasting using ARIMA, LSTM, and FB Prophet on 100K+ rows. Published research on Gaussian Splatting for advanced rendering at Springer.',
    techStack: ['Python', 'Google Colab', 'Time Series Algorithm'],
    techHighlights: ['Python', 'ARIMA', 'LSTM', 'FB Prophet'],
    thumbnail: autoenvisionImg,
    featured: false,
  },
  {
    title: 'Music Fiesta, Recommendation System',
    hidden: true,
    period: 'Sep 2021 to Apr 2022',
    demoLink: 'https://ieeexplore.ieee.org/document/9936009',
    codeLink: 'https://github.com/Deep-De-coder/Music-Recommendation',
    summary:
      'I built a full-stack Flask music recommendation app that ingests a genre-labeled dataset, extracts audio features, and serves real-time personalized suggestions using a hybrid of popularity, content-based, and SVD collaborative filtering models. It includes user auth, a SQLite/SQLAlchemy backend, a built-in web music player, search/filter UI, and deployment scaffolding (requirements.txt, Procfile), with organized folders for datasets, extracted features/notebooks, and model code for easy reproducibility.',
    shortSummary:
      'Full-stack Flask music recommendation app with popularity, content-based, and SVD collaborative filtering. Published at IEEE; includes user auth, SQLite, built-in player.',
    techStack: ['Python', 'Flask', 'SQLite', 'SQLAlchemy', 'Popularity Filtering', 'Content-Based Filtering', 'SVD Collaborative Filtering'],
    techHighlights: ['Flask', 'SQLite', 'SVD Collaborative Filtering', 'TF-IDF'],
    thumbnail: musicfiesta,
    featured: false,
  },
  {
    title: 'Car Price EDA',
    hidden: true,
    period: 'Sep 2022 to Nov 2022',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/EDA-on-car-price-prediction',
    summary:
      'Performed in-depth EDA on a car price dataset with 11,900 rows and 16 columns. Used Matplotlib and Seaborn for data visualization.',
    shortSummary:
      'In-depth EDA on 11,900-row car price dataset with 16 features. Comprehensive Matplotlib/Seaborn visualizations and statistical analysis.',
    techStack: ['Pandas', 'NumPy', 'Google Colab'],
    techHighlights: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
    thumbnail: carpriceedaImg,
    featured: false,
  },
  {
    title: 'Flying Cubes (AR)',
    hidden: true,
    period: 'Oct 2022 to Jan 2023',
    demoLink: '',
    codeLink: 'https://github.com/Deep-De-coder/FLying_Cubes',
    summary:
      'Developed an AR application allowing real-time manipulation of ascending cubes. Demonstrated Unity and AR proficiency.',
    shortSummary:
      'AR application enabling real-time manipulation of ascending cubes. Demonstrates Unity + ARCore proficiency for interactive mixed-reality experiences.',
    techStack: ['AR', 'Unity', 'C#'],
    techHighlights: ['AR', 'Unity', 'C#', 'ARCore'],
    thumbnail: cubesImage,
    featured: false,
  },
  {
    title: 'Coinee',
    hidden: true,
    period: 'Oct 2024 to Jan 2025',
    demoLink: 'https://play.google.com/store/apps/details?id=com.deepshahane.coines&hl=en_US',
    codeLink: '',
    summary:
      'Coinee is a privacy-safe Android app to browse 300+ coins from 15+ countries with crisp visuals and concise facts. Optimized for offline use with fast on-device search, category filters, and smooth Material UI, no sign-in, no tracking. Built as a lightweight, read-only viewer to showcase numismatic collections and inspire casual learning.',
    shortSummary:
      'Privacy-safe Android app browsing 300+ coins from 15+ countries. Optimized for offline use with fast on-device search and Material UI. On Google Play.',
    techStack: ['Android', 'Kotlin', 'Java', 'Android SDK', 'Material Components'],
    techHighlights: ['Android', 'Kotlin', 'Java', 'Material Components'],
    thumbnail: coineeImg,
    featured: false,
  },
];
