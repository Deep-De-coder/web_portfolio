import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Both shaders fade geometry out with distance from the camera. Without it
// every star and every edge draws at full strength, the far field reads as
// loud as the near field, and the whole thing flattens into visual noise.
const VERTEX_SHADER = `
  uniform float uTime;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.6 + position.x * 0.01) * 0.4;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = clamp(240.0 / -mvPosition.z, 0.6, 2.6);
    gl_Position = projectionMatrix * mvPosition;
    vColor = mix(vec3(0.86, 0.88, 1.0), vec3(0.36, 0.38, 0.92), clamp(-position.z / 600.0, 0.0, 1.0));
    vFade = 1.0 - smoothstep(160.0, 820.0, -mvPosition.z);
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = 1.0 - smoothstep(0.22, 0.5, d);
    alpha *= vFade * 0.72;
    if (alpha <= 0.001) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const LINE_VERTEX_SHADER = `
  varying float vFade;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vFade = 1.0 - smoothstep(120.0, 700.0, -mvPosition.z);
  }
`;

const LINE_FRAGMENT_SHADER = `
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float a = uOpacity * vFade;
    if (a <= 0.001) discard;
    gl_FragColor = vec4(0.42, 0.44, 0.96, a);
  }
`;

export default function SceneBackground() {
  const mountRef = useRef(null);

  const [reduce, setReduce] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // React to reduced-motion changes live instead of a single mount-time read.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduce(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const mount = mountRef.current;
    if (!mount) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Deliberately sparse. The earlier 2500/4000 density filled every part of
    // the frame; a quieter field reads as atmosphere instead of wallpaper.
    const count = window.innerWidth > 768 ? 1400 : 700;
    const positions = new Float32Array(count * 3);
    const pts = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 1600;
      const y = (Math.random() - 0.5) * 1000;
      const z = -600 + Math.random() * 700;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      pts.push([x, y, z]);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const uniforms = { uTime: { value: 0 } };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Neural connection lines — static topology computed once.
    // Spatial hash grid (cell = neighbor threshold) replaces the O(n^2)
    // all-pairs scan: only the 27 surrounding cells can hold a neighbor.
    const linePositions = [];
    const maxEdges = 1300;
    let edgeCount = 0;
    const thresh = 110;
    const threshSq = thresh * thresh;
    const grid = new Map();
    const cellKey = (cx, cy, cz) => `${cx},${cy},${cz}`;
    for (let i = 0; i < count; i++) {
      const key = cellKey(
        Math.floor(pts[i][0] / thresh),
        Math.floor(pts[i][1] / thresh),
        Math.floor(pts[i][2] / thresh)
      );
      let cell = grid.get(key);
      if (!cell) grid.set(key, (cell = []));
      cell.push(i);
    }
    const buildEdges = () => {
      for (let i = 0; i < count; i++) {
        const cx = Math.floor(pts[i][0] / thresh);
        const cy = Math.floor(pts[i][1] / thresh);
        const cz = Math.floor(pts[i][2] / thresh);
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            for (let oz = -1; oz <= 1; oz++) {
              const cell = grid.get(cellKey(cx + ox, cy + oy, cz + oz));
              if (!cell) continue;
              for (const j of cell) {
                if (j <= i) continue; // each pair once, mirroring i<j order
                const dx = pts[i][0] - pts[j][0];
                const dy = pts[i][1] - pts[j][1];
                const dz = pts[i][2] - pts[j][2];
                if (dx * dx + dy * dy + dz * dz < threshSq) {
                  linePositions.push(pts[i][0], pts[i][1], pts[i][2], pts[j][0], pts[j][1], pts[j][2]);
                  if (++edgeCount >= maxEdges) return;
                }
              }
            }
          }
        }
      }
    };
    buildEdges();
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineUniforms = { uOpacity: { value: 0.05 } };
    const lineMaterial = new THREE.ShaderMaterial({
      uniforms: lineUniforms,
      vertexShader: LINE_VERTEX_SHADER,
      fragmentShader: LINE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    let mx = 0;
    let my = 0;
    const onMouseMove = (e) => {
      mx = e.clientX / width - 0.5;
      my = e.clientY / height - 0.5;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId;
    const animate = () => {
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      scene.rotation.y += 0.00015;
      lineUniforms.uOpacity.value = 0.05 + Math.sin(t * 0.4) * 0.022;

      camera.rotation.x += (my * -0.08 - camera.rotation.x) * 0.04;
      camera.rotation.y += (mx * 0.12 - camera.rotation.y) * 0.04;
      camera.position.z += (5 + window.scrollY * 0.008 - camera.position.z) * 0.05;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [reduce]);

  return (
    <>
      <div
        ref={mountRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />
      {/* Vignette. Pulls the corners down so the eye is held in the centre of
          the frame — the field no longer runs flat to the edges of the screen. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'radial-gradient(75% 60% at 50% 42%, transparent 0%, rgba(6,6,10,0.35) 62%, rgba(6,6,10,0.82) 100%)',
        }}
      />
    </>
  );
}
