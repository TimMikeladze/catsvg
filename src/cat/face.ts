import { N } from './rng';
import type { Colors } from './types';

export const EYES = [
  'almond', 'wedge', 'round', 'wide', 'sleepy', 'squint', 'slit', 'star',
  'wink', 'heart', 'dizzy', 'glow', 'half', 'googly', 'sparkle',
] as const;

function oneEye(k: string, x: number, y: number, ink: string, cream: string, pop: string): string {
  switch (k) {
    case 'wedge':
      return `<path d="M${x - 15},${y - 8} L${x + 15},${y - 2} L${x - 8},${y + 9} Z" fill="${cream}"/><path d="M${x + 2},${y - 3} L${x + 11},${y - 1} L${x + 1},${y + 4} Z" fill="${ink}"/>`;
    case 'round':
      return `<circle cx="${x}" cy="${y}" r="12" fill="${cream}"/><circle cx="${x + 2}" cy="${y}" r="5" fill="${ink}"/>`;
    case 'wide':
      return `<circle cx="${x}" cy="${y}" r="15" fill="${cream}"/><circle cx="${x + 1}" cy="${y}" r="8" fill="${pop}"/><circle cx="${x + 1}" cy="${y}" r="4" fill="${ink}"/><circle cx="${x - 4}" cy="${y - 5}" r="3" fill="#fff"/>`;
    case 'sleepy':
      return `<path d="M${x - 14},${y} Q${x},${y + 11} ${x + 14},${y}" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>`;
    case 'squint':
      return `<path d="M${x - 14},${y + 4} Q${x},${y - 8} ${x + 14},${y + 4}" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>`;
    case 'slit':
      return `<path d="M${x - 15},${y} Q${x},${y - 14} ${x + 15},${y} Q${x},${y + 12} ${x - 15},${y} Z" fill="${pop}"/><rect x="${x - 2}" y="${y - 9}" width="4" height="18" rx="2" fill="${ink}"/>`;
    case 'star':
      return `<path d="M${x},${y - 14} l4,9 10,1 -7,7 2,10 -9,-5 -9,5 2,-10 -7,-7 10,-1 Z" fill="${cream}"/>`;
    case 'heart':
      return `<path d="M${x},${y + 10} C${x - 16},${y - 1} ${x - 12},${y - 12} ${x - 5},${y - 5} C${x - 2},${y - 2} ${x + 2},${y - 2} ${x + 5},${y - 5} C${x + 12},${y - 12} ${x + 16},${y - 1} ${x},${y + 10} Z" fill="${pop}"/>`;
    case 'dizzy':
      return `<circle cx="${x}" cy="${y}" r="12" fill="${cream}"/><path d="M${x},${y} m0,-8 a8,8 0 1,1 -5,14 a5,5 0 1,0 5,-9" fill="none" stroke="${ink}" stroke-width="3"/>`;
    case 'glow':
      return `<circle cx="${x}" cy="${y}" r="13" fill="${pop}" opacity=".35"/><circle cx="${x}" cy="${y}" r="8" fill="${pop}"/><circle cx="${x}" cy="${y}" r="3.5" fill="${ink}"/>`;
    case 'half':
      return `<path d="M${x - 14},${y - 4} a14,14 0 0,1 28,0 z" fill="${cream}"/><circle cx="${x}" cy="${y - 5}" r="5" fill="${ink}"/><path d="M${x - 14},${y - 4} h28" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
    case 'googly':
      return `<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="${ink}" stroke-width="2"/><circle cx="${x + 3}" cy="${y + 4}" r="6" fill="${ink}"/>`;
    case 'sparkle':
      return `<path d="M${x - 15},${y} Q${x},${y - 14} ${x + 15},${y} Q${x},${y + 12} ${x - 15},${y} Z" fill="${cream}"/><ellipse cx="${x + 1}" cy="${y - 1}" rx="5" ry="7.5" fill="${ink}"/><circle cx="${x - 4}" cy="${y - 4}" r="3" fill="#fff"/><circle cx="${x + 6}" cy="${y + 3}" r="1.8" fill="#fff"/>`;
    default:
      return `<path d="M${x - 15},${y} Q${x},${y - 14} ${x + 15},${y} Q${x},${y + 12} ${x - 15},${y} Z" fill="${cream}"/><ellipse cx="${x + 1}" cy="${y - 1}" rx="4.5" ry="7" fill="${ink}"/><circle cx="${x - 4}" cy="${y - 4}" r="2.4" fill="#fff"/>`;
  }
}

export function eyesG(k: string, cx: number, cy: number, ink: string, cream: string, pop: string): string {
  const y = cy - 4;
  const l = cx - 30;
  const rt = cx + 30;
  if (k === 'wink') return oneEye('sleepy', l, y, ink, cream, pop) + oneEye('round', rt, y, ink, cream, pop);
  return oneEye(k, l, y, ink, cream, pop) + oneEye(k, rt, y, ink, cream, pop);
}

export const LASHES = ['none', 'none', 'lashes', 'long', 'under'] as const;

export function lashesG(k: string, cx: number, cy: number, ink: string): string {
  if (k === 'none') return '';
  const s = `stroke="${ink}" stroke-width="3" stroke-linecap="round" fill="none"`;
  if (k === 'lashes')
    return `<g ${s}><path d="M${cx - 44},${cy - 16} l-8,-6 M${cx - 36},${cy - 20} l-5,-8"/><path d="M${cx + 44},${cy - 16} l8,-6 M${cx + 36},${cy - 20} l5,-8"/></g>`;
  if (k === 'long')
    return `<g ${s}><path d="M${cx - 46},${cy - 14} l-14,-8 M${cx - 38},${cy - 20} l-8,-13 M${cx - 28},${cy - 22} l-2,-13"/><path d="M${cx + 46},${cy - 14} l14,-8 M${cx + 38},${cy - 20} l8,-13 M${cx + 28},${cy - 22} l2,-13"/></g>`;
  return `<g ${s}><path d="M${cx - 38},${cy + 10} l-6,7 M${cx + 38},${cy + 10} l6,7"/></g>`;
}

export const NOSES = ['triangle', 'heart', 'button', 'wide', 'tiny', 'flat'] as const;

export function noseG(k: string, cx: number, y: number, pop: string): string {
  if (k === 'heart')
    return `<path d="M${cx},${y + 13} C${cx - 13},${y + 3} ${cx - 10},${y - 4} ${cx - 4},${y + 1} C${cx - 1},${y + 3} ${cx + 1},${y + 3} ${cx + 4},${y + 1} C${cx + 10},${y - 4} ${cx + 13},${y + 3} ${cx},${y + 13} Z" fill="${pop}"/>`;
  if (k === 'button') return `<circle cx="${cx}" cy="${y + 5}" r="5.5" fill="${pop}"/>`;
  if (k === 'wide') return `<path d="M${cx - 12},${y} L${cx + 12},${y} L${cx},${y + 11} Z" fill="${pop}"/>`;
  if (k === 'tiny') return `<path d="M${cx - 5},${y + 2} L${cx + 5},${y + 2} L${cx},${y + 8} Z" fill="${pop}"/>`;
  if (k === 'flat') return `<rect x="${cx - 9}" y="${y + 1}" width="18" height="7" rx="3.5" fill="${pop}"/>`;
  return `<path d="M${cx - 8},${y} L${cx + 8},${y} L${cx},${y + 10} Z" fill="${pop}"/>`;
}

export const MOUTHS = ['w', 'smirk', 'open', 'tongue', 'fang', 'grin', 'frown', 'blep', 'whistle', 'none'] as const;

export function mouthG(k: string, cx: number, y: number, ink: string, pop: string, cream: string): string {
  const s = `stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"`;
  if (k === 'w') return `<path d="M${cx},${y + 10} v6 M${cx},${y + 16} q-9,7 -15,-1 M${cx},${y + 16} q9,7 15,-1" ${s}/>`;
  if (k === 'smirk') return `<path d="M${cx},${y + 10} v5 M${cx},${y + 15} q11,6 17,-3" ${s}/>`;
  if (k === 'open')
    return `<path d="M${cx},${y + 10} v4" ${s}/><ellipse cx="${cx}" cy="${y + 21}" rx="8" ry="9" fill="${ink}"/><ellipse cx="${cx}" cy="${y + 25}" rx="4.5" ry="4" fill="${pop}"/>`;
  if (k === 'tongue')
    return `<path d="M${cx},${y + 10} v6 M${cx},${y + 16} q-9,7 -15,-1" ${s}/><path d="M${cx + 2},${y + 16} q10,2 8,12 q-8,4 -10,-6 Z" fill="${pop}"/>`;
  if (k === 'fang')
    return `<path d="M${cx},${y + 10} v6 M${cx},${y + 16} q-9,7 -15,-1 M${cx},${y + 16} q9,7 15,-1" ${s}/><path d="M${cx - 9},${y + 18} l5,0 -2.5,9 Z" fill="${cream}"/><path d="M${cx + 4},${y + 18} l5,0 -2.5,9 Z" fill="${cream}"/>`;
  if (k === 'grin')
    return `<path d="M${cx - 18},${y + 13} q18,20 36,0 Z" fill="${ink}"/><path d="M${cx - 18},${y + 13} h36" stroke="${cream}" stroke-width="2.5"/>`;
  if (k === 'frown') return `<path d="M${cx},${y + 10} v6 M${cx - 13},${y + 26} q13,-12 26,0" ${s}/>`;
  if (k === 'blep')
    return `<path d="M${cx},${y + 10} v6 M${cx},${y + 16} q-9,7 -15,-1 M${cx},${y + 16} q9,7 15,-1" ${s}/><path d="M${cx - 7},${y + 20} h14 q0,14 -7,14 q-7,0 -7,-14 Z" fill="${pop}"/>`;
  if (k === 'whistle') return `<path d="M${cx},${y + 10} v4" ${s}/><circle cx="${cx}" cy="${y + 20}" r="6" fill="${ink}"/>`;
  return '';
}

export const WHISKERS = ['straight', 'droop', 'long', 'short', 'curly', 'onesided', 'none'] as const;

export function whiskersG(k: string, cx: number, y: number, col: string): string {
  if (k === 'none') return '';
  const w = `stroke="${col}" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".8"`;
  if (k === 'droop')
    return `<g ${w}><path d="M${cx - 22},${y} L${cx - 76},${y + 16}"/><path d="M${cx - 22},${y + 5} L${cx - 72},${y + 28}"/><path d="M${cx + 22},${y} L${cx + 76},${y + 16}"/><path d="M${cx + 22},${y + 5} L${cx + 72},${y + 28}"/></g>`;
  if (k === 'long')
    return `<g ${w}><path d="M${cx - 22},${y - 2} L${cx - 104},${y - 14}"/><path d="M${cx - 22},${y + 4} L${cx - 100},${y + 18}"/><path d="M${cx + 22},${y - 2} L${cx + 104},${y - 14}"/><path d="M${cx + 22},${y + 4} L${cx + 100},${y + 18}"/></g>`;
  if (k === 'short')
    return `<g ${w}><path d="M${cx - 24},${y + 1} L${cx - 54},${y - 4}"/><path d="M${cx + 24},${y + 1} L${cx + 54},${y - 4}"/></g>`;
  if (k === 'curly')
    return `<g ${w}><path d="M${cx - 24},${y} q-24,-14 -34,2 q-8,12 -18,4"/><path d="M${cx + 24},${y} q24,-14 34,2 q8,12 18,4"/></g>`;
  if (k === 'onesided')
    return `<g ${w}><path d="M${cx + 22},${y} L${cx + 82},${y - 10}"/><path d="M${cx + 22},${y + 5} L${cx + 80},${y + 12}"/><path d="M${cx + 22},${y + 9} L${cx + 74},${y + 26}"/></g>`;
  return `<g ${w}><path d="M${cx - 22},${y} L${cx - 78},${y - 8}"/><path d="M${cx - 22},${y + 5} L${cx - 76},${y + 11}"/><path d="M${cx + 22},${y} L${cx + 78},${y - 8}"/><path d="M${cx + 22},${y + 5} L${cx + 76},${y + 11}"/></g>`;
}

export const FACES = [
  'plain', 'split', 'blaze', 'mask', 'mustache', 'tabby', 'freckles',
  'blush', 'eyebrows', 'patcheye', 'moon', 'cheeks', 'beard', 'specks',
] as const;

/** Face markings. Clipped to the head silhouette by the caller. */
export function faceG(k: string, cx: number, cy: number, C: Colors, tilt: number): string {
  if (k === 'split')
    return `<path d="M${cx - 120},${cy + tilt + 12} L${cx + 120},${cy - tilt + 12} L${cx + 120},${cy + 150} L${cx - 120},${cy + 150} Z" fill="${C.mark}"/>`;
  if (k === 'blaze')
    return `<path d="M${cx - 13},${cy - 112} L${cx + 13},${cy - 112} L${cx + 7},${cy + 8} L${cx - 7},${cy + 8} Z" fill="${C.cream}"/>`;
  if (k === 'mask')
    return `<path d="M${cx - 120},${cy - 30} L${cx + 120},${cy - 30} L${cx + 120},${cy + 22} L${cx - 120},${cy + 22} Z" fill="${C.mark}"/>`;
  if (k === 'mustache')
    return `<path d="M${cx - 30},${cy + 16} q30,-14 60,0 q-6,26 -30,26 q-24,0 -30,-26 Z" fill="${C.cream}"/>`;
  if (k === 'tabby')
    return `<g stroke="${C.mark}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M${cx - 26},${cy - 52} l6,20 M${cx},${cy - 58} v20 M${cx + 26},${cy - 52} l-6,20"/></g>`;
  if (k === 'freckles') {
    let s = '';
    for (let i = 0; i < 8; i++) {
      const dx = (i % 4) * 11 - 16;
      const dy = Math.floor(i / 4) * 9;
      s += `<circle cx="${cx + (i < 4 ? -44 + dx : 44 + dx)}" cy="${cy + 22 + dy}" r="2.6" fill="${C.mark}" opacity=".8"/>`;
    }
    return s;
  }
  if (k === 'blush')
    return `<ellipse cx="${cx - 46}" cy="${cy + 20}" rx="17" ry="10" fill="${C.pop}" opacity=".55"/><ellipse cx="${cx + 46}" cy="${cy + 20}" rx="17" ry="10" fill="${C.pop}" opacity=".55"/>`;
  if (k === 'eyebrows')
    return `<path d="M${cx - 44},${cy - 26} l26,-6 M${cx + 44},${cy - 26} l-26,-6" stroke="${C.mark}" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  if (k === 'patcheye') return `<circle cx="${cx - 30}" cy="${cy - 4}" r="30" fill="${C.mark}"/>`;
  if (k === 'moon')
    return `<path d="M${cx - 18},${cy - 44} a18,18 0 1,0 18,18 a14,14 0 1,1 -18,-18 Z" fill="${C.cream}"/>`;
  if (k === 'cheeks')
    return `<path d="M${cx - 76},${cy + 6} q22,-16 40,4 q-18,26 -40,16 Z" fill="${C.mark}"/><path d="M${cx + 76},${cy + 6} q-22,-16 -40,4 q18,26 40,16 Z" fill="${C.mark}"/>`;
  if (k === 'beard')
    return `<path d="M${cx - 40},${cy + 34} q40,26 80,0 q-8,34 -40,34 q-32,0 -40,-34 Z" fill="${C.cream}"/>`;
  if (k === 'specks') {
    let s = '';
    for (let i = 0; i < 12; i++)
      s += `<circle cx="${N(cx - 70 + i * 13)}" cy="${N(cy - 46 + (i % 3) * 10)}" r="3" fill="${C.mark}" opacity=".7"/>`;
    return s;
  }
  return '';
}
