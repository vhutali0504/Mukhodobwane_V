import { describe, it, expect } from 'vitest';
import { likeness, createVault, guessVault } from '../../../client/src/room/terminal/vault.js';
import { VAULT_WORDS } from '../../../client/src/content/vaultWords.js';
import { mulberry32 } from './helpers.js';

const fresh = () => createVault(VAULT_WORDS, mulberry32(42));
const fact = () => 'a fact';
const wrongWord = (v) => v.words.find((w) => w !== v.secret);

describe('vault', () => {
  it('counts same-position letters', () => {
    expect(likeness('TOKEN', 'TAKEN')).toBe(4);
  });
  it('creates 8 candidates containing the secret', () => {
    const v = fresh();
    expect(v.words).toHaveLength(8);
    expect(v.words).toContain(v.secret);
    expect(v.left).toBe(4);
    expect(v.done).toBeNull();
  });
  it('costs an attempt and logs likeness on a wrong guess', () => {
    const v = fresh();
    const w = wrongWord(v);
    const g = guessVault(v, w, fact);
    expect(g.left).toBe(3);
    expect(g.log.at(-1)).toBe(`> ${w}  likeness ${likeness(w, v.secret)}/5`);
    expect(v.left).toBe(4);
  });
  it('ignores a repeat guess', () => {
    const v = fresh();
    const g = guessVault(v, wrongWord(v), fact);
    expect(guessVault(g, wrongWord(v).toLowerCase(), fact)).toBe(g);
  });
  it('logs a non-candidate without costing an attempt', () => {
    const v = fresh();
    const g = guessVault(v, 'zzzzz', fact);
    expect(g.left).toBe(4);
    expect(g.log.at(-1)).toBe('> ZZZZZ  not in memory');
  });
  it('wins on the secret and attaches the fact', () => {
    const v = fresh();
    const g = guessVault(v, v.secret, fact);
    expect(g.done).toBe('win');
    expect(g.fact).toBe('a fact');
    expect(g.log.at(-1)).toBe(`> ${v.secret}  MATCH`);
  });
  it('locks out after four wrong guesses', () => {
    let v = fresh();
    const wrong = v.words.filter((w) => w !== v.secret).slice(0, 4);
    for (const w of wrong) v = guessVault(v, w, fact);
    expect(v.done).toBe('lose');
    expect(v.log.at(-1)).toBe(`> LOCKOUT · it was ${v.secret}`);
    expect(guessVault(v, v.secret, fact)).toBe(v);
  });
});
