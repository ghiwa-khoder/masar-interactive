"use client";

import { useFrame } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

import {
  scroll,
  damp,
} from "./useScrollProgress";
import PathFlare from "./PathFlare";

/* =====================================================
   MASAR CURVE
===================================================== */

export const masarCurve =
  new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(
        0,
        -0.55,
        4
      ),
      new THREE.Vector3(
        -0.8,
        -0.3,
        0.5
      ),
      new THREE.Vector3(
        -1.5,
        0.1,
        -3
      ),
      new THREE.Vector3(
        0.4,
        0.5,
        -6.5
      ),
      new THREE.Vector3(
        1.9,
        0.05,
        -10
      ),
      new THREE.Vector3(
        0.1,
        -0.35,
        -13.5
      ),
      new THREE.Vector3(
        -1.7,
        0.3,
        -17
      ),
      new THREE.Vector3(
        0.5,
        0.6,
        -20.5
      ),
      new THREE.Vector3(
        1.2,
        0.05,
        -23.5
      ),
      new THREE.Vector3(
        0,
        -0.15,
        -27
      ),
    ],
    false,
    "catmullrom",
    0.5
  );

const UP =
  new THREE.Vector3(
    0,
    1,
    0
  );

const LIME = "#d8f860";
const NAVY = "#1c3049";
const IVORY = "#f1f2ec";

const SEGMENTS = 600;

const MILESTONES = [
  0.17,
  0.37,
  0.62,
  0.86,
];

/*
 * Where the round tube hands off to PathFlare's
 * ribbon. Kept here, exported, and imported by
 * PathFlare — a single number, not two copies that
 * could quietly drift apart.
 */
export const RIBBON_START = 0.88;

/*
 * The path is drawn slightly ahead of the reader's
 * literal scroll position, so it always leads rather
 * than trails. Both the round tube below and
 * PathFlare's ribbon read from this same function,
 * so the handoff between them lines up exactly.
 */
export function getPathReveal(t: number) {
  return Math.min(t * 1.055 + 0.035, 1);
}

/* =====================================================
   PATH TRANSFORM
===================================================== */

export function getPathTransform(
  t: number,
  {
    lateralOffset = 0,
    verticalOffset = 0,
    facing = "path" as
      | "path"
      | "inward",
  } = {}
) {
  const clamped =
    THREE.MathUtils.clamp(
      t,
      0,
      0.999
    );

  const point =
    masarCurve.getPointAt(
      clamped
    );

  const tangent =
    masarCurve
      .getTangentAt(
        clamped
      )
      .normalize();

  const binormal =
    new THREE.Vector3()
      .crossVectors(
        UP,
        tangent
      )
      .normalize();

  const position =
    point
      .clone()
      .add(
        binormal
          .clone()
          .multiplyScalar(
            lateralOffset
          )
      )
      .add(
        new THREE.Vector3(
          0,
          verticalOffset,
          0
        )
      );

  const matrix =
    new THREE.Matrix4();

  if (
    facing === "inward"
  ) {
    matrix.lookAt(
      position,
      point,
      UP
    );
  } else {
    const behind =
      position
        .clone()
        .sub(
          tangent
            .clone()
            .multiplyScalar(2)
        );

    matrix.lookAt(
      position,
      behind,
      UP
    );
  }

  const quaternion =
    new THREE.Quaternion()
      .setFromRotationMatrix(
        matrix
      );

  return {
    position,
    quaternion,
  };
}

/* =====================================================
   MILESTONE PULSE
===================================================== */

function milestonePulse(
  value: number,
  center: number
) {
  const radius = 0.075;

  const distance =
    Math.abs(
      value - center
    );

  if (
    distance >= radius
  ) {
    return 0;
  }

  const x =
    1 -
    distance / radius;

  return (
    x *
    x *
    (3 - 2 * x)
  );
}

/* =====================================================
   MASAR PATH
===================================================== */

export default function MasarPath() {
  const drawn =
    useRef<THREE.Mesh>(
      null
    );

  const glow =
    useRef<THREE.Mesh>(
      null
    );

  const tip =
    useRef<THREE.Mesh>(
      null
    );

  const tipGlow =
    useRef<THREE.PointLight>(
      null
    );

  const markerGroups =
    useRef<
      (
        | THREE.Group
        | null
      )[]
    >([]);

  const markerMaterials =
    useRef<
      (
        | THREE.MeshBasicMaterial
        | null
      )[]
    >([]);

  const tipScale =
    useRef(1);

  /* =================================================
     MAIN PATH GEOMETRY
  ================================================= */

  const geometry =
    useMemo(
      () =>
        new THREE.TubeGeometry(
          masarCurve,
          SEGMENTS,
          0.028,
          12,
          false
        ),
      []
    );

  /* =================================================
     GLOW PATH
  ================================================= */

  const glowGeometry =
    useMemo(
      () =>
        new THREE.TubeGeometry(
          masarCurve,
          SEGMENTS,
          0.055,
          10,
          false
        ),
      []
    );

  const indexCount =
    geometry.index
      ? geometry.index.count
      : 0;

  const glowIndexCount =
    glowGeometry.index
      ? glowGeometry.index
          .count
      : 0;

  /*
   * The round tube is parameterised uniformly along
   * the curve, same as PathFlare's ribbon, so the
   * curve parameter RIBBON_START maps directly onto
   * a fraction of this geometry's index count too.
   * Capping the tube's draw range here — instead of
   * always drawing the full length — is what stops
   * it from running underneath the ribbon once that
   * takes over.
   */
  const tubeRevealCap = RIBBON_START;

  /* =================================================
     WAYPOINT POSITIONS
  ================================================= */

  const waypoints =
    useMemo(
      () =>
        MILESTONES.map(
          (t) =>
            masarCurve.getPointAt(
              t
            )
        ),
      []
    );

  /* =================================================
     CLEANUP
  ================================================= */

  useEffect(() => {
    return () => {
      geometry.dispose();
      glowGeometry.dispose();
    };
  }, [
    geometry,
    glowGeometry,
  ]);

  /* =================================================
     SCROLL ANIMATION
  ================================================= */

  useFrame(
    (_, delta) => {
      const dt =
        Math.min(
          delta,
          0.1
        );

      const t =
        THREE.MathUtils.clamp(
          scroll.smooth,
          0,
          1
        );

      const reveal =
        getPathReveal(t);

      // Never draw the round tube past where the
      // ribbon begins — the two are never visible
      // in the same stretch of path at once.
      const tubeReveal =
        Math.min(
          reveal,
          tubeRevealCap
        );

      /* =========================
         DRAWN PATH
      ========================= */

      if (
        drawn.current
      ) {
        drawn.current
          .geometry
          .setDrawRange(
            0,
            Math.floor(
              indexCount *
                tubeReveal
            )
          );
      }

      /* =========================
         GLOW
      ========================= */

      if (
        glow.current
      ) {
        glow.current
          .geometry
          .setDrawRange(
            0,
            Math.floor(
              glowIndexCount *
                tubeReveal
            )
          );
      }

      /* =========================
         LEADING POINT
      ========================= */

      if (
        tip.current
      ) {
        // Once the ribbon takes over, its own arrow
        // carries the "leading edge" — this marker
        // fades out rather than travel underneath it.
        const tipVisibility =
          reveal < RIBBON_START
            ? 1
            : 1 -
              smoothstepLocal(
                (reveal -
                  RIBBON_START) /
                  0.04
              );

        tip.current.position.copy(
          masarCurve.getPointAt(
            Math.min(
              tubeReveal,
              0.999
            )
          )
        );

        const nearestEnergy =
          Math.max(
            ...MILESTONES.map(
              (
                milestone
              ) =>
                milestonePulse(
                  t,
                  milestone
                )
            )
          );

        const targetScale =
          (1 +
            nearestEnergy *
              0.75) *
          tipVisibility;

        tipScale.current =
          scroll.reduced
            ? targetScale
            : damp(
                tipScale.current,
                targetScale,
                5,
                dt
              );

        tip.current.scale.setScalar(
          tipScale.current
        );

        if (
          tipGlow.current
        ) {
          tipGlow.current.intensity =
            (1.2 +
              nearestEnergy *
                5.5) *
            tipVisibility;
        }
      }

      /* =========================
         MILESTONE MARKERS
      ========================= */

      markerGroups.current.forEach(
        (
          group,
          index
        ) => {
          if (!group) {
            return;
          }

          const milestone =
            MILESTONES[
              index
            ];

          const energy =
            milestonePulse(
              t,
              milestone
            );

          const passed =
            t >= milestone
              ? 1
              : 0;

          const targetScale =
            0.82 +
            passed *
              0.18 +
            energy *
              0.65;

          const currentScale =
            group.scale.x;

          const nextScale =
            scroll.reduced
              ? targetScale
              : damp(
                  currentScale,
                  targetScale,
                  5,
                  dt
                );

          group.scale.setScalar(
            nextScale
          );

          const material =
            markerMaterials
              .current[
              index
            ];

          if (material) {
            material.color.set(
              passed ||
                energy >
                  0.02
                ? LIME
                : IVORY
            );

            material.opacity =
              0.45 +
              passed *
                0.35 +
              energy *
                0.2;
          }
        }
      );
    }
  );

  /* =================================================
     RENDER
  ================================================= */

  return (
    <group>
      {/* ==========================================
          PATH AHEAD
      ========================================== */}

      <mesh
        geometry={
          geometry
        }
      >
        <meshBasicMaterial
          color={NAVY}
          transparent
          opacity={0.42}
        />
      </mesh>

      {/* ==========================================
          SOFT LIME GLOW
      ========================================== */}

      <mesh
        ref={glow}
        geometry={
          glowGeometry
        }
      >
        <meshBasicMaterial
          color={LIME}
          transparent
          opacity={0.075}
          depthWrite={
            false
          }
          toneMapped={
            false
          }
        />
      </mesh>

      {/* ==========================================
          ACTIVE / TRAVELLED PATH
      ========================================== */}

      <mesh
        ref={drawn}
        geometry={
          geometry
        }
      >
        <meshStandardMaterial
          color={LIME}
          emissive={LIME}
          emissiveIntensity={
            1.75
          }
          metalness={
            0.15
          }
          roughness={
            0.3
          }
          toneMapped={
            false
          }
        />
      </mesh>

      {/* ==========================================
          MILESTONES
      ========================================== */}

      {waypoints.map(
        (
          point,
          index
        ) => (
          <group
            key={
              MILESTONES[
                index
              ]
            }
            ref={(
              group
            ) => {
              markerGroups
                .current[
                index
              ] =
                group;
            }}
            position={
              point
            }
          >
            {/* CENTER */}

            <mesh>
              <sphereGeometry
                args={[
                  0.052,
                  18,
                  18,
                ]}
              />

              <meshBasicMaterial
                ref={(
                  material
                ) => {
                  markerMaterials
                    .current[
                    index
                  ] =
                    material;
                }}
                color={
                  IVORY
                }
                transparent
                opacity={
                  0.45
                }
                toneMapped={
                  false
                }
              />
            </mesh>

            {/* OUTER RING */}

            <mesh>
              <ringGeometry
                args={[
                  0.085,
                  0.095,
                  32,
                ]}
              />

              <meshBasicMaterial
                color={
                  LIME
                }
                transparent
                opacity={
                  0.32
                }
                side={
                  THREE.DoubleSide
                }
                depthWrite={
                  false
                }
                toneMapped={
                  false
                }
              />
            </mesh>
          </group>
        )
      )}

      {/* ==========================================
          LEADING EDGE (round-tube phase only)
      ========================================== */}

      <mesh ref={tip}>
        <sphereGeometry
          args={[
            0.072,
            24,
            24,
          ]}
        />

        <meshBasicMaterial
          color={LIME}
          toneMapped={
            false
          }
        />

        <pointLight
          ref={tipGlow}
          color={LIME}
          intensity={
            1.2
          }
          distance={
            2.6
          }
          decay={2}
        />
      </mesh>

      {/* ==========================================
          RIBBON + ARROW (final flare)
      ========================================== */}

      <PathFlare />
    </group>
  );
}

function smoothstepLocal(x: number) {
  const c = THREE.MathUtils.clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
}
