// Canonical skills data — single source of truth shared by
// v1 (src/components/Skillset.js) and v2 (src/pages/v2/SkillsSection.jsx).
//
// `span` is the card size ('wide' | 'square'); v1 maps it to its `className`
// prop. `stats` is rendered by v1 only; `icon` and `color` by v2 only.

export const skillCategories = [
  {
    title: 'Deep Learning & AI',
    stats: '6+ Technologies',
    span: 'wide',
    icon: '◈',
    color: '#6366f1',
    skills: ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'LangChain', 'Transformers'],
  },
  {
    title: 'Frontend',
    stats: '4+ Frameworks',
    span: 'square',
    icon: '◻',
    color: '#22d3ee',
    skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Figma'],
  },
  {
    title: 'Backend',
    stats: '6+ Tools',
    span: 'square',
    icon: '◈',
    color: '#10b981',
    skills: ['Python', 'FastAPI', 'Flask', 'Node.js', 'Express.js', 'Hugging Face'],
  },
  {
    title: 'Databases',
    stats: '4+ Databases',
    span: 'wide',
    icon: '◻',
    color: '#f59e0b',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQL Server', 'SQLAlchemy', 'FAISS'],
  },
  {
    title: 'Cloud & DevOps',
    stats: '6+ Platforms',
    span: 'wide',
    icon: '◈',
    color: '#818cf8',
    skills: ['AWS (EC2, S3)', 'GCP (Compute Engine)', 'Azure (OpenAI, Blob, Maps)', 'Docker', 'Linux', 'ROS'],
  },
  {
    title: 'Mobile',
    stats: '3+ Technologies',
    span: 'square',
    icon: '◻',
    color: '#f43f5e',
    skills: ['Kotlin', 'Android SDK', 'Flutter', 'Firebase', 'Material UI'],
  },
  {
    title: 'Soft Skills',
    stats: '4+ Skills',
    span: 'square',
    icon: '◈',
    color: '#a78bfa',
    skills: ['Research', 'Leadership', 'Critical Thinking', 'Communication'],
  },
];
