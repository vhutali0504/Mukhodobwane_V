import { useEffect, useRef } from "react";

/* ShadowHawk: sparse digital rain on a canvas.
   Red glyphs, occasional green one — predator colors, low opacity. */
function CyberRain() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glyphs = "01ABCDEF<>/#$%&*";
    const colWidth = 24;
    const size = 15;
    let cols, drops, raf, last = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / colWidth);
      drops = Array.from({ length: cols }, () => Math.random() * -60);
    }
    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      return () => window.removeEventListener("resize", resize);
    }

    function draw(t) {
      raf = requestAnimationFrame(draw);
      if (t - last < 90) return; // slow the tick — atmosphere, not a screensaver
      last = t;

     ctx.fillStyle = "rgba(10, 14, 18, 0.12)"; // fading trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${size}px "IBM Plex Mono", monospace`;

      for (let i = 0; i < cols; i++) {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillStyle =
          Math.random() < 0.05
            ? "rgba(59, 165, 93, 0.55)"   // rare green blip
            : Math.random() < 0.25
            ? "rgba(255, 96, 78, 0.55)"   // bright stream heads
            : "rgba(212, 43, 43, 0.3)";   // the body of the rain
        ctx.fillText(glyph, i * colWidth, drops[i] * size);
        if (drops[i] * size > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="bg-canvas" aria-hidden="true" />;
}

export default function ThemeBackground({ theme }) {
  if (theme === "cyber") {
    return (
      <div className="theme-bg">
        <CyberRain />
        <div className="cyber-extras" aria-hidden="true">
          {/* radar sweep */}
          <svg className="radar" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="5" y1="100" x2="195" y2="100" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
            <line x1="100" y1="5" x2="100" y2="195" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
            <g className="radar-arm">
              <line x1="100" y1="100" x2="100" y2="8" stroke="currentColor" strokeWidth="1.6" />
            </g>
            <circle cx="146" cy="72" r="3" fill="#3BA55D" className="radar-blip" />
          </svg>

          {/* padlock */}
          <svg className="cyb-icon icon-lock" viewBox="0 0 48 60">
            <rect x="6" y="26" width="36" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M14 26 V17 a10 10 0 0 1 20 0 V26" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="24" cy="38" r="4" fill="currentColor" />
            <line x1="24" y1="41" x2="24" y2="47" stroke="currentColor" strokeWidth="2.5" />
          </svg>

          {/* shield */}
          <svg className="cyb-icon icon-shield" viewBox="0 0 48 58">
            <path d="M24 2 L44 10 V28 C44 43 35 52 24 56 C13 52 4 43 4 28 V10 Z"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M15 28 L22 35 L34 20" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* key */}
          <svg className="cyb-icon icon-key" viewBox="0 0 64 28">
            <circle cx="13" cy="14" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <line x1="22" y1="14" x2="60" y2="14" stroke="currentColor" strokeWidth="2.5" />
            <line x1="50" y1="14" x2="50" y2="22" stroke="currentColor" strokeWidth="2.5" />
            <line x1="58" y1="14" x2="58" y2="20" stroke="currentColor" strokeWidth="2.5" />
          </svg>

          {/* system chatter */}
          <span className="sys-text t1">[ OK ] handshake :: TLS 1.3</span>
          <span className="sys-text t2">SCANNING 10.0.4.0/24 ...</span>
          <span className="sys-text t3">ACCESS DENIED — retrying</span>
          <span className="sys-text t4">auth.token refresh :: queued</span>

          {/* glitch bars */}
          <span className="glitch-bar gb-1" />
          <span className="glitch-bar gb-2" />
        </div>
      </div>
    );
  }

 if (theme === "student") {
    return (
      <div className="theme-bg" aria-hidden="true">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />

        <svg className="paper-plane plane-1" viewBox="0 0 64 64">
          <path d="M2 34 L62 2 L34 62 L28 40 Z" fill="#FFFFFF" stroke="#E8730C" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M62 2 L28 40" fill="none" stroke="#E8730C" strokeWidth="1.5" />
        </svg>
        <svg className="paper-plane plane-2" viewBox="0 0 64 64">
          <path d="M2 34 L62 2 L34 62 L28 40 Z" fill="#FFFFFF" stroke="#3B6EA5" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M62 2 L28 40" fill="none" stroke="#3B6EA5" strokeWidth="1.5" />
        </svg>

        <span className="floating-note note-1" />
        <span className="floating-note note-2" />
        <span className="floating-note note-3" />

        {/* closed book */}
        <svg className="school-item item-book" viewBox="0 0 64 48">
          <rect x="4" y="6" width="56" height="36" rx="3" fill="#3B6EA5" />
          <rect x="10" y="10" width="46" height="28" rx="2" fill="#FFFFFF" />
          <line x1="14" y1="6" x2="14" y2="42" stroke="#2C5580" strokeWidth="3" />
          <line x1="18" y1="17" x2="50" y2="17" stroke="#D8D2C4" strokeWidth="2" />
          <line x1="18" y1="24" x2="50" y2="24" stroke="#D8D2C4" strokeWidth="2" />
          <line x1="18" y1="31" x2="44" y2="31" stroke="#D8D2C4" strokeWidth="2" />
        </svg>

        {/* open book */}
        <svg className="school-item item-open-book" viewBox="0 0 64 44">
          <path d="M32 8 C22 2 8 3 4 7 V38 C8 34 22 33 32 38 C42 33 56 34 60 38 V7 C56 3 42 2 32 8 Z"
            fill="#FFFFFF" stroke="#E8730C" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="32" y1="8" x2="32" y2="38" stroke="#E8730C" strokeWidth="1.5" />
          <line x1="10" y1="14" x2="26" y2="12" stroke="#E3DED2" strokeWidth="1.5" />
          <line x1="10" y1="20" x2="26" y2="18" stroke="#E3DED2" strokeWidth="1.5" />
          <line x1="38" y1="12" x2="54" y2="14" stroke="#E3DED2" strokeWidth="1.5" />
          <line x1="38" y1="18" x2="54" y2="20" stroke="#E3DED2" strokeWidth="1.5" />
        </svg>

        {/* pencil */}
        <svg className="school-item item-pencil" viewBox="0 0 64 14">
          <rect x="2" y="3" width="8" height="8" rx="2" fill="#F2A7B8" />
          <rect x="10" y="3" width="4" height="8" fill="#9AA3B2" />
          <rect x="14" y="3" width="34" height="8" fill="#F2B134" />
          <polygon points="48,3 60,7 48,11" fill="#F5DEB8" />
          <polygon points="56,5.7 60,7 56,8.3" fill="#1E2430" />
        </svg>

        {/* graduation cap */}
        <svg className="school-item item-cap" viewBox="0 0 64 48">
          <polygon points="32,4 60,16 32,28 4,16" fill="#1E2430" />
          <path d="M18 22 V32 C18 36 46 36 46 32 V22 L32 28 Z" fill="#2C3444" />
          <line x1="32" y1="16" x2="50" y2="20" stroke="#E8730C" strokeWidth="1.5" />
          <line x1="50" y1="20" x2="50" y2="32" stroke="#E8730C" strokeWidth="1.5" />
          <circle cx="50" cy="34" r="2.5" fill="#E8730C" />
        </svg>

        {/* ruler */}
        <svg className="school-item item-ruler" viewBox="0 0 64 16">
          <rect x="1" y="2" width="62" height="12" rx="2" fill="#FFD877" stroke="#D9AE3C" strokeWidth="1" />
          {[8, 15, 22, 29, 36, 43, 50, 57].map((x, i) => (
            <line key={x} x1={x} y1="2" x2={x} y2={i % 2 === 0 ? 9 : 6.5}
              stroke="#8A6D1F" strokeWidth="1" />
          ))}
        </svg>
      </div>
    );
  }

  if (theme === "swe") {
    return (
      <div className="theme-bg" aria-hidden="true">
        {/* binary tree — nodes pulse in traversal order */}
        <svg className="eng-item eng-tree" viewBox="0 0 120 92">
          <line x1="60" y1="14" x2="30" y2="44" stroke="currentColor" strokeWidth="1" />
          <line x1="60" y1="14" x2="90" y2="44" stroke="currentColor" strokeWidth="1" />
          <line x1="30" y1="44" x2="15" y2="74" stroke="currentColor" strokeWidth="1" />
          <line x1="30" y1="44" x2="45" y2="74" stroke="currentColor" strokeWidth="1" />
          <line x1="90" y1="44" x2="75" y2="74" stroke="currentColor" strokeWidth="1" />
          <line x1="90" y1="44" x2="105" y2="74" stroke="currentColor" strokeWidth="1" />
          <circle className="tnode tn-1" cx="60" cy="14" r="7" />
          <circle className="tnode tn-2" cx="30" cy="44" r="7" />
          <circle className="tnode tn-3" cx="90" cy="44" r="7" />
          <circle className="tnode tn-4" cx="15" cy="74" r="7" />
          <circle className="tnode tn-5" cx="45" cy="74" r="7" />
          <circle className="tnode tn-6" cx="75" cy="74" r="7" />
          <circle className="tnode tn-7" cx="105" cy="74" r="7" />
        </svg>

        {/* sorting bars — reordering themselves forever */}
        <svg className="eng-item eng-sort" viewBox="0 0 88 60">
          <rect className="sbar sb-1" x="2"  y="10" width="10" height="46" />
          <rect className="sbar sb-2" x="17" y="10" width="10" height="46" />
          <rect className="sbar sb-3" x="32" y="10" width="10" height="46" />
          <rect className="sbar sb-4" x="47" y="10" width="10" height="46" />
          <rect className="sbar sb-5" x="62" y="10" width="10" height="46" />
          <rect className="sbar sb-6" x="77" y="10" width="10" height="46" />
        </svg>

        {/* Big-O sketch */}
        <svg className="eng-item eng-bigo" viewBox="0 0 100 82">
          <path d="M10 4 V70 H96" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M10 70 L88 22" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
          <path d="M10 70 Q58 66 76 6" fill="none" stroke="currentColor" strokeWidth="1" />
          <text x="80" y="16" fontSize="8" fontFamily="IBM Plex Mono, monospace" fill="currentColor">O(n²)</text>
          <text x="86" y="34" fontSize="8" fontFamily="IBM Plex Mono, monospace" fill="currentColor">O(n)</text>
        </svg>

        {/* browser wireframe with a loading bar */}
        <svg className="eng-item eng-browser" viewBox="0 0 120 84">
          <rect x="1" y="1" width="118" height="82" rx="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <line x1="1" y1="16" x2="119" y2="16" stroke="currentColor" strokeWidth="1" />
          <circle cx="9" cy="8.5" r="2.2" fill="currentColor" />
          <circle cx="17" cy="8.5" r="2.2" fill="currentColor" />
          <circle cx="25" cy="8.5" r="2.2" fill="currentColor" />
          <rect className="load-bar" x="8" y="24" width="104" height="4" rx="2" fill="currentColor" />
          <line x1="8" y1="40" x2="86" y2="40" stroke="currentColor" strokeWidth="1.2" />
          <line x1="8" y1="50" x2="104" y2="50" stroke="currentColor" strokeWidth="1.2" />
          <line x1="8" y1="60" x2="70" y2="60" stroke="currentColor" strokeWidth="1.2" />
          <line x1="8" y1="70" x2="94" y2="70" stroke="currentColor" strokeWidth="1.2" />
        </svg>

        {/* phone wireframe */}
        <svg className="eng-item eng-phone" viewBox="0 0 44 84">
          <rect x="1" y="1" width="42" height="82" rx="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <line x1="14" y1="8" x2="30" y2="8" stroke="currentColor" strokeWidth="1.4" />
          <rect x="8" y="16" width="28" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="8" y1="44" x2="36" y2="44" stroke="currentColor" strokeWidth="1" />
          <line x1="8" y1="52" x2="30" y2="52" stroke="currentColor" strokeWidth="1" />
          <line x1="8" y1="60" x2="34" y2="60" stroke="currentColor" strokeWidth="1" />
          <circle cx="22" cy="74" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>

        {/* database cylinder */}
        <svg className="eng-item eng-db" viewBox="0 0 64 72">
          <ellipse cx="32" cy="12" rx="26" ry="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 12 V58 A26 9 0 0 0 58 58 V12" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 28 A26 9 0 0 0 58 28" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M6 44 A26 9 0 0 0 58 44" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>

        {/* code brackets */}
        <svg className="eng-item eng-code" viewBox="0 0 80 40">
          <text x="40" y="30" textAnchor="middle" fontSize="32"
            fontFamily="IBM Plex Mono, monospace" fill="currentColor">&lt;/&gt;</text>
        </svg>
      </div>
    );
  }

  return null;
}