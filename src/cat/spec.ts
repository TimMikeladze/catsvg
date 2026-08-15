import { BODIES, FLUFF, POSTURES, SIZES } from './bodies';
import { COATS } from './coats';
import { EARS, HEADS } from './heads';
import { EYES, FACES, LASHES, MOUTHS, NOSES, WHISKERS } from './face';
import { AURAS, EXTRAS, HOLDS, PAWS, PROPS } from './accessories';
import { PALETTES } from './palettes';
import { FRAMES, SCENES, TINTS, TONES } from './scenes';
import { TAILS, TAILTIPS } from './tails';
import { TRAIT_KEYS } from './types';
import type { TraitKey, Traits } from './types';

/**
 * Every trait's option pool. Duplicated entries are deliberate weighting —
 * `'none'` appears three times in HOLDS so most cats hold nothing.
 */
export const SPEC: Record<TraitKey, readonly string[]> = {
  palette: Object.keys(PALETTES),
  tone: TONES,
  body: Object.keys(BODIES),
  size: Object.keys(SIZES),
  posture: Object.keys(POSTURES),
  coat: COATS,
  fluff: FLUFF,
  face: FACES,
  head: Object.keys(HEADS),
  ears: EARS,
  eyes: EYES,
  lashes: LASHES,
  nose: NOSES,
  mouth: MOUTHS,
  whiskers: WHISKERS,
  tail: Object.keys(TAILS),
  tailtip: TAILTIPS,
  paws: PAWS,
  extra: EXTRAS,
  hold: HOLDS,
  prop: PROPS,
  aura: AURAS,
  scene: SCENES,
  tint: TINTS,
  frame: FRAMES,
};

/** Deduplicated option list per trait, for pickers and validation. */
export const TRAIT_OPTIONS: Record<TraitKey, string[]> = Object.fromEntries(
  TRAIT_KEYS.map((k) => [k, [...new Set(SPEC[k])]]),
) as Record<TraitKey, string[]>;

/** Distinct cats reachable by rolling. */
export const COMBOS: number = TRAIT_KEYS.reduce((n, k) => n * TRAIT_OPTIONS[k].length, 1);

export type PresetName = 'anything' | 'minimal' | 'maximal' | 'noir' | 'pastel' | 'feral';

export const PRESET_NAMES: PresetName[] = ['anything', 'minimal', 'maximal', 'noir', 'pastel', 'feral'];

/** A preset narrows the option pool for some traits; unlisted traits roll free. */
export const PRESETS: Record<PresetName, Partial<Record<TraitKey, readonly string[]>>> = {
  anything: {},
  minimal: {
    coat: ['solid', 'bib', 'socks', 'belly'],
    face: ['plain', 'split', 'blaze'],
    extra: ['none'],
    prop: ['none'],
    aura: ['none'],
    scene: ['flat', 'halo', 'arch', 'horizon'],
    frame: ['none', 'rule'],
    fluff: ['smooth'],
    hold: ['none'],
    tint: ['none'],
    tailtip: ['none'],
  },
  maximal: {
    extra: EXTRAS.filter((v) => v !== 'none'),
    prop: PROPS.filter((v) => v !== 'none'),
    aura: AURAS.filter((v) => v !== 'none'),
    hold: HOLDS.filter((v) => v !== 'none'),
    scene: ['confetti', 'rays', 'rings', 'night', 'stripe', 'tiles', 'spotlight'],
    frame: ['badge', 'dashed', 'double', 'corners'],
  },
  noir: {
    palette: ['ink', 'midnight', 'storm', 'slate', 'ash', 'arctic', 'glacier'],
    tone: ['mono', 'smoke', 'standard'],
    tint: ['cool', 'dusk', 'none'],
    scene: ['flat', 'spotlight', 'window', 'grid', 'night'],
    extra: ['none', 'shades', 'tie', 'monocle', 'bowtie'],
    aura: ['none', 'question', 'music'],
  },
  pastel: {
    palette: ['sorbet', 'lavender', 'sky', 'rosewood', 'peach', 'bubblegum', 'seafoam', 'glacier', 'cherry'],
    tone: ['standard', 'frost', 'points'],
    tint: ['none', 'faded', 'warm'],
    aura: ['none', 'hearts', 'sparkle', 'bubbles'],
    scene: ['halo', 'dots', 'arch', 'rings', 'waves', 'hills'],
  },
  feral: {
    body: ['ready', 'leap', 'slink', 'stretch', 'tall'],
    coat: ['stripes', 'rosettes', 'tortie', 'spots', 'vstripes', 'chevron'],
    eyes: ['slit', 'glow', 'wedge', 'squint'],
    mouth: ['fang', 'grin', 'open'],
    extra: ['none'],
    aura: ['none', 'anger'],
    fluff: ['spiky', 'tufty', 'longhair'],
  },
};

export const isPresetName = (v: string): v is PresetName => PRESET_NAMES.includes(v as PresetName);

/** Human-readable chip text per trait. */
export const TRAIT_LABEL: Record<TraitKey, (t: Traits) => string> = {
  body: (t) => t.body,
  head: (t) => `${t.head} head`,
  ears: (t) => `${t.ears} ears`,
  eyes: (t) => `${t.eyes} eyes`,
  lashes: (t) => (t.lashes === 'none' ? 'no lashes' : `${t.lashes} lashes`),
  nose: (t) => `${t.nose} nose`,
  mouth: (t) => (t.mouth === 'none' ? 'no mouth' : `${t.mouth} mouth`),
  whiskers: (t) => (t.whiskers === 'none' ? 'no whiskers' : `${t.whiskers} whiskers`),
  coat: (t) => (t.coat === 'solid' ? 'solid coat' : t.coat),
  fluff: (t) => `${t.fluff} fur`,
  face: (t) => (t.face === 'plain' ? 'clean face' : t.face),
  tail: (t) => `${t.tail} tail`,
  tailtip: (t) => (t.tailtip === 'none' ? 'plain tip' : `${t.tailtip} tip`),
  paws: (t) => (t.paws === 'none' ? 'no paws' : `${t.paws} paws`),
  extra: (t) => (t.extra === 'none' ? 'no accessory' : t.extra),
  hold: (t) => (t.hold === 'none' ? 'empty paws' : `holding ${t.hold}`),
  prop: (t) => (t.prop === 'none' ? 'no prop' : t.prop),
  aura: (t) => (t.aura === 'none' ? 'no aura' : t.aura),
  scene: (t) => t.scene,
  tint: (t) => (t.tint === 'none' ? 'no tint' : `${t.tint} tint`),
  frame: (t) => (t.frame === 'none' ? 'no frame' : `${t.frame} frame`),
  palette: (t) => t.palette,
  tone: (t) => `${t.tone} tone`,
  size: (t) => t.size,
  posture: (t) => t.posture,
};
