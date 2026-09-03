import React from 'react';
import './Skillset.css';
import { skillCategories as skillCategoriesData } from '../data/skills';

// Adapter: the shared data exposes the card size as `span`; this component's
// markup/CSS expects it as `className`.
const skillCategories = skillCategoriesData.map(({ span, ...category }) => ({
  ...category,
  className: span,
}));

const Skillset = () => {
  return (
    <div id="skillset">
      <h1>Welcome to My Skillset</h1>
      <p className="subtitle">An Overview of My Technical Expertise</p>
      <div className="skill-masonry-grid">
        {skillCategories.map((category, index) => (
          <div key={index} className={`skill-category ${category.className}`}>
            <h2>{category.title}</h2>
            <p className="stats">{category.stats}</p>
            <div className="skill-items">
              {category.skills.map((skill, skillIndex) => (
                <div key={skillIndex} className="skill-box">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skillset;
