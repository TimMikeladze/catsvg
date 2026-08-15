/**
 * Regenerate the brand images: `bun run images`.
 *
 * Everything here is drawn by the same generator the service uses, so the
 * favicon, the touch icon and the social card are all just cats. Rasterising
 * happens once, here, rather than in a function at request time.
 */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { renderCat } from '../src/cat/render';
import { makeTraits } from '../src/cat/traits';
import { SITE_NAME, SITE_URL, TAGLINE } from '../src/seo/site';

const FAVICON_SEED = 'catsvg-icon';

const iconTraits = makeTraits(FAVICON_SEED, {
  body: 'sit',
  ears: 'pointy',
  eyes: 'almond',
  scene: 'flat',
  frame: 'none',
  tint: 'none',
  prop: 'none',
  hold: 'none',
  aura: 'none',
  extra: 'none',
  palette: 'bistro',
});

writeFileSync('public/favicon.svg', renderCat(iconTraits, { width: 64, height: 64 }) + '\n');
console.log('wrote public/favicon.svg');

await sharp(Buffer.from(renderCat(iconTraits, { width: 180, height: 180 })))
  .png()
  .toFile('public/apple-touch-icon.png');
console.log('wrote public/apple-touch-icon.png');

/* ---------- social card ---------- */

const OG_W = 1200;
const OG_H = 630;
const INK = '#241c3b';
const LILAC = '#e6e1f5';
const PAPER = '#fbf9f3';

/** Place one cat on the card. Nested <svg> keeps each cat's own viewBox intact. */
function card(x: number, y: number, size: number, seed: string, preset: string): string {
  const cat = renderCat(makeTraits(seed, {}, preset), { width: size, height: size }).replace(
    '<svg ',
    `<svg x="${x}" y="${y}" `,
  );
  return `<g>
    <rect x="${x + 5}" y="${y + 5}" width="${size}" height="${size}" rx="26" fill="${INK}" opacity=".85"/>
    ${cat}
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="22" fill="none" stroke="${INK}" stroke-width="5"/>
  </g>`;
}

const SANS = 'Bricolage Grotesque, Helvetica Neue, Helvetica, Arial, sans-serif';
const MONO = 'IBM Plex Mono, Menlo, monospace';

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}" viewBox="0 0 ${OG_W} ${OG_H}">
  <rect width="${OG_W}" height="${OG_H}" fill="${LILAC}"/>
  <text x="72" y="232" font-family="${SANS}" font-weight="800" font-size="104" letter-spacing="-4" fill="${INK}">${SITE_NAME}</text>
  ${TAGLINE.split(' — ')
    .map(
      (line, i) =>
        `<text x="76" y="${292 + i * 40}" font-family="${SANS}" font-size="30" fill="${INK}" opacity=".72">${line}</text>`,
    )
    .join('\n  ')}
  <rect x="72" y="392" width="500" height="66" rx="33" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
  <text x="100" y="435" font-family="${MONO}" font-size="24" fill="${INK}">${SITE_URL.replace('https://', '')}/cat/…</text>
  ${card(650, 60, 240, 'mackerel', 'anything')}
  ${card(910, 60, 240, 'clementine', 'pastel')}
  ${card(780, 330, 240, 'anchovy', 'noir')}
</svg>`;

await sharp(Buffer.from(og)).png().toFile('public/og.png');
console.log('wrote public/og.png');
