import { profile } from "../../data/profile";

export default function Experience() {
  return (
    <section id="experience" className="section reveal">
      <div className="sec-head">
        <span className="sec-label mono">Experience</span>
        <h2>Where I've been</h2>
      </div>
      <div className="xp">
        {profile.experience.map((x) => (
          <div className="xp-item" key={x.title}>
            <div className="xp-when mono">{x.when}</div>
            <div>
              <h3>{x.title}</h3>
              <div className="xp-org mono">{x.org}</div>
              <p>{x.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}