import { profile } from "../../data/profile";
import TiltCard from "../TiltCard";

export default function Projects({ theme }) {
  return (
    <section id="projects" className="section reveal">
      <div className="sec-head">
        <span className="sec-label mono">Projects</span>
        <h2>Work on record</h2>
      </div>
      <div className="cards">
        {profile.projects.map((p, i) => (
          <TiltCard
            enabled={theme === "student"}
            className="card reveal"
            key={p.id}
            style={{ transitionDelay: `${i * 0.08}s` }}
          >
            {p.image && (
              <div className="card-thumb">
                <img
                  src={p.image}
                  alt={`${p.title} screenshot`}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                />
              </div>
            )}
            <div className="card-meta mono">
              <span className="card-status">{p.status}</span>
              <span>{p.stack.join(" · ")}</span>
            </div>
            <h3>{p.title}</h3>
            <p className="card-sub">{p.subtitle}</p>
            <p>{p.summary}</p>
            {p.points.length > 0 && (
              <ul>
                {p.points.map((pt, idx) => <li key={idx}>{pt}</li>)}
              </ul>
            )}
            {p.links.length > 0 && (
              <div className="card-links">
                {p.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </TiltCard>
        ))}
      </div>
    </section>
  );
}