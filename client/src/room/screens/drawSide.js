import { profile as defaultProfile } from '../../content/profile.js';
import { G, DIM, AMBER, RED, BG, PALE, FAINT, mono, scanlines, hash } from './scanlines.js';

const HEX = '0123456789ABCDEF';

// Code rain, 512x320. Stateless: every cell is a pure function of (column, row, now).
export function drawSideLeft(ctx, now) {
  const W = 512;
  const H = 320;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.font = mono(16);
  ctx.textBaseline = 'top';
  const step = Math.floor(now / 90);
  for (let c = 0; c < 32; c++) {
    const speed = 1 + (hash('col', c) % 3);
    const head = (Math.floor((step * speed) / 2) + (hash('off', c) % 40)) % 34;
    for (let k = 0; k < 12; k++) {
      const row = head - k;
      if (row < 0 || row * 16 > H) continue;
      ctx.globalAlpha = 1 - k / 12;
      ctx.fillStyle = k === 0 ? PALE : G;
      ctx.fillText(HEX[hash('ch', c * 100 + row + (k === 0 ? step : 0)) % 16], c * 16, row * 16);
    }
  }
  ctx.globalAlpha = 1;
  ctx.drawImage(scanlines(W, H), 0, 0);
}

function sideMode(t) {
  if (t.mode === 'quiz') return 'quiz';
  if (t.mode === 'game') return 'game';
  if (t.mode === 'section' && t.sec === 1) return 'skills';
  if (t.mode === 'section' && t.sec === 3) return 'projects';
  return 'radar';
}

// Bar length = how many items the group lists (real data, no invented levels).
function skillsPanel(ctx, now, profile) {
  ctx.fillStyle = AMBER;
  ctx.fillText('SKILLS.load()', 20, 18);
  const groups = profile.skills.slice(0, 6);
  const max = Math.max(1, ...groups.map((g) => g.items.length));
  const fill = Math.min(1, (now % 2400) / 1200);
  groups.forEach((g, i) => {
    const y = 56 + i * 40;
    ctx.fillStyle = G;
    ctx.fillText(g.group.slice(0, 9).padEnd(9), 20, y);
    ctx.fillStyle = FAINT;
    ctx.fillRect(170, y + 2, 310, 18);
    ctx.fillStyle = G;
    ctx.fillRect(170, y + 2, 310 * (g.items.length / max) * fill, 18);
  });
}

function networkPanel(ctx, now, profile) {
  const n = Math.max(2, profile.projects.length);
  ctx.fillStyle = AMBER;
  ctx.fillText(`net.map  (${profile.projects.length} nodes live)`, 20, 18);
  const t = now / 1000;
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = t * 0.4 + (i * Math.PI * 2) / n;
    return [256 + Math.cos(a) * 150, 176 + Math.sin(a) * 85];
  });
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 2;
  nodes.forEach((a) =>
    nodes.forEach((b) => {
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }),
  );
  nodes.forEach((p, i) => {
    ctx.fillStyle = i === Math.floor(t * 1.5) % n ? AMBER : G;
    ctx.beginPath();
    ctx.arc(p[0], p[1], 10, 0, 7);
    ctx.fill();
  });
}

function scorePanel(ctx, t) {
  const z = t.quiz;
  ctx.fillStyle = AMBER;
  ctx.fillText('SCOREBOARD', 30, 24);
  if (!z) return;
  ctx.fillStyle = G;
  ctx.font = mono(110, true);
  ctx.fillText(String(z.score), 30, 70);
  ctx.font = mono(22);
  ctx.fillStyle = DIM;
  ctx.fillText(`/ ${z.qs.length} correct`, 30, 200);
  z.qs.forEach((_, i) => {
    ctx.fillStyle = i < z.i || (i === z.i && z.picked !== null) ? G : FAINT;
    ctx.fillRect(30 + i * 90, 250, 76, 14);
  });
}

function alarmPanel(ctx, t, now, reducedMotion) {
  const g = t.game;
  if (!g) return;
  const on = reducedMotion || Math.floor(now / 333) % 2 === 0;
  const win = g.done === 'win';
  ctx.font = mono(34, true);
  ctx.fillStyle = win ? G : on ? RED : '#5a1414';
  ctx.fillText(win ? 'BREACH OK' : 'INTRUSION', 30, 40);
  if (!win) ctx.fillText('DETECTED', 30, 84);
  ctx.font = mono(18);
  ctx.fillStyle = AMBER;
  ctx.fillText('trace progress', 30, 170);
  const base = g.done ? 1 : (4 - g.left) / 4;
  const p = g.done || reducedMotion ? base : base + (((now / 1000) * 0.05) % 0.25);
  ctx.fillStyle = '#2a0c0c';
  ctx.fillRect(30, 200, 440, 22);
  ctx.fillStyle = win ? G : RED;
  ctx.fillRect(30, 200, 440 * Math.min(1, p), 22);
  ctx.fillStyle = DIM;
  ctx.fillText(win ? 'trace cancelled.' : 'they are onto you. guess fast.', 30, 250);
}

function radarPanel(ctx, now) {
  const cx = 256;
  const cy = 170;
  const r = 120;
  const t = now / 1000;
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1.5;
  [1, 0.66, 0.33].forEach((k) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r * k, 0, 7);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();
  const a = t * 1.6;
  if (typeof ctx.createConicGradient === 'function') {
    const gr = ctx.createConicGradient(a - 0.8, cx, cy);
    gr.addColorStop(0, 'rgba(60,255,143,0)');
    gr.addColorStop(0.12, 'rgba(60,255,143,0.45)');
    gr.addColorStop(0.13, 'rgba(60,255,143,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 7);
  } else {
    // Wedge fallback where conic gradients are unavailable.
    ctx.fillStyle = 'rgba(60,255,143,0.25)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a - 0.8, a);
    ctx.closePath();
  }
  ctx.fill();
  [[0.4, 0.6], [2.2, 0.8], [4, 0.35]].forEach(([b, d]) => {
    const da = (((a - b) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    ctx.fillStyle = `rgba(255,179,71,${Math.max(0, 1 - da / 3)})`;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(b) * r * d, cy + Math.sin(b) * r * d, 6, 0, 7);
    ctx.fill();
  });
  ctx.fillStyle = G;
  ctx.fillText('trace: JHB, ZA', 16, 14);
  ctx.fillStyle = DIM;
  ctx.fillText(`packets ${Math.floor(t * 913)}`, 16, 290);
}

// Right screen, 512x320. Panel depends on terminal mode.
export function drawSideRight(ctx, t, now, { reducedMotion = false, profile = defaultProfile } = {}) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, 512, 320);
  ctx.font = mono(18);
  ctx.textBaseline = 'top';
  const mode = sideMode(t);
  if (mode === 'quiz') scorePanel(ctx, t);
  else if (mode === 'game') alarmPanel(ctx, t, now, reducedMotion);
  else if (mode === 'skills') skillsPanel(ctx, now, profile);
  else if (mode === 'projects') networkPanel(ctx, now, profile);
  else radarPanel(ctx, now);
  ctx.drawImage(scanlines(512, 320), 0, 0);
}

// Top-left hex dump, 512x292.
export function drawTopLeft(ctx, now) {
  const W = 512;
  const H = 292;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.font = mono(15);
  ctx.textBaseline = 'top';
  const off = now * 0.036;
  for (let i = 0; i < 17; i++) {
    const n = Math.floor(off / 18) + i;
    let s = `${(n * 16).toString(16).padStart(6, '0')}  `;
    for (let k = 0; k < 8; k++) s += `${(hash('hx', n * 8 + k) % 256).toString(16).padStart(2, '0')} `;
    ctx.fillStyle = n % 5 === 0 ? AMBER : DIM;
    ctx.fillText(s, 12, i * 18 - (off % 18));
  }
  ctx.drawImage(scanlines(W, H), 0, 0);
}

// Top-right clock + CPU graph, 512x292. `date` is injected so the caller owns the clock.
export function drawTopRight(ctx, now, date = new Date()) {
  const W = 512;
  const H = 292;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'top';
  const p2 = (n) => String(n).padStart(2, '0');
  ctx.fillStyle = G;
  ctx.font = mono(54, true);
  ctx.fillText(`${p2(date.getHours())}:${p2(date.getMinutes())}:${p2(date.getSeconds())}`, 18, 14);
  ctx.font = mono(16);
  ctx.fillStyle = DIM;
  ctx.fillText(`load ${(0.4 + Math.sin(now / 1000) * 0.2).toFixed(2)}`, 20, 82);
  const tick = Math.floor(now / 250);
  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 60; i++) {
    const v = 0.2 + ((hash('cpu', tick - 59 + i) % 1000) / 1000) * 0.6;
    const px = 20 + (i * (W - 40)) / 59;
    const py = H - 20 - v * 150;
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.stroke();
  ctx.drawImage(scanlines(W, H), 0, 0);
}
