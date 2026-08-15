/** Core types for the cat rendering engine. */

/** Five-colour palette every cat is built from. */
export interface Palette {
  /** Scene background. */
  bg: string;
  /** Primary fur. */
  a: string;
  /** Secondary fur / markings. */
  b: string;
  /** Cream — bibs, socks, whiskers. */
  c: string;
  /** Pop — nose, accessories, accents. */
  d: string;
}

/** Palette resolved through a tone (inverted, mono, smoke …). */
export interface Colors {
  body: string;
  head: string;
  tail: string;
  mark: string;
  cream: string;
  pop: string;
}

/** A body silhouette plus the anchor points that hang off it. */
export interface Body {
  /** Silhouette path. */
  d: string;
  /** Head centre x. */
  hx: number;
  /** Head centre y. */
  hy: number;
  /** Head scale. */
  hs: number;
  /** Tail root x. */
  tx: number;
  /** Tail root y. */
  ty: number;
  /** Front-paw group centre and baseline. */
  px: number;
  py: number;
  /** Horizontal spacing of the paired front paws. */
  ps: number;
  /** Centre of an object held against the chest. */
  holdX: number;
  holdY: number;
  /** Width of the grounded shadow for this silhouette. */
  shadowRx: number;
  /** Optional horizontal shadow centre for asymmetric poses. */
  shadowX?: number;
}

/**
 * The visible rectangle in art coordinates. The cat is drawn in a fixed
 * 400x400 space; non-square requests widen or heighten this frame around it
 * so backgrounds extend instead of the cat getting cropped.
 */
export interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Every independently rollable trait, in chip/tinker display order. */
export const TRAIT_KEYS = [
  'palette',
  'tone',
  'body',
  'size',
  'posture',
  'coat',
  'fluff',
  'face',
  'head',
  'ears',
  'eyes',
  'lashes',
  'nose',
  'mouth',
  'whiskers',
  'tail',
  'tailtip',
  'paws',
  'extra',
  'hold',
  'prop',
  'aura',
  'scene',
  'tint',
  'frame',
] as const;

export type TraitKey = (typeof TRAIT_KEYS)[number];

/** A fully resolved cat. Deterministic for a given seed + locks + preset. */
export type Traits = { [K in TraitKey]: string } & {
  seed: string;
  /** Face-marking tilt, degrees. */
  tilt: number;
  /** Floor prop on the left (true) or right (false). */
  propSide: boolean;
};

/** Traits pinned by the user; survive re-rolls. */
export type Locks = Partial<Record<TraitKey, string>>;

/** Pseudo-random float in [0, 1). */
export type Rng = () => number;
