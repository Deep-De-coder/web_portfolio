// Canonical education data — single source of truth shared by
// v1 (src/components/Education.js) and v2 (src/pages/v2/EducationSection.jsx).
//
// Ordered chronologically (bachelor's first) to match the v1 timeline, which
// derives its year markers from this order; v2 reverses it (newest first).
//
// Field conventions:
// - `institution` / `degree` are the full formal names (rendered by v1).
// - `institutionShort` (optional) / `degreeShort` are the condensed versions
//   rendered by v2.
// - `year` / `endYear` / `position` drive the v1 timeline; `short`, `color`,
//   `accent`, `border` drive the v2 cards.

export const education = [
  {
    institution: 'Vidyalankar Institute of Technology, Mumbai University',
    short: 'VIT',
    degree: 'Bachelor of Engineering in Computer Engineering',
    degreeShort: 'BE Computer Engineering',
    period: 'Aug 2019 – Jun 2023',
    gpa: '3.8 / 4.0',
    courses: ['Machine Learning', 'Big Data Analytics', 'Artificial Intelligence', 'Algorithms & Data Structures'],
    year: '2019',
    position: 'right',
    color: '#22d3ee',
    accent: 'rgba(34,211,238,0.1)',
    border: 'rgba(34,211,238,0.2)',
  },
  {
    institution: 'University at Buffalo, The State University of New York',
    institutionShort: 'University at Buffalo, SUNY',
    short: 'UB',
    degree: 'Master of Science in Computer Science',
    degreeShort: 'MS Computer Science',
    period: 'Aug 2023 – Jun 2025',
    gpa: '3.5 / 4.0',
    courses: ['Information Retrieval', 'Computer Vision', 'Deep Learning', 'Pattern Recognition'],
    year: '2023',
    endYear: '2025',
    position: 'left',
    color: '#6366f1',
    accent: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.22)',
  },
];
