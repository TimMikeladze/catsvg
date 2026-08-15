import { N, rr } from './rng';
import type { Colors, Rng } from './types';

export const COATS = [
  'solid', 'stripes', 'patch', 'bib', 'socks', 'tuxedo', 'spots', 'saddle',
  'dapple', 'belly', 'van', 'harlequin', 'vstripes', 'tortie', 'starchest',
  'rosettes', 'chevron', 'half', 'pinstripe', 'clouds',
] as const;

/** Coat markings. Clipped to the body silhouette by the caller. */
export function coatG(k: string, C: Colors, r: Rng): string {
  if (k === 'stripes') {
    let s = '';
    for (let i = 0; i < 7; i++) {
      const y = 228 + i * 22 + rr(r, -4, 4);
      s += `<path d="M80,${N(y)} q60,-16 120,-4 q60,12 120,-6 v12 q-60,18 -120,6 q-60,-12 -120,4 Z" fill="${C.mark}" opacity=".9"/>`;
    }
    return s;
  }
  if (k === 'vstripes') {
    let s = '';
    for (let i = 0; i < 9; i++) {
      const x = 90 + i * 26 + rr(r, -4, 4);
      s += `<path d="M${N(x)},220 q-10,60 2,150 h13 q-12,-90 -2,-150 Z" fill="${C.mark}" opacity=".85"/>`;
    }
    return s;
  }
  if (k === 'pinstripe') {
    let s = '';
    for (let i = 0; i < 14; i++) s += `<rect x="${86 + i * 16}" y="210" width="4" height="170" fill="${C.cream}" opacity=".5"/>`;
    return s;
  }
  if (k === 'patch')
    return `<circle cx="${N(rr(r, 132, 180))}" cy="${N(rr(r, 286, 326))}" r="${N(rr(r, 34, 50))}" fill="${C.mark}"/>`;
  if (k === 'bib')
    return `<path d="M200,230 C234,262 242,316 234,372 L166,372 C158,316 166,262 200,230 Z" fill="${C.cream}"/>`;
  if (k === 'socks') return `<rect x="80" y="332" width="240" height="30" fill="${C.cream}"/>`;
  if (k === 'tuxedo')
    return `<path d="M200,224 C244,266 252,320 246,372 L154,372 C148,320 156,266 200,224 Z" fill="${C.cream}"/><rect x="80" y="338" width="240" height="26" fill="${C.cream}"/>`;
  if (k === 'spots') {
    let s = '';
    for (let i = 0; i < 9; i++)
      s += `<circle cx="${N(rr(r, 105, 295))}" cy="${N(rr(r, 250, 350))}" r="${N(rr(r, 7, 14))}" fill="${C.mark}"/>`;
    return s;
  }
  if (k === 'rosettes') {
    let s = '';
    for (let i = 0; i < 8; i++) {
      const x = N(rr(r, 108, 292));
      const y = N(rr(r, 248, 344));
      const rad = N(rr(r, 10, 16));
      s += `<circle cx="${x}" cy="${y}" r="${rad}" fill="none" stroke="${C.mark}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="${N(rad / 2.6)}" fill="${C.mark}" opacity=".7"/>`;
    }
    return s;
  }
  if (k === 'saddle')
    return `<path d="M96,246 C150,224 250,224 304,246 L304,300 C250,282 150,282 96,300 Z" fill="${C.mark}"/>`;
  if (k === 'dapple') {
    let s = '';
    for (let i = 0; i < 26; i++)
      s += `<circle cx="${N(rr(r, 100, 300))}" cy="${N(rr(r, 240, 356))}" r="${N(rr(r, 3, 6))}" fill="${C.cream}" opacity=".7"/>`;
    return s;
  }
  if (k === 'clouds') {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const x = N(rr(r, 110, 290));
      const y = N(rr(r, 250, 340));
      s += `<path d="M${x - 30},${y} a16,16 0 0,1 16,-16 a20,20 0 0,1 34,4 a14,14 0 0,1 4,26 h-46 a14,14 0 0,1 -8,-14 Z" fill="${C.cream}" opacity=".55"/>`;
    }
    return s;
  }
  if (k === 'belly') return `<ellipse cx="200" cy="352" rx="86" ry="46" fill="${C.cream}"/>`;
  if (k === 'van')
    return `<rect x="60" y="200" width="340" height="200" fill="${C.cream}"/><path d="M92,232 C150,214 250,214 308,232 L308,288 C250,266 150,266 92,288 Z" fill="${C.body}"/>`;
  if (k === 'harlequin') return `<path d="M60,200 L400,380 L400,200 Z" fill="${C.mark}"/>`;
  if (k === 'half') return `<rect x="200" y="190" width="220" height="200" fill="${C.mark}"/>`;
  if (k === 'chevron') {
    let s = '';
    for (let i = 0; i < 6; i++) {
      const y = 232 + i * 26;
      s += `<path d="M80,${y} L200,${y + 22} L320,${y} v14 L200,${y + 36} L80,${y + 14} Z" fill="${C.mark}" opacity=".75"/>`;
    }
    return s;
  }
  if (k === 'tortie') {
    let s = '';
    for (let i = 0; i < 6; i++) {
      const x = N(rr(r, 100, 290));
      const y = N(rr(r, 246, 340));
      const k2 = N(rr(r, 1.3, 2.1));
      s += `<path d="M${x},${y} q${N(30 * k2)},-${N(16 * k2)} ${N(46 * k2)},${N(6 * k2)} q${N(12 * k2)},${N(26 * k2)} -${N(18 * k2)},${N(30 * k2)} q-${N(36 * k2)},${N(6 * k2)} -${N(28 * k2)},-${N(36 * k2)} Z" fill="${i % 2 ? C.mark : C.cream}"/>`;
    }
    return s;
  }
  if (k === 'starchest')
    return `<path d="M200,262 l9,20 22,2 -16,15 5,22 -20,-11 -20,11 5,-22 -16,-15 22,-2 Z" fill="${C.cream}"/>`;
  return '';
}
