import React from 'react';
import './Skillset.css';

const skillCategories = [
  {
    title: "Deep learning & AI",
    stats: "6+ Technologies",
    skills: ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Langchain", "Transformers"],
    className: "wide" // Wide card
},
{
    title: "Frontend Development",
    stats: "4+ Frameworks",
    skills: ["React", "JavaScript", "HTML", "CSS", "Figma"],
    className: "square" // Square card
},
{
    title: "Backend Development",
    stats: "6+ Tools",
    skills: ["Flask", "Python", "Node.js", "Express.js", "Postman", "Hugging Face"],
    className: "square"
},
{
    title: "Database Management",
    stats: "4+ Databases",
    skills: ["MySQL", "PostgreSQL", "MongoDB", "SQL Server"],
    className: "wide"
},
{
    title: "Cloud & DevOps",
    stats: "6+ Platforms",
    skills: ["AWS (EC2, S3)", "GCP (Compute Engine, Cloud Storage)", "Azure (Q&A Maker, Blob Storage, Maps)", "Docker", "Linux", "ROS (Robot Operating System)"],
    className: "wide"
},
{
    title: "Android Development",
    stats: "3+ Technologies",
    skills: ["Kotlin", "Flutter", "Firebase", "Android Studio"],
    className: "square"
},
{
    title: "Soft Skills",
    stats: "4+ Skills",
    skills: ["Adaptability", "Leadership", "Critical Thinking", "Communication"],
    className: "square"
}

];

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
