import { profile as defaultProfile } from '../../content/profile.js';
import { sectionLines } from '../terminal/sections.js';
import { visibleBootLines } from '../terminal/engine.js';
import { quizRank, isQuizOver } from '../terminal/quiz.js';
import { BOOT_LINES, MENU, SCAN_MS } from '../terminal/constants.js';
import { G, DIM, AMBER, RED, BG, PALE, mono, scanlines, wrap, hash } from './scanlines.js';

const W = 1024;
const H = 612;
const X = 34;
const LH = 34;
const JUNK = '!@#$%^&*()[]{};:<>?/|~=+';

// Deterministic decoration for one vault row: depends only on (secret, index).
function junk(secret, i, side) {
  let s = '';
  for (let k = 0; k < 3; k++) s += JUNK[hash(secret + side, i * 7 + k) % JUNK.length];
  return s;
}

// Cursor for one drawing pass. Keeps y in one place so mode drawers stay short.
function pen(ctx) {
  const p = {
    y: 28,
    line(s, col = G) {
      ctx.fillStyle = col;
      ctx.fillText(s, X, p.y);
      p.y += LH;
    },
    // Highlight bar behind text, then the text on top.
    chip(s, bar, text, extra = 0) {
      ctx.fillStyle = bar;
      ctx.fillRect(X - 8, p.y - 5, ctx.measureText(s).width + 16 + extra, 38);
      ctx.fillStyle = text;
      ctx.fillText(s, X, p.y);
    },
  };
  return p;
}

function drawIdle(ctx, now, blink) {
  ctx.font = mono(64, true);
  ctx.fillStyle = G;
  ctx.fillText('VHUTALI//SEC', X, 170);
  ctx.font = mono(25);
  ctx.fillStyle = DIM;
  ctx.fillText('terminal locked, operator away', X, 260);
  ctx.fillStyle = AMBER;
  ctx.fillText(`> click to sit down${blink ? '_' : ''}`, X, 320);
  ctx.fillStyle = DIM;
  for (let i = 0; i < 6; i++) {
    const addr = (hash('idle', i + Math.floor(now / 700)) >>> 0).toString(16).padStart(8, '0');
    ctx.fillText(`${addr}  ${'▒'.repeat(4 + (hash('w', i) % 12))}`, X, 410 + i * 30);
  }
}

function drawBootScan(ctx, t, now, blink, p) {
  const n = visibleBootLines(t, now);
  for (let i = 0; i < n; i++) p.line(BOOT_LINES[i], i === 3 ? AMBER : DIM);
  if (t.mode === 'boot') return;
  p.y += 10;
  if (t.mode === 'granted') {
    ctx.fillStyle = G;
    ctx.fillRect(X - 6, p.y - 4, 330, 44);
    ctx.fillStyle = BG;
    ctx.font = mono(34, true);
    ctx.fillText('ACCESS GRANTED', X, p.y);
    p.y += 60;
    ctx.font = mono(25);
    p.line(`welcome, visitor${blink ? '_' : ''}`);
  } else if (t.scanAt >= 0) {
    const pr = Math.max(0, Math.min(1, (now - t.scanAt) / SCAN_MS));
    const bars = Math.round(pr * 24);
    p.line('scanning fingerprint ...', AMBER);
    p.line(`[${'█'.repeat(bars)}${'░'.repeat(24 - bars)}] ${Math.round(pr * 100)}%`);
  } else {
    p.line('BIOMETRIC LOCK', AMBER);
    p.line(`place finger on the scanner${blink ? ' ◉' : ''}`);
    p.line('[click the glowing pad on the desk, or press Enter]', DIM);
  }
}

function drawMenu(ctx, t, p, geom) {
  p.line('root@vhutali:~$ ls ./about_me', DIM);
  p.y += 8;
  geom.menuY0 = p.y;
  geom.lineH = 40;
  MENU.forEach((id, i) => {
    const lab = `${String(i + 1).padStart(2, '0')}  ${id}`;
    if (i === t.sel) p.chip(`> ${lab}`, G, BG, 6);
    else {
      ctx.fillStyle = G;
      ctx.fillText(`  ${lab}`, X, p.y);
    }
    p.y += 40;
  });
  p.y += 10;
  p.line('↑↓ or click · enter to open · type "help" · esc to stand up', DIM);
}

// Draws the visible slice of the wrapped body and returns the max scroll offset.
function drawSection(ctx, t, p, profile) {
  const isSec = t.mode === 'section';
  const id = MENU[t.sec];
  p.line(`root@vhutali:~$ ${isSec ? `cat ${id}.txt` : t.msg.cmd}`, DIM);
  p.y += 6;
  if (isSec) {
    ctx.font = mono(30, true);
    ctx.fillStyle = AMBER;
    ctx.fillText(`# ${id.replaceAll('_', ' ').toUpperCase()}`, X, p.y);
    p.y += 50;
  }
  ctx.font = mono(isSec ? 21 : 25);
  const step = isSec ? 27 : LH;
  const body = isSec ? sectionLines(t.sec, profile) : t.msg.lines;
  const lines = body.flatMap((b) => wrap(ctx, b, W - X * 2));
  const visible = Math.max(1, Math.floor((H - 100 - p.y) / step) + 1);
  const scrollMax = Math.max(0, lines.length - visible);
  const from = Math.min(t.scroll, scrollMax);
  lines.slice(from, from + visible).forEach((l) => {
    ctx.fillStyle = l.startsWith('[placeholder') ? DIM : G;
    ctx.fillText(l, X, p.y);
    p.y += step;
  });
  ctx.font = mono(18);
  ctx.fillStyle = DIM;
  const last = Math.min(lines.length, from + visible);
  if (from > 0) ctx.fillText('[▲ more]', W - 160, 28);
  if (last < lines.length) ctx.fillText(`[more ▼ ${last}/${lines.length}]`, W - 260, H - 90);
  return scrollMax;
}

function drawQuiz(ctx, t, p, geom) {
  const z = t.quiz;
  p.line('root@vhutali:~$ ./trivia --questions 5', DIM);
  ctx.font = mono(28, true);
  ctx.fillStyle = AMBER;
  if (isQuizOver(z)) {
    ctx.fillText('RESULTS', X, p.y);
    p.y += 56;
    ctx.font = mono(64, true);
    ctx.fillStyle = G;
    ctx.fillText(`${z.score} / ${z.qs.length}`, X, p.y);
    p.y += 90;
    ctx.font = mono(25);
    p.line(quizRank(z.score), AMBER);
    p.y = H - 90;
    p.line('[enter] play again · [←] menu', DIM);
    return;
  }
  const q = z.qs[z.i];
  ctx.fillText(`TRIVIA  ·  question ${z.i + 1}/${z.qs.length}  ·  score ${z.score}`, X, p.y);
  p.y += 52;
  ctx.font = mono(25);
  wrap(ctx, q.q, W - X * 2).forEach((l) => p.line(l, PALE));
  p.y += 14;
  geom.menuY0 = p.y;
  geom.lineH = 44;
  q.o.forEach((o, k) => {
    const mark = z.picked === null ? '' : k === q.a ? '  ✓' : k === z.picked ? '  ✗' : '';
    const s = `[${'ABC'[k]}]  ${o}${mark}`;
    let col = G;
    if (z.picked !== null) {
      if (k === q.a) {
        p.chip(s, G, BG);
        col = BG;
      } else if (k === z.picked) {
        p.chip(s, RED, BG);
        col = BG;
      } else col = DIM;
    }
    ctx.fillStyle = col;
    ctx.fillText(s, X, p.y);
    p.y += 44;
  });
  p.y += 10;
  if (z.picked !== null) {
    const ok = z.picked === q.a;
    p.line(ok ? 'correct. +1' : `nope. the answer was ${'ABC'[q.a]}.`, ok ? G : RED);
  }
  p.y = H - 90;
  p.line(z.picked === null ? 'click an answer or press A / B / C · [←] menu' : '[enter] next question · [←] menu', DIM);
}

function drawVaultLog(ctx, g, y0) {
  const lx = 600;
  let ly = y0;
  g.log.slice(-6).forEach((l) => {
    ctx.fillStyle = l.includes('MATCH') ? G : l.includes('LOCKOUT') ? RED : AMBER;
    ctx.fillText(l, lx, ly);
    ly += 36;
  });
  if (g.done === 'win') {
    ly += 10;
    ctx.fillStyle = G;
    ctx.fillText('reward: fun fact unlocked', lx, ly);
    ly += 36;
    ctx.fillStyle = AMBER;
    ctx.font = mono(19);
    wrap(ctx, g.fact, W - lx - 30).forEach((l) => {
      ctx.fillText(l, lx, ly);
      ly += 24;
    });
    ctx.font = mono(25);
    ctx.fillStyle = DIM;
    ctx.fillText('[enter] play again', lx, ly + 8);
  } else if (g.done === 'lose') {
    ctx.fillStyle = DIM;
    ctx.fillText('[enter] try again', lx, ly + 10);
  }
}

function drawGame(ctx, t, p, geom) {
  const g = t.game;
  p.line('root@vhutali:~$ ./crack_the_vault', DIM);
  ctx.font = mono(28, true);
  ctx.fillStyle = g.done === 'win' ? G : AMBER;
  const title =
    g.done === 'win'
      ? 'VAULT OPEN'
      : `VAULT LOCKED  ·  attempts ${'▮'.repeat(g.left)}${'▯'.repeat(4 - g.left)}`;
  ctx.fillText(title, X, p.y);
  p.y += 50;
  ctx.font = mono(25);
  geom.menuY0 = p.y;
  geom.lineH = 40;
  g.words.forEach((w, i) => {
    const addr = `0x${(0xf4a0 + i * 12).toString(16).toUpperCase()}`;
    const s = `${addr}  ${junk(g.secret, i, 'a')}${w}${junk(g.secret, i, 'b')}`;
    const tried = g.log.some((l) => l.startsWith(`> ${w} `));
    if (i === g.sel && !g.done) {
      ctx.fillStyle = G;
      ctx.fillRect(X - 8, p.y - 5, ctx.measureText(s).width + 16, 36);
      ctx.fillStyle = BG;
    } else ctx.fillStyle = tried ? DIM : G;
    ctx.fillText(s, X, p.y);
    p.y += 40;
  });
  drawVaultLog(ctx, g, geom.menuY0);
  p.y = H - 90;
  p.line('click a word or type it · likeness = letters in the right spot · [←] menu', DIM);
}

// Glitch slices are copies of the already drawn frame, so a pass must come last.
function drawGlitch(ctx, now) {
  const f = Math.floor(now / 40);
  for (let k = 0; k < 9; k++) {
    const gy = (hash('gy', f * 9 + k) % 1000) * (H / 1000);
    const gh = 4 + (hash('gh', f * 9 + k) % 40);
    const dx = ((hash('gx', f * 9 + k) % 90) - 45);
    ctx.drawImage(ctx.canvas, 0, gy, W, gh, dx, gy, W, gh);
  }
  ctx.fillStyle = 'rgba(255,69,69,0.10)';
  ctx.fillRect(0, (hash('gb', f) % 1000) * (H / 1000), W, 30 + (hash('gc', f) % 80));
}

const TYPED = ['menu', 'section', 'msg', 'game', 'quiz'];

// Main monitor, 1024x612. Reads T, never writes it. Returns click geometry:
// menuY0 = y (px) of the first clickable row, lineH = row pitch (menu, quiz options, vault words).
// opts.glitchUntil: absolute `now` (ms) before which glitch slices are drawn; ignored when reducedMotion.
export function drawMain(ctx, t, now, { reducedMotion = false, glitchUntil = 0, profile = defaultProfile } = {}) {
  const blink = reducedMotion || Math.floor(now / 500) % 2 === 0;
  const geom = { menuY0: 0, lineH: 40, scrollMax: 0 };
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'top';
  ctx.font = mono(25);
  const p = pen(ctx);
  switch (t.mode) {
    case 'idle':
      drawIdle(ctx, now, blink);
      break;
    case 'boot':
    case 'scan':
    case 'granted':
      drawBootScan(ctx, t, now, blink, p);
      break;
    case 'menu':
      drawMenu(ctx, t, p, geom);
      break;
    case 'section':
    case 'msg':
      geom.scrollMax = drawSection(ctx, t, p, profile);
      p.y = H - 90;
      ctx.font = mono(25);
      p.line('↑↓ scroll · [←] menu · [esc] stand up', DIM);
      break;
    case 'quiz':
      drawQuiz(ctx, t, p, geom);
      break;
    case 'game':
      drawGame(ctx, t, p, geom);
      break;
    default:
      break;
  }
  if (TYPED.includes(t.mode)) {
    ctx.font = mono(25);
    ctx.fillStyle = G;
    ctx.fillText(`visitor@vhutali:~$ ${t.input}${blink ? '█' : ''}`, X, H - 50);
  }
  ctx.drawImage(scanlines(W, H), 0, 0);
  if (!reducedMotion && now < glitchUntil) drawGlitch(ctx, now);
  return geom;
}

// uvY is the three.js UV (0 at bottom). Returns the row index or -1.
export function hitLine(uvY, geom, count) {
  const py = (1 - uvY) * H;
  const i = Math.floor((py - geom.menuY0) / geom.lineH);
  return py >= geom.menuY0 && i >= 0 && i < count ? i : -1;
}
