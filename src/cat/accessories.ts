import type { Colors, Palette } from './types.ts';

export const PAWS = ['none', 'two', 'crossed', 'tucked', 'spread', 'beans'] as const;

export function pawsG(k: string, C: Colors): string {
  const y = 340;
  const col = C.cream;
  if (k === 'two')
    return `<rect x="164" y="${y}" width="30" height="18" rx="9" fill="${col}"/><rect x="206" y="${y}" width="30" height="18" rx="9" fill="${col}"/>`;
  if (k === 'crossed')
    return `<rect x="158" y="${y + 2}" width="46" height="17" rx="8.5" fill="${col}" transform="rotate(-8 181 ${y + 10})"/><rect x="196" y="${y}" width="46" height="17" rx="8.5" fill="${col}" transform="rotate(6 219 ${y + 8})"/>`;
  if (k === 'tucked') return `<path d="M168,${y + 4} q32,-12 64,0 q-32,16 -64,0 Z" fill="${col}"/>`;
  if (k === 'spread')
    return `<rect x="126" y="${y}" width="34" height="18" rx="9" fill="${col}"/><rect x="240" y="${y}" width="34" height="18" rx="9" fill="${col}"/><rect x="183" y="${y + 2}" width="34" height="18" rx="9" fill="${col}"/>`;
  if (k === 'beans')
    return `<rect x="164" y="${y}" width="30" height="18" rx="9" fill="${col}"/><rect x="206" y="${y}" width="30" height="18" rx="9" fill="${col}"/>
    <circle cx="179" cy="${y + 9}" r="4.5" fill="${C.pop}"/><circle cx="221" cy="${y + 9}" r="4.5" fill="${C.pop}"/>`;
  return '';
}

export const HOLDS = ['none', 'none', 'none', 'fish', 'mug', 'book', 'balloon', 'pencil', 'snack'] as const;

/** Item held in front of the chest. */
export function holdG(k: string, C: Colors, p: Palette): string {
  const x = 200;
  const y = 336;
  const wrap = (g: string) => `<g transform="translate(${x},${y}) scale(.86) translate(${-x},${-y})">${g}</g>`;
  switch (k) {
    case 'fish':
      return wrap(`<g transform="translate(${x},${y})"><path d="M-26,0 q16,-17 32,0 q-17,17 -32,0 Z" fill="${C.cream}" stroke="${p.a}" stroke-width="2"/><path d="M6,0 l17,-11 0,22 Z" fill="${C.cream}" stroke="${p.a}" stroke-width="2"/><circle cx="-13" cy="-2" r="2" fill="${p.a}"/></g>`);
    case 'mug':
      return wrap(`<rect x="${x - 20}" y="${y - 16}" width="40" height="34" rx="6" fill="${C.cream}" stroke="${p.a}" stroke-width="2"/><path d="M${x + 20},${y - 6} a10,10 0 0,1 0,16" fill="none" stroke="${p.a}" stroke-width="4"/><rect x="${x - 20}" y="${y - 16}" width="40" height="9" fill="${p.d}"/>`);
    case 'book':
      return wrap(`<rect x="${x - 26}" y="${y - 14}" width="52" height="34" rx="3" fill="${p.d}"/><rect x="${x - 4}" y="${y - 14}" width="6" height="34" fill="${p.b}"/><rect x="${x - 26}" y="${y + 18}" width="52" height="5" fill="${C.cream}"/>`);
    case 'balloon':
      return wrap(`<path d="M${x},${y + 6} q30,-30 84,-52" stroke="${p.a}" stroke-width="2" fill="none"/><ellipse cx="${x + 92}" cy="${y - 84}" rx="26" ry="31" fill="${p.d}"/><path d="M${x + 92},${y - 53} l-7,10 14,0 Z" fill="${p.d}"/>`);
    case 'pencil':
      return wrap(`<g transform="rotate(-24 ${x} ${y})"><rect x="${x - 6}" y="${y - 40}" width="12" height="60" fill="${p.b}"/><path d="M${x - 6},${y - 40} l6,-14 6,14 Z" fill="${C.cream}"/><rect x="${x - 6}" y="${y + 20}" width="12" height="8" fill="${p.d}"/></g>`);
    case 'snack':
      return wrap(`<path d="M${x - 22},${y + 18} l6,-34 h32 l6,34 Z" fill="${p.d}"/><path d="M${x - 16},${y - 16} h32" stroke="${C.cream}" stroke-width="4"/>`);
    default:
      return '';
  }
}

export const EXTRAS = [
  'none', 'none', 'bell', 'bowtie', 'scarf', 'flower', 'glasses', 'beanie',
  'bandana', 'headphones', 'crown', 'shades', 'tie', 'partyhat', 'monocle',
  'eyepatch', 'antennae', 'earmuffs', 'halo', 'bandage', 'cap', 'hairbow',
] as const;

/** Accessories worn at the neck — suppressed on bodies with a low head. */
export const NECK = ['bell', 'bowtie', 'scarf', 'bandana', 'tie'];

export function extraG(k: string, cx: number, cy: number, C: Colors, p: Palette): string {
  const ny = cy + 64;
  switch (k) {
    case 'bell':
      return `<path d="M${cx - 52},${ny} Q${cx},${ny + 24} ${cx + 52},${ny} L${cx + 50},${ny + 13} Q${cx},${ny + 36} ${cx - 50},${ny + 13} Z" fill="${p.d}"/><circle cx="${cx}" cy="${ny + 30}" r="8" fill="${p.b}" stroke="${p.a}" stroke-width="2"/>`;
    case 'bowtie':
      return `<path d="M${cx - 34},${ny + 4} L${cx - 6},${ny + 16} L${cx - 34},${ny + 30} Z" fill="${p.d}"/><path d="M${cx + 34},${ny + 4} L${cx + 6},${ny + 16} L${cx + 34},${ny + 30} Z" fill="${p.d}"/><circle cx="${cx}" cy="${ny + 17}" r="6" fill="${p.b}"/>`;
    case 'scarf':
      return `<path d="M${cx - 56},${ny - 2} Q${cx},${ny + 26} ${cx + 56},${ny - 2} L${cx + 54},${ny + 20} Q${cx},${ny + 48} ${cx - 54},${ny + 20} Z" fill="${p.d}"/><path d="M${cx + 30},${ny + 26} l26,10 -12,30 -22,-12 Z" fill="${p.d}"/>`;
    case 'tie':
      return `<path d="M${cx - 30},${ny} L${cx + 30},${ny} L${cx + 8},${ny + 16} L${cx - 8},${ny + 16} Z" fill="${C.cream}"/><path d="M${cx - 9},${ny + 14} L${cx + 9},${ny + 14} L${cx + 15},${ny + 58} L${cx},${ny + 70} L${cx - 15},${ny + 58} Z" fill="${p.d}"/>`;
    case 'flower':
      return `<g transform="translate(${cx + 62},${cy - 92})"><g fill="${p.d}"><circle cx="0" cy="-11" r="9"/><circle cx="11" cy="0" r="9"/><circle cx="0" cy="11" r="9"/><circle cx="-11" cy="0" r="9"/></g><circle r="6" fill="${p.b}"/></g>`;
    case 'hairbow':
      return `<g transform="translate(${cx - 58},${cy - 96})"><path d="M0,0 L-26,-12 -26,14 Z" fill="${p.d}"/><path d="M0,0 L26,-12 26,14 Z" fill="${p.d}"/><circle r="6" fill="${p.b}"/></g>`;
    case 'glasses':
      return `<g fill="none" stroke="${p.a}" stroke-width="4"><circle cx="${cx - 30}" cy="${cy - 4}" r="24" fill="#fff" fill-opacity=".22"/><circle cx="${cx + 30}" cy="${cy - 4}" r="24" fill="#fff" fill-opacity=".22"/><path d="M${cx - 6},${cy - 6} h12 M${cx - 54},${cy - 8} l-22,-6 M${cx + 54},${cy - 8} l22,-6"/></g>`;
    case 'shades':
      return `<path d="M${cx - 58},${cy - 20} h116 v10 q0,26 -26,26 q-24,0 -26,-22 h-12 q-2,22 -26,22 q-26,0 -26,-26 Z" fill="#17151F" stroke="${C.cream}" stroke-width="2.5"/><path d="M${cx - 58},${cy - 22} h116" stroke="${p.d}" stroke-width="5" stroke-linecap="round"/>`;
    case 'monocle':
      return `<g fill="none" stroke="${p.b}" stroke-width="4"><circle cx="${cx + 30}" cy="${cy - 4}" r="26" fill="#fff" fill-opacity=".25"/><path d="M${cx + 30},${cy + 22} l-6,34"/></g>`;
    case 'eyepatch':
      return `<path d="M${cx - 58},${cy - 28} L${cx + 64},${cy - 44}" stroke="#17151F" stroke-width="6"/><path d="M${cx - 56},${cy - 24} L${cx - 4},${cy - 18} L${cx - 6},${cy + 16} L${cx - 54},${cy + 12} Z" fill="#17151F" stroke="${C.cream}" stroke-width="2"/>`;
    case 'beanie':
      return `<path d="M${cx - 80},${cy - 46} C${cx - 74},${cy - 118} ${cx + 74},${cy - 118} ${cx + 80},${cy - 46} Z" fill="${p.d}"/><rect x="${cx - 84}" y="${cy - 54}" width="168" height="18" rx="9" fill="${p.b}"/><circle cx="${cx}" cy="${cy - 116}" r="13" fill="${p.b}"/>`;
    case 'cap':
      return `<path d="M${cx - 72},${cy - 58} a72,58 0 0,1 144,0 Z" fill="${p.d}"/><path d="M${cx + 60},${cy - 58} q40,4 44,18 l-46,2 Z" fill="${p.b}"/><circle cx="${cx}" cy="${cy - 114}" r="8" fill="${p.b}"/>`;
    case 'partyhat':
      return `<path d="M${cx},${cy - 136} L${cx + 34},${cy - 56} L${cx - 34},${cy - 56} Z" fill="${p.d}"/><path d="M${cx - 26},${cy - 74} h52 M${cx - 16},${cy - 98} h32" stroke="${p.b}" stroke-width="5"/><circle cx="${cx}" cy="${cy - 140}" r="9" fill="${p.b}"/>`;
    case 'crown':
      return `<path d="M${cx - 52},${cy - 58} L${cx - 40},${cy - 104} L${cx - 18},${cy - 76} L${cx},${cy - 112} L${cx + 18},${cy - 76} L${cx + 40},${cy - 104} L${cx + 52},${cy - 58} Z" fill="${p.b}" stroke="${p.a}" stroke-width="2"/><circle cx="${cx}" cy="${cy - 72}" r="6" fill="${p.d}"/>`;
    case 'halo':
      return `<ellipse cx="${cx}" cy="${cy - 118}" rx="46" ry="13" fill="none" stroke="${p.b}" stroke-width="8"/>`;
    case 'bandage':
      return `<rect x="${cx + 8}" y="${cy - 46}" width="42" height="16" rx="3" fill="${C.cream}" transform="rotate(-16 ${cx + 29} ${cy - 38})"/><rect x="${cx + 22}" y="${cy - 58}" width="16" height="42" rx="3" fill="${C.cream}" transform="rotate(-16 ${cx + 30} ${cy - 37})"/>`;
    case 'bandana':
      return `<path d="M${cx - 54},${ny - 6} Q${cx},${ny + 18} ${cx + 54},${ny - 6} L${cx},${ny + 62} Z" fill="${p.d}"/>`;
    case 'headphones':
      return `<path d="M${cx - 84},${cy - 6} C${cx - 84},${cy - 104} ${cx + 84},${cy - 104} ${cx + 84},${cy - 6}" fill="none" stroke="${p.d}" stroke-width="11" stroke-linecap="round"/><rect x="${cx - 98}" y="${cy - 18}" width="26" height="42" rx="12" fill="${p.d}"/><rect x="${cx + 72}" y="${cy - 18}" width="26" height="42" rx="12" fill="${p.d}"/>`;
    case 'earmuffs':
      return `<path d="M${cx - 72},${cy - 40} C${cx - 60},${cy - 104} ${cx + 60},${cy - 104} ${cx + 72},${cy - 40}" fill="none" stroke="${p.b}" stroke-width="9"/><circle cx="${cx - 76}" cy="${cy - 34}" r="20" fill="${p.d}"/><circle cx="${cx + 76}" cy="${cy - 34}" r="20" fill="${p.d}"/>`;
    case 'antennae':
      return `<g stroke="${p.d}" stroke-width="4" fill="none"><path d="M${cx - 22},${cy - 92} q-8,-30 -22,-40"/><path d="M${cx + 22},${cy - 92} q8,-30 22,-40"/></g><circle cx="${cx - 46}" cy="${cy - 134}" r="8" fill="${p.b}"/><circle cx="${cx + 46}" cy="${cy - 134}" r="8" fill="${p.b}"/>`;
    default:
      return '';
  }
}

export const PROPS = ['none', 'none', 'none', 'yarn', 'fish', 'ball', 'mouse', 'leaf', 'can', 'box', 'plant', 'sock'] as const;

/** Object on the floor beside the cat. */
export function propG(k: string, C: Colors, p: Palette, leftSide: boolean): string {
  const x = leftSide ? 62 : 338;
  const y = 344;
  switch (k) {
    case 'yarn':
      return `<circle cx="${x}" cy="${y}" r="22" fill="${p.d}"/><path d="M${x - 16},${y - 12} q16,12 32,0 M${x - 20},${y + 2} q20,16 40,-4 M${x - 8},${y - 20} q-8,20 4,40" stroke="${p.a}" stroke-width="2.5" fill="none" opacity=".6"/>`;
    case 'fish':
      return `<g transform="translate(${x},${y})"><path d="M-24,0 q14,-16 30,0 q-16,16 -30,0 Z" fill="${C.cream}" stroke="${p.a}" stroke-width="2"/><path d="M6,0 l16,-10 0,20 Z" fill="${C.cream}" stroke="${p.a}" stroke-width="2"/><circle cx="-12" cy="-2" r="2" fill="${p.a}"/></g>`;
    case 'ball':
      return `<circle cx="${x}" cy="${y + 2}" r="18" fill="${p.b}"/><path d="M${x - 18},${y + 2} a18,18 0 0,0 36,0" fill="${p.d}"/>`;
    case 'mouse':
      return `<g transform="translate(${x},${y + 4})"><ellipse cx="0" cy="0" rx="20" ry="13" fill="${C.cream}"/><circle cx="-14" cy="-10" r="7" fill="${C.cream}"/><path d="M18,2 q18,4 22,-8" stroke="${C.cream}" stroke-width="3" fill="none"/><circle cx="-20" cy="0" r="2.5" fill="${p.a}"/></g>`;
    case 'leaf':
      return `<path d="M${x},${y + 14} q-30,-14 -6,-40 q26,12 6,40 Z" fill="${p.b}"/><path d="M${x},${y + 14} q-8,-22 -4,-38" stroke="${p.a}" stroke-width="2" fill="none" opacity=".5"/>`;
    case 'can':
      return `<rect x="${x - 16}" y="${y - 22}" width="32" height="36" rx="5" fill="${p.b}" stroke="${p.a}" stroke-width="2"/><rect x="${x - 16}" y="${y - 14}" width="32" height="14" fill="${p.d}" opacity=".8"/>`;
    case 'box':
      return `<path d="M${x - 34},${y + 14} v-30 l34,-12 34,12 v30 Z" fill="${p.b}"/><path d="M${x - 34},${y - 16} l34,12 34,-12" fill="none" stroke="${p.a}" stroke-width="2" opacity=".5"/>`;
    case 'plant':
      return `<path d="M${x - 16},${y + 14} l4,-24 h24 l4,24 Z" fill="${p.d}"/><path d="M${x},${y - 10} q-26,-6 -22,-34 q24,4 22,34 Z" fill="${p.b}"/><path d="M${x},${y - 10} q26,-10 24,-38 q-26,8 -24,38 Z" fill="${p.b}" opacity=".8"/>`;
    case 'sock':
      return `<path d="M${x - 16},${y - 18} h20 v22 l14,10 -8,14 -30,-16 Z" fill="${C.cream}" stroke="${p.a}" stroke-width="2"/>`;
    default:
      return '';
  }
}

export const AURAS = ['none', 'none', 'none', 'sparkle', 'hearts', 'zzz', 'music', 'question', 'anger', 'bubbles', 'stars'] as const;

/** Floating mood glyphs beside the head. */
export function auraG(k: string, cx: number, cy: number, C: Colors, p: Palette): string {
  const x = cx + 96;
  const y = cy - 72;
  switch (k) {
    case 'sparkle':
      return `<g fill="${p.b}"><path d="M${x},${y} l6,14 14,6 -14,6 -6,14 -6,-14 -14,-6 14,-6 Z"/><path d="M${x - 40},${y + 40} l4,9 9,4 -9,4 -4,9 -4,-9 -9,-4 9,-4 Z" opacity=".8"/><path d="M${x + 16},${y + 54} l3,7 7,3 -7,3 -3,7 -3,-7 -7,-3 7,-3 Z" opacity=".6"/></g>`;
    case 'hearts':
      return `<g fill="${p.d}"><path d="M${x},${y + 16} C${x - 20},${y + 2} ${x - 14},${y - 14} ${x - 6},${y - 6} C${x - 2},${y - 2} ${x + 2},${y - 2} ${x + 6},${y - 6} C${x + 14},${y - 14} ${x + 20},${y + 2} ${x},${y + 16} Z"/><g transform="translate(-46,44) scale(.6)"><path d="M${x},${y + 16} C${x - 20},${y + 2} ${x - 14},${y - 14} ${x - 6},${y - 6} C${x - 2},${y - 2} ${x + 2},${y - 2} ${x + 6},${y - 6} C${x + 14},${y - 14} ${x + 20},${y + 2} ${x},${y + 16} Z"/></g></g>`;
    case 'zzz':
      return `<g fill="${C.cream}" font-family="monospace" font-weight="700"><text x="${x - 10}" y="${y}" font-size="34">Z</text><text x="${x + 18}" y="${y + 30}" font-size="24">z</text><text x="${x - 30}" y="${y + 40}" font-size="18">z</text></g>`;
    case 'music':
      return `<g fill="${p.b}"><path d="M${x},${y + 20} a9,7 0 1,0 9,7 V${y - 8} l18,-6 v26 a9,7 0 1,0 9,7 V${y - 20} l-36,12 Z"/></g>`;
    case 'question':
      return `<text x="${x - 12}" y="${y + 14}" font-size="46" font-family="monospace" font-weight="700" fill="${p.b}">?</text>`;
    case 'anger':
      return `<g stroke="${p.d}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M${x - 14},${y - 8} h26 M${x - 4},${y - 18} v26 M${x - 14},${y + 18} h20 M${x - 6},${y + 10} v18" transform="rotate(20 ${x} ${y})"/></g>`;
    case 'bubbles':
      return `<g fill="none" stroke="${C.cream}" stroke-width="3" opacity=".8"><circle cx="${x}" cy="${y}" r="13"/><circle cx="${x - 34}" cy="${y + 34}" r="8"/><circle cx="${x + 12}" cy="${y + 52}" r="5"/></g>`;
    case 'stars':
      return `<g fill="${C.cream}"><path d="M${x},${y - 6} l5,11 12,1 -9,8 3,12 -11,-6 -11,6 3,-12 -9,-8 12,-1 Z"/><path d="M${x - 40},${y + 38} l3,7 8,1 -6,5 2,8 -7,-4 -7,4 2,-8 -6,-5 8,-1 Z" opacity=".75"/></g>`;
    default:
      return '';
  }
}
