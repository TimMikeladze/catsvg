import type { Colors } from './types.ts';

export const EARS = ['pointy', 'tall', 'round', 'wide', 'tufted', 'folded', 'notched', 'satellite', 'curled'] as const;

/** Head shape as [x-scale, y-scale]. */
export const HEADS: Record<string, [number, number]> = {
  standard: [1, 1],
  wide: [1.14, 0.92],
  narrow: [0.88, 1.06],
  long: [1, 1.14],
  squat: [1.08, 0.86],
};

/** Skull + ears as one silhouette, so ears never seam against the head. */
export function headPath(cx: number, cy: number, ears: string): string {
  const hw = 76;
  const hh = 52;
  if (ears === 'round' || ears === 'folded' || ears === 'curled') {
    const eh = ears === 'folded' ? 14 : ears === 'curled' ? 22 : 30;
    return `M${cx - hw},${cy + 6} C${cx - hw - 2},${cy - hh} ${cx - hw + 6},${cy - hh - eh} ${cx - hw + 34},${cy - hh - eh + 6}
      C${cx - 30},${cy - hh - 16} ${cx + 30},${cy - hh - 16} ${cx + hw - 34},${cy - hh - eh + 6}
      C${cx + hw - 6},${cy - hh - eh} ${cx + hw + 2},${cy - hh} ${cx + hw},${cy + 6}
      C${cx + hw},${cy + hh} ${cx + 40},${cy + hh + 12} ${cx},${cy + hh + 12}
      C${cx - 40},${cy + hh + 12} ${cx - hw},${cy + hh} ${cx - hw},${cy + 6} Z`;
  }
  if (ears === 'notched')
    return `M${cx - hw},${cy + 4} L${cx - hw + 2},${cy - hh + 6} L${cx - hw + 8},${cy - hh - 40} L${cx - 52},${cy - hh - 18} L${cx - 40},${cy - hh - 34} L${cx - 26},${cy - hh - 2}
      L${cx + 26},${cy - hh - 2} L${cx + 40},${cy - hh - 34} L${cx + 52},${cy - hh - 18} L${cx + hw - 8},${cy - hh - 40} L${cx + hw - 2},${cy - hh + 6} L${cx + hw},${cy + 4}
      C${cx + hw},${cy + hh} ${cx + 42},${cy + hh + 12} ${cx},${cy + hh + 12} C${cx - 42},${cy + hh + 12} ${cx - hw},${cy + hh} ${cx - hw},${cy + 4} Z`;
  if (ears === 'satellite')
    return `M${cx - hw},${cy + 4} L${cx - hw - 16},${cy - hh - 6} L${cx - hw - 6},${cy - hh - 40} L${cx - 24},${cy - hh - 4}
      L${cx + 24},${cy - hh - 4} L${cx + hw + 6},${cy - hh - 40} L${cx + hw + 16},${cy - hh - 6} L${cx + hw},${cy + 4}
      C${cx + hw},${cy + hh} ${cx + 42},${cy + hh + 12} ${cx},${cy + hh + 12} C${cx - 42},${cy + hh + 12} ${cx - hw},${cy + hh} ${cx - hw},${cy + 4} Z`;
  const eh = ears === 'tall' ? 60 : ears === 'wide' ? 34 : 44;
  const lean = ears === 'tall' ? 12 : ears === 'wide' ? -8 : 4;
  const inner = ears === 'wide' ? 38 : 28;
  return `M${cx - hw},${cy + 4} L${cx - hw + 2},${cy - hh + 6} L${cx - hw + lean + 6},${cy - hh - eh} L${cx - inner},${cy - hh - 2}
    L${cx + inner},${cy - hh - 2} L${cx + hw - lean - 6},${cy - hh - eh} L${cx + hw - 2},${cy - hh + 6} L${cx + hw},${cy + 4}
    C${cx + hw},${cy + hh} ${cx + 42},${cy + hh + 12} ${cx},${cy + hh + 12}
    C${cx - 42},${cy + hh + 12} ${cx - hw},${cy + hh} ${cx - hw},${cy + 4} Z`;
}

/** Inner ear, tufts, curls — drawn on top of the head silhouette. */
export function earExtras(cx: number, cy: number, ears: string, C: Colors): string {
  const hh = 52;
  const hw = 76;
  if (ears === 'tufted')
    return `<g stroke="${C.cream}" stroke-width="3" stroke-linecap="round" opacity=".9">
      <path d="M${cx - hw + 14},${cy - hh - 40} l-8,-16 M${cx - hw + 22},${cy - hh - 42} l2,-18"/>
      <path d="M${cx + hw - 14},${cy - hh - 40} l8,-16 M${cx + hw - 22},${cy - hh - 42} l-2,-18"/></g>
      <path d="M${cx - hw + 12},${cy - hh - 30} l14,26 l-22,2 Z" fill="${C.pop}" opacity=".55"/>
      <path d="M${cx + hw - 12},${cy - hh - 30} l-14,26 l22,2 Z" fill="${C.pop}" opacity=".55"/>`;
  if (ears === 'curled')
    return `<path d="M${cx - hw + 2},${cy - hh - 16} a16,16 0 1,1 26,10" fill="none" stroke="${C.head}" stroke-width="11" stroke-linecap="round"/>
      <path d="M${cx + hw - 2},${cy - hh - 16} a16,16 0 1,0 -26,10" fill="none" stroke="${C.head}" stroke-width="11" stroke-linecap="round"/>`;
  if (ears === 'satellite')
    return `<path d="M${cx - hw - 4},${cy - hh - 28} L${cx - 34},${cy - hh + 2} L${cx - hw + 2},${cy - hh + 4} Z" fill="${C.pop}" opacity=".5"/>
      <path d="M${cx + hw + 4},${cy - hh - 28} L${cx + 34},${cy - hh + 2} L${cx + hw - 2},${cy - hh + 4} Z" fill="${C.pop}" opacity=".5"/>`;
  if (ears === 'pointy' || ears === 'tall' || ears === 'wide' || ears === 'notched') {
    const eh = ears === 'tall' ? 60 : ears === 'wide' ? 34 : ears === 'notched' ? 40 : 44;
    return `<path d="M${cx - hw + 14},${cy - hh - eh + 18} L${cx - 34},${cy - hh + 4} L${cx - hw + 4},${cy - hh + 6} Z" fill="${C.pop}" opacity=".5"/>
            <path d="M${cx + hw - 14},${cy - hh - eh + 18} L${cx + 34},${cy - hh + 4} L${cx + hw - 4},${cy - hh + 6} Z" fill="${C.pop}" opacity=".5"/>`;
  }
  return '';
}
