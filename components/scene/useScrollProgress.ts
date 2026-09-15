"use client";

import { useEffect, useRef } from "react";

/*
 * SHARED SCROLL STATE
 *
 * raw      = actual scroll position, 0 to 1
 * smooth   = damped value the scene reads
 *
 * Everything in the scene reads `smooth`, so the
 * camera, the path reveal and the objects stay in
 * perfect agreement. There is no second source of
 * motion anywhere in the project.
 */
export const scroll = {
  raw: 0,
  smooth: 0,
  reduced: false,
};

/*
 * Frame-rate independent damping.
 *
 * lerp(a, b, 0.05) moves twice as fast on a 120Hz
 * screen as on 60Hz. This does not.
 *
 * `lambda` is responsiveness: higher = tighter
 * tracking, lower = heavier and more cinematic.
 */
export function damp(
  current: number,
  target: number,
  lambda: number,
  delta: number
) {
  return (
    target +
    (current - target) * Math.exp(-lambda * delta)
  );
}

export function useScrollProgress() {
  const maxScroll = useRef(1);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    scroll.reduced = media.matches;

    const onMotionChange = () => {
      scroll.reduced = media.matches;
    };

    /*
     * scrollHeight forces a layout recalculation,
     * so it is measured here and on resize only —
     * never inside the render loop.
     */
    const measure = () => {
      maxScroll.current = Math.max(
        document.documentElement.scrollHeight -
          window.innerHeight,
        1
      );
      read();
    };

    const read = () => {
      scroll.raw = Math.min(
        Math.max(window.scrollY / maxScroll.current, 0),
        1
      );
    };

    measure();

    window.addEventListener("scroll", read, {
      passive: true,
    });
    window.addEventListener("resize", measure);
    media.addEventListener("change", onMotionChange);

    /*
     * Content height can change after fonts and
     * images settle, so re-measure when it does.
     */
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", measure);
      media.removeEventListener("change", onMotionChange);
      observer.disconnect();
    };
  }, []);
}
