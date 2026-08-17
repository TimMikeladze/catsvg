import { renderCat } from './render';
import {
  POSTCARD_WIDTH,
  clampStamps,
  isPostcardSide,
  postcardHeightFor,
  renderPostcard,
} from './postcard';
import { TRAIT_OPTIONS, isPresetName } from './spec';
import { makeTraits, newSeed } from './traits';
import { TRAIT_KEYS } from './types';
import type { PostcardSide } from './postcard';
import type { Locks, TraitKey } from './types';

/** What the URL asks to be drawn: a bare cat, or a cat on a postcard. */
export type CatMode = 'cat' | 'postcard';

/** The writable parts of a postcard, beyond its message. */
export interface CardFields {
  /** Small line under the greeting, front only. */
  caption?: string;
  /** Addressee on the back. */
  to?: string;
  /** Signature on the back. */
  from?: string;
  /** Words in the postmark ring. */
  postmark?: string;
  /** How many stamps frank the back. */
  stamp?: number;
  /** CatSVG's own marks. */
  brand?: boolean;
}

/** Text fields a postcard URL can set, and how long each may be. */
const CARD_TEXT = ['caption', 'to', 'from', 'postmark'] as const;

const OFF = new Set(['0', 'false', 'off', 'no', 'none', 'hide']);
const ON = new Set(['1', 'true', 'on', 'yes', 'show']);

/** `?brand=off` and friends. Anything unreadable leaves the default alone. */
const readFlag = (v: string | null): boolean | undefined => {
  if (v === null) return undefined;
  const s = v.trim().toLowerCase();
  if (OFF.has(s)) return false;
  if (ON.has(s) || s === '') return true;
  return undefined;
};

/** `?stamp=3` is a count; `?stamp=off` is none of them. */
const readCount = (v: string | null): number | undefined => {
  if (v === null) return undefined;
  const s = v.trim().toLowerCase();
  if (OFF.has(s)) return 0;
  if (ON.has(s) || s === '') return 1;
  if (!/^\d+$/.test(s)) return undefined;
  return clampStamps(Number(s));
};

/** Everything a cat URL can say. */
export interface CatRequest {
  seed: string;
  width: number;
  height: number;
  preset: string;
  /** `cat` (default) or `postcard`. */
  mode: CatMode;
  /** Which side of the postcard. Ignored outside postcard mode. */
  side: PostcardSide;
  /** Caption pill on a cat; the greeting or message on a postcard. */
  text?: string;
  /** Postcard fields. Ignored outside postcard mode. */
  card: CardFields;
  /** Trait overrides pinned by query string (`?eyes=star`). */
  locks: Locks;
  /** `?seed=random` — a different cat every request, so never cache it. */
  random: boolean;
}

export const MIN_SIZE = 16;
export const MAX_SIZE = 2000;
export const DEFAULT_SIZE = 400;

const clampSize = (n: number): number => Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n)));

/** Path prefixes that are stripped before parsing size/seed segments. */
const PREFIXES = new Set(['cat', 'cats', 'i', 'api']);

/**
 * Segments that name a mode rather than a seed. A cat really called
 * "postcard" is still reachable as `?seed=postcard`.
 */
const MODE_WORDS = new Set(['postcard', 'front', 'back']);

const isNum = (s: string): boolean => /^\d+$/.test(s);

/**
 * Parse any of these into a request:
 *
 *   /cat/mackerel.svg
 *   /cat/320/mackerel.svg
 *   /cat/1200x300/mackerel.svg
 *   /cat/240x240?eyes=star&palette=neon
 *   /cat?seed=biscuit&w=600&h=200
 *   /cat/postcard/mackerel.svg
 *   /cat/postcard/back/900x600/mackerel.svg
 */
export function parseCatUrl(url: URL): CatRequest {
  const segs = url.pathname
    .split('/')
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean);
  while (segs.length && PREFIXES.has(segs[0].toLowerCase())) segs.shift();

  let width: number | undefined;
  let height: number | undefined;
  let seed: string | undefined;
  let mode: CatMode = 'cat';
  let side: PostcardSide = 'front';

  for (const raw of segs) {
    const seg = raw.replace(/\.svg$/i, '');
    if (!seg) continue;
    const pair = /^(\d+)\s*[x×]\s*(\d+)$/i.exec(seg);
    if (pair) {
      width = Number(pair[1]);
      height = Number(pair[2]);
      continue;
    }
    if (isNum(seg)) {
      if (width === undefined) width = Number(seg);
      else if (height === undefined) height = Number(seg);
      continue;
    }
    const word = seg.toLowerCase();
    if (MODE_WORDS.has(word)) {
      mode = 'postcard';
      if (isPostcardSide(word)) side = word;
      continue;
    }
    if (seed === undefined) seed = seg;
  }

  const q = url.searchParams;
  const qw = q.get('w') ?? q.get('width');
  const qh = q.get('h') ?? q.get('height');
  if (qw && isNum(qw)) width = Number(qw);
  if (qh && isNum(qh)) height = Number(qh);
  const qSeed = q.get('seed') ?? q.get('s');
  if (qSeed) seed = qSeed;

  const qMode = (q.get('mode') ?? '').toLowerCase();
  if (qMode === 'postcard') mode = 'postcard';
  else if (qMode === 'cat') mode = 'cat';
  const qSide = (q.get('side') ?? '').toLowerCase();
  if (isPostcardSide(qSide)) {
    side = qSide;
    // Asking for a side is asking for a postcard.
    if (!qMode) mode = 'postcard';
  }

  const random = !seed || seed.toLowerCase() === 'random';
  const postcard = mode === 'postcard';
  // A postcard with no size given is a 3:2 card, not a square.
  const w = clampSize(width ?? (postcard ? POSTCARD_WIDTH : DEFAULT_SIZE));
  const h = clampSize(height ?? (postcard ? postcardHeightFor(w) : w));

  const locks: Locks = {};
  for (const k of TRAIT_KEYS) {
    const v = q.get(k);
    if (v && TRAIT_OPTIONS[k].includes(v)) locks[k as TraitKey] = v;
  }

  const preset = q.get('preset') ?? 'anything';
  const text = q.get('text') ?? undefined;

  const card: CardFields = {};
  for (const k of CARD_TEXT) {
    const v = q.get(k);
    if (v !== null && v.trim()) card[k] = v;
  }
  const brand = readFlag(q.get('brand'));
  if (brand !== undefined) card.brand = brand;
  const stamp = readCount(q.get('stamp'));
  if (stamp !== undefined) card.stamp = stamp;

  return {
    seed: random ? newSeed() : seed!,
    width: w,
    height: h,
    preset: isPresetName(preset) ? preset : 'anything',
    mode,
    side,
    text: text ?? undefined,
    card,
    locks,
    random,
  };
}

/** Render the SVG a parsed request asks for. */
export function renderCatRequest(req: CatRequest): string {
  const traits = makeTraits(req.seed, req.locks, req.preset);
  if (req.mode === 'postcard')
    return renderPostcard(traits, {
      ...req.card,
      width: req.width,
      height: req.height,
      side: req.side,
      text: req.text,
    });
  return renderCat(traits, {
    width: req.width,
    height: req.height,
    text: req.text,
  });
}

export interface BuildUrlInput {
  seed: string;
  width?: number;
  height?: number;
  preset?: string;
  mode?: CatMode;
  side?: string;
  text?: string;
  card?: CardFields;
  locks?: Locks;
}

/** The size a build input asks for, with the mode's own default filled in. */
function buildSize(input: BuildUrlInput, postcard: boolean): [number, number] {
  const w = clampSize(input.width ?? (postcard ? POSTCARD_WIDTH : DEFAULT_SIZE));
  const h = clampSize(input.height ?? (postcard ? postcardHeightFor(w) : w));
  return [w, h];
}

/**
 * Everything about a cat that travels in a query string — what it looks like
 * and, on a postcard, what it says. Shared by the image URL and the studio
 * link so the two can never describe different cats.
 */
function buildParams(input: BuildUrlInput, postcard: boolean): URLSearchParams {
  const q = new URLSearchParams();
  if (input.preset && input.preset !== 'anything') q.set('preset', input.preset);
  if (input.text) q.set('text', input.text);
  if (postcard && input.card) {
    for (const k of CARD_TEXT) {
      const v = input.card[k];
      if (v && v.trim()) q.set(k, v);
    }
    // Both default to on, so only a change is worth saying.
    if (input.card.brand === false) q.set('brand', 'off');
    const stamps = input.card.stamp;
    if (stamps !== undefined && stamps !== 1) q.set('stamp', String(clampStamps(stamps)));
  }
  for (const k of TRAIT_KEYS) {
    const v = input.locks?.[k];
    if (v) q.set(k, v);
  }
  return q;
}

/** Inverse of {@link parseCatUrl} — the canonical path for a cat. */
export function buildCatPath(input: BuildUrlInput): string {
  const postcard = input.mode === 'postcard';
  const [w, h] = buildSize(input, postcard);
  const size = w === h ? `${w}` : `${w}x${h}`;
  // `/cat/postcard/back/900x600/mackerel.svg` — the mode reads as part of the
  // path, the way the size does.
  const kind = postcard ? `postcard/${input.side === 'back' ? 'back/' : ''}` : '';
  const qs = buildParams(input, postcard).toString();
  return `/cat/${kind}${size}/${encodeURIComponent(input.seed)}.svg${qs ? `?${qs}` : ''}`;
}

/**
 * The query half of a studio link — a page URL that reopens this exact cat or
 * postcard. {@link parseCatUrl} reads it back, so the address bar, the share
 * sheet and a pasted link all describe the same animal. The page is always
 * `/`, so the mode rides in the query here even though the image URL wears it
 * as a path segment.
 */
export function buildStudioQuery(input: BuildUrlInput): string {
  const postcard = input.mode === 'postcard';
  const [w, h] = buildSize(input, postcard);
  const q = buildParams(input, postcard);
  q.set('seed', input.seed);
  if (w !== DEFAULT_SIZE || h !== DEFAULT_SIZE) {
    q.set('w', String(w));
    q.set('h', String(h));
  }
  if (postcard) {
    q.set('mode', 'postcard');
    q.set('side', input.side === 'back' ? 'back' : 'front');
  }
  return q.toString();
}
