// Re-runnable: crops the portrait, exports responsive formats, renders the OG image.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const src = resolve(root, 'docs/assets/photo-original.jpg');
const outDir = resolve(root, 'client/public/images');

// Head-and-shoulders 4:5 crop (see docs/DECISIONS.md for how these were chosen).
const CROP = { left: 60, top: 330, width: 600, height: 750 };
const WIDTHS = [480, 600]; // never wider than the crop, so no upscaling

await mkdir(outDir, { recursive: true });

for (const w of WIDTHS) {
  const base = sharp(src).rotate().extract(CROP).resize({ width: w, withoutEnlargement: true });
  const out = resolve(outDir, `portrait-${w}`);
  await base.clone().avif({ quality: 50 }).toFile(`${out}.avif`);
  await base.clone().webp({ quality: 75 }).toFile(`${out}.webp`);
  await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${out}.jpg`);
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F7F5F0"/>
  <rect x="80" y="170" width="64" height="8" fill="#E8730C"/>
  <text x="80" y="290" font-family="Arial, Helvetica, sans-serif" font-size="68" font-weight="700" fill="#14213D">Mukhodobwane</text>
  <text x="80" y="370" font-family="Arial, Helvetica, sans-serif" font-size="68" font-weight="700" fill="#14213D">Vhutalihandivho</text>
  <text x="80" y="450" font-family="Arial, Helvetica, sans-serif" font-size="36" fill="#5B6474">Software Developer · Johannesburg</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile(resolve(root, 'client/public/og-image.png'));

console.log('Photo and OG image written.');
