/**
 * Draw the pictures in the README: `bun run readme:images`.
 *
 * Everything here comes out of the same generator the service runs, so the
 * README shows real output rather than a mock-up of it. Each plain example is
 * rendered by asking the URL parser for exactly the URL the README documents;
 * the labelled strips nest `catArt` the way the contact sheet does, so a dozen
 * cats can share one document without their ids colliding.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { ART, catArt, computeFrame } from '../src/cat/render';
import { makeTraits } from '../src/cat/traits';
import type { Traits } from '../src/cat/types';
import { parseCatUrl, renderCatRequest } from '../src/cat/url';
import { SITE_URL } from '../src/seo/site';

const OUT = 'docs/readme';

/* ---------- house style, straight off the site's tokens ---------- */

const LILAC = '#ded8f0';
const INK = '#211a33';
const PAPER = '#fcfaf4';
const DISPLAY = "ui-rounded, 'Arial Rounded MT Bold', 'Trebuchet MS', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

/** Lilac paper with the site's dot grid on it. */
const backdrop = (w: number, h: number, fill = LILAC): string =>
  `<defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
<circle cx="2" cy="2" r="1.5" fill="${INK}" opacity=".09"/></pattern></defs>
<rect width="${w}" height="${h}" fill="${fill}"/><rect width="${w}" height="${h}" fill="url(#dots)"/>`;

/**
 * One cat as a card: a hard shadow, the art clipped to the rounded corner, and
 * an ink rule on top. `catArt` takes its radius in art units, so the screen
 * radius is scaled back up before it is handed over.
 */
function tile(t: Traits, x: number, y: number, size: number, ns: string, radius = 18): string {
  const f = computeFrame(ART, ART);
  const art = catArt(t, f, { ns, rx: (radius * ART) / size });
  return `<g>
<rect x="${x + 6}" y="${y + 6}" width="${size}" height="${size}" rx="${radius}" fill="${INK}" opacity=".82"/>
<g transform="translate(${x},${y}) scale(${size / ART})">${art}</g>
<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}" fill="none" stroke="${INK}" stroke-width="3.5"/>
</g>`;
}

/** Centred monospace label, the way the app annotates its own grids. */
const label = (text: string, cx: number, y: number, size = 19, opacity = '.75'): string =>
  `<text x="${cx}" y="${y}" text-anchor="middle" font-family="${MONO}" font-size="${size}" fill="${INK}" opacity="${opacity}">${text}</text>`;

const doc = (w: number, h: number, title: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}">
<title>${title}</title>
${body}
</svg>\n`;

/**
 * A labelled grid of cats on lilac paper. Sized to land near 1:1 in a README
 * column rather than being scaled down until the captions stop being readable.
 */
function grid(
  cats: Array<{ traits: Traits; caption: string }>,
  title: string,
  opts: { cols?: number; size?: number; gap?: number; pad?: number; captionSize?: number } = {},
): string {
  const cols = opts.cols ?? cats.length;
  const size = opts.size ?? 200;
  const gap = opts.gap ?? 20;
  const pad = opts.pad ?? 26;
  const rows = Math.ceil(cats.length / cols);
  const cellH = size + 34;
  const w = pad * 2 + cols * size + (cols - 1) * gap;
  const h = pad * 2 + rows * cellH + (rows - 1) * gap;
  const body = cats
    .map((c, i) => {
      const x = pad + (i % cols) * (size + gap);
      const y = pad + Math.floor(i / cols) * (cellH + gap);
      return tile(c.traits, x, y, size, `r${i}`) + label(c.caption, x + size / 2, y + size + 26, opts.captionSize);
    })
    .join('\n');
  return doc(w, h, title, backdrop(w, h) + body);
}

mkdirSync(OUT, { recursive: true });

const write = (name: string, svg: string): void => {
  writeFileSync(`${OUT}/${name}`, svg);
  console.log(`${name.padEnd(22)} ${(svg.length / 1024).toFixed(1)} kB`);
};

/** Render the exact URL the README documents, through the real parser. */
const fromUrl = (path: string): string => renderCatRequest(parseCatUrl(new URL(path, SITE_URL))) + '\n';

/* ---------- the hero ---------- */

const HERO_W = 1280;
const HERO_H = 440;
const HERO_TILE = 220;
const heroCats: Array<[string, string]> = [
  ['mackerel', 'anything'],
  ['clementine', 'pastel'],
  ['anchovy', 'noir'],
];
const heroTiles = heroCats
  .map(([seed, preset], i) =>
    tile(
      makeTraits(seed, {}, preset),
      HERO_W - 48 - (heroCats.length - i) * HERO_TILE - (heroCats.length - 1 - i) * 20,
      (HERO_H - HERO_TILE) / 2,
      HERO_TILE,
      `h${i}`,
      22,
    ),
  )
  .join('\n');

const URL_TEXT = 'catsvg.app/cat/mackerel.svg';
const PILL_W = Math.round(URL_TEXT.length * 22 * 0.6) + 48;

write(
  'hero.svg',
  doc(
    HERO_W,
    HERO_H,
    'CatSVG — cat placeholder images, drawn as SVG',
    `${backdrop(HERO_W, HERO_H)}
<text x="72" y="180" font-family="${DISPLAY}" font-weight="800" font-size="92" letter-spacing="-3" fill="${INK}">CatSVG</text>
<text x="76" y="228" font-family="${DISPLAY}" font-size="27" fill="${INK}" opacity=".72">Cat placeholder images —</text>
<text x="76" y="264" font-family="${DISPLAY}" font-size="27" fill="${INK}" opacity=".72">any size, any seed, pure SVG.</text>
<rect x="72" y="296" width="${PILL_W}" height="60" rx="30" fill="${PAPER}" stroke="${INK}" stroke-width="3.5"/>
<text x="98" y="334" font-family="${MONO}" font-size="22" fill="${INK}">${URL_TEXT}</text>
${heroTiles}`,
  ),
);

/* ---------- one seed word, one cat ---------- */

const LITTER = ['mackerel', 'biscuit', 'juniper', 'clementine', 'pebble', 'tinsel', 'marlow', 'pippin'];
write(
  'litter.svg',
  grid(
    LITTER.map((seed) => ({ traits: makeTraits(seed, {}), caption: seed })),
    'Eight cats, one per seed word',
    { cols: 4, size: 180, gap: 18, captionSize: 18 },
  ),
);

/* ---------- presets ---------- */

const PRESET_ROW = [
  ['anything', 'juniper'],
  ['minimal', 'pebble'],
  ['maximal', 'bramble'],
  ['noir', 'biscuit'],
  ['pastel', 'cinder'],
  ['feral', 'olive'],
];
write(
  'presets.svg',
  grid(
    PRESET_ROW.map(([preset, seed]) => ({ traits: makeTraits(seed, {}, preset), caption: `?preset=${preset}` })),
    'The six presets, one cat each',
    { cols: 3, size: 220, gap: 20, captionSize: 19 },
  ),
);

/* ---------- pinned traits ---------- */

/** A base cat whose face is unobstructed, so a pinned trait is what changes. */
const PIN_BASE = 'maple';

const PINNED: Array<[string, Record<string, string>]> = [
  ['?eyes=star', { eyes: 'star' }],
  ['?extra=crown', { extra: 'crown' }],
  ['?body=loaf', { body: 'loaf' }],
  ['?coat=tuxedo', { coat: 'tuxedo' }],
  ['?scene=night', { scene: 'night' }],
  ['?hold=fish', { hold: 'fish' }],
];
write(
  'traits.svg',
  grid(
    PINNED.map(([caption, locks]) => ({ traits: makeTraits(PIN_BASE, locks), caption })),
    'The same seed with one trait pinned',
    { cols: 3, size: 220, gap: 20, captionSize: 19 },
  ),
);

/* ---------- avatars ---------- */

const PEOPLE = ['ada@example.com', 'grace@example.com', 'alan@example.com', 'katherine@example.com', 'linus@example.com', 'edsger@example.com'];
write(
  'avatars.svg',
  grid(
    PEOPLE.map((seed) => ({ traits: makeTraits(seed, {}), caption: seed.split('@')[0] })),
    'Six accounts, six stable cats',
    { cols: 6, size: 120, gap: 16, captionSize: 17 },
  ),
);

/* ---------- straight from the documented URLs ---------- */

const EXAMPLES: Array<[string, string]> = [
  ['banner.svg', '/cat/1200x300/mackerel.svg'],
  ['card.svg', '/cat/800x450/biscuit.svg'],
  ['portrait.svg', '/cat/600x800/pebble.svg'],
  ['square.svg', '/cat/400/juniper.svg'],
  ['postcard-front.svg', '/cat/postcard/900x600/clementine.svg'],
  ['postcard-back.svg', '/cat/postcard/back/900x600/clementine.svg'],
];
for (const [name, path] of EXAMPLES) write(name, fromUrl(path));
