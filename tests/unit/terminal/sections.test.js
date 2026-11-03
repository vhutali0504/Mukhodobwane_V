import { describe, it, expect } from 'vitest';
import { sectionLines } from '../../../client/src/room/terminal/sections.js';
import { profile } from '../../../client/src/content/profile.js';

describe('sectionLines', () => {
  it('contact has email, links and the CV pointer', () => {
    const text = sectionLines(5, profile).join('\n');
    expect(text).toContain(profile.email);
    expect(text).toContain('github.com/vhutali0504');
    expect(text).toContain('linkedin.com/in/mukhodobwanev');
    expect(text).toContain('tryhackme.com/p/HawkSpecter');
    expect(text).toContain('Download CV');
  });
  it('every section has lines and no phone number', () => {
    for (let id = 0; id < 6; id++) {
      const lines = sectionLines(id, profile);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.join('\n')).not.toMatch(/(\+27|\b0)\s?\d{2}\s?\d{3}\s?\d{4}/);
    }
  });
  it('experience and projects list every entry', () => {
    const exp = sectionLines(2, profile).join('\n');
    for (const e of profile.experience) expect(exp).toContain(e.org);
    const proj = sectionLines(3, profile).join('\n');
    for (const p of profile.projects) expect(proj).toContain(p.title);
  });
  it('returns nothing for ids beyond the CV sections', () => {
    expect(sectionLines(6, profile)).toEqual([]);
  });
});
