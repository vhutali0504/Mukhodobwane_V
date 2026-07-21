import { profile } from "../../data/profile";

export default function Skills() {
  return (
    <section id="skills" className="section reveal">
      <div className="sec-head">
        <span className="sec-label mono">Skills</span>
        <h2>What I work with</h2>
      </div>
      <div className="skill-groups">
        {Object.entries(profile.skills).map(([group, items]) => (
          <div className="skill-group" key={group}>
            <h3 className="mono">{group}</h3>
            <div className="tags">
              {items.map((s) => <span className="tag" key={s}>{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}