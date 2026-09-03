// Canonical publications data — single source of truth shared by
// v1 (src/components/Publications.js) and v2 (src/pages/v2/PublicationsSection.jsx).
//
// Ordered as the v1 list renders; v2 sorts by `year` descending (newest first).
// `venue`, `year`, and `color` are rendered by v2 only.

export const publications = [
  {
    title: 'Car Sales Forecasting Using ML Time Series Algorithm',
    venue: 'Springer LNNS',
    year: '2023',
    link: 'https://link.springer.com/chapter/10.1007/978-981-99-3982-4_41',
    tags: ['Time Series', 'LSTM', 'ARIMA'],
    color: '#22d3ee',
  },
  {
    title: 'Music Fiesta the Recommendation System',
    venue: 'IEEE Xplore',
    year: '2022',
    link: 'https://ieeexplore.ieee.org/document/9936009',
    tags: ['Collaborative Filtering', 'Deep Learning', 'NLP'],
    color: '#10b981',
  },
  {
    title: 'Gaussian Splatting for Advanced Rendering',
    venue: 'UB Technical Report 2025-09',
    year: '2025',
    link: 'https://cse.buffalo.edu/tech-reports/2025-09.pdf',
    tags: ['3D Rendering', 'Gaussian Splatting', 'Computer Vision'],
    color: '#6366f1',
  },
];
