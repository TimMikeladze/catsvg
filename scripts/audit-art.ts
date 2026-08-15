/**
 * Generate visual QA atlases for every independently selectable cat part.
 *
 * Run with `bun scripts/audit-art.ts`; output lands in /tmp/catsvg-audit so it
 * never dirties the project. Each tile keeps every other trait neutral, which
 * makes alignment and drawing regressions much easier to spot.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { renderSheet } from '../src/cat/render';
import { TRAIT_OPTIONS } from '../src/cat/spec';
import { makeTraits } from '../src/cat/traits';
import type { Locks, TraitKey } from '../src/cat/types';

const OUT = '/tmp/catsvg-audit';
const CELL = 260;
const COLS = 5;

const neutral: Locks = {
  palette: 'bistro',
  tone: 'standard',
  body: 'sit',
  size: 'regular',
  posture: 'upright',
  coat: 'solid',
  fluff: 'smooth',
  face: 'plain',
  head: 'standard',
  ears: 'pointy',
  eyes: 'almond',
  lashes: 'none',
  nose: 'triangle',
  mouth: 'w',
  whiskers: 'straight',
  tail: 'curl',
  tailtip: 'none',
  paws: 'two',
  extra: 'none',
  hold: 'none',
  prop: 'none',
  aura: 'none',
  scene: 'flat',
  tint: 'none',
  frame: 'none',
};

mkdirSync(OUT, { recursive: true });

for (const [key, options] of Object.entries(TRAIT_OPTIONS) as [TraitKey, string[]][]) {
  if (key === 'palette') continue;
  const cats = options.map((value) => makeTraits(`audit-${key}-${value}`, { ...neutral, [key]: value }));
  const svg = renderSheet(cats, COLS, CELL);
  const rows = Math.ceil(cats.length / COLS);
  writeFileSync(`${OUT}/${key}.svg`, svg);
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}/${key}.png`);
  console.log(`${key}: ${options.length} parts (${COLS}×${rows})`);
}

const presets = ['anything', 'minimal', 'maximal', 'noir', 'pastel', 'feral'];
const combinations = Array.from({ length: 25 }, (_, i) =>
  makeTraits(`audit-combination-${i + 1}`, {}, presets[i % presets.length]),
);
const overview = renderSheet(combinations, COLS, CELL);
writeFileSync(`${OUT}/overview.svg`, overview);
await sharp(Buffer.from(overview)).png().toFile(`${OUT}/overview.png`);
console.log('overview: 25 cross-trait combinations (5×5)');
