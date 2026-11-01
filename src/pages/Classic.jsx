import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Education from '../components/Education';
import Experience from '../components/Experience';
import Publications from '../components/Publications';
import Projects from '../components/Projects';
import Skillset from '../components/Skillset';
import Ask from '../components/Ask';
import '../App.css';
import '../ShootingStars.css';

/**
 * The original dark portfolio, now the secondary route.
 *
 * Its layout needs html and body pinned to full height with overflow hidden,
 * because `.main-content` is the scroll container rather than the page. Those
 * used to live in App.css and applied everywhere, which meant the default
 * route had to undo them on every load. They are set here instead and
 * restored on the way out, so this page owns its own environment.
 */
export default function Classic() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyBackground: body.style.background,
      bodyColor: body.style.color,
    };

    html.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.height = '100%';
    body.style.background = 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)';
    body.style.color = 'white';

    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
      body.style.background = prev.bodyBackground;
      body.style.color = prev.bodyColor;
    };
  }, []);

  return (
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
  );
}
