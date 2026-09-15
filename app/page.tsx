"use client";

import Navbar from "@/components/layout/Navbar";
import Experience from "@/components/scene/Experience";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <div className="scene-layer">
        <Experience />
      </div>

      <Navbar />

      <div className="content-layer">
        <Hero />
        <Manifesto />
        <Services />
        <Work />
        <Contact />
      </div>
    </main>
  );
}