import React, { useRef, useEffect } from 'react';

const BUSES = [
  { y: 0.285, reveal: 0.22 },
  { y: 0.525, reveal: 0.46 },
  { y: 0.725, reveal: 0.68 },
];

const ROWS = [
  {
    y0: 0.04, y1: 0.26, reveal: 0.0, above: null, below: 0.285,
    blocks: [
      { x0: 0.03, x1: 0.22, label: 'CPU CORE 0' },
      { x0: 0.24, x1: 0.43, label: 'CPU CORE 1' },
      { x0: 0.45, x1: 0.62, label: 'L2 CACHE' },
      { x0: 0.64, x1: 0.97, label: 'NEURAL ENGINE' },
    ],
  },
  {
    y0: 0.31, y1: 0.50, reveal: 0.28, above: 0.285, below: 0.525,
    blocks: [
      { x0: 0.03, x1: 0.42, label: 'L3 CACHE' },
      { x0: 0.44, x1: 0.70, label: 'GPU CORE' },
      { x0: 0.72, x1: 0.97, label: 'DISPLAY ENGINE' },
    ],
  },
  {
    y0: 0.545, y1: 0.70, reveal: 0.52, above: 0.525, below: 0.725,
    blocks: [
      { x0: 0.03, x1: 0.30, label: 'MEM CTRL' },
      { x0: 0.32, x1: 0.62, label: 'PCIe / IO' },
      { x0: 0.64, x1: 0.97, label: 'SECURE ENCLAVE' },
    ],
  },
  {
    y0: 0.745, y1: 0.94, reveal: 0.74, above: 0.725, below: null,
    blocks: [
      { x0: 0.03, x1: 0.22, label: 'PMU' },
      { x0: 0.24, x1: 0.56, label: 'STORAGE I/O' },
      { x0: 0.58, x1: 0.97, label: 'WIRELESS' },
    ],
  },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

function buildLayout(W, H) {
  const busReveal = (yNorm) => {
    const b = BUSES.find((bus) => Math.abs(bus.y - yNorm) < 1e-6);
    return b ? b.reveal : 0;
  };

  const blocks = [];
  const traces = [];
  const buses = [];
  const nodes = [];
  const edges = [];
  const nodeMap = new Map();
  const busJunctions = new Map(BUSES.map((b) => [b.y, []]));

  const node = (x, y) => {
    const key = `${Math.round(x)},${Math.round(y)}`;
    let i = nodeMap.get(key);
    if (i === undefined) {
      i = nodes.length;
      nodes.push({ x, y, edges: [], activatedAt: -Infinity });
      nodeMap.set(key, i);
    }
    return i;
  };
  const edge = (ax, ay, bx, by, reveal) => {
    const a = node(ax, ay);
    const b = node(bx, by);
    const ei = edges.length;
    edges.push({ a, b, reveal, lastPassed: -Infinity });
    nodes[a].edges.push(ei);
    nodes[b].edges.push(ei);
  };

  for (const row of ROWS) {
    const yTop = row.y0 * H;
    const yBot = row.y1 * H;
    for (const blk of row.blocks) {
      const x0 = blk.x0 * W;
      const x1 = blk.x1 * W;
      const midx = (x0 + x1) / 2;
      blocks.push({ x: x0, y: yTop, w: x1 - x0, h: yBot - yTop, label: blk.label, reveal: row.reveal });

      // Perimeter — top and bottom edges split at midx so vertical traces can connect.
      edge(x0, yTop, midx, yTop, row.reveal);
      edge(midx, yTop, x1, yTop, row.reveal);
      edge(x0, yBot, midx, yBot, row.reveal);
      edge(midx, yBot, x1, yBot, row.reveal);
      edge(x0, yTop, x0, yBot, row.reveal);
      edge(x1, yTop, x1, yBot, row.reveal);

      if (row.below != null) {
        const busY = row.below * H;
        const r = Math.max(row.reveal, busReveal(row.below));
        traces.push({ x: midx, y0: yBot, y1: busY, reveal: r });
        edge(midx, yBot, midx, busY, r);
        busJunctions.get(row.below).push(midx);
      }
      if (row.above != null) {
        const busY = row.above * H;
        const r = Math.max(row.reveal, busReveal(row.above));
        traces.push({ x: midx, y0: busY, y1: yTop, reveal: r });
        edge(midx, busY, midx, yTop, r);
        busJunctions.get(row.above).push(midx);
      }
    }
  }

  for (const bus of BUSES) {
    const y = bus.y * H;
    const xStart = 0.03 * W;
    const xEnd = 0.97 * W;
    buses.push({ x0: xStart, x1: xEnd, y, reveal: bus.reveal });
    const xs = Array.from(new Set([xStart, xEnd, ...busJunctions.get(bus.y)])).sort((a, b) => a - b);
    for (let i = 0; i < xs.length - 1; i++) edge(xs[i], y, xs[i + 1], y, bus.reveal);
  }

  return { blocks, traces, buses, nodes, edges };
}

export default function ChipCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const isMobile = window.innerWidth <= 768;
    const PARTICLE_COUNT = isMobile ? 16 : 38;
    const TRAIL_LEN = 28;
    const ASSEMBLY_MS = 2800;

    let W = 0;
    let H = 0;
    let layout = null;
    let particles = [];
    let particlesReady = false;
    const startTime = Date.now();

    const spawnParticles = () => {
      const { edges, nodes } = layout;
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ei = (Math.random() * edges.length) | 0;
        const e = edges[ei];
        const forward = Math.random() < 0.5;
        const r = Math.random();
        particles.push({
          edgeIndex: ei,
          fromNode: forward ? e.a : e.b,
          toNode: forward ? e.b : e.a,
          t: Math.random(),
          speed: 0.18 + Math.random() * 0.14,
          color: r < 0.8 ? '#a5b4fc' : r < 0.95 ? '#22d3ee' : '#ffffff',
          trail: [],
        });
      }
      particlesReady = true;
      void nodes;
    };

    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout = buildLayout(W, H);
      if (Date.now() - startTime > ASSEMBLY_MS) spawnParticles();
      else particlesReady = false;
    };
    size();

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(size, 150);
    };
    window.addEventListener('resize', onResize);

    let frameId;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const assembly = easeOutQuart(clamp((now - startTime) / ASSEMBLY_MS, 0, 1));
      const docScroll = document.body.scrollHeight - window.innerHeight;
      const scrollRatio = docScroll > 0 ? clamp(window.scrollY / docScroll, 0, 1) : 0;
      const speedMul = 1 + scrollRatio * 0.7;

      const { blocks, traces, buses, nodes, edges } = layout;

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(0, scrollRatio * -30);

      // Buses
      for (const bus of buses) {
        const lp = clamp((assembly - bus.reveal) / 0.14, 0, 1);
        if (lp <= 0) continue;
        const len = bus.x1 - bus.x0;
        ctx.save();
        ctx.setLineDash([len]);
        ctx.lineDashOffset = len * (1 - lp);
        ctx.strokeStyle = `rgba(99,102,241,${lp * 0.22})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(bus.x0, bus.y);
        ctx.lineTo(bus.x1, bus.y);
        ctx.stroke();
        ctx.restore();
      }

      // Vertical traces
      for (const tr of traces) {
        const lp = clamp((assembly - tr.reveal) / 0.14, 0, 1);
        if (lp <= 0) continue;
        const len = Math.abs(tr.y1 - tr.y0);
        ctx.save();
        ctx.setLineDash([len]);
        ctx.lineDashOffset = len * (1 - lp);
        ctx.strokeStyle = `rgba(99,102,241,${lp * 0.18})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(tr.x, tr.y0);
        ctx.lineTo(tr.x, tr.y1);
        ctx.stroke();
        ctx.restore();
      }

      // Blocks
      for (const b of blocks) {
        const lp = clamp((assembly - b.reveal) / 0.14, 0, 1);
        if (lp <= 0) continue;
        const perim = 2 * (b.w + b.h);
        ctx.save();
        ctx.setLineDash([perim]);
        ctx.lineDashOffset = perim * (1 - lp);
        ctx.strokeStyle = `rgba(99,102,241,${lp * 0.22})`;
        ctx.lineWidth = 0.7;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.restore();
        if (lp > 0.8) {
          ctx.fillStyle = 'rgba(99,102,241,0.18)';
          ctx.font = "8px 'Courier New', monospace";
          ctx.fillText(b.label, b.x + 8, b.y + 13);
        }
      }

      // Signal particles + activity
      if (assembly > 0.82) {
        if (!particlesReady) spawnParticles();

        for (const p of particles) {
          p.t += p.speed * speedMul * dt;
          edges[p.edgeIndex].lastPassed = now;
          const a = nodes[p.fromNode];
          const b = nodes[p.toNode];
          const tt = Math.min(p.t, 1);
          const x = a.x + (b.x - a.x) * tt;
          const y = a.y + (b.y - a.y) * tt;
          p.trail.unshift([x, y]);
          if (p.trail.length > TRAIL_LEN) p.trail.pop();

          if (p.t >= 1) {
            nodes[p.toNode].activatedAt = now;
            const opts = nodes[p.toNode].edges.filter((e) => e !== p.edgeIndex);
            const next = opts.length ? opts[(Math.random() * opts.length) | 0] : (Math.random() * edges.length) | 0;
            const e = edges[next];
            p.fromNode = p.toNode;
            p.toNode = e.a === p.fromNode ? e.b : e.a;
            p.edgeIndex = next;
            p.t = 0;
          }
        }

        // Recently traversed traces glow
        for (const e of edges) {
          const age = (now - e.lastPassed) / 2000;
          if (age >= 1) continue;
          const na = nodes[e.a];
          const nb = nodes[e.b];
          ctx.strokeStyle = `rgba(99,102,241,${0.35 * (1 - age)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        }

        // Particle trails
        for (const p of particles) {
          for (let i = 0; i < p.trail.length; i++) {
            const [tx, ty] = p.trail[i];
            const f = 1 - i / p.trail.length;
            ctx.beginPath();
            if (i === 0) {
              ctx.shadowBlur = 8;
              ctx.shadowColor = p.color;
            }
            ctx.fillStyle = p.color;
            ctx.globalAlpha = f * 0.9;
            ctx.arc(tx, ty, f * 2.5, 0, Math.PI * 2);
            ctx.fill();
            if (i === 0) ctx.shadowBlur = 0;
          }
        }
        ctx.globalAlpha = 1;

        // Node flashes
        for (const n of nodes) {
          const age = (now - n.activatedAt) / 800;
          if (age >= 1) continue;
          ctx.beginPath();
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#818cf8';
          ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - age)})`;
          ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.restore();
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.55 }}
    />
  );
}
