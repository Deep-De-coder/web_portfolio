import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const VERTEX_SHADER = `
  uniform float uTime;
  varying vec3 vColor;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.6 + position.x * 0.01) * 0.4;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = clamp(300.0 / -mvPosition.z, 1.0, 4.0);
    gl_Position = projectionMatrix * mvPosition;
    vColor = mix(vec3(1.0), vec3(0.38, 0.40, 0.95), clamp(-position.z / 600.0, 0.0, 1.0));
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = 1.0 - smoothstep(0.3, 0.5, d);
    if (alpha <= 0.0) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function SceneBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

    const count = window.innerWidth > 768 ? 2500 : 1200;
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
    const linePositions = [];
    const maxEdges = 4000;
    let edgeCount = 0;
    const threshSq = 120 * 120;
    for (let i = 0; i < count && edgeCount < maxEdges; i++) {
      for (let j = i + 1; j < count && edgeCount < maxEdges; j++) {
        const dx = pts[i][0] - pts[j][0];
        const dy = pts[i][1] - pts[j][1];
        const dz = pts[i][2] - pts[j][2];
        if (dx * dx + dy * dy + dz * dz < threshSq) {
          linePositions.push(pts[i][0], pts[i][1], pts[i][2], pts[j][0], pts[j][1], pts[j][2]);
          edgeCount++;
        }
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.06,
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
      lineMaterial.opacity = 0.06 + Math.sin(t * 0.4) * 0.03;

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
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
