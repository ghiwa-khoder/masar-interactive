"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { scroll, damp } from "./useScrollProgress";
import { masarCurve, getPathReveal } from "./MasarPath";

/*
 * PATH FLARE
 *
 * Near the end of the journey, the thin tube widens
 * into a twisting ribbon and resolves into a flat
 * arrowhead — a nod to the logo mark, appearing where
 * the path itself ends rather than as a separate
 * graphic pasted into the scene.
 *
 * RIBBON_START deliberately matches the threshold
 * CameraRig.tsx already uses for its "finalReveal"
 * pullback and lift. That timing wasn't duplicated
 * here — it's the same number for the same reason,
 * so the camera easing back and the ribbon widening
 * happen together without CameraRig needing to know
 * this component exists.
 *
 * Why a ribbon needs a rectangular cross-section,
 * not a flat plane: a flat plane goes nearly invisible
 * viewed edge-on, and a camera flying alongside a
 * twisting form will see it edge-on some of the time.
 * Giving it real thickness means there's always a
 * visible face, even if the wide face isn't the one
 * in view at that instant. This is a genuine trade-off,
 * not a full fix — the flare still reads best from
 * roughly the angle the camera already approaches it
 * from, which is why it's timed to the one moment the
 * camera path is most predictable (the final pullback).
 *
 * The twist itself is an envelope, not a spiral: it's
 * zero at the start (so it hands off cleanly from the
 * round tube) and zero again at the end (so the arrow
 * cap always attaches at a known, predictable
 * orientation rather than needing a correction term).
 */

const RIBBON_START = 0.88;
const RIBBON_SEGMENTS = 72;

const TUBE_DIAMETER = 0.028 * 2;
const RIBBON_MAX_WIDTH = 0.34;
const RIBBON_THICKNESS = 0.036;

const TWIST_COILS = 2;
const TWIST_AMPLITUDE = Math.PI * 0.6;

const LIME = "#d8f860";

const UP = new THREE.Vector3(0, 1, 0);

function smoothstep01(x: number) {
  const c = THREE.MathUtils.clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
}

/*
 * Zero at u = 0 and u = 1, oscillating in between —
 * an envelope multiplied by a coil frequency, so the
 * ribbon twists and then deliberately untwists rather
 * than spiralling indefinitely.
 */
function twistEnvelope(u: number) {
  return (
    TWIST_AMPLITUDE *
    Math.sin(u * Math.PI) *
    Math.sin(u * Math.PI * TWIST_COILS)
  );
}

function widthAt(u: number) {
  return THREE.MathUtils.lerp(
    TUBE_DIAMETER,
    RIBBON_MAX_WIDTH,
    smoothstep01(u / 0.6)
  );
}

function thicknessAt(u: number) {
  return THREE.MathUtils.lerp(
    TUBE_DIAMETER,
    RIBBON_THICKNESS,
    smoothstep01(u / 0.6)
  );
}

/*
 * Frame at a point along the flare: tangent, and two
 * perpendicular axes rotated by the twist envelope.
 * binormal0/normal0 use the same UP-based construction
 * as getPathTransform in MasarPath.tsx, so the ribbon's
 * un-twisted orientation (u = 0) lines up with how
 * every other object on the path is oriented.
 */
function frameAt(t: number, u: number) {
  const point = masarCurve.getPointAt(t);
  const tangent = masarCurve.getTangentAt(t).normalize();

  const binormal0 = new THREE.Vector3()
    .crossVectors(UP, tangent)
    .normalize();
  const normal0 = new THREE.Vector3()
    .crossVectors(tangent, binormal0)
    .normalize();

  const twist = twistEnvelope(u);
  const cos = Math.cos(twist);
  const sin = Math.sin(twist);

  const widthDir = binormal0
    .clone()
    .multiplyScalar(cos)
    .add(normal0.clone().multiplyScalar(sin));

  const thicknessDir = binormal0
    .clone()
    .multiplyScalar(-sin)
    .add(normal0.clone().multiplyScalar(cos));

  return { point, tangent, widthDir, thicknessDir };
}

function buildRibbonGeometry() {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= RIBBON_SEGMENTS; i++) {
    const u = i / RIBBON_SEGMENTS;
    const t = THREE.MathUtils.lerp(RIBBON_START, 1, u);

    const { point, widthDir, thicknessDir } = frameAt(t, u);
    const w = widthAt(u) / 2;
    const h = thicknessAt(u) / 2;

    // Four corners of the rectangular cross-section,
    // in a fixed winding order around the centerline.
    const corners = [
      point.clone().add(widthDir.clone().multiplyScalar(w)).add(thicknessDir.clone().multiplyScalar(h)),
      point.clone().add(widthDir.clone().multiplyScalar(w)).sub(thicknessDir.clone().multiplyScalar(h)),
      point.clone().sub(widthDir.clone().multiplyScalar(w)).sub(thicknessDir.clone().multiplyScalar(h)),
      point.clone().sub(widthDir.clone().multiplyScalar(w)).add(thicknessDir.clone().multiplyScalar(h)),
    ];

    for (const c of corners) positions.push(c.x, c.y, c.z);
  }

  // Side quads between each consecutive ring of four
  // corners. Built in segment order (i increasing) so
  // setDrawRange can reveal it the same way the main
  // tube reveals — segment by segment, in sequence.
  for (let i = 0; i < RIBBON_SEGMENTS; i++) {
    const ringA = i * 4;
    const ringB = (i + 1) * 4;

    for (let k = 0; k < 4; k++) {
      const a = ringA + k;
      const b = ringA + ((k + 1) % 4);
      const c = ringB + ((k + 1) % 4);
      const d = ringB + k;

      indices.push(a, b, c, a, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function buildArrowGeometry() {
  const { point, tangent, widthDir, thicknessDir } = frameAt(1, 1);
  const w = widthAt(1) / 2;
  const depth = thicknessAt(1);

  // Arrow silhouette in local (forward, lateral) space.
  // Starts at the ribbon's exact half-width so the
  // handoff has no visible seam, holds that width for
  // a short shaft, then flares into flanges and a tip —
  // echoing the arrow in the logo mark rather than a
  // generic chevron.
  const shape = new THREE.Shape();
  shape.moveTo(0, w);
  shape.lineTo(0.4, w);
  shape.lineTo(0.4, w * 1.9);
  shape.lineTo(0.78, 0);
  shape.lineTo(0.4, -w * 1.9);
  shape.lineTo(0.4, -w);
  shape.lineTo(0, -w);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 1,
  });

  // Center the extrusion depth on the ribbon's
  // centerline instead of offset to one side.
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();

  const basis = new THREE.Matrix4().makeBasis(
    tangent,
    widthDir,
    thicknessDir
  );
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(basis);

  return { geometry, point, quaternion };
}

export default function PathFlare() {
  const ribbon = useRef<THREE.Mesh>(null);
  const arrowGroup = useRef<THREE.Group>(null);
  const arrowLight = useRef<THREE.PointLight>(null);
  const arrowLevel = useRef(0);

  const ribbonGeometry = useMemo(buildRibbonGeometry, []);
  const ribbonIndexCount = ribbonGeometry.index
    ? ribbonGeometry.index.count
    : 0;

  const { geometry: arrowGeometry, point: arrowPoint, quaternion: arrowQuaternion } =
    useMemo(buildArrowGeometry, []);

  useEffect(() => {
    return () => {
      ribbonGeometry.dispose();
      arrowGeometry.dispose();
    };
  }, [ribbonGeometry, arrowGeometry]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const reveal = getPathReveal(scroll.smooth);

    const localU = THREE.MathUtils.clamp(
      (reveal - RIBBON_START) / (1 - RIBBON_START),
      0,
      1
    );

    if (ribbon.current) {
      ribbon.current.geometry.setDrawRange(
        0,
        Math.floor(ribbonIndexCount * localU)
      );
    }

    // The arrow only grows in once the ribbon is
    // almost fully drawn — a distinct final beat
    // rather than appearing alongside the ribbon.
    const arrowTarget = smoothstep01((localU - 0.82) / 0.18);

    arrowLevel.current = scroll.reduced
      ? arrowTarget
      : damp(arrowLevel.current, arrowTarget, 5, dt);

    if (arrowGroup.current) {
      arrowGroup.current.scale.setScalar(
        Math.max(arrowLevel.current, 0.0001)
      );
    }

    if (arrowLight.current) {
      arrowLight.current.intensity = arrowLevel.current * 4.5;
    }
  });

  return (
    <group>
      <mesh ref={ribbon} geometry={ribbonGeometry}>
        <meshStandardMaterial
          color={LIME}
          emissive={LIME}
          emissiveIntensity={1.75}
          metalness={0.15}
          roughness={0.3}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group
        ref={arrowGroup}
        position={arrowPoint}
        quaternion={arrowQuaternion}
      >
        <mesh geometry={arrowGeometry}>
          <meshStandardMaterial
            color={LIME}
            emissive={LIME}
            emissiveIntensity={2.1}
            metalness={0.2}
            roughness={0.25}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight ref={arrowLight} color={LIME} intensity={0} distance={5} />
      </group>
    </group>
  );
}
