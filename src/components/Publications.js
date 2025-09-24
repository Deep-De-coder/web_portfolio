import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import './Publications.css';

const publicationsData = [
  {
    title: "Car Sales Forecasting Using ML Time Series Algorithm",
    link: "https://link.springer.com/chapter/10.1007/978-981-99-3982-4_41",
    tags: ["Time Series", "LSTM", "ARIMA"]
  },
  {
    title: "Music Fiesta the Recommendation System",
    link: "https://ieeexplore.ieee.org/document/9936009",
    tags: ["Collaborative Filtering", "Deep Learning", "NLP"]
  },
  {
    title: "Gaussian Splatting for Advanced Rendering",
    link: "https://cse.buffalo.edu/tech-reports/2025-09.pdf",
    tags: ["3D Rendering", "Gaussian Splatting", "Computer Vision"]
  }
];

const Publications = () => {
  return (
    <div id="publications" className="publications-container">
      <h1 className="publications-title">Publications</h1>
      <p className="publications-subtitle">Here are some of my published and ongoing research works:</p>
      
      <div className="publications-list">
        {publicationsData.map((pub, index) => (
          <div key={index} className="publication-card">
            <h2>{pub.title}</h2>

            {/* Tags Section */}
            <div className="tags-container">
              {pub.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>

            <a href={pub.link} target="_blank" rel="noopener noreferrer" className="publication-link">
              View Publication <FaExternalLinkAlt />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Publications;
