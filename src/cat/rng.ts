import type { Rng } from './types.ts';

/** FNV-1a. Stable across runtimes — the seed contract depends on it. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 seeded from a string. Same seed, same cat, forever. */
export function rng(seed: string): Rng {
  let a = hash(seed);
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T,>(r: Rng, a: readonly T[]): T => a[Math.floor(r() * a.length)];

/** Random float in [a, b). */
export const rr = (r: Rng, a: number, b: number): number => a + r() * (b - a);

/** Round to 1dp — keeps generated path data compact. */
export const N = (x: number): number => Math.round(x * 10) / 10;

const hx = (h: string): number[] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

/** Blend two hex colours, t in [0, 1]. */
export const mix = (c1: string, c2: string, t: number): string => {
  const a = hx(c1);
  const b = hx(c2);
  return (
    '#' +
    a
      .map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0'))
      .join('')
  );
};
