import { BODIES, POSTURES, SIZES, fluffG } from './bodies';
import { PALETTES } from './palettes';
import { auraG, extraG, holdG, pawsG, propG } from './accessories';
import { coatG } from './coats';
import { earExtras, headPath, HEADS } from './heads';
import { eyesG, faceG, lashesG, mouthG, noseG, whiskersG } from './face';
import { frameG, sceneG, tintG, toneOf } from './scenes';
import { tailLayer } from './tails';
import { N, hash, mix, rng } from './rng';
import type { Frame, Traits } from './types';

/** The square the cat itself is drawn in. Everything else stretches around it. */
export const ART = 400;

/** Widest / tallest aspect ratio we will render, to bound generated markup. */
const MIN_ASPECT = 1 / 8;
const MAX_ASPECT = 8;

export interface RenderOptions {
  /** Output width in px. Default 400. */
  width?: number;
  /** Output height in px. Default = width. */
  height?: number;
  /** Optional caption drawn on a pill at the bottom (e.g. "1200x600"). */
  text?: string;
}

/**
 * The visible art rectangle for a given output size. Wider-than-square output
 * extends sideways around the cat; taller output extends upward, keeping the
 * cat's feet near the bottom edge.
 */
export function computeFrame(width: number, height: number): Frame {
  const aspect = Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, width / height));
  if (aspect >= 1) {
    const w = ART * aspect;
    return { x: 200 - w / 2, y: 0, w, h: ART };
  }
  const h = ART / aspect;
  return { x: 0, y: ART - h, w: ART, h };
}

const escapeXml = (s: string): string =>
  s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);

function captionG(text: string, f: Frame, C: { cream: string }, ink: string): string {
  const label = escapeXml(text.slice(0, 40));
  const fs = Math.max(16, Math.min(34, f.h * 0.09));
  const w = label.length * fs * 0.62 + fs * 1.2;
  const h = fs * 1.9;
  const x = 200 - w / 2;
  const y = f.y + f.h - h - fs * 0.7;
  return `<g><rect x="${N(x)}" y="${N(y)}" width="${N(w)}" height="${N(h)}" rx="${N(h / 2)}" fill="${C.cream}" opacity=".92"/><text x="200" y="${N(y + h / 2 + fs * 0.35)}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-weight="600" font-size="${N(fs)}" fill="${ink}">${label}</text></g>`;
}

/** Render a cat to a standalone SVG document string. */
export function renderCat(t: Traits, opts: RenderOptions = {}): string {
  const width = Math.round(opts.width ?? ART);
  const height = Math.round(opts.height ?? width);

  const p = PALETTES[t.palette] ?? PALETTES.bistro;
  const body = BODIES[t.body] ?? BODIES.sit;
  const C = toneOf(t.tone, p);
  const f = computeFrame(width, height);
  const r = rng(t.seed + '|art');
  const cx = body.hx;
  const cy = body.hy;
  const hs = body.hs;
  const [sx, sy] = HEADS[t.head] ?? HEADS.standard;
  const hp = headPath(cx, cy, t.ears);
  // Ids must be unique per cat but stable per trait set — several cats share
  // one document in the contact sheet and in the React grids.
  const u = 'c' + hash(t.seed + t.body + t.ears + t.coat + t.head).toString(36);
  const ink = mix(C.head, '#000000', 0.55);
  const sc = SIZES[t.size] ?? 1;
  const rot = POSTURES[t.posture] ?? 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${N(f.x)} ${N(f.y)} ${N(f.w)} ${N(f.h)}" width="${width}" height="${height}" role="img" aria-label="A geometric cat">
<defs>
<clipPath id="b${u}"><path d="${body.d}"/></clipPath>
<clipPath id="h${u}"><path d="${hp}"/></clipPath>
<clipPath id="f${u}"><rect x="${N(f.x)}" y="${N(f.y)}" width="${N(f.w)}" height="${N(f.h)}" rx="14"/></clipPath>
</defs>
<g clip-path="url(#f${u})">
${sceneG(t.scene, p, r, f)}
<g transform="translate(200,368) scale(${sc}) rotate(${rot}) translate(-200,-368)">
<ellipse cx="200" cy="360" rx="128" ry="16" fill="${p.a}" opacity=".18"/>
<g>${tailLayer(t.tail, t.tailtip, body, C)}</g>
${fluffG(t.fluff, body, C)}
<path d="${body.d}" fill="${C.body}"/>
<g clip-path="url(#b${u})">${coatG(t.coat, C, r)}</g>
${holdG(t.hold, C, p)}
${pawsG(t.paws, C)}
${propG(t.prop, C, p, t.propSide)}
<g transform="translate(${cx},${cy}) scale(${N(hs * sx)},${N(hs * sy)}) translate(${-cx},${-cy})">
  <path d="${hp}" fill="${C.head}"/>
  <g clip-path="url(#h${u})">${faceG(t.face, cx, cy, C, t.tilt)}</g>
  ${earExtras(cx, cy, t.ears, C)}
  ${whiskersG(t.whiskers, cx, cy + 32, C.cream)}
  <g>${eyesG(t.eyes, cx, cy, ink, C.cream, C.pop)}</g>
  ${lashesG(t.lashes, cx, cy, ink)}
  ${noseG(t.nose, cx, cy + 22, C.pop)}
  ${mouthG(t.mouth, cx, cy + 22, ink, C.pop, C.cream)}
  ${extraG(t.extra, cx, cy, C, p)}
</g>
<g>${auraG(t.aura, cx, cy, C, p)}</g>
</g>
${tintG(t.tint, f)}
${frameG(t.frame, p, C, f)}
${opts.text ? captionG(opts.text, f, C, ink) : ''}
</g>
</svg>`;
}

/** Tile cats into one square contact sheet, e.g. a 3x3 export. */
export function renderSheet(cats: Traits[], cols = 3, cell = 400): string {
  const rows = Math.ceil(cats.length / cols);
  const inner = cats
    .map((t, i) => {
      const art = renderCat(t, { width: cell, height: cell })
        .replace(/^<svg[^>]*>/, '')
        .replace(/<\/svg>$/, '');
      return `<g transform="translate(${(i % cols) * cell},${Math.floor(i / cols) * cell}) scale(${cell / ART})">${art}</g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols * cell} ${rows * cell}" width="${cols * cell}" height="${rows * cell}">${inner}</svg>`;
}
