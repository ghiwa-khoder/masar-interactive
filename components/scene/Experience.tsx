"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

import MasarPath from "../scene/MasarPath";
import CameraRig from "./CameraRig";
import SceneObjects from "./SceneObjects";
import { useScrollProgress } from "./useScrollProgress";

const DEEP_NAVY = "#0b182b";

export default function Experience() {
  useScrollProgress();

  return (
    <Canvas
      camera={{ position: [0, 0.95, 6.5], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={[DEEP_NAVY]} />

      {/* Fog colour must match the background
          exactly or a seam appears at the horizon. */}
      <fog attach="fog" args={[DEEP_NAVY, 14, 40]} />

      {/* Restrained, directional lighting. The lime
          emission and bloom carry the scene, so the
          fill light stays low and cool. */}
      <ambientLight intensity={0.22} color="#9ca8b4" />

      <directionalLight
        position={[3, 5, 4]}
        intensity={0.8}
        color="#f4f0e6"
      />

      <directionalLight
        position={[-4, 2, -8]}
        intensity={0.35}
        color="#6b7a8c"
      />

      <Suspense fallback={null}>
        <MasarPath />
        <SceneObjects />
      </Suspense>

      <CameraRig />

      {/* Bloom is what makes the lime read as light
          rather than paint. Without it the high
          emissive values do nothing. */}
      <EffectComposer>
        <Bloom
          intensity={0.75}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
        <Vignette
          offset={0.32}
          darkness={0.55}
          eskil={false}
        />
      </EffectComposer>
    </Canvas>
  );
}
