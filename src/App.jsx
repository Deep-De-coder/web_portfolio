import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import V2 from './pages/V2';

// The classic dark portfolio is now the secondary route, so it is the one
// that loads on demand. It brings its own stylesheets and the shooting-star
// background with it, none of which the main route needs.
const Classic = lazy(() => import('./pages/Classic'));

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<V2 />} />
        <Route
          path="/v2"
          element={
            <Suspense fallback={<div style={{ minHeight: '100vh', background: '#090a0f' }} />}>
              <Classic />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}
