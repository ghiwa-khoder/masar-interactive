"use client";

import Experience from "./Experience";
import { MILESTONES } from "./SceneObjects";

/*
 * SCROLL CONTAINER
 *
 * Section heights are still derived from the same
 * `at` values SceneObjects.tsx uses, so copy appears
 * while the camera is genuinely near the milestone
 * it describes.
 *
 * Copy voice changed from process ("first we do X")
 * to demonstration ("this page is built with X") —
 * consistent with treating the page itself as the
 * proof, not a case study about the proof.
 */

const TOTAL_VH = 900;

const CONTENT = [
  {
    at: 0,
    title: "Masar Interactive",
    body: "A path through what we build, made out of what we build.",
    eyebrow: "Masar — مسار — path",
  },
  {
    at: MILESTONES[0].at,
    title: "Interactive Web",
    body: "Pages that respond to the person on them, not just to a route.",
  },
  {
    at: MILESTONES[1].at,
    title: "3D / WebGL",
    body: "Real-time rendering in the browser — no plugin, no download, just this.",
  },
  {
    at: MILESTONES[2].at,
    title: "Creative Frontend",
    body: "Layout, type and motion decided together, because they're one decision.",
  },
  {
    at: MILESTONES[3].at,
    title: "Motion Systems",
    body: "The thing carrying you through this exact page, right now.",
  },
  {
    at: 1,
    title: "Start your path",
    body: "Tell us what you're building and we'll show you where the Masar leads.",
  },
];

function sectionHeight(index: number) {
  const current = CONTENT[index].at;
  const next = CONTENT[index + 1]?.at ?? 1;
  const vh = (next - current) * TOTAL_VH;
  return Math.max(vh, 100);
}

export default function Page() {
  return (
    <main style={{ background: "#0b182b" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Experience />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {CONTENT.map((section, i) => (
          <section
            key={section.title}
            style={{
              minHeight: `${sectionHeight(i)}vh`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 clamp(1.5rem, 7vw, 8rem)",
              maxWidth: "34rem",
              marginLeft: i % 2 === 0 ? 0 : "auto",
              marginRight: i % 2 === 0 ? "auto" : 0,
            }}
          >
            {section.eyebrow && (
              <p
                style={{
                  color: "#d8f860",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  marginBottom: "1.5rem",
                }}
              >
                {section.eyebrow}
              </p>
            )}
            <h2
              style={{
                color: "#f4f0e6",
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontWeight: 500,
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {section.title}
            </h2>
            <p
              style={{
                color: "#9ca8b4",
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                marginTop: "1rem",
                maxWidth: "36ch",
              }}
            >
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
