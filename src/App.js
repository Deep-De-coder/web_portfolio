import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Sidebar component
import Education from './components/Education';
import Experience from './components/Experience';
import Publications from './components/Publications';
import Projects from './components/Projects';
import Skillset from './components/Skillset';
import Ask from './components/Ask';
import './App.css';
import './ShootingStars.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to adjust main content margin based on sidebar state
  const toggleContentMargin = (isOpen) => {
    setIsSidebarOpen(isOpen); // Track sidebar state
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      if (isOpen) {
        mainContent.classList.add('shifted'); // Add shifted class
      } else {
        mainContent.classList.remove('shifted'); // Remove shifted class
      }
    }
  };

  return (
    <Router>
      <div className="App">
        {/* Shooting Stars Background */}
        <div className="night">
          {Array.from({ length: 60 }).map((_, index) => (
            <div
              key={index}
              className="shooting_star"
              style={{
                '--top': Math.random(),
                '--left': Math.random(),
                '--delay': Math.random() * 5,
              }}
            ></div>
          ))}
        </div>

        {/* Sidebar */}
        <Sidebar toggleContentMargin={toggleContentMargin} />
        <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
          <div id="ask">
            <Ask />
          </div>
          <div id="experience">
            <Experience />
          </div>
          <div id="education">
            <Education />
          </div>
          <div id="publications">
            <Publications />
          </div>
          <div id="projects">
            <Projects />
          </div>
          <div id="skillset">
            <Skillset />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
