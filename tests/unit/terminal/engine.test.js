import { describe, it, expect } from 'vitest';
import {
  createTerminal,
  step,
  visibleBootLines,
} from '../../../client/src/room/terminal/engine.js';
import { profile } from '../../../client/src/content/profile.js';
import { FACTS } from '../../../client/src/content/facts.js';
import { TRIVIA } from '../../../client/src/content/trivia.js';
import { VAULT_WORDS } from '../../../client/src/content/vaultWords.js';
import { mulberry32 } from './helpers.js';

const ctx = () => ({ profile, FACTS, TRIVIA, VAULT_WORDS, rng: mulberry32(7) });
const mk = () => createTerminal({ rng: mulberry32(1), now: 0 });

// Applies actions in order, returning the last state and all effects.
function run(t, actions, c = ctx()) {
  const effects = [];
  for (const a of actions) {
    const r = step(t, a, c);
    t = r.t;
    effects.push(...r.effects);
  }
  return { t, effects };
}
const key = (k, now = 0) => ({ type: 'key', key: k, now });
const type = (s) => [...s].map((ch) => key(ch));
const toMenu = () => {
  let t = mk();
  t = run(t, [{ type: 'sit', now: 1000 }]).t;
  t = run(t, [{ type: 'tick', now: 1000 + 6 * 280 }]).t;
  t = run(t, [{ type: 'pad', now: 5000 }]).t;
  t = run(t, [{ type: 'tick', now: 5000 + 1400 }]).t;
  t = run(t, [{ type: 'tick', now: 6400 + 1100 }]).t;
  return t;
};

describe('boot flow', () => {
  it('sit goes to boot with a glitch', () => {
    const r = step(mk(), { type: 'sit', now: 1000 }, ctx());
    expect(r.t.mode).toBe('boot');
    expect(r.t.bootAt).toBe(1000);
    expect(r.effects).toEqual(['glitch']);
  });
  it('reveals boot lines over time', () => {
    const t = step(mk(), { type: 'sit', now: 1000 }, ctx()).t;
    expect(visibleBootLines(t, 1000)).toBe(1);
    expect(visibleBootLines(t, 1000 + 280)).toBe(2);
    expect(visibleBootLines(t, 99999)).toBe(6);
  });
  it('walks boot -> scan -> granted -> menu', () => {
    let t = step(mk(), { type: 'sit', now: 1000 }, ctx()).t;
    t = step(t, { type: 'tick', now: 1000 + 6 * 280 - 1 }, ctx()).t;
    expect(t.mode).toBe('boot');
    t = step(t, { type: 'tick', now: 1000 + 6 * 280 }, ctx()).t;
    expect(t.mode).toBe('scan');
    const p = step(t, { type: 'pad', now: 4000 }, ctx());
    expect(p.effects).toEqual(['scanStarted']);
    expect(step(p.t, { type: 'pad', now: 4100 }, ctx()).effects).toEqual([]);
    const early = step(p.t, { type: 'tick', now: 4000 + 1399 }, ctx());
    expect(early.t.mode).toBe('scan');
    const g = step(p.t, { type: 'tick', now: 4000 + 1400 }, ctx());
    expect(g.t.mode).toBe('granted');
    const m = step(g.t, { type: 'tick', now: g.t.grantAt + 1100 }, ctx());
    expect(m.t.mode).toBe('menu');
    expect(m.effects).toEqual(['glitch']);
  });
  it('Enter starts the scan', () => {
    let t = step(mk(), { type: 'sit', now: 0 }, ctx()).t;
    t = step(t, { type: 'tick', now: 6 * 280 }, ctx()).t;
    expect(step(t, key('Enter', 3000), ctx()).effects).toEqual(['scanStarted']);
  });
  it('sitting again after standing up does not re-boot', () => {
    const t = toMenu();
    const stood = step(t, key('Escape'), ctx());
    expect(stood.effects).toEqual(['standUp']);
    const back = step(stood.t, { type: 'sit', now: 99999 }, ctx());
    expect(back.t.mode).toBe('menu');
    expect(back.effects).toEqual([]);
  });
  it('ignores keys during boot', () => {
    const t = step(mk(), { type: 'sit', now: 0 }, ctx()).t;
    const r = step(t, key('x'), ctx());
    expect(r.t).toEqual(t);
    expect(r.effects).toEqual([]);
  });
});

describe('menu', () => {
  it('wraps the selection and opens with Enter', () => {
    let t = toMenu();
    t = run(t, Array(9).fill(key('ArrowDown'))).t;
    expect(t.sel).toBe(0);
    t = run(t, [key('ArrowUp')]).t;
    expect(t.sel).toBe(8);
    t = run(t, [key('ArrowDown'), key('ArrowDown'), key('Enter')]).t;
    expect(t.mode).toBe('section');
    expect(t.sec).toBe(1);
  });
  it('opens fun_facts, trivia and the vault from ids 6-8', () => {
    const base = toMenu();
    const fact = run(base, [{ type: 'clickLine', index: 6 }]);
    expect(fact.t.mode).toBe('msg');
    expect(fact.t.msg.fact).toBe(true);
    expect(fact.effects).toEqual(['glitch']);
    expect(run(base, [{ type: 'clickLine', index: 7 }]).t.mode).toBe('quiz');
    expect(run(base, [{ type: 'clickLine', index: 8 }]).t.mode).toBe('game');
  });
  it('typing hack + Enter starts the game', () => {
    const r = run(toMenu(), [...type('hack'), key('Enter')]);
    expect(r.t.mode).toBe('game');
    expect(r.effects).toContain('glitch');
    expect(r.t.input).toBe('');
  });
  it('Escape stands up', () => {
    expect(run(toMenu(), [key('Escape')]).effects).toEqual(['standUp']);
  });
  it('exit command stands up', () => {
    expect(run(toMenu(), [...type('exit'), key('Enter')]).effects).toEqual(['standUp']);
  });
  it('caps input at 40 characters', () => {
    const t = run(toMenu(), type('x'.repeat(60))).t;
    expect(t.input).toHaveLength(40);
  });
  it('tapCommand matches typing', () => {
    const typed = run(toMenu(), [...type('quiz'), key('Enter')]);
    const tapped = run(toMenu(), [{ type: 'tapCommand', text: 'quiz' }]);
    expect(tapped.t.mode).toBe('quiz');
    expect(tapped.effects).toEqual(typed.effects);
  });
  it('whoami names the TryHackMe handle; sudo is refused; help lists commands', () => {
    const who = run(toMenu(), [{ type: 'tapCommand', text: 'whoami' }]).t.msg.lines.join('\n');
    expect(who).toContain('visitor');
    expect(who).toContain('HawkSpecter');
    const sudo = run(toMenu(), [{ type: 'tapCommand', text: 'sudo su' }]).t.msg.lines.join('\n');
    expect(sudo).toContain('not in the sudoers file');
    const help = run(toMenu(), [{ type: 'tapCommand', text: 'help' }]).t.msg.lines.join('\n');
    for (const w of ['quiz', 'hack', 'funfact']) expect(help).toContain(w);
  });
  it('unknown command shows not found; blank does nothing', () => {
    const r = run(toMenu(), [{ type: 'tapCommand', text: 'frobnicate' }]).t;
    expect(r.msg.lines[0]).toBe('command not found: frobnicate');
    const base = toMenu();
    expect(run(base, [{ type: 'tapCommand', text: '  ' }]).t).toEqual(base);
  });
});

describe('section and msg', () => {
  it('Backspace with empty input returns to the menu', () => {
    const t = run(toMenu(), [key('Enter')]).t;
    expect(t.mode).toBe('section');
    const r = run(t, [key('Backspace')]);
    expect(r.t.mode).toBe('menu');
    expect(r.effects).toContain('glitch');
  });
  it('Enter on a fact shows the next fact', () => {
    const a = run(toMenu(), [{ type: 'clickLine', index: 6 }]).t;
    const b = run(a, [key('Enter')]).t;
    expect(b.mode).toBe('msg');
    expect(b.msg.lines[0]).not.toBe(a.msg.lines[0]);
    expect(b.factIdx).toBe(a.factIdx + 1);
  });
});

describe('quiz', () => {
  const quiz = () => run(toMenu(), [{ type: 'tapCommand', text: 'quiz' }]).t;
  it('letters and digits answer when input is empty', () => {
    for (const k of ['a', 'b', 'c', '1', '2', '3']) {
      const t = run(quiz(), [key(k)]).t;
      expect(t.quiz.picked).toBe('abc123'.indexOf(k) % 3);
      expect(t.input).toBe('');
    }
  });
  it('Enter advances and the quiz ends after 5 questions', () => {
    let t = quiz();
    for (let r = 0; r < 5; r++) t = run(t, [key('a'), key('Enter')]).t;
    expect(t.quiz.i).toBe(5);
    const again = run(t, [key('Enter')]).t;
    expect(again.quiz.i).toBe(0);
  });
  it('clickLine answers 0-2', () => {
    expect(run(quiz(), [{ type: 'clickLine', index: 2 }]).t.quiz.picked).toBe(2);
  });
});

describe('game', () => {
  const game = () => run(toMenu(), [{ type: 'tapCommand', text: 'hack' }]).t;
  it('arrows move sel and Enter guesses it', () => {
    let t = game();
    t = run(t, [key('ArrowDown'), key('ArrowDown')]).t;
    expect(t.game.sel).toBe(2);
    t = run(t, [key('Enter')]).t;
    expect(t.game.log).toHaveLength(1);
    expect(t.game.log[0]).toContain(t.game.words[2]);
  });
  it('typing a candidate word guesses it', () => {
    const g = game();
    const w = g.game.words[3].toLowerCase();
    const t = run(g, [{ type: 'tapCommand', text: w }]).t;
    expect(t.game.log[0]).toContain(w.toUpperCase());
  });
  it('typing a non-candidate word logs not in memory', () => {
    const t = run(game(), [...type('zzzzz'), key('Enter')]).t;
    expect(t.game.log.at(-1)).toBe('> ZZZZZ  not in memory');
    expect(t.game.left).toBe(4);
  });
  it('clickLine guesses words[i]; Enter when done restarts', () => {
    let t = game();
    const secret = t.game.secret;
    t = run(t, [{ type: 'clickLine', index: t.game.words.indexOf(secret) }]).t;
    expect(t.game.done).toBe('win');
    expect(t.game.fact).toBeTruthy();
    const r = run(t, [key('Enter')]);
    expect(r.t.game.done).toBeNull();
    expect(r.t.game.log).toEqual([]);
    expect(r.effects).toContain('glitch');
  });
});

describe('purity', () => {
  it('never mutates the input state', () => {
    const actions = [
      key('ArrowDown'),
      key('x'),
      key('Backspace'),
      { type: 'tapCommand', text: 'quiz' },
      key('a'),
      key('Enter'),
      { type: 'tapCommand', text: 'hack' },
      key('Enter'),
      { type: 'tapCommand', text: 'funfact' },
      { type: 'clickLine', index: 7 },
      { type: 'tick', now: 1e6 },
    ];
    let t = toMenu();
    for (const a of actions) {
      const before = structuredClone(t);
      const r = step(t, a, ctx());
      expect(t).toEqual(before);
      t = r.t;
    }
  });
});
