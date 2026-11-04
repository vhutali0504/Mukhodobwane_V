import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const pub = (p) => resolve(process.cwd(), 'client/public', p);

describe('public assets', () => {
  const files = [
    ...['avif', 'webp', 'jpg'].flatMap((ext) => [
      `images/portrait-480.${ext}`,
      `images/portrait-600.${ext}`,
    ]),
    'cv/Mukhodobwane-Vhutalihandivho-CV.pdf',
    'favicon.svg',
    'og-image.png',
    'robots.txt',
    'sitemap.xml',
  ];

  it.each(files)('%s exists', (f) => {
    expect(existsSync(pub(f))).toBe(true);
  });

  it('robots.txt points at the sitemap', () => {
    expect(readFileSync(pub('robots.txt'), 'utf8')).toContain(
      'Sitemap: https://mukhodobwanevhutalihandivho.netlify.app/sitemap.xml',
    );
  });

  it('sitemap lists /, /room and /privacy', () => {
    const xml = readFileSync(pub('sitemap.xml'), 'utf8');
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([
      'https://mukhodobwanevhutalihandivho.netlify.app/',
      'https://mukhodobwanevhutalihandivho.netlify.app/room',
      'https://mukhodobwanevhutalihandivho.netlify.app/privacy',
    ]);
  });

  it('CV PDF matches the source file size', () => {
    expect(statSync(pub('cv/Mukhodobwane-Vhutalihandivho-CV.pdf')).size).toBe(
      statSync(resolve(process.cwd(), 'docs/assets/cv.pdf')).size,
    );
  });
});
