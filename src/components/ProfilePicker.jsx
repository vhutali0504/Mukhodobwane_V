import { THEMES } from "../data/profile";
import "../styles/picker.css";

// Each profile's avatar, drawn inline so the picker
// previews the personality before a theme is active.
function Avatar({ id }) {
  if (id === "student") {
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <rect width="120" height="120" fill="#FAF8F4" />
        {/* notebook lines */}
        <line x1="0" y1="34" x2="120" y2="34" stroke="#E3DED2" strokeWidth="1.5" />
        <line x1="0" y1="58" x2="120" y2="58" stroke="#E3DED2" strokeWidth="1.5" />
        <line x1="0" y1="82" x2="120" y2="82" stroke="#E3DED2" strokeWidth="1.5" />
        <line x1="0" y1="106" x2="120" y2="106" stroke="#E3DED2" strokeWidth="1.5" />
        <line x1="22" y1="0" x2="22" y2="120" stroke="#E8730C" strokeWidth="1.5" opacity="0.5" />
        <text x="66" y="76" textAnchor="middle" fontFamily="Sora, sans-serif"
          fontWeight="800" fontSize="42" fill="#E8730C">JV</text>
      </svg>
    );
  }
  if (id === "cyber") {
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <rect width="120" height="120" fill="#0A0E12" />
        {/* fingerprint arcs */}
        {[14, 24, 34, 44].map((r) => (
          <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#D42B2B"
            strokeWidth="2" strokeDasharray="30 9" opacity="0.85" />
        ))}
        {/* crosshair */}
        <line x1="60" y1="2" x2="60" y2="16" stroke="#3BA55D" strokeWidth="2" />
        <line x1="60" y1="104" x2="60" y2="118" stroke="#3BA55D" strokeWidth="2" />
        <line x1="2" y1="60" x2="16" y2="60" stroke="#3BA55D" strokeWidth="2" />
        <line x1="104" y1="60" x2="118" y2="60" stroke="#3BA55D" strokeWidth="2" />
        <circle cx="60" cy="60" r="3.5" fill="#D42B2B" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect width="120" height="120" fill="#0F2237" />
      {/* blueprint grid */}
      {[20, 40, 60, 80, 100].map((p) => (
        <g key={p}>
          <line x1={p} y1="0" x2={p} y2="120" stroke="#24405E" strokeWidth="1" />
          <line x1="0" y1={p} x2="120" y2={p} stroke="#24405E" strokeWidth="1" />
        </g>
      ))}
      <text x="60" y="76" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace"
        fontWeight="500" fontSize="40" fill="#4FA3E3">{"{ }"}</text>
    </svg>
  );
}

export default function ProfilePicker({ onSelect }) {
  return (
    <div className="picker">
      <p className="picker-eyebrow mono">MUKHODOBWANE VHUTALIHANDIVHO — PORTFOLIO</p>
      <h1 className="picker-title">Who's viewing?</h1>
      <p className="picker-sub">Same person, same work. Pick your lens.</p>

      <div className="picker-cards">
        {THEMES.map((t, i) => (
          <button
            key={t.id}
            className={`picker-card card-${t.id}`}
            style={{ animationDelay: `${i * 0.12}s` }}
            onClick={() => onSelect(t.id)}
          >
            <span className="picker-avatar">
              <Avatar id={t.id} />
            </span>
            <span className="picker-name">{t.name}</span>
            <span className="picker-blurb">{t.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}