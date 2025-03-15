import React from 'react';
import './Education.css';

const educationData = [
  {
    institution: "Mumbai University, Vidyalankar Institute Of Technology",
    degree: "Bachelor of Engineering in Computer Engineering",
    period: "Aug 2019 - June 2023",
    gpa: "3.8",
    courses: ["Machine Learning", "Big Data Analytics", "Artificial Intelligence", "Algorithms and Data Structures"],
    year: "2019",
    position: "right",
  },
  {
    institution: "University at Buffalo, The State University of New York",
    degree: "Master of Science in Computer Science",
    period: "Aug 2023 - June 2025",
    gpa: "3.5",
    courses: ["Information Retrieval", "Computer Vision", "Deep Learning", "Pattern Recognition"],
    year: "2023",
    position: "left",
  },
];

const Education = () => {
  return (
    <div id="education" className="education-container">
      <h1 className="education-title">Education</h1>
      <div className="timeline">
        {/* Vertical Dashed Line */}
        <div className="timeline-line"></div>

        {/* Year Markers */}
        <div className="timeline-year" style={{ bottom: "2%" }}>2019</div>
        <div className="timeline-year" style={{ bottom: "42%" }}>2023</div>
        <div className="timeline-year" style={{ bottom: "85%" }}>2025</div>

        {/* Timeline Items */}
        {educationData.map((edu, index) => (
          <div key={index} className={`timeline-item ${edu.position}`}>
            <div className="timeline-card">
              <h2>{edu.institution}</h2>
              <p className="degree">{edu.degree}</p>
              <p className="education-period">{edu.period}</p>
              {edu.gpa !== "N/A" && <p><strong>GPA:</strong> {edu.gpa}</p>}
              <p><strong>Relevant Courses:</strong> {edu.courses.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Education;
