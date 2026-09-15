"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { scroll, damp } from "./useScrollProgress";
import { getPathTransform } from "./MasarPath";

type Shape =
  | "web"
  | "webgl"
  | "frontend"
  | "motion";

type Milestone = {
  label: string;
  at: number;
  side: 1 | -1;
  shape: Shape;
};

const MILESTONES: Milestone[] = [
  {
    label: "Interactive Web",
    at: 0.17,
    side: -1,
    shape: "web",
  },
  {
    label: "3D / WebGL",
    at: 0.37,
    side: 1,
    shape: "webgl",
  },
  {
    label: "Creative Frontend",
    at: 0.62,
    side: -1,
    shape: "frontend",
  },
  {
    label: "Motion Systems",
    at: 0.86,
    side: 1,
    shape: "motion",
  },
];

const LATERAL_OFFSET = 1.7;
const VERTICAL_OFFSET = 0.15;

const LIME = "#d8f860";
const GREY = "#9ca8b4";

function proximity(
  t: number,
  at: number
) {
  const d = Math.abs(t - at);
  const range = 0.17;

  if (d >= range) return 0;

  const n = 1 - d / range;

  return n * n * (3 - 2 * n);
}

type MaterialRef =
  THREE.MeshBasicMaterial | null;

type CoreMaterialRef =
  | THREE.MeshStandardMaterial
  | THREE.MeshPhysicalMaterial
  | null;

/* =====================================================
   MILESTONE MOTION
===================================================== */

function useMilestoneMotion(
  at: number,
  group: React.RefObject<THREE.Group | null>,
  structure: React.MutableRefObject<
    MaterialRef[]
  >,
  core: React.MutableRefObject<
    CoreMaterialRef[]
  >,
  light: React.RefObject<THREE.PointLight | null>,
  accent?: React.RefObject<THREE.Group | null>
) {
  const level = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    const target = proximity(
      scroll.smooth,
      at
    );

    level.current = scroll.reduced
      ? target
      : damp(
          level.current,
          target,
          5,
          dt
        );

    const v = level.current;

    /* -----------------------------
       SCALE + LIFT
    ----------------------------- */

    if (group.current) {
      const targetScale =
        0.88 + v * 0.18;

      const nextScale =
        scroll.reduced
          ? targetScale
          : damp(
              group.current.scale.x,
              targetScale,
              5,
              dt
            );

      group.current.scale.setScalar(
        nextScale
      );

      const targetY =
        (1 - v) * 0.08;

      group.current.position.y =
        scroll.reduced
          ? targetY
          : damp(
              group.current.position.y,
              targetY,
              5,
              dt
            );
    }

    /* -----------------------------
       STRUCTURE VISIBILITY
    ----------------------------- */

    structure.current.forEach(
      (material, index) => {
        if (!material) return;

        const base =
          index === 0
            ? 0.2
            : 0.13;

        material.opacity =
          base + v * 0.55;
      }
    );

    /* -----------------------------
       LIME CORE
    ----------------------------- */

    core.current.forEach(
      (material) => {
        if (!material) return;

        material.emissiveIntensity =
          0.25 + v * 2.7;
      }
    );

    /* -----------------------------
       LIGHT
    ----------------------------- */

    if (light.current) {
      light.current.intensity =
        v * 6;
    }

    /* -----------------------------
       SCROLL-DRIVEN ROTATION
    ----------------------------- */

    if (
      accent?.current &&
      !scroll.reduced
    ) {
      accent.current.rotation.z =
        v * 0.35;

      accent.current.rotation.y =
        v * 0.28;
    }
  });
}

/* =====================================================
   INTERACTIVE WEB
===================================================== */

function WebForm({
  at,
}: {
  at: number;
}) {
  const group =
    useRef<THREE.Group>(null);

  const accent =
    useRef<THREE.Group>(null);

  const structure =
    useRef<MaterialRef[]>([]);

  const core =
    useRef<CoreMaterialRef[]>([]);

  const light =
    useRef<THREE.PointLight>(null);

  useMilestoneMotion(
    at,
    group,
    structure,
    core,
    light,
    accent
  );

  return (
    <group ref={group}>
      {/* BROWSER / PAGE FRAME */}

      <mesh>
        <boxGeometry
          args={[
            1.45,
            0.95,
            0.045,
          ]}
        />

        <meshBasicMaterial
          ref={(m) => {
            structure.current[0] = m;
          }}
          color={GREY}
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* TOP UI LINE */}

      <mesh
        position={[
          0,
          0.32,
          0.035,
        ]}
      >
        <boxGeometry
          args={[
            1.15,
            0.018,
            0.018,
          ]}
        />

        <meshBasicMaterial
          ref={(m) => {
            structure.current[1] = m;
          }}
          color={GREY}
          transparent
          opacity={0.13}
        />
      </mesh>

      <group ref={accent}>
        {/* INTERACTION TRACE */}

        <mesh
          position={[
            -0.18,
            -0.02,
            0.04,
          ]}
          rotation={[
            0,
            0,
            0.42,
          ]}
        >
          <boxGeometry
            args={[
              0.62,
              0.014,
              0.014,
            ]}
          />

          <meshBasicMaterial
            ref={(m) => {
              structure.current[2] =
                m;
            }}
            color={LIME}
            transparent
            opacity={0.13}
          />
        </mesh>

        {/* CURSOR / ACTIVE POINT */}

        <mesh
          position={[
            0.32,
            0.22,
            0.055,
          ]}
          scale={0.09}
        >
          <sphereGeometry
            args={[1, 24, 24]}
          />

          <meshStandardMaterial
            ref={(m) => {
              core.current[0] = m;
            }}
            color={LIME}
            emissive={LIME}
            emissiveIntensity={
              0.25
            }
            metalness={0.25}
            roughness={0.25}
            toneMapped={false}
          />
        </mesh>
      </group>

      <pointLight
        ref={light}
        color={LIME}
        intensity={0}
        distance={4.5}
      />
    </group>
  );
}

/* =====================================================
   3D / WEBGL
===================================================== */

function WebglForm({
  at,
}: {
  at: number;
}) {
  const group =
    useRef<THREE.Group>(null);

  const accent =
    useRef<THREE.Group>(null);

  const structure =
    useRef<MaterialRef[]>([]);

  const core =
    useRef<CoreMaterialRef[]>([]);

  const light =
    useRef<THREE.PointLight>(null);

  useMilestoneMotion(
    at,
    group,
    structure,
    core,
    light,
    accent
  );

  return (
    <group ref={group}>
      <group ref={accent}>
        {/* OUTER WIREFRAME */}

        <mesh>
          <icosahedronGeometry
            args={[0.9, 1]}
          />

          <meshBasicMaterial
            ref={(m) => {
              structure.current[0] =
                m;
            }}
            color={GREY}
            wireframe
            transparent
            opacity={0.2}
          />
        </mesh>

        {/* INNER LIME WIREFRAME */}

        <mesh
          rotation={[
            0.4,
            0.35,
            0.2,
          ]}
        >
          <icosahedronGeometry
            args={[0.68, 1]}
          />

          <meshBasicMaterial
            ref={(m) => {
              structure.current[1] =
                m;
            }}
            color={LIME}
            wireframe
            transparent
            opacity={0.13}
          />
        </mesh>
      </group>

      {/* GLASS CORE */}

      <mesh scale={0.34}>
        <icosahedronGeometry
          args={[1, 2]}
        />

        <meshPhysicalMaterial
          ref={(m) => {
            core.current[0] = m;
          }}
          color={LIME}
          emissive={LIME}
          emissiveIntensity={
            0.25
          }
          metalness={0.08}
          roughness={0.08}
          transmission={0.5}
          thickness={0.65}
          clearcoat={1}
          clearcoatRoughness={
            0.08
          }
          ior={1.4}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        ref={light}
        color={LIME}
        intensity={0}
        distance={4.5}
      />
    </group>
  );
}

/* =====================================================
   CREATIVE FRONTEND
===================================================== */

function FrontendForm({
  at,
}: {
  at: number;
}) {
  const group =
    useRef<THREE.Group>(null);

  const accent =
    useRef<THREE.Group>(null);

  const structure =
    useRef<MaterialRef[]>([]);

  const core =
    useRef<CoreMaterialRef[]>([]);

  const light =
    useRef<THREE.PointLight>(null);

  useMilestoneMotion(
    at,
    group,
    structure,
    core,
    light,
    accent
  );

  const layers: [
    number,
    number,
    number
  ][] = [
    [-0.16, -0.1, -0.08],
    [0, 0, 0],
    [0.16, 0.1, 0.08],
  ];

  return (
    <group ref={group}>
      <group
        ref={accent}
        rotation={[
          0.05,
          -0.12,
          0,
        ]}
      >
        {layers.map(
          ([x, y, z], i) => (
            <mesh
              key={i}
              position={[
                x,
                y,
                z,
              ]}
              rotation={[
                0,
                0.12 * i,
                0,
              ]}
            >
              <planeGeometry
                args={[
                  0.95,
                  0.65,
                ]}
              />

              <meshBasicMaterial
                ref={(m) => {
                  structure.current[
                    i
                  ] = m;
                }}
                color={
                  i === 1
                    ? LIME
                    : GREY
                }
                wireframe={
                  i !== 1
                }
                transparent
                opacity={
                  i === 1
                    ? 0.2
                    : 0.13
                }
                side={
                  THREE.DoubleSide
                }
              />
            </mesh>
          )
        )}
      </group>

      {/* ACTIVE DESIGN POINT */}

      <mesh
        position={[
          0.3,
          0.18,
          0.12,
        ]}
        scale={0.055}
      >
        <boxGeometry
          args={[1, 1, 1]}
        />

        <meshStandardMaterial
          ref={(m) => {
            core.current[0] = m;
          }}
          color={LIME}
          emissive={LIME}
          emissiveIntensity={
            0.25
          }
          metalness={0.25}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        ref={light}
        color={LIME}
        intensity={0}
        distance={4.5}
      />
    </group>
  );
}

/* =====================================================
   MOTION SYSTEMS
===================================================== */

function MotionForm({
  at,
}: {
  at: number;
}) {
  const group =
    useRef<THREE.Group>(null);

  const accent =
    useRef<THREE.Group>(null);

  const structure =
    useRef<MaterialRef[]>([]);

  const core =
    useRef<CoreMaterialRef[]>([]);

  const light =
    useRef<THREE.PointLight>(null);

  useMilestoneMotion(
    at,
    group,
    structure,
    core,
    light,
    accent
  );

  const rings: {
    radius: number;
    rotation: [
      number,
      number,
      number
    ];
  }[] = [
    {
      radius: 0.88,
      rotation: [
        Math.PI / 2,
        0,
        0,
      ],
    },
    {
      radius: 0.68,
      rotation: [
        Math.PI / 2.5,
        0.6,
        0,
      ],
    },
    {
      radius: 0.49,
      rotation: [
        Math.PI / 1.8,
        -0.5,
        0.3,
      ],
    },
  ];

  return (
    <group ref={group}>
      <group ref={accent}>
        {rings.map(
          (ring, i) => (
            <mesh
              key={i}
              rotation={
                ring.rotation
              }
            >
              <torusGeometry
                args={[
                  ring.radius,
                  0.008,
                  8,
                  96,
                ]}
              />

              <meshBasicMaterial
                ref={(m) => {
                  structure.current[
                    i
                  ] = m;
                }}
                color={
                  i === 1
                    ? LIME
                    : GREY
                }
                transparent
                opacity={0.13}
              />
            </mesh>
          )
        )}
      </group>

      {/* CENTER */}

      <mesh scale={0.14}>
        <sphereGeometry
          args={[1, 24, 24]}
        />

        <meshStandardMaterial
          ref={(m) => {
            core.current[0] = m;
          }}
          color={LIME}
          emissive={LIME}
          emissiveIntensity={
            0.25
          }
          metalness={0.35}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        ref={light}
        color={LIME}
        intensity={0}
        distance={4.5}
      />
    </group>
  );
}

/* =====================================================
   FORMS
===================================================== */

const FORMS: Record<
  Shape,
  (props: {
    at: number;
  }) => JSX.Element
> = {
  web: WebForm,
  webgl: WebglForm,
  frontend: FrontendForm,
  motion: MotionForm,
};

/* =====================================================
   MILESTONE
===================================================== */

function MilestoneObject({
  data,
}: {
  data: Milestone;
}) {
  const {
    position,
    quaternion,
  } = useMemo(
    () =>
      getPathTransform(
        data.at,
        {
          lateralOffset:
            LATERAL_OFFSET *
            data.side,

          verticalOffset:
            VERTICAL_OFFSET,

          facing: "inward",
        }
      ),
    [
      data.at,
      data.side,
    ]
  );

  const Form =
    FORMS[data.shape];

  return (
    <group
      position={position}
      quaternion={quaternion}
    >
      <Form at={data.at} />
    </group>
  );
}

/* =====================================================
   SCENE OBJECTS
===================================================== */

export default function SceneObjects() {
  return (
    <>
      {MILESTONES.map(
        (milestone) => (
          <MilestoneObject
            key={
              milestone.label
            }
            data={milestone}
          />
        )
      )}
    </>
  );
}

export {
  MILESTONES,
};