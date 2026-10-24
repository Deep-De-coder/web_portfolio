// Canonical skills data, single source of truth shared by
// v1 (src/components/Skillset.js) and v2 (src/pages/v2/SkillsSection.jsx).
//
// `span` is the card size ('wide' | 'square') for v1's three-column masonry,
// where 'wide' spans two columns: the four categories tile as 2+1 / 2+1 with
// no orphaned cells. v2 lays the same four out as a uniform two-by-two and
// ignores `span`. `stats` is rendered by v1 only; `icon` and `color` by v2.

export const skillCategories = [
  {
    title: 'AI and LLMs',
    stats: '12 technologies',
    span: 'wide',
    icon: '◈',
    color: '#6366f1',
    skills: [
      'Agentic AI',
      'Multi-agent systems',
      'RAG',
      'LLM evaluation',
      'Prompt engineering',
      'Model routing',
      'MCP',
      'LangGraph',
      'Anthropic Claude',
      'vLLM',
      'TensorRT-LLM',
      'LoRA',
    ],
  },
  {
    title: 'ML and Vision',
    stats: '8 technologies',
    span: 'square',
    icon: '◻',
    color: '#8b5cf6',
    skills: [
      'PyTorch',
      'Computer Vision',
      '3D Reconstruction',
      'SLAM',
      'Gaussian Splatting',
      'VLMs',
      'CLIP',
      'MLflow',
    ],
  },
  {
    title: 'Backend and Infra',
    stats: '8 tools',
    span: 'wide',
    icon: '◈',
    color: '#10b981',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'Docker', 'Airflow', 'C++', 'CUDA'],
  },
  {
    title: 'Frontend',
    stats: '3 frameworks',
    span: 'square',
    icon: '◻',
    color: '#22d3ee',
    skills: ['Next.js', 'TypeScript', 'React'],
  },
];
