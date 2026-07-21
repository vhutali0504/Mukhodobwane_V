import { useEffect, useState } from "react";
import { profile } from "../data/profile";
import ThemeBackground from "./ThemeBackground";
import Hero from "./sections/Hero";
import Projects from "./sections/Projects";
import Experience from "./sections/Experience";
import Skills from "./sections/Skills";
import Contact from "./sections/Contact";
import "../styles/portfolio.css";

export default function Portfolio({ theme, onSwitchProfile }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [theme]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="portfolio">
      <ThemeBackground theme={theme} />
      {theme === "cyber" && <div className="theme-sweep" aria-hidden="true" />}

      <header className="topbar">
        <div className="wrap topbar-inner">
          <span className="topbar-id mono">{profile.shortName} — {profile.location}</span>

          <nav className={`topbar-nav ${menuOpen ? "open" : ""}`} aria-label="Main">
            <a href="#projects" onClick={closeMenu}>Projects</a>
            <a href="#experience" onClick={closeMenu}>Experience</a>
            <a href="#skills" onClick={closeMenu}>Skills</a>
            <a href="#contact" onClick={closeMenu}>Contact</a>
            <button
              className="switch-btn mono"
              onClick={() => { closeMenu(); onSwitchProfile(); }}
            >
              Switch profile
            </button>
          </nav>

          <button
            className={`menu-btn ${menuOpen ? "open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main className="wrap">
        <Hero theme={theme} />
        <Projects theme={theme} />
        <Experience />
        <Skills />
        <Contact />
      </main>

      <footer className="foot">
        <div className="wrap mono">
          {profile.name} · Johannesburg · Built by hand, three ways
        </div>
      </footer>
    </div>
  );
}