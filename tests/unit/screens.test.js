import { describe, it, expect } from 'vitest';
import { createTerminal, step } from '../../client/src/room/terminal/engine.js';
import { drawMain, hitLine } from '../../client/src/room/screens/drawMain.js';
import {
  drawSideLeft,
  drawSideRight,
  drawTopLeft,
  drawTopRight,
} from '../../client/src/room/screens/drawSide.js';
import { drawNote } from '../../client/src/room/screens/drawNote.js';
import { mulberry32 } from './terminal/helpers.js';

const mkCtx = () => document.createElement('canvas').getContext('2d');
const texts = (ctx) => ctx.fillText.mock.calls.map((c) => String(c[0]));
const rng = () => mulberry32(7);

function seatedMenu() {
  let t = createTerminal({ rng: rng(), now: 0 });
  const act = (a) => (t = step(t, a, { rng: rng() }).t);
  act({ type: 'sit', now: 0 });
  act({ type: 'tick', now: 5000 });
  act({ type: 'pad', now: 5000 });
  act({ type: 'tick', now: 7000 });
  act({ type: 'tick', now: 9000 });
  return { get: () => t, act };
}

const OPTS = { reducedMotion: false };

describe('drawMain headlines', () => {
  it('idle shows the lock screen', () => {
    const ctx = mkCtx();
    drawMain(ctx, createTerminal({ now: 0 }), 100, OPTS);
    expect(texts(ctx)).toContain('VHUTALI//SEC');
    expect(texts(ctx).some((s) => s.startsWith('> click to sit down'))).toBe(true);
  });

  it('scan before the pad shows BIOMETRIC LOCK', () => {
    const s = seatedMenu();
    const ctx = mkCtx();
    drawMain(ctx, { ...createTerminal({ now: 0 }), mode: 'scan' }, 100, OPTS);
    expect(texts(ctx)).toContain('BIOMETRIC LOCK');
    expect(s.get().mode).toBe('menu');
  });

  it('menu shows the ls prompt', () => {
    const s = seatedMenu();
    const ctx = mkCtx();
    drawMain(ctx, s.get(), 10000, OPTS);
    expect(texts(ctx)).toContain('root@vhutali:~$ ls ./about_me');
  });

  it('section mode draws its heading', () => {
    const s = seatedMenu();
    s.act({ type: 'clickLine', index: 1 });
    const ctx = mkCtx();
    drawMain(ctx, s.get(), 10000, OPTS);
    expect(texts(ctx).some((x) => x.includes('SKILLS'))).toBe(true);
  });

  it('quiz starts with TRIVIA', () => {
    const s = seatedMenu();
    s.act({ type: 'clickLine', index: 7 });
    const ctx = mkCtx();
    drawMain(ctx, s.get(), 10000, OPTS);
    expect(texts(ctx).some((x) => x.startsWith('TRIVIA'))).toBe(true);
  });

  it('game shows VAULT LOCKED, then VAULT OPEN on a win', () => {
    const s = seatedMenu();
    s.act({ type: 'clickLine', index: 8 });
    const ctx = mkCtx();
    drawMain(ctx, s.get(), 10000, OPTS);
    expect(texts(ctx).some((x) => x.startsWith('VAULT LOCKED'))).toBe(true);
    const g = s.get().game;
    const idx = g.words.indexOf(g.secret);
    s.act({ type: 'clickLine', index: idx });
    const ctx2 = mkCtx();
    drawMain(ctx2, s.get(), 10000, OPTS);
    expect(texts(ctx2)).toContain('VAULT OPEN');
  });

  it('vault junk is identical across frames and does not mutate T', () => {
    const s = seatedMenu();
    s.act({ type: 'clickLine', index: 8 });
    const snap = JSON.stringify(s.get());
    const a = mkCtx();
    const b = mkCtx();
    drawMain(a, s.get(), 10000, OPTS);
    drawMain(b, s.get(), 13333, OPTS);
    const rows = (c) => texts(c).filter((x) => x.startsWith('0x'));
    expect(rows(a).length).toBe(8);
    expect(rows(a)).toEqual(rows(b));
    expect(JSON.stringify(s.get())).toBe(snap);
  });
});

describe('glitch', () => {
  const slices = (ctx) => ctx.drawImage.mock.calls.filter((c) => c.length === 9);

  it('draws slices while glitchUntil is in the future', () => {
    const ctx = mkCtx();
    drawMain(ctx, seatedMenu().get(), 100, { reducedMotion: false, glitchUntil: 200 });
    expect(slices(ctx).length).toBeGreaterThan(0);
  });

  it('draws none once expired', () => {
    const ctx = mkCtx();
    drawMain(ctx, seatedMenu().get(), 300, { reducedMotion: false, glitchUntil: 200 });
    expect(slices(ctx).length).toBe(0);
  });

  it('draws none with reducedMotion', () => {
    const ctx = mkCtx();
    drawMain(ctx, seatedMenu().get(), 100, { reducedMotion: true, glitchUntil: 200 });
    expect(slices(ctx).length).toBe(0);
  });
});

describe('hitLine', () => {
  it('maps a menu click to its row', () => {
    const ctx = mkCtx();
    const geom = drawMain(ctx, seatedMenu().get(), 10000, OPTS);
    expect(hitLine(1 - (geom.menuY0 + 45) / 612, geom, 9)).toBe(1);
    expect(hitLine(1 - (geom.menuY0 + 1) / 612, geom, 9)).toBe(0);
  });

  it('returns -1 outside the list', () => {
    const geom = { menuY0: 70, lineH: 40 };
    expect(hitLine(1 - 10 / 612, geom, 9)).toBe(-1);
    expect(hitLine(1 - (70 + 40 * 9 + 5) / 612, geom, 9)).toBe(-1);
    expect(hitLine(-0.5, geom, 9)).toBe(-1);
  });
});

describe('side screens and note', () => {
  it('every side screen draws without throwing in every mode', () => {
    const s = seatedMenu();
    const modes = [s.get()];
    [1, 3, 7, 8].forEach((i) => {
      s.act({ type: 'clickLine', index: i });
      modes.push(s.get());
      s.act({ type: 'key', key: 'Backspace', now: 1 });
      if (s.get().mode !== 'menu') s.act({ type: 'key', key: 'Backspace', now: 1 });
    });
    modes.forEach((t) => {
      expect(() => drawSideRight(mkCtx(), t, 1234, OPTS)).not.toThrow();
    });
    expect(() => drawSideLeft(mkCtx(), 1234)).not.toThrow();
    expect(() => drawTopLeft(mkCtx(), 1234)).not.toThrow();
    expect(() => drawTopRight(mkCtx(), 1234, new Date(2026, 0, 1, 9, 5, 7))).not.toThrow();
  });

  it('top right shows the supplied time', () => {
    const ctx = mkCtx();
    drawTopRight(ctx, 0, new Date(2026, 0, 1, 9, 5, 7));
    expect(texts(ctx)).toContain('09:05:07');
  });

  it('drawNote wraps a 200 character fact to at most 9 lines', () => {
    const ctx = mkCtx();
    const fact = 'word '.repeat(40).trim();
    expect(fact.length).toBeGreaterThanOrEqual(199);
    drawNote(ctx, fact);
    const body = ctx.fillText.mock.calls.filter((c) => c[1] === 14 && c[2] >= 60 && c[2] < 60 + 9 * 19);
    expect(body.length).toBeLessThanOrEqual(9);
    expect(body.length).toBeGreaterThan(0);
  });
});
