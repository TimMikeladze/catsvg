import { BODIES } from './bodies';
import { NECK } from './accessories';
import { N, pick, rng, rr } from './rng';
import { PRESETS, SPEC, isPresetName } from './spec';
import { TRAIT_KEYS } from './types';
import type { PresetName } from './spec';
import type { Locks, Traits } from './types';

export type { PresetName };

/**
 * Build a cat from a seed. Pure and deterministic: same seed + locks + preset
 * always yields the same cat, which is what makes the URL API cacheable.
 */
export function makeTraits(seed: string, locks: Locks = {}, preset: string = 'anything'): Traits {
  const r = rng(seed);
  const pre = PRESETS[isPresetName(preset) ? preset : 'anything'];
  const t = { seed } as Traits;
  for (const k of TRAIT_KEYS) {
    const pool = pre[k];
    t[k] = pick(r, pool && pool.length ? pool : SPEC[k]);
  }
  t.tilt = N(rr(r, -26, 26));
  Object.assign(t, locks);

  // Most tails live on the cat's right, so floor props belong on the open
  // side. The wrap tail crosses left and flips that staging. Keeping the two
  // apart prevents props from being swallowed by a random tail silhouette.
  t.propSide = t.tail !== 'wrap';

  // Bodies whose head sits low have no neck to hang things from, and nothing
  // to hold an item in front of — unless the user pinned that trait.
  const b = BODIES[t.body];
  if (b.hy > 240 && NECK.includes(t.extra) && !locks.extra) t.extra = 'none';
  if (b.hy > 240 && !locks.hold) t.hold = 'none';
  if (['sleepy', 'squint', 'wink', 'half'].includes(t.eyes) && !locks.lashes) t.lashes = 'none';
  return t;
}

const FIRST = [
  'Biscuit', 'Mackerel', 'Pickle', 'Domino', 'Waffle', 'Juniper', 'Turnip', 'Saffron',
  'Noodle', 'Pebble', 'Anchovy', 'Clementine', 'Marzipan', 'Ottoman', 'Buckle', 'Sprocket',
  'Vermouth', 'Tangerine', 'Barnaby', 'Olive', 'Kimchi', 'Pretzel', 'Marlowe', 'Truffle',
  'Gusto', 'Parsnip', 'Halibut', 'Wednesday', 'Custard', 'Bergamot',
];

const LAST = [
  'the Brief', 'of the Sofa', 'Esq.', 'the Third', 'the Loud', 'Junior', 'the Patient',
  'the Unbothered', 'the Damp', 'the Magnificent', 'the Small', 'the Vast', 'the Reasonable',
  'of No Fixed Abode', 'the Nocturnal',
];

/** Deterministic display name for a seed. */
export function catName(seed: string): string {
  const r = rng(seed + '|name');
  return `${pick(r, FIRST)} ${pick(r, LAST)}`;
}

const SEED_WORDS = [
  'mackerel', 'biscuit', 'tuna', 'pebble', 'marzipan', 'ottoman', 'sardine', 'pickle',
  'domino', 'clementine', 'pudding', 'waffle', 'juniper', 'moth', 'pistachio', 'buckle',
  'anchovy', 'turnip', 'saffron', 'noodle',
];

/** A fresh random seed like `pickle-4821`. Not deterministic — that's the point. */
export function newSeed(): string {
  return `${SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)]}-${Math.floor(Math.random() * 9000 + 1000)}`;
}
