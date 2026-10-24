import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import './theme.css';

const EASE = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-80px' };

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function rise(reduced, i = 0) {
  if (reduced) return {};
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.06 },
  };
}

// Pulled out of the prose so the numbers are scannable without reading the
// paragraph. Each one is stated in the copy it sits beside.
const FACTS = [
  { value: '3+', label: 'Years building AI' },
  { value: 'NILA', label: 'Founding engineer' },
  { value: 'MS CS', label: 'University at Buffalo' },
];

export default function AboutSection() {
  const reduced = useReducedMotion();

  return (
    <section id="about" className="v2-section" style={{ background: 'transparent' }}>
      <div className="v2-container">
        <motion.header {...rise(reduced)}>
          <p className="v2-eyebrow">
            <span className="v2-eyebrow__index">01</span>
            <span className="v2-eyebrow__line shrink-0" aria-hidden="true" />
            About
          </p>
          <h2 className="v2-h2">AI that holds up in production.</h2>
        </motion.header>

        <motion.div {...rise(reduced, 1)} className="mt-8 sm:mt-10">
          <p className="v2-lede" style={{ margin: 0, maxWidth: '68ch' }}>
            I build AI that holds up in production. Right now I&rsquo;m the founding engineer at
            NILA, an AI-native tax platform that real CPA firms run on. Before that I built the
            first AI platform at Niti Pharma as its sole engineer, and I do research on real-time
            3D reconstruction and vision-language models at SAIR Lab. 3+ years across agents,
            document AI, evals, model serving and full-stack SaaS. I care most about one thing:
            AI output a customer can trust and check.
          </p>
        </motion.div>

        <motion.ul
          {...rise(reduced, 2)}
          className="mt-10 grid list-none gap-4 sm:mt-12 sm:grid-cols-3"
          style={{ margin: '2.5rem 0 0', padding: 0 }}
        >
          {FACTS.map(fact => (
            <li key={fact.label} className="v2-card" style={{ padding: '1.25rem 1.375rem' }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  color: 'var(--v2-text)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fact.value}
              </p>
              <p className="v2-meta" style={{ margin: '0.375rem 0 0' }}>{fact.label}</p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
