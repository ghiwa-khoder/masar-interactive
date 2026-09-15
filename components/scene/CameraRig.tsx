"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import {
  scroll,
  damp,
} from "./useScrollProgress";

const START = 0;
const END = 0.965;
const LOOK_AHEAD = 0.045;

function smoothPulse(
  value: number,
  center: number,
  radius: number
) {
  const distance =
    Math.abs(value - center);

  if (distance >= radius) {
    return 0;
  }

  const x =
    1 - distance / radius;

  return (
    x *
    x *
    (3 - 2 * x)
  );
}

export default function CameraRig() {
  const cameraPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(
            0,
            0.95,
            6.5
          ),

          new THREE.Vector3(
            -0.25,
            0.82,
            3.0
          ),

          new THREE.Vector3(
            -0.85,
            0.72,
            -1.0
          ),

          new THREE.Vector3(
            -0.2,
            0.86,
            -4.5
          ),

          new THREE.Vector3(
            1.0,
            0.78,
            -8.0
          ),

          new THREE.Vector3(
            0.25,
            0.68,
            -11.5
          ),

          new THREE.Vector3(
            -0.95,
            0.82,
            -15.0
          ),

          new THREE.Vector3(
            -0.2,
            0.92,
            -18.5
          ),

          new THREE.Vector3(
            0.95,
            0.76,
            -22.0
          ),

          new THREE.Vector3(
            0.25,
            0.82,
            -25.0
          ),

          new THREE.Vector3(
            0,
            1.05,
            -27.2
          ),
        ],
        false,
        "catmullrom",
        0.5
      ),
    []
  );

  const desired =
    useRef(
      new THREE.Vector3()
    );

  const lookTarget =
    useRef(
      cameraPath
        .getPointAt(
          LOOK_AHEAD
        )
        .clone()
    );

  const parallax =
    useRef(
      new THREE.Vector2()
    );

  const roll =
    useRef(0);

  useFrame(
    (
      {
        camera,
        pointer,
      },
      delta
    ) => {
      const dt =
        Math.min(
          delta,
          0.1
        );

      /* =========================
         SCROLL SMOOTHING
      ========================= */

      scroll.smooth =
        scroll.reduced
          ? scroll.raw
          : damp(
              scroll.smooth,
              scroll.raw,
              3.2,
              dt
            );

      const progress =
        THREE.MathUtils.clamp(
          scroll.smooth,
          0,
          1
        );

      const t =
        THREE.MathUtils.lerp(
          START,
          END,
          progress
        );

      /* =========================
         CAMERA PATH
      ========================= */

      const point =
        cameraPath.getPointAt(
          t
        );

      const aheadT =
        Math.min(
          t +
            LOOK_AHEAD,
          0.999
        );

      const ahead =
        cameraPath.getPointAt(
          aheadT
        );

      /* =========================
         MOUSE PARALLAX
      ========================= */

      if (
        !scroll.reduced
      ) {
        parallax.current.x =
          damp(
            parallax
              .current.x,

            pointer.x *
              0.1,

            2.5,
            dt
          );

        parallax.current.y =
          damp(
            parallax
              .current.y,

            pointer.y *
              0.055,

            2.5,
            dt
          );
      } else {
        parallax.current.set(
          0,
          0
        );
      }

      /* =========================
         MILESTONE MOMENTS
      ========================= */

      const webMoment =
        smoothPulse(
          progress,
          0.17,
          0.11
        );

      const webglMoment =
        smoothPulse(
          progress,
          0.37,
          0.11
        );

      const frontendMoment =
        smoothPulse(
          progress,
          0.62,
          0.11
        );

      const motionMoment =
        smoothPulse(
          progress,
          0.86,
          0.1
        );

      const milestoneEnergy =
        Math.max(
          webMoment,
          webglMoment,
          frontendMoment,
          motionMoment
        );

      /* =========================
         FINAL REVEAL
      ========================= */

      const finalReveal =
        THREE.MathUtils.smoothstep(
          progress,
          0.88,
          1
        );

      const breatheY =
        milestoneEnergy *
          0.08 +
        finalReveal *
          0.16;

      const finalPullback =
        finalReveal *
        0.75;

      /* =========================
         DESIRED POSITION
      ========================= */

      desired.current.set(
        point.x +
          parallax
            .current.x,

        point.y +
          parallax
            .current.y +
          breatheY,

        point.z +
          finalPullback
      );

      const positionLambda =
        finalReveal >
        0.01
          ? 3.8
          : 4.6;

      /* =========================
         CAMERA MOVEMENT
      ========================= */

      camera.position.x =
        damp(
          camera
            .position.x,

          desired
            .current.x,

          positionLambda,
          dt
        );

      camera.position.y =
        damp(
          camera
            .position.y,

          desired
            .current.y,

          positionLambda,
          dt
        );

      camera.position.z =
        damp(
          camera
            .position.z,

          desired
            .current.z,

          positionLambda,
          dt
        );

      /* =========================
         LOOK TARGET
      ========================= */

      const lookLift =
        milestoneEnergy *
          0.05 +
        finalReveal *
          0.22;

      lookTarget.current.x =
        damp(
          lookTarget
            .current.x,

          ahead.x,

          3.7,
          dt
        );

      lookTarget.current.y =
        damp(
          lookTarget
            .current.y,

          ahead.y +
            lookLift,

          3.7,
          dt
        );

      lookTarget.current.z =
        damp(
          lookTarget
            .current.z,

          ahead.z,

          3.7,
          dt
        );

      camera.lookAt(
        lookTarget.current
      );

      /* =========================
         SUBTLE CAMERA ROLL
      ========================= */

      if (
        !scroll.reduced
      ) {
        const targetRoll =
          pointer.x *
            -0.008 +
          webMoment *
            -0.006 +
          webglMoment *
            0.008 +
          frontendMoment *
            -0.006 +
          motionMoment *
            0.008;

        roll.current =
          damp(
            roll.current,
            targetRoll,
            3,
            dt
          );

        camera.rotateZ(
          roll.current
        );
      }
    }
  );

  return null;
}