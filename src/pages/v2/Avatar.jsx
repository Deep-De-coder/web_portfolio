import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A small companion built entirely from primitives: no model file, no
 * licensing, and nothing to download beyond the code itself. Reads as a
 * friendly machine rather than a likeness, which suits a page about building
 * AI systems.
 *
 * It tracks the cursor across the whole window rather than only over its own
 * canvas, which is what makes it feel aware of you instead of like a widget.
 */

const ACCENT = '#22d3ee';
const ACCENT_DIM = '#6366f1';

/** Window-wide pointer in -1..1, so the avatar reacts anywhere on the page. */
function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return pointer;
}

function Companion({ pointer, reduced }) {
  const head = useRef();
  const leftEye = useRef();
  const rightEye = useRef();
  const ring = useRef();

  // Blink timing lives in a ref so re-renders never restart the cycle.
  const blink = useRef({ next: 2 + Math.random() * 3, closing: 0 });

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const h = head.current;
    if (!h) return;

    if (reduced) {
      // Hold a pleasant three-quarter pose rather than freezing head-on.
      h.rotation.set(-0.06, 0.28, 0);
      h.position.y = 0;
      return;
    }

    // Look toward the cursor, damped so it glides instead of snapping.
    const targetY = pointer.current.x * 0.5;
    const targetX = -pointer.current.y * 0.32;
    h.rotation.y += (targetY - h.rotation.y) * Math.min(1, delta * 4);
    h.rotation.x += (targetX - h.rotation.x) * Math.min(1, delta * 4);
    // A touch of counter-roll sells the head as having weight.
    h.rotation.z += (-pointer.current.x * 0.08 - h.rotation.z) * Math.min(1, delta * 3);

    // Idle breathing.
    h.position.y = Math.sin(t * 1.1) * 0.045;

    // Blink: a fast close, a slower open.
    blink.current.next -= delta;
    if (blink.current.next <= 0) {
      blink.current.closing = 0.16;
      blink.current.next = 2.5 + Math.random() * 3.5;
    }
    let lid = 1;
    if (blink.current.closing > 0) {
      blink.current.closing -= delta;
      const p = Math.max(0, blink.current.closing) / 0.16;
      lid = Math.abs(p - 0.5) * 2; // 1 -> 0 -> 1
    }
    const sy = 0.12 + lid * 0.88;
    if (leftEye.current) leftEye.current.scale.y = sy;
    if (rightEye.current) rightEye.current.scale.y = sy;

    if (ring.current) ring.current.rotation.z = t * 0.35;
  });

  return (
    <group ref={head}>
      <RoundedBox args={[1.25, 1.05, 1.0]} radius={0.3} smoothness={5} castShadow>
        <meshStandardMaterial color="#1a1e28" roughness={0.36} metalness={0.38} />
      </RoundedBox>

      {/* Eyes sit proud of the face so the emissive reads as light, not paint. */}
      {[-0.26, 0.26].map((x, i) => (
        <mesh key={x} ref={i === 0 ? leftEye : rightEye} position={[x, 0.07, 0.52]}>
          <capsuleGeometry args={[0.085, 0.07, 4, 12]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* A slow halo: one moving element keeps it alive while idle. */}
      <mesh ref={ring} position={[0, -0.04, 0]} rotation={[Math.PI / 2 - 0.4, 0, 0.12]}>
        <torusGeometry args={[1.08, 0.013, 8, 72]} />
        <meshStandardMaterial
          color={ACCENT_DIM}
          emissive={ACCENT_DIM}
          emissiveIntensity={1.4}
          toneMapped={false}
          transparent
          opacity={0.55}
        />
      </mesh>
    </group>
  );
}

function Rig({ reduced }) {
  const pointer = usePointer();
  const key = useMemo(() => new THREE.Color(ACCENT), []);
  const rim = useMemo(() => new THREE.Color(ACCENT_DIM), []);

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[2.5, 3, 4]} intensity={2.1} />
      {/* Cyan fill from below-front picks out the lower edge of the face. */}
      <pointLight position={[-1.6, -1.2, 2.4]} intensity={6} color={key} distance={9} />
      {/* Rim from behind-left: without it the shell disappears into the page. */}
      <directionalLight position={[-3.2, 2.2, -2.6]} intensity={3.4} color={rim} />
      <Companion pointer={pointer} reduced={reduced} />
    </>
  );
}

export default function Avatar({ size = 200, className = '', style = {} }) {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div
      className={className}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      <Canvas
        // Cap the pixel ratio: past 2x this costs fill rate and buys nothing
        // at this size. `frameloop` stays on so the idle motion continues.
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <Rig reduced={reduced} />
      </Canvas>
    </div>
  );
}
