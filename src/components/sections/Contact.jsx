import { profile } from "../../data/profile";

export default function Contact() {
  const rows = [
    { k: "Email", label: profile.email, url: `mailto:${profile.email}` },
    { k: "GitHub", ...profile.links.github },
    { k: "LinkedIn", ...profile.links.linkedin },
    { k: "TryHackMe", ...profile.links.tryhackme },
  ];
  return (
    <section id="contact" className="section reveal">
      <div className="sec-head">
        <span className="sec-label mono">Contact</span>
        <h2>Make contact</h2>
      </div>
      <div className="channels">
        {rows.map((r) => (
          <a key={r.k} href={r.url} target="_blank" rel="noopener noreferrer">
            <span className="k mono">{r.k}</span>
            <span className="mono">{r.label}</span>
          </a>
        ))}
      </div>
      <span className="hire mono">{profile.availability}</span>
    </section>
  );
}