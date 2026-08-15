import type { Body, Colors } from './types.ts';

type TailPath = (x: number, y: number) => string;

export const TAILS: Record<string, TailPath> = {
  curl: (x, y) => `M${x},${y} C${x + 58},${y + 2} ${x + 72},${y - 42} ${x + 42},${y - 70}`,
  up: (x, y) => `M${x},${y} C${x + 50},${y + 4} ${x + 70},${y - 46} ${x + 62},${y - 100}`,
  sweep: (x, y) => `M${x},${y} C${x + 58},${y + 8} ${x + 84},${y - 16} ${x + 72},${y - 48}`,
  hook: (x, y) => `M${x},${y} C${x + 54},${y - 6} ${x + 64},${y - 50} ${x + 30},${y - 60}`,
  kink: (x, y) => `M${x},${y} C${x + 44},${y + 2} ${x + 50},${y - 28} ${x + 30},${y - 38} L${x + 56},${y - 62}`,
  wrap: (x, y) => `M${x},${y} C${x + 34},${y + 16} ${x - 60},${y + 30} ${x - 140},${y + 16}`,
  puff: (x, y) => `M${x},${y} C${x + 30},${y - 2} ${x + 42},${y - 22} ${x + 34},${y - 38}`,
  scurve: (x, y) => `M${x},${y} C${x + 62},${y + 6} ${x + 30},${y - 40} ${x + 76},${y - 70}`,
  bolt: (x, y) => `M${x},${y} L${x + 40},${y - 14} L${x + 20},${y - 40} L${x + 58},${y - 58}`,
  spiral: (x, y) =>
    `M${x},${y} C${x + 56},${y + 4} ${x + 70},${y - 34} ${x + 44},${y - 46} C${x + 26},${y - 54} ${x + 26},${y - 30} ${x + 44},${y - 26}`,
  droop: (x, y) => `M${x},${y} C${x + 52},${y + 12} ${x + 74},${y + 6} ${x + 84},${y - 14}`,
  stub: (x, y) => `M${x},${y - 4} C${x + 18},${y - 8} ${x + 26},${y - 18} ${x + 24},${y - 28}`,
  question: (x, y) =>
    `M${x},${y} C${x + 56},${y + 2} ${x + 64},${y - 56} ${x + 36},${y - 70} C${x + 18},${y - 78} ${x + 10},${y - 64} ${x + 18},${y - 56}`,
  plume: (x, y) => `M${x},${y} C${x + 52},${y - 4} ${x + 58},${y - 48} ${x + 28},${y - 76}`,
  low: (x, y) => `M${x},${y + 4} C${x + 48},${y + 16} ${x + 80},${y + 10} ${x + 92},${y - 6}`,
};

const TAIL_W: Record<string, number> = {
  curl: 24, up: 24, sweep: 24, hook: 22, kink: 20, wrap: 22, puff: 36, scurve: 18,
  bolt: 16, spiral: 18, droop: 22, stub: 30, question: 20, plume: 34, low: 20,
};

export const TAILTIPS = ['none', 'tipped', 'ringed', 'poof', 'dipped'] as const;

export function tailLayer(tail: string, tailtip: string, body: Body, C: Colors): string {
  const d = TAILS[tail](body.tx, body.ty);
  const w = TAIL_W[tail];
  let s = `<path d="${d}" fill="none" stroke="${C.tail}" stroke-width="${w}" stroke-linecap="round"/>`;
  if (tailtip === 'tipped')
    s += `<path d="${d}" pathLength="100" fill="none" stroke="${C.cream}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="16 100" stroke-dashoffset="-84"/>`;
  if (tailtip === 'dipped')
    s += `<path d="${d}" pathLength="100" fill="none" stroke="${C.mark}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="30 100" stroke-dashoffset="-70"/>`;
  if (tailtip === 'ringed')
    s += `<path d="${d}" pathLength="100" fill="none" stroke="${C.mark}" stroke-width="${w}" stroke-dasharray="7 9"/>`;
  if (tailtip === 'poof')
    s += `<path d="${d}" pathLength="100" fill="none" stroke="${C.tail}" stroke-width="${w + 18}" stroke-linecap="round" stroke-dasharray="9 100" stroke-dashoffset="-91"/>`;
  return s;
}
