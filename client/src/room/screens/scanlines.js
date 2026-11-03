// Shared palette, font and text helpers for the canvas screens.

export const G = '#3CFF8F';
export const DIM = '#1F8F50';
export const AMBER = '#FFB347';
export const RED = '#FF4545';
export const BG = '#010402';
export const PALE = '#d8ffe6';
export const FAINT = '#0c2a18';

export const mono = (px, bold = false) =>
  `${bold ? 'bold ' : ''}${px}px "IBM Plex Mono", Consolas, monospace`;

const cache = new Map();

// CRT overlay (scanlines + vignette), built once per size.
export function scanlines(w, h) {
  const key = `${w}x${h}`;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < h; y += 3) x.fillRect(0, y, w, 1);
  const v = x.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.55)');
  x.fillStyle = v;
  x.fillRect(0, 0, w, h);
  cache.set(key, c);
  return c;
}

// Word wrap by measured width. Honours "\n" and keeps blank lines.
export function wrap(ctx, text, maxW) {
  const out = [];
  String(text)
    .split('\n')
    .forEach((p) => {
      if (!p) {
        out.push('');
        return;
      }
      let cur = '';
      p.split(' ').forEach((w) => {
        const next = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(next).width > maxW && cur) {
          out.push(cur);
          cur = w;
        } else cur = next;
      });
      out.push(cur);
    });
  return out;
}

// Tiny deterministic string+int hash -> unsigned 32-bit int.
export function hash(str, n = 0) {
  let h = 2166136261 ^ n;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  return (h ^ (h >>> 15)) >>> 0;
}
