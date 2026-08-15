import { N, mix, rr } from './rng.ts';
import type { Colors, Frame, Palette, Rng } from './types.ts';

/**
 * Backgrounds, tints and frames all paint the whole visible {@link Frame}, not
 * a fixed 400x400 box — that is what lets a 1200x300 banner keep a full-size
 * cat with the scene running edge to edge behind it.
 */

/** First point of an `offset + n*step` lattice that is <= min. */
const latticeStart = (min: number, offset: number, step: number): number =>
  offset + Math.floor((min - offset) / step) * step;

export const SCENES = [
  'flat', 'halo', 'arch', 'dots', 'rays', 'checker', 'window', 'confetti',
  'grid', 'rings', 'night', 'waves', 'horizon', 'spotlight', 'hills',
  'tiles', 'stripe', 'corner',
] as const;

export function sceneG(k: string, p: Palette, r: Rng, f: Frame): string {
  const right = f.x + f.w;
  const bottom = f.y + f.h;
  const base = `<rect x="${N(f.x)}" y="${N(f.y)}" width="${N(f.w)}" height="${N(f.h)}" fill="${p.bg}"/>`;

  if (k === 'halo') return base + `<circle cx="200" cy="196" r="140" fill="${p.c}" opacity=".18"/>`;
  if (k === 'arch')
    return base + `<path d="M84,${N(bottom)} L84,180 A116,116 0 0 1 316,180 L316,${N(bottom)} Z" fill="${p.c}" opacity=".16"/>`;
  if (k === 'dots') {
    let s = base;
    for (let x = latticeStart(f.x, 28, 46); x < right; x += 46)
      for (let y = latticeStart(f.y, 28, 46); y < bottom; y += 46)
        s += `<circle cx="${N(x)}" cy="${N(y)}" r="4" fill="${p.c}" opacity=".22"/>`;
    return s;
  }
  if (k === 'rays') {
    const len = Math.hypot(f.w, f.h);
    let s = base;
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 * Math.PI) / 180;
      s += `<path d="M200,200 L${N(200 + len * Math.cos(a))},${N(200 + len * Math.sin(a))} L${N(200 + len * Math.cos(a + 0.26))},${N(200 + len * Math.sin(a + 0.26))} Z" fill="${p.c}" opacity="${i % 2 ? '.13' : '0'}"/>`;
    }
    return s;
  }
  if (k === 'checker') {
    let s = base;
    let col = 0;
    for (let x = latticeStart(f.x, 0, 50); x < right; x += 50, col++) {
      let row = 0;
      for (let y = bottom - 100; y < bottom; y += 50, row++)
        if ((col + row) % 2) s += `<rect x="${N(x)}" y="${N(y)}" width="50" height="50" fill="${p.a}" opacity=".14"/>`;
    }
    return s;
  }
  if (k === 'window')
    return base + `<rect x="52" y="40" width="296" height="300" rx="18" fill="${p.c}" opacity=".2"/><path d="M200,40 V340 M52,190 H348" stroke="${p.a}" stroke-width="6" opacity=".18"/>`;
  if (k === 'confetti') {
    let s = base;
    const band = Math.min(f.h * 0.6, 220);
    for (let i = 0; i < Math.round(14 * Math.max(1, f.w / 400)); i++) {
      const x = N(rr(r, f.x + 20, right - 20));
      const y = N(rr(r, f.y + 20, f.y + band));
      s += `<path d="M${x},${y} l14,4 -8,12 Z" fill="${i % 2 ? p.d : p.c}" opacity=".5"/>`;
    }
    return s;
  }
  if (k === 'grid') {
    let s = base;
    for (let x = latticeStart(f.x, 0, 50); x <= right; x += 50)
      s += `<path d="M${N(x)},${N(f.y)} V${N(bottom)}" stroke="${p.c}" stroke-width="1.5" opacity=".16"/>`;
    for (let y = latticeStart(f.y, 0, 50); y <= bottom; y += 50)
      s += `<path d="M${N(f.x)},${N(y)} H${N(right)}" stroke="${p.c}" stroke-width="1.5" opacity=".16"/>`;
    return s;
  }
  if (k === 'rings') {
    let s = base;
    const rings = Math.ceil(Math.hypot(f.w, f.h) / 2 / 38);
    for (let i = 1; i <= rings; i++)
      s += `<circle cx="200" cy="210" r="${i * 38}" fill="none" stroke="${p.c}" stroke-width="6" opacity=".12"/>`;
    return s;
  }
  if (k === 'night') {
    const mx = right - 88;
    const my = f.y + 76;
    let s = base + `<circle cx="${N(mx)}" cy="${N(my)}" r="34" fill="${p.c}" opacity=".85"/><circle cx="${N(mx - 14)}" cy="${N(my - 10)}" r="30" fill="${p.bg}"/>`;
    for (let i = 0; i < Math.round(18 * Math.max(1, f.w / 400)); i++) {
      const x = N(rr(r, f.x + 10, right - 10));
      const y = N(rr(r, f.y + 10, f.y + Math.min(f.h * 0.7, 250)));
      s += `<circle cx="${x}" cy="${y}" r="${N(rr(r, 1.5, 3))}" fill="${p.c}" opacity=".8"/>`;
    }
    return s;
  }
  if (k === 'waves') {
    let s = base;
    const reps = Math.ceil(f.w / 200) + 1;
    for (let i = 0; i < Math.ceil(f.h / 56); i++) {
      const y = f.y + 20 + i * 56;
      s += `<path d="M${N(f.x - 10)},${N(y)} q50,-26 100,0 ${'t100,0 '.repeat(reps * 2)}" fill="none" stroke="${p.c}" stroke-width="5" opacity=".14"/>`;
    }
    return s;
  }
  if (k === 'horizon')
    return base + `<rect x="${N(f.x)}" y="252" width="${N(f.w)}" height="${N(bottom - 252)}" fill="${p.a}" opacity=".16"/><path d="M${N(f.x)},252 H${N(right)}" stroke="${p.c}" stroke-width="4" opacity=".3"/>`;
  if (k === 'spotlight')
    return base + `<path d="M200,${N(f.y - 40)} L${N(right + 40)},${N(bottom)} L${N(f.x - 40)},${N(bottom)} Z" fill="${p.c}" opacity=".16"/>`;
  if (k === 'hills') {
    const w = f.w;
    return (
      base +
      `<path d="M${N(f.x - 20)},320 q${N(w * 0.22)},-90 ${N(w * 0.45)},-10 q${N(w * 0.2)},70 ${N(w * 0.65)},-20 V${N(bottom)} H${N(f.x - 20)} Z" fill="${p.a}" opacity=".18"/>` +
      `<path d="M${N(f.x - 20)},360 q${N(w * 0.3)},-60 ${N(w * 0.55)},0 q${N(w * 0.22)},50 ${N(w * 0.55)},-10 V${N(bottom)} H${N(f.x - 20)} Z" fill="${p.c}" opacity=".16"/>`
    );
  }
  if (k === 'tiles') {
    let s = base;
    let col = 0;
    for (let x = latticeStart(f.x, 0, 50); x < right; x += 50, col++) {
      let row = 0;
      for (let y = latticeStart(f.y, 0, 50); y < bottom; y += 50, row++)
        if ((col + row) % 2) s += `<rect x="${N(x)}" y="${N(y)}" width="50" height="50" fill="${p.c}" opacity=".1"/>`;
    }
    return s;
  }
  if (k === 'stripe') {
    let s = base;
    const span = f.w + f.h;
    for (let x = f.x - span; x < right + span; x += 80)
      s += `<rect x="${N(x)}" y="${N(f.y - span)}" width="40" height="${N(f.h + 2 * span)}" fill="${p.c}" opacity=".13" transform="rotate(22 200 200)"/>`;
    return s;
  }
  if (k === 'corner') {
    const c = Math.min(f.w, f.h) * 0.6;
    return (
      base +
      `<path d="M${N(f.x)},${N(f.y)} H${N(f.x + c)} L${N(f.x)},${N(f.y + c)} Z" fill="${p.c}" opacity=".18"/>` +
      `<path d="M${N(right)},${N(bottom)} H${N(right - c)} L${N(right)},${N(bottom - c)} Z" fill="${p.a}" opacity=".14"/>`
    );
  }
  return base;
}

export const TONES = ['standard', 'standard', 'standard', 'inverted', 'points', 'mono', 'smoke', 'frost'] as const;

/** Map a palette through a tone into the six colours the art actually uses. */
export function toneOf(k: string, p: Palette): Colors {
  const base: Colors = { body: p.a, head: p.a, tail: p.a, mark: p.b, cream: p.c, pop: p.d };
  if (k === 'inverted') return { ...base, body: p.b, head: p.b, tail: p.b, mark: p.a };
  if (k === 'points') return { ...base, body: p.b, mark: mix(p.a, p.b, 0.35) };
  if (k === 'mono')
    return {
      body: p.a, head: p.a, tail: p.a,
      mark: mix(p.a, '#ffffff', 0.26),
      cream: mix(p.a, '#ffffff', 0.6),
      pop: mix(p.a, '#ffffff', 0.42),
    };
  if (k === 'smoke')
    return {
      ...base,
      body: mix(p.a, p.bg, 0.4), head: mix(p.a, p.bg, 0.4), tail: mix(p.a, p.bg, 0.4),
      mark: mix(p.b, p.bg, 0.35),
    };
  if (k === 'frost')
    return {
      ...base,
      body: mix(p.a, '#ffffff', 0.3), head: mix(p.a, '#ffffff', 0.3), tail: mix(p.a, '#ffffff', 0.3),
      cream: '#FFFFFF',
    };
  return base;
}

export const TINTS = ['none', 'none', 'none', 'warm', 'cool', 'dusk', 'faded', 'sun'] as const;

export function tintG(k: string, f: Frame): string {
  const rect = (fill: string, opacity: string) =>
    `<rect x="${N(f.x)}" y="${N(f.y)}" width="${N(f.w)}" height="${N(f.h)}" fill="${fill}" opacity="${opacity}"/>`;
  if (k === 'warm') return rect('#F2B233', '.12');
  if (k === 'cool') return rect('#5B6BA8', '.13');
  if (k === 'dusk') return rect('#3B2A45', '.18');
  if (k === 'faded') return rect('#FBF9F3', '.18');
  if (k === 'sun') return rect('#FF7A3D', '.1');
  return '';
}

export const FRAMES = ['none', 'none', 'rule', 'badge', 'dashed', 'double', 'notch', 'arch', 'corners'] as const;

export function frameG(k: string, p: Palette, C: Colors, f: Frame): string {
  const inset = (i: number) =>
    `x="${N(f.x + i)}" y="${N(f.y + i)}" width="${N(f.w - 2 * i)}" height="${N(f.h - 2 * i)}"`;
  const right = f.x + f.w;
  const bottom = f.y + f.h;
  if (k === 'rule') return `<rect ${inset(14)} rx="10" fill="none" stroke="${C.cream}" stroke-width="4" opacity=".6"/>`;
  if (k === 'badge')
    return `<circle cx="200" cy="200" r="${N(Math.min(f.w, f.h) / 2 - 18)}" fill="none" stroke="${C.cream}" stroke-width="5" opacity=".55"/>`;
  if (k === 'dashed')
    return `<rect ${inset(16)} rx="12" fill="none" stroke="${C.cream}" stroke-width="4" stroke-dasharray="14 10" opacity=".65"/>`;
  if (k === 'double')
    return `<rect ${inset(12)} fill="none" stroke="${C.cream}" stroke-width="3" opacity=".5"/><rect ${inset(22)} fill="none" stroke="${C.cream}" stroke-width="6" opacity=".5"/>`;
  if (k === 'notch')
    return `<g fill="${p.bg}"><circle cx="${N(f.x)}" cy="${N(f.y + f.h / 2)}" r="22"/><circle cx="${N(right)}" cy="${N(f.y + f.h / 2)}" r="22"/></g><rect ${inset(14)} rx="10" fill="none" stroke="${C.cream}" stroke-width="3" opacity=".45"/>`;
  if (k === 'arch') {
    const springY = f.y + Math.min(150, f.h * 0.4);
    return `<path d="M${N(f.x)},${N(f.y)} H${N(right)} V${N(springY)} A${N(f.w / 2)},${N(springY - f.y)} 0 0,0 ${N(f.x)},${N(springY)} Z" fill="${p.bg}"/><path d="M${N(f.x)},${N(springY)} A${N(f.w / 2)},${N(springY - f.y)} 0 0,1 ${N(right)},${N(springY)}" fill="none" stroke="${C.cream}" stroke-width="4" opacity=".5"/>`;
  }
  if (k === 'corners')
    return `<g stroke="${C.cream}" stroke-width="5" fill="none" opacity=".65"><path d="M${N(f.x + 20)},${N(f.y + 60)} V${N(f.y + 20)} H${N(f.x + 60)} M${N(right - 60)},${N(f.y + 20)} H${N(right - 20)} V${N(f.y + 60)} M${N(right - 20)},${N(bottom - 60)} V${N(bottom - 20)} H${N(right - 60)} M${N(f.x + 60)},${N(bottom - 20)} H${N(f.x + 20)} V${N(bottom - 60)}"/></g>`;
  return '';
}
