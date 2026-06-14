import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { motion, useScroll, useTransform } from 'framer-motion';
import { drawScreen } from './screenBoot';
import boardUrl from '../../assets/models/board.glb';
import laptopUrl from '../../assets/models/laptop.glb';

/* ------------------------------------------------------------------ *
 * Scroll-driven section: a real circuit board, filmed with restraint,
 * that powers on and integrates into a real laptop running on-device AI.
 *
 *  - Real GLTF board (PCB w/ components) + real MacBook.
 *  - ACES tone-mapping + RoomEnvironment reflections for real materials.
 *  - Restrained lighting: soft dark-studio key + fill; the cyan accent
 *    appears only on the powered-on SoC and the laptop screen. Bloom is a
 *    whisper, not a neon wash.
 *  - Framer Motion drives the phase text overlays + progress rail.
 *  - rAF/composer gated by IntersectionObserver; full dispose on unmount.
 * ------------------------------------------------------------------ */

const PHASES = [
  { title: 'Silicon Foundations',  sub: 'A real circuit board',               readout: 'PCB · POWER OFF',  band: [0.00, 0.04, 0.12, 0.16] },
  { title: 'Engineered Detail',    sub: 'Every trace and component in place', readout: 'INSPECTING',       band: [0.16, 0.21, 0.42, 0.47] },
  { title: 'Neural Engine Active', sub: 'On-device AI compute comes online',  readout: 'NPU ONLINE',       band: [0.47, 0.52, 0.60, 0.64], counter: true },
  { title: 'Integration Complete', sub: 'Built into the machine',            readout: 'BOARD MOUNT · OK', band: [0.64, 0.69, 0.78, 0.82] },
  { title: 'AI in Your Browser',   sub: 'WebGPU · On-device · Zero latency',  readout: 'WEBGPU · READY',   band: [0.82, 0.88, 0.99, 1.00] },
];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function ChipAssemblySection() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const scrollProgressRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    if (reduce || isMobile) return;

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    /* ---- Renderer (ACES + sRGB, restrained exposure) ---- */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050a, 0.02);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);

    /* ---- Image-based lighting (reflections, zero asset weight) ---- */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    /* ---- Restrained, realistic studio lighting (no neon) ---- */
    const ambient = new THREE.AmbientLight(0x20232e, 0.6);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.1);
    keyLight.position.set(5, 9, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x9fb2d8, 0.6);
    fillLight.position.set(-6, 3, 4);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xcfd9ff, 0.5);
    rimLight.position.set(-4, 5, -8);
    scene.add(rimLight);
    // The only colored light — the SoC "power on", off until its beat.
    const accentLight = new THREE.PointLight(0x38e0ff, 0, 12, 2);
    scene.add(accentLight);

    /* ---- Soft contact shadow ---- */
    const shadowTex = makeRadialShadow();
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0, depthWrite: false });
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.02;
    scene.add(shadowPlane);

    /* ---- Real circuit board ---- */
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);
    const boardMats = new Set();
    let boardTopY = 1;
    let accentGlow = null;

    const loader = new GLTFLoader();
    loader.load(boardUrl, (gltf) => {
      const root = gltf.scene;
      // normalize size → ~9 units wide hero
      let box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const S = 9 / Math.max(size.x, size.y, size.z);
      root.scale.setScalar(S);
      box = new THREE.Box3().setFromObject(root);
      const ctr = box.getCenter(new THREE.Vector3());
      root.position.x -= ctr.x;
      root.position.z -= ctr.z;
      root.position.y -= box.min.y; // sit on the ground plane
      boardTopY = box.max.y - box.min.y;

      root.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          m.transparent = true;
          m.opacity = 0;
          m.envMapIntensity = 1.15;
          if (m.metalness !== undefined && m.metalness < 0.2 && m.roughness !== undefined) m.roughness = Math.min(m.roughness, 0.7);
          boardMats.add(m);
        });
      });
      boardGroup.add(root);

      // Subtle accent glow disc over the main SoC (board centre).
      const glowTex = makeRadialShadow(0x4fe6ff);
      accentGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 3.2),
        new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      accentGlow.rotation.x = -Math.PI / 2;
      accentGlow.position.set(0.4, boardTopY + 0.02, 0);
      boardGroup.add(accentGlow);
      accentLight.position.set(0.4, boardTopY + 1.4, 0);
      boardGroup.userData.ready = true;
    });

    /* ---- Boot-screen canvas texture ---- */
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024; screenCanvas.height = 696;
    const screenCtx = screenCanvas.getContext('2d');
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;

    /* ---- Real laptop (fades in for the finale) ---- */
    const laptopGroup = new THREE.Group();
    laptopGroup.visible = false;
    scene.add(laptopGroup);
    const laptopMats = [];

    loader.load(laptopUrl, (gltf) => {
      const root = gltf.scene;
      root.scale.setScalar(2.7);
      let screenMesh = null;
      root.traverse((o) => {
        if (!o.isMesh) return;
        o.material = o.material.clone();
        o.material.transparent = true;
        o.material.opacity = 0;
        o.material.envMapIntensity = 1.15;
        if (o.material.metalness !== undefined) o.material.metalness = Math.max(0.5, o.material.metalness);
        laptopMats.push(o.material);
        if (o.name === 'mesh256948792_2') {
          screenMesh = o;
          o.material.color.setHex(0x05070c);
          o.material.metalness = 0.2;
          o.material.roughness = 0.3;
        }
      });

      const box = new THREE.Box3().setFromObject(root);
      const ctr = box.getCenter(new THREE.Vector3());
      root.position.x -= ctr.x;
      root.position.z -= ctr.z;
      root.position.y -= box.min.y;
      laptopGroup.add(root);

      if (screenMesh) {
        const geo = screenMesh.geometry;
        geo.computeBoundingBox();
        const ls = geo.boundingBox.getSize(new THREE.Vector3());
        const lc = geo.boundingBox.getCenter(new THREE.Vector3());
        const spMat = new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: true });
        const sp = new THREE.Mesh(new THREE.PlaneGeometry(ls.x * 0.94, ls.y * 0.94), spMat);
        sp.position.copy(lc);
        const nWorld = new THREE.Vector3(0, 0, 1).applyQuaternion(screenMesh.getWorldQuaternion(new THREE.Quaternion()));
        sp.position.z += (nWorld.z >= 0 ? 1 : -1) * (ls.z * 0.5 + 0.004);
        screenMesh.add(sp);
        laptopGroup.userData.screenPlaneMat = spMat;
      }
    });

    /* ---- Camera keyframes (calm, well-eased) ---- */
    const camKeys = [
      { p: 0.00, pos: new THREE.Vector3(0, 6.5, 9.5),    look: new THREE.Vector3(0, 0.3, 0) },   // reveal
      { p: 0.16, pos: new THREE.Vector3(-3.8, 2.0, 5.2), look: new THREE.Vector3(-1.0, 0.4, 0) }, // detail (low, left)
      { p: 0.40, pos: new THREE.Vector3(3.8, 1.9, 5.0),  look: new THREE.Vector3(1.2, 0.4, 0) },  // detail glide (low, right)
      { p: 0.52, pos: new THREE.Vector3(1.4, 2.8, 4.6),  look: new THREE.Vector3(0.4, 0.5, 0) },  // power on (centre)
      { p: 0.72, pos: new THREE.Vector3(0, 4.6, 12.0),   look: new THREE.Vector3(0, 1.0, -0.4) }, // pull back
      { p: 0.88, pos: new THREE.Vector3(-3.0, 3.6, 11.0),look: new THREE.Vector3(0, 1.3, -0.6) }, // boot
      { p: 1.00, pos: new THREE.Vector3(-2.5, 3.5, 11.0),look: new THREE.Vector3(0, 1.3, -0.6) },
    ];
    const _cp = new THREE.Vector3();
    const _cl = new THREE.Vector3();
    const applyCamera = (p) => {
      let i = 0;
      while (i < camKeys.length - 1 && p > camKeys[i + 1].p) i++;
      const a = camKeys[i];
      const b = camKeys[Math.min(i + 1, camKeys.length - 1)];
      const local = a === b ? 0 : easeInOutCubic(seg(p, a.p, b.p));
      _cp.lerpVectors(a.pos, b.pos, local);
      _cl.lerpVectors(a.look, b.look, local);
      camera.position.copy(_cp);
      camera.lookAt(_cl);
    };

    /* ---- Post-processing: whisper bloom only (screen + accent) ---- */
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.16, 0.4, 0.9);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* ---- Bridge Framer scroll → render loop ---- */
    scrollProgressRef.current = scrollYProgress.get();
    const unsubScroll = scrollYProgress.on('change', (v) => { scrollProgressRef.current = v; });

    /* ---- Render gating ---- */
    let visible = true;
    const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0 });
    io.observe(section);

    /* ---- Render loop ---- */
    const clock = new THREE.Clock();
    let rafId;
    const render = () => {
      rafId = requestAnimationFrame(render);
      if (!visible) return;

      const p = scrollProgressRef.current;
      const t = clock.getElapsedTime();
      applyCamera(p);

      const reveal = easeOutCubic(seg(p, 0.02, 0.14));
      const powerOn = easeOutCubic(seg(p, 0.47, 0.6));
      // Staggered hand-off: the board leaves (fade + sink) before the laptop
      // arrives, so the two models never overlap as translucent ghosts.
      const boardOut = easeInOutCubic(seg(p, 0.6, 0.7));
      const laptopIn = easeInOutCubic(seg(p, 0.64, 0.78));
      const boot = seg(p, 0.82, 1.0);
      const pulse = 0.9 + Math.sin(t * 2.2) * 0.1;

      // Board: fade in, then fade out + sink away on hand-off.
      const boardOp = reveal * (1 - boardOut);
      boardMats.forEach((m) => { m.opacity = boardOp; });
      boardGroup.position.y = -boardOut * 7;
      boardGroup.rotation.y = Math.sin(t * 0.12) * 0.02 * (1 - boardOut);
      shadowMat.opacity = boardOp * 0.5;

      // Power-on accent (the only color), fades out as the board leaves.
      const accentK = powerOn * (1 - boardOut);
      accentLight.intensity = accentK * 2.2 * pulse;
      if (accentGlow) accentGlow.material.opacity = accentK * 0.45 * pulse;

      // Laptop arrives, then the screen boots.
      if (laptopIn > 0.001) {
        laptopGroup.visible = true;
        for (const m of laptopMats) m.opacity = laptopIn;
      } else {
        laptopGroup.visible = false;
      }
      const spMat = laptopGroup.userData.screenPlaneMat;
      if (spMat) {
        spMat.opacity = clamp01(seg(p, 0.82, 0.9));
        drawScreen(screenCtx, screenCanvas.width, screenCanvas.height, boot, t);
        screenTex.needsUpdate = true;
      }

      // hand off to AskSection at the very end
      canvas.style.opacity = String(1 - seg(p, 0.97, 1.0) * 0.5);

      composer.render();
    };
    render();

    /* ---- Resize ---- */
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    /* ---- Cleanup ---- */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      io.disconnect();
      unsubScroll();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => { Object.values(m).forEach((v) => v && v.isTexture && v.dispose()); m.dispose(); });
        }
      });
      screenTex.dispose();
      envRT.dispose();
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
    };
    // scrollYProgress is a stable MotionValue; run setup once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Static fallback (reduced-motion / mobile) ---- */
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (reduce || isMobile) {
    return (
      <section className="relative flex items-center justify-center px-6" style={{ minHeight: '70vh', background: 'transparent' }}>
        <div className="text-center max-w-md">
          <ChipGlyph />
          <h2 className="font-grotesk font-bold text-white mt-6" style={{ fontSize: 'clamp(1.6rem,6vw,2.4rem)' }}>
            AI in Your Browser
          </h2>
          <p className="font-dm text-slate-400 mt-3" style={{ fontSize: '0.95rem' }}>
            A neural engine, on your device. WebGPU-powered, zero latency, no data leaves your machine.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} style={{ height: '500vh', position: 'relative', background: '#05050a' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, zIndex: 0, transition: 'opacity 0.2s linear' }}
        />
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
          {PHASES.map((phase, i) => (
            <PhaseOverlay key={i} phase={phase} scrollYProgress={scrollYProgress} />
          ))}
          <PhaseProgressRail scrollYProgress={scrollYProgress} />
          <Attribution />
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Sub-components --------------------------- */

function PhaseOverlay({ phase, scrollYProgress }) {
  const [a, b, c, d] = phase.band;
  const opacity = useTransform(scrollYProgress, [a, b, c, d], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [a, b, c, d], [26, 0, 0, -22]);
  const tops = useTransform(scrollYProgress, [b, c], [0, 38], { clamp: true });
  const topsText = useTransform(tops, (v) => `${Math.round(v)} TOPS`);

  return (
    <motion.div
      style={{ opacity, y, position: 'absolute', left: 'clamp(1.5rem, 6vw, 6rem)', bottom: 'clamp(3rem, 12vh, 8rem)', maxWidth: 'min(90vw, 460px)' }}
    >
      <div
        className="px-6 py-5 rounded-2xl"
        style={{
          background: 'rgba(8,8,16,0.5)',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(34,211,238,0.18)',
          boxShadow: '0 8px 50px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" style={{ boxShadow: '0 0 8px #22d3ee' }} />
          <span className="font-dm tracking-[0.18em] uppercase" style={{ fontSize: '0.62rem', color: '#22d3ee' }}>
            {phase.readout}
            {phase.counter && <motion.span style={{ marginLeft: 8 }}>{topsText}</motion.span>}
          </span>
        </div>
        <h2 className="font-grotesk font-bold text-white leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.6rem)', letterSpacing: '-0.02em' }}>
          {phase.title}
        </h2>
        <p className="font-dm text-slate-400 mt-2" style={{ fontSize: 'clamp(0.85rem, 2vw, 1.05rem)' }}>
          {phase.sub}
        </p>
      </div>
    </motion.div>
  );
}

function PhaseProgressRail({ scrollYProgress }) {
  return (
    <div
      className="hidden sm:flex flex-col items-center gap-3"
      style={{ position: 'absolute', right: 'clamp(1.5rem, 4vw, 4rem)', top: '50%', transform: 'translateY(-50%)' }}
    >
      {PHASES.map((phase, i) => (
        <RailDot key={i} phase={phase} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function RailDot({ phase, scrollYProgress }) {
  const center = (phase.band[1] + phase.band[2]) / 2;
  const lo = phase.band[0], hi = phase.band[3];
  const scale = useTransform(scrollYProgress, [lo, center, hi], [1, 1.9, 1]);
  const bg = useTransform(scrollYProgress, [lo, center, hi], ['#334155', '#22d3ee', '#334155']);
  const glow = useTransform(scrollYProgress, [lo, center, hi], ['0 0 0px #22d3ee', '0 0 12px #22d3ee', '0 0 0px #22d3ee']);
  return (
    <motion.span className="rounded-full" style={{ width: 6, height: 6, scale, background: bg, boxShadow: glow }} />
  );
}

function Attribution() {
  return (
    <div
      className="hidden sm:block"
      style={{ position: 'absolute', right: 'clamp(1rem,3vw,2rem)', bottom: '1rem', fontSize: '0.6rem', color: 'rgba(148,163,184,0.45)', fontFamily: 'DM Sans, sans-serif' }}
    >
      Models: Gone U · Alex Safayan (CC-BY)
    </div>
  );
}

function ChipGlyph() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="mx-auto" aria-hidden="true">
      <rect x="26" y="26" width="44" height="44" rx="4" stroke="#6366f1" strokeWidth="2" />
      <rect x="38" y="38" width="20" height="20" rx="2" fill="#164e63" stroke="#22d3ee" strokeWidth="1.5" />
      {[34, 44, 54, 62].map((c, i) => (
        <g key={i} stroke="#6366f1" strokeWidth="2">
          <line x1={c} y1="14" x2={c} y2="26" />
          <line x1={c} y1="70" x2={c} y2="82" />
          <line x1="14" y1={c} x2="26" y2={c} />
          <line x1="70" y1={c} x2="82" y2={c} />
        </g>
      ))}
    </svg>
  );
}

/* Soft radial texture for shadow / accent glow. */
function makeRadialShadow(tint) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  if (tint) {
    const col = new THREE.Color(tint);
    const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
    grd.addColorStop(0, `rgba(${rgb},0.9)`);
    grd.addColorStop(0.5, `rgba(${rgb},0.25)`);
    grd.addColorStop(1, `rgba(${rgb},0)`);
  } else {
    grd.addColorStop(0, 'rgba(0,0,0,0.55)');
    grd.addColorStop(0.6, 'rgba(0,0,0,0.22)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
  }
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
