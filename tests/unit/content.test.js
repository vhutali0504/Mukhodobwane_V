import { describe, it, expect } from 'vitest';
import { profile } from '../../client/src/content/profile.js';
import { FACTS } from '../../client/src/content/facts.js';
import { TRIVIA } from '../../client/src/content/trivia.js';
import { VAULT_WORDS } from '../../client/src/content/vaultWords.js';

describe('content', () => {
  it('skills match the CV', () => {
    expect(profile.skills.map((s) => s.group)).toEqual([
      'Languages', 'Web & Backend', 'Databases', 'Security', 'Tools & Practices',
    ]);
    expect(profile.skills[0].items).toEqual(['JavaScript (ES6+)', 'Java', 'C++', 'C#', 'SQL']);
  });

  it('projects in spec order', () => {
    expect(profile.projects.map((p) => p.id)).toEqual(['ksms', 'fingerprint', 'tle', 'job-tracker', 'this-portfolio']);
  });

  it('ksms has no links and tle has no links', () => {
    const byId = Object.fromEntries(profile.projects.map((p) => [p.id, p]));
    expect(byId.ksms.links).toEqual([]);
    expect(byId.tle.links).toEqual([]);
  });

  it('stats', () => {
    expect(profile.stats.map((s) => s.value)).toEqual([5, 5, 2, 2024]);
    expect(profile.stats.map((s) => s.label)).toEqual([
      'projects built', 'programming languages', 'junior students mentored', 'co-founded Elevate Digital Solutions',
    ]);
  });

  it('availability is exact', () => {
    expect(profile.availability).toBe('Open to roles, starting 2027');
  });

  it('experience order', () => {
    expect(profile.experience.map((e) => e.org)).toEqual(['Elevate Digital Solutions', 'StudyTrust']);
    expect(profile.experience.map((e) => e.when)).toEqual(['Jan 2024 – Present', 'Feb 2026 – Present']);
  });

  it('no phone number in content', () => {
    const all = JSON.stringify([profile, FACTS, TRIVIA, VAULT_WORDS]);
    expect(all).not.toMatch(/(\+27|\b0)\s?\d{2}\s?\d{3}\s?\d{4}/);
  });

  it('facts', () => {
    expect(FACTS.length).toBeGreaterThanOrEqual(12);
    for (const f of FACTS) {
      expect(f.length).toBeGreaterThan(0);
      expect(f.length).toBeLessThanOrEqual(220);
    }
  });

  it('trivia', () => {
    expect(TRIVIA.length).toBeGreaterThanOrEqual(12);
    for (const t of TRIVIA) {
      expect(t.o).toHaveLength(3);
      expect([0, 1, 2]).toContain(t.a);
    }
    expect(new Set(TRIVIA.map((t) => t.q)).size).toBe(TRIVIA.length);
  });

  it('vault words', () => {
    expect(VAULT_WORDS.length).toBeGreaterThanOrEqual(16);
    expect(new Set(VAULT_WORDS).size).toBe(VAULT_WORDS.length);
    for (const w of VAULT_WORDS) expect(w).toMatch(/^[A-Z]{5}$/);
  });
});
