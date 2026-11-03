// CV text for menu ids 0-5, as plain lines. Task 11 wraps them to the screen.
// Built from profile data only.

const bullets = (list) => list.map((b) => `- ${b}`);

export function sectionLines(id, profile) {
  switch (id) {
    case 0:
      return [
        profile.name,
        profile.location,
        profile.availability,
        '',
        profile.summary,
      ];
    case 1:
      return profile.skills.map((s) => `${s.group}: ${s.items.join(', ')}`);
    case 2:
      return profile.experience.flatMap((e, i) => [
        ...(i ? [''] : []),
        `${e.org} | ${e.title}`,
        e.location ? `${e.when} | ${e.location}` : e.when,
        ...bullets(e.bullets),
      ]);
    case 3:
      return profile.projects.flatMap((p, i) => [
        ...(i ? [''] : []),
        p.title,
        `${p.kind} | ${p.when}`,
        `stack: ${p.stack.join(', ')}`,
        ...bullets(p.bullets),
        ...p.links.map((l) => `${l.label}: ${l.url}`),
      ]);
    case 4: {
      const ed = profile.education;
      return [
        ed.school,
        `${ed.degree} | ${ed.when}`,
        '',
        'coursework:',
        ...bullets(ed.coursework),
        '',
        ...bullets(ed.notes),
      ];
    }
    case 5:
      return [
        `email:     ${profile.email}`,
        `github:    ${profile.links.github}`,
        `linkedin:  ${profile.links.linkedin}`,
        `tryhackme: ${profile.links.tryhackme}`,
        '',
        'Full CV: use the "Download CV" button on the formal site.',
      ];
    default:
      return [];
  }
}
