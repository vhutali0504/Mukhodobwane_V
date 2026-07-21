import { useState, useRef } from "react";
import { profile } from "../../data/profile";

const HEADLINES = {
  student: <>Hi, I'm <span className="accent">JV</span>.</>,
  cyber: <>Subject: <span className="accent">ShadowHawk</span></>,
  swe: <>Mukhodobwane<br />Vhutalihandivho<span className="accent">.</span></>,
};

const reduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Hero({ theme }) {
  const [hasPhoto, setHasPhoto] = useState(true);
  const frameRef = useRef(null);
  const tilt = theme === "student" && !reduced;

  function onMove(e) {
    if (!tilt) return;
    const el = frameRef.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(800px) rotateX(${py * -12}deg) rotateY(${px * 14}deg)`;
  }

  function onLeave() {
    if (!tilt) return;
    frameRef.current.style.transform = "";
  }

  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-text">
          <p className="eyebrow mono">{profile.name} · {profile.location}</p>
          <h1 className="hero-title">{HEADLINES[theme] ?? HEADLINES.swe}</h1>
          <p className="lede">{profile.tagline}</p>
          <div className="cta-row">
            <a className="btn btn-solid" href="#projects">See the work</a>
            <a className="btn btn-ghost" href="#contact">Get in touch</a>
          </div>
        </div>

        {hasPhoto && (
          <div className="hero-photo">
            <div
              className="photo-frame"
              ref={frameRef}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            >
              <img
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                onError={() => setHasPhoto(false)}
              />
              <span className="fcorner tl" /><span className="fcorner tr" />
              <span className="fcorner bl" /><span className="fcorner br" />
              <div className="photo-scan" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}