/**
 * Regenerate public/favicon.svg from the engine: `bun run favicon`.
 * The site's icon is just another cat, pinned to one seed and one look.
 */
import { writeFileSync } from 'node:fs';
import { renderCat } from '../src/cat/render.ts';
import { makeTraits } from '../src/cat/traits.ts';

const FAVICON_SEED = 'catsvg-icon';

const traits = makeTraits(FAVICON_SEED, {
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

writeFileSync('public/favicon.svg', renderCat(traits, { width: 64, height: 64 }) + '\n');
console.log('wrote public/favicon.svg');
