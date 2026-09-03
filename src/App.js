import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import V2 from './pages/V2';
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
  return (
    <Router>
      <Routes>
        <Route path="/v2" element={<V2 />} />
        <Route path="/" element={
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
        <Sidebar />
        <div className="main-content">
          {/* Ask keeps its wrapper id: the Ask component has no id of its own,
              and both App.css (#ask) and Sidebar scrolling rely on it.
              The other sections' components carry their own ids, so the
              wrappers stay id-less to avoid duplicate DOM ids. */}
          <div id="ask">
            <Ask />
          </div>
          <div>
            <Education />
          </div>
          <div>
            <Experience />
          </div>
          <div>
            <Publications />
          </div>
          <div>
            <Projects />
          </div>
          <div>
            <Skillset />
          </div>
        </div>
      </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
