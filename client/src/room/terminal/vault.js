import { shuffled } from './quiz.js';

export const VAULT_SIZE = 8;
export const VAULT_ATTEMPTS = 4;

// Number of letters in the same position.
export function likeness(a, b) {
  let n = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) n++;
  return n;
}

export function createVault(words, rng) {
  const pool = shuffled(words, rng).slice(0, VAULT_SIZE);
  const secret = pool[Math.floor(rng() * pool.length)];
  return { words: pool, secret, left: VAULT_ATTEMPTS, log: [], sel: 0, done: null, fact: '' };
}

export function guessVault(v, word, pickFact) {
  if (v.done) return v;
  const w = String(word).toUpperCase();
  if (!v.words.includes(w)) return { ...v, log: [...v.log, `> ${w}  not in memory`] };
  if (v.log.some((l) => l.startsWith(`> ${w} `))) return v;
  if (w === v.secret) {
    return { ...v, done: 'win', fact: pickFact(), log: [...v.log, `> ${w}  MATCH`] };
  }
  const left = v.left - 1;
  const log = [...v.log, `> ${w}  likeness ${likeness(w, v.secret)}/5`];
  if (left <= 0) {
    return { ...v, left: 0, done: 'lose', log: [...log, `> LOCKOUT · it was ${v.secret}`] };
  }
  return { ...v, left, log };
}
