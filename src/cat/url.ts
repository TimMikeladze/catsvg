import { renderCat } from './render.ts';
import { TRAIT_OPTIONS, isPresetName } from './spec.ts';
import { makeTraits, newSeed } from './traits.ts';
import { TRAIT_KEYS } from './types.ts';
import type { Locks, TraitKey } from './types.ts';

/** Everything a cat URL can say. */
export interface CatRequest {
  seed: string;
  width: number;
  height: number;
  preset: string;
  /** Caption pill, e.g. the dimensions. */
  text?: string;
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

const isNum = (s: string): boolean => /^\d+$/.test(s);

/**
 * Parse any of these into a request:
 *
 *   /cat/mackerel.svg
 *   /cat/320/mackerel.svg
 *   /cat/1200x300/mackerel.svg
 *   /cat/240x240?eyes=star&palette=neon
 *   /cat?seed=biscuit&w=600&h=200
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
    if (seed === undefined) seed = seg;
  }

  const q = url.searchParams;
  const qw = q.get('w') ?? q.get('width');
  const qh = q.get('h') ?? q.get('height');
  if (qw && isNum(qw)) width = Number(qw);
  if (qh && isNum(qh)) height = Number(qh);
  const qSeed = q.get('seed') ?? q.get('s');
  if (qSeed) seed = qSeed;

  const random = !seed || seed.toLowerCase() === 'random';
  const w = clampSize(width ?? DEFAULT_SIZE);
  const h = clampSize(height ?? w);

  const locks: Locks = {};
  for (const k of TRAIT_KEYS) {
    const v = q.get(k);
    if (v && TRAIT_OPTIONS[k].includes(v)) locks[k as TraitKey] = v;
  }

  const preset = q.get('preset') ?? 'anything';
  const text = q.get('text') ?? undefined;

  return {
    seed: random ? newSeed() : seed!,
    width: w,
    height: h,
    preset: isPresetName(preset) ? preset : 'anything',
    text: text ?? undefined,
    locks,
    random,
  };
}

/** Render the SVG a parsed request asks for. */
export function renderCatRequest(req: CatRequest): string {
  const traits = makeTraits(req.seed, req.locks, req.preset);
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
  text?: string;
  locks?: Locks;
}

/** Inverse of {@link parseCatUrl} — the canonical path for a cat. */
export function buildCatPath(input: BuildUrlInput): string {
  const w = clampSize(input.width ?? DEFAULT_SIZE);
  const h = clampSize(input.height ?? w);
  const size = w === h ? `${w}` : `${w}x${h}`;
  const q = new URLSearchParams();
  if (input.preset && input.preset !== 'anything') q.set('preset', input.preset);
  if (input.text) q.set('text', input.text);
  for (const k of TRAIT_KEYS) {
    const v = input.locks?.[k];
    if (v) q.set(k, v);
  }
  const qs = q.toString();
  return `/cat/${size}/${encodeURIComponent(input.seed)}.svg${qs ? `?${qs}` : ''}`;
}
