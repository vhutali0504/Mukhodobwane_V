import { wrap } from './scanlines.js';

const HAND = '"Segoe Print", "Comic Sans MS", cursive';

// Sticky note, 256x256.
export function drawNote(ctx, text) {
  ctx.fillStyle = '#e6cf5c';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, 0, 256, 34);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#2a2208';
  ctx.font = `bold 26px ${HAND}`;
  ctx.fillText('fun fact!', 16, 26);
  ctx.font = `15px ${HAND}`;
  wrap(ctx, text, 226)
    .slice(0, 9)
    .forEach((l, i) => ctx.fillText(l, 14, 60 + i * 19));
  ctx.font = `16px ${HAND}`;
  ctx.fillStyle = '#6a5a20';
  ctx.fillText('click for another', 16, 240);
}
