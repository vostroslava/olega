"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;

  void main() {
    float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float bevel = 1.0 - smoothstep(0.0, 0.12, edge);
    float diagonal = 1.0 - smoothstep(0.0, 0.025, abs(vUv.x + vUv.y * 0.30 - 0.58));
    float sweep = 1.0 - smoothstep(0.0, 0.075, abs(vUv.x - (0.18 + sin(uTime * 0.42) * 0.10)));
    float pointerGlow = 1.0 - smoothstep(0.0, 0.48, distance(vUv, uPointer));

    vec3 prism = 0.52 + 0.48 * cos(6.28318 * (vec3(0.02, 0.24, 0.47) + vUv.x * 0.72 + vUv.y * 0.18));
    vec3 glass = mix(vec3(0.16, 0.42, 0.62), prism, 0.68);
    float alpha = bevel * 0.34 + diagonal * 0.40 + sweep * 0.12 + pointerGlow * 0.24;

    gl_FragColor = vec4(glass, alpha);
  }
`;

function PrismPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const targetPointer = useRef(new THREE.Vector2(0.5, 0.5));
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  );

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      targetPointer.current.set(
        THREE.MathUtils.clamp(event.clientX / window.innerWidth, 0, 1),
        THREE.MathUtils.clamp(1 - event.clientY / window.innerHeight, 0, 1)
      );
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, []);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (material) {
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      (material.uniforms.uPointer.value as THREE.Vector2).lerp(
        targetPointer.current,
        Math.min(1, delta * 2.8)
      );
    }

    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        (targetPointer.current.y - 0.5) * 0.09,
        Math.min(1, delta * 2.4)
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        (targetPointer.current.x - 0.5) * 0.12,
        Math.min(1, delta * 2.4)
      );
    }
  });

  return (
    <mesh ref={meshRef} position={[0.78, 0.06, 0]} rotation={[0, 0, -0.62]}>
      <planeGeometry args={[4.8, 2.05, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export function GlassRefraction() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const widthQuery = window.matchMedia("(min-width: 861px)");
    const sync = () => setEnabled(motionQuery.matches && widthQuery.matches);
    sync();
    motionQuery.addEventListener("change", sync);
    widthQuery.addEventListener("change", sync);
    return () => {
      motionQuery.removeEventListener("change", sync);
      widthQuery.removeEventListener("change", sync);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="glass-refraction" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 3.2], fov: 42 }}
      >
        <PrismPlane />
      </Canvas>
    </div>
  );
}
