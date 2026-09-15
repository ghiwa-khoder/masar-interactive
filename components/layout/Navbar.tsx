"use client";

import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "ABOUT", href: "#about" },
  { label: "SERVICES", href: "#services" },
  { label: "WORK", href: "#work" },
  { label: "CONTACT", href: "#contact" },
];

function MasarLogo() {
  return (
    <svg
      className="masar-nav-mark"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 33.5C13.5 33.5 13.8 10.5 22 10.5C30.2 10.5 30.5 33.5 36 33.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle
        cx="8"
        cy="33.5"
        r="2.4"
        fill="currentColor"
      />

      <circle
        cx="36"
        cy="33.5"
        r="2.4"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`masar-navbar${
        scrolled ? " masar-navbar--scrolled" : ""
      }${
        menuOpen ? " masar-navbar--open" : ""
      }`}
    >
      {/* BRAND */}

      <a
        href="#top"
        className="masar-nav-brand"
        aria-label="MASAR Interactive — Home"
        onClick={() => setMenuOpen(false)}
      >
        <MasarLogo />

        <span className="masar-nav-brand-copy">
          <span className="masar-nav-brand-main">
            MASAR
          </span>

          <span className="masar-nav-brand-sub">
            INTERACTIVE
          </span>
        </span>
      </a>

      {/* DESKTOP NAV */}

      <nav
        className="masar-nav-links"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
          >
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {/* CTA */}

      <a
        href="#contact"
        className="masar-nav-cta"
      >
        START A PROJECT
      </a>

      {/* MOBILE BUTTON */}

      <button
        className="masar-nav-toggle"
        type="button"
        aria-label={
          menuOpen ? "Close menu" : "Open menu"
        }
        aria-expanded={menuOpen}
        onClick={() => {
          setMenuOpen((open) => !open);
        }}
      >
        <span />
        <span />
      </button>

      {/* MOBILE MENU */}

      <div className="masar-nav-mobile-panel">
        <nav aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="masar-nav-mobile-cta"
          onClick={() => setMenuOpen(false)}
        >
          START A PROJECT
        </a>
      </div>
    </header>
  );
}