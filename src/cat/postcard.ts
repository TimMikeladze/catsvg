/**
 * Postcard mode: the same cat, mounted on a paper card.
 *
 * The front is a picture card — the cat in a window with a greeting printed
 * under it. The back is the written side: a message, a stamp with a miniature
 * of the same cat in it, a postmark and the address rules. Both are pure
 * functions of the seed, exactly like a plain cat, so a postcard URL caches
 * for a year the way every other cat URL does.
 */
import { catArt, computeFrame, escapeXml } from './render';
import { PALETTES } from './palettes';
import { toneOf } from './scenes';
import { N, hash, mix, pick, rng, rr } from './rng';
import { catName } from './traits';
import type { Frame, Rng, Traits } from './types';

export const POSTCARD_SIDES = ['front', 'back'] as const;

export type PostcardSide = (typeof POSTCARD_SIDES)[number];

export const isPostcardSide = (v: string): v is PostcardSide =>
  (POSTCARD_SIDES as readonly string[]).includes(v);

/** A postcard is 3:2 landscape unless the URL says otherwise. */
export const POSTCARD_WIDTH = 600;
export const POSTCARD_ASPECT = 3 / 2;

/** Height that goes with a width when only one of the two is given. */
export const postcardHeightFor = (width: number): number => Math.round(width / POSTCARD_ASPECT);

export interface PostcardOptions {
  /** Output width in px. Default 600. */
  width?: number;
  /** Output height in px. Default = width / 1.5. */
  height?: number;
  /** `front` (default) or `back`. */
  side?: string;
  /** Greeting printed on the front, message written on the back. */
  text?: string;
}

/** Places a cat writes home from. */
const PLACES = [
  'the Sofa', 'the Windowsill', 'the Warm Laptop', 'the Top of the Fridge',
  'Under the Bed', 'the Sun Patch', 'the Cardboard Box', 'the Radiator',
  'the Kitchen Counter', 'the Bottom Stair', 'the Laundry Pile', 'the Empty Bath',
  'the Good Chair', 'the Bookshelf', 'the Bag You Just Emptied', 'the Doorway',
];

/** What a cat writes when nobody gives it a message. */
const NOTES = [
  'Weather warm. Sun patch excellent. Slept fourteen hours. Wish you were here.',
  'Arrived safely. Knocked one glass off the table. No regrets. Send fish.',
  'The box is a good box. I have moved in. Do not look for me.',
  'Food situation acceptable. Staff attentive. Will review again at 4am.',
  'Found a warm rectangle that hums. Living here now. Bring snacks.',
  'Long journey to the windowsill. Worth it. Birds are noisier this year.',
  'Have inspected the whole house. Everything is mine. Report follows.',
  'Nothing to report. Sat down. Stood up. Sat down again. Marvellous.',
];

/** The greeting a seed prints on the front when the URL supplies none. */
export const greetingFor = (seed: string): string =>
  `Greetings from ${pick(rng(seed + '|place'), PLACES)}`;

/** The note a seed writes on the back when the URL supplies none. */
export const noteFor = (seed: string): string => pick(rng(seed + '|note'), NOTES);

/** Greedy word wrap, so a message fills the panel instead of running off it. */
export function wrapText(text: string, perLine: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  const flush = () => {
    if (line) lines.push(line);
    line = '';
  };

  for (const raw of text.split(/\s+/).filter(Boolean)) {
    let word = raw;
    // Nothing guarantees a message is made of words. Anything wider than the
    // panel is broken mid-word rather than let out across the fold.
    while (word.length > perLine) {
      flush();
      if (lines.length >= maxLines) return lines.slice(0, maxLines);
      lines.push(word.slice(0, perLine));
      word = word.slice(perLine);
    }
    if (!word) continue;

    const next = line ? `${line} ${word}` : word;
    if (next.length <= perLine) {
      line = next;
      continue;
    }
    flush();
    if (lines.length >= maxLines) return lines.slice(0, maxLines);
    line = word;
  }

  flush();
  return lines.slice(0, maxLines);
}

const SANS = "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** A line of handwriting: a wobbly stroke that reads as writing without being it. */
function scrawl(r: Rng, x: number, y: number, w: number, amp: number): string {
  const step = Math.max(4, amp * 3.2);
  let d = `M${N(x)},${N(y)}`;
  for (let px = 0; px < w; px += step) {
    const dx = Math.min(step, w - px);
    if (dx < 0.5) break;
    d += ` q${N(dx / 2)},${N(rr(r, -amp, amp))} ${N(dx)},${N(rr(r, -amp * 0.4, amp * 0.4))}`;
  }
  return d;
}

/**
 * Nest a cat inside a rectangle of the card, cropped to it. The cat is drawn in
 * its own 400-unit art space, so it comes in under a transform, with the window
 * rectangle doing the cropping in card coordinates.
 */
function catWindow(t: Traits, win: Frame, ns: string, rx: number): string {
  const f = computeFrame(Math.max(1, win.w), Math.max(1, win.h));
  // Cover, not contain: computeFrame already matches most aspects exactly, and
  // covering keeps an extreme window full-bleed instead of letterboxed.
  const s = Math.max(win.w / f.w, win.h / f.h);
  const tx = win.x + (win.w - f.w * s) / 2 - f.x * s;
  const ty = win.y + (win.h - f.h * s) / 2 - f.y * s;
  return (
    `<defs><clipPath id="win${ns}"><rect x="${N(win.x)}" y="${N(win.y)}" width="${N(win.w)}" height="${N(win.h)}" rx="${N(rx)}"/></clipPath></defs>` +
    `<g clip-path="url(#win${ns})">` +
    // N() is 1dp — fine for coordinates, far too coarse for a scale factor.
    `<g transform="translate(${N(tx)},${N(ty)}) scale(${Math.round(s * 1e4) / 1e4})">` +
    catArt(t, f, { ns, rx: 0 }) +
    `</g></g>`
  );
}

/** The stamp: a perforated square with a miniature of the same cat in it. */
function stampG(t: Traits, box: Frame, paper: string, ink: string, ns: string): string {
  const teeth = Math.max(3, Math.round(Math.min(box.w, box.h) / 9));
  const rTooth = Math.min(box.w, box.h) / (teeth * 2.6);
  const punch = (cx: number, cy: number) =>
    `<circle cx="${N(cx)}" cy="${N(cy)}" r="${N(rTooth)}" fill="${paper}"/>`;
  let perf = '';
  for (let i = 0; i <= teeth; i++) {
    const fx = box.x + (box.w * i) / teeth;
    const fy = box.y + (box.h * i) / teeth;
    perf += punch(fx, box.y) + punch(fx, box.y + box.h) + punch(box.x, fy) + punch(box.x + box.w, fy);
  }

  const pad = Math.min(box.w, box.h) * 0.11;
  const labelH = box.h * 0.16;
  const win: Frame = {
    x: box.x + pad,
    y: box.y + pad,
    w: box.w - 2 * pad,
    h: box.h - 2 * pad - labelH,
  };
  const fs = labelH * 0.78;
  const label =
    fs >= 4
      ? `<text x="${N(box.x + box.w / 2)}" y="${N(box.y + box.h - pad * 0.7)}" text-anchor="middle" font-family="${MONO}" font-size="${N(fs)}" letter-spacing="${N(fs * 0.12)}" fill="${ink}" opacity=".75">1 CAT</text>`
      : '';

  return (
    `<g><rect x="${N(box.x)}" y="${N(box.y)}" width="${N(box.w)}" height="${N(box.h)}" fill="${mix(paper, '#000000', 0.05)}"/>` +
    (win.w > 1 && win.h > 1 ? catWindow(t, win, ns, 0) : '') +
    `<rect x="${N(win.x)}" y="${N(win.y)}" width="${N(win.w)}" height="${N(win.h)}" fill="none" stroke="${ink}" stroke-width="${N(Math.max(0.5, pad * 0.12))}" opacity=".35"/>` +
    label +
    perf +
    `</g>`
  );
}

/** The postmark: rings, a dateline and the cancellation waves beside them. */
function postmarkG(cx: number, cy: number, r: number, ink: string, tilt: number): string {
  const fs = r * 0.32;
  const line = (y: number, w: number) =>
    `<path d="M${N(cx - w / 2)},${N(cy + y)} H${N(cx + w / 2)}" stroke="${ink}" stroke-width="${N(r * 0.05)}" opacity=".6"/>`;
  const text =
    fs >= 4
      ? `<text x="${N(cx)}" y="${N(cy + fs * 0.38)}" text-anchor="middle" font-family="${MONO}" font-weight="600" font-size="${N(fs)}" fill="${ink}" opacity=".72">CATSVG</text>`
      : '';
  let waves = '';
  for (let i = 0; i < 3; i++) {
    const y = cy - r * 0.4 + i * r * 0.4;
    waves += `<path d="M${N(cx + r * 1.1)},${N(y)} q${N(r * 0.5)},${N(-r * 0.22)} ${N(r)},0 t${N(r)},0" fill="none" stroke="${ink}" stroke-width="${N(r * 0.07)}" opacity=".45"/>`;
  }
  return (
    `<g transform="rotate(${N(tilt)} ${N(cx)} ${N(cy)})" opacity=".8">` +
    `<circle cx="${N(cx)}" cy="${N(cy)}" r="${N(r)}" fill="none" stroke="${ink}" stroke-width="${N(r * 0.08)}" opacity=".6"/>` +
    `<circle cx="${N(cx)}" cy="${N(cy)}" r="${N(r * 0.78)}" fill="none" stroke="${ink}" stroke-width="${N(r * 0.05)}" opacity=".45"/>` +
    line(-r * 0.34, r * 1.3) +
    line(r * 0.34, r * 1.3) +
    text +
    waves +
    `</g>`
  );
}

/** The picture side: the cat in a window, with the greeting printed under it. */
function frontG(
  t: Traits,
  card: Frame,
  pad: number,
  greeting: string,
  paper: string,
  ink: string,
  ns: string,
): string {
  const capH = Math.max(6, card.h * 0.17);
  const win: Frame = {
    x: card.x + pad,
    y: card.y + pad,
    w: Math.max(1, card.w - 2 * pad),
    h: Math.max(1, card.h - 2 * pad - capH),
  };
  const label = escapeXml(greeting.slice(0, 60));
  // Fit the greeting to the strip: cap it by height, then shrink until the
  // longest greeting still clears the card's edges.
  const fs = Math.max(3, Math.min(capH * 0.42, (win.w * 0.9) / (label.length * 0.6)));

  return (
    catWindow(t, win, ns, Math.min(win.w, win.h) * 0.02) +
    `<rect x="${N(win.x)}" y="${N(win.y)}" width="${N(win.w)}" height="${N(win.h)}" rx="${N(Math.min(win.w, win.h) * 0.02)}" fill="none" stroke="${ink}" stroke-width="${N(Math.max(0.5, pad * 0.14))}" opacity=".16"/>` +
    `<text x="${N(card.x + card.w / 2)}" y="${N(win.y + win.h + capH * 0.66)}" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="${N(fs)}" letter-spacing="${N(fs * 0.03)}" fill="${ink}">${label}</text>` +
    `<rect x="${N(card.x)}" y="${N(card.y)}" width="${N(card.w)}" height="${N(card.h)}" rx="${N(Math.min(card.w, card.h) * 0.03)}" fill="none" stroke="${mix(ink, paper, 0.5)}" stroke-width="${N(Math.max(0.5, pad * 0.1))}" opacity=".4"/>`
  );
}

/** The written side: message, stamp, postmark and the address rules. */
function backG(
  t: Traits,
  card: Frame,
  pad: number,
  message: string,
  paper: string,
  ink: string,
  ns: string,
): string {
  const r = rng(t.seed + '|post');
  const inner: Frame = {
    x: card.x + pad,
    y: card.y + pad,
    w: Math.max(1, card.w - 2 * pad),
    h: Math.max(1, card.h - 2 * pad),
  };
  const splitX = inner.x + inner.w * 0.52;
  const gap = inner.w * 0.035;
  const left: Frame = { x: inner.x, y: inner.y, w: Math.max(1, splitX - gap - inner.x), h: inner.h };
  const right: Frame = {
    x: splitX + gap,
    y: inner.y,
    w: Math.max(1, inner.x + inner.w - splitX - gap),
    h: inner.h,
  };

  // Message side. A hand fills a card in a dozen lines whatever shape it is, so
  // the rhythm comes from the panel height, not from the type size.
  const fs = Math.max(3, Math.min(left.h * 0.09, left.w * 0.055));
  const lineH = Math.max(fs * 1.55, left.h / 13);
  const perLine = Math.max(8, Math.floor(left.w / (fs * 0.62)));
  const lines = wrapText(message, perLine, Math.max(1, Math.floor((left.h * 0.62) / (fs * 1.6))));
  // Wrapped text stays tightly set — it is one sentence, not one line per idea.
  const textH = fs * 1.6;
  let msg = '';
  lines.forEach((text, i) => {
    msg += `<text x="${N(left.x)}" y="${N(left.y + fs * 1.4 + i * textH)}" font-family="${MONO}" font-size="${N(fs)}" fill="${ink}" opacity=".85">${escapeXml(text)}</text>`;
  });
  // Whatever the message does not fill reads as more handwriting below it.
  const usedH = fs * 1.4 + lines.length * textH;
  let scrawls = '';
  for (let y = left.y + usedH + lineH * 0.4; y < left.y + left.h - fs * 2.4; y += lineH) {
    scrawls += `<path d="${scrawl(r, left.x, y, left.w * rr(r, 0.55, 0.97), fs * 0.2)}" fill="none" stroke="${ink}" stroke-width="${N(fs * 0.11)}" stroke-linecap="round" opacity=".3"/>`;
  }
  const sign = escapeXml(`— ${catName(t.seed)}`);
  const sfs = Math.max(3, Math.min(fs, (left.w * 0.9) / (sign.length * 0.56)));
  const signature = `<text x="${N(left.x + left.w)}" y="${N(left.y + left.h - sfs * 0.4)}" text-anchor="end" font-family="${MONO}" font-style="italic" font-size="${N(sfs)}" fill="${ink}" opacity=".7">${sign}</text>`;

  // Stamp, postmark, address.
  const stampW = Math.min(right.w * 0.42, right.h * 0.4);
  const stamp: Frame = {
    x: right.x + right.w - stampW,
    y: right.y,
    w: stampW,
    h: Math.min(stampW * 1.15, right.h * 0.46),
  };
  const mark = postmarkG(
    stamp.x - stampW * 0.34,
    stamp.y + stamp.h * 0.42,
    Math.max(2, stampW * 0.36),
    ink,
    rr(r, -14, 14),
  );

  // An address is four or five lines wherever it lands — spread them over the
  // space under the stamp rather than ruling the whole panel.
  const afs = Math.max(3, Math.min(right.h * 0.075, right.w * 0.05));
  const free = Math.max(afs, right.y + right.h - (stamp.y + stamp.h));
  const rules = 5;
  const step = Math.min(afs * 2.2, free / (rules + 1));
  // Centred in what the stamp leaves, so a tall card does not strand the
  // address at the top of an empty panel.
  const addrTop = stamp.y + stamp.h + (free - (rules - 1) * step) / 2;
  const to = escapeXml(catName(t.seed));
  let address = `<text x="${N(right.x)}" y="${N(addrTop - afs * 0.35)}" font-family="${MONO}" font-size="${N(afs)}" fill="${ink}" opacity=".8">${to}</text>`;
  for (let i = 0; i < rules; i++) {
    const y = addrTop + i * step;
    if (y > right.y + right.h) break;
    address += `<path d="M${N(right.x)},${N(y)} H${N(right.x + right.w)}" stroke="${ink}" stroke-width="${N(Math.max(0.4, afs * 0.06))}" opacity=".28"/>`;
    if (i > 0)
      address += `<path d="${scrawl(r, right.x + afs * 0.3, y - step * 0.28, right.w * rr(r, 0.4, 0.85), afs * 0.16)}" fill="none" stroke="${ink}" stroke-width="${N(afs * 0.1)}" stroke-linecap="round" opacity=".24"/>`;
  }

  const ffs = Math.max(3, fs * 0.62);
  const footer = `<text x="${N(inner.x)}" y="${N(card.y + card.h - pad * 0.35)}" font-family="${MONO}" font-size="${N(ffs)}" fill="${ink}" opacity=".4">catsvg · ${escapeXml(t.seed.slice(0, 24))}</text>`;

  return (
    msg +
    scrawls +
    signature +
    `<path d="M${N(splitX)},${N(inner.y)} V${N(inner.y + inner.h)}" stroke="${ink}" stroke-width="${N(Math.max(0.5, pad * 0.1))}" opacity=".35"/>` +
    (stamp.w > 2 && stamp.h > 2 ? stampG(t, stamp, paper, ink, ns) : '') +
    mark +
    address +
    footer +
    `<rect x="${N(card.x)}" y="${N(card.y)}" width="${N(card.w)}" height="${N(card.h)}" rx="${N(Math.min(card.w, card.h) * 0.03)}" fill="none" stroke="${mix(ink, paper, 0.5)}" stroke-width="${N(Math.max(0.5, pad * 0.1))}" opacity=".4"/>`
  );
}

/** The accessible name and description of a postcard. */
export function describePostcard(
  t: Traits,
  side: PostcardSide,
  text: string,
): { title: string; desc: string } {
  const name = catName(t.seed);
  return {
    title: `A postcard from ${name}`,
    desc:
      side === 'front'
        ? `The picture side of a postcard: a geometric ${t.coat} cat in the ${t.palette} palette, ` +
          `printed on a paper card under the words “${text}”. Generated from the seed “${t.seed}”.`
        : `The written side of a postcard from ${name}, with a stamp showing the same cat, ` +
          `a postmark, address rules and the message “${text}”. Generated from the seed “${t.seed}”.`,
  };
}

/** Render a cat as a postcard, front or back, to a standalone SVG document. */
export function renderPostcard(t: Traits, opts: PostcardOptions = {}): string {
  const width = Math.round(opts.width ?? POSTCARD_WIDTH);
  const height = Math.round(opts.height ?? postcardHeightFor(width));
  const asked = (opts.side ?? '').toLowerCase();
  const side: PostcardSide = isPostcardSide(asked) ? asked : 'front';

  const p = PALETTES[t.palette] ?? PALETTES.bistro;
  const C = toneOf(t.tone, p);
  const paper = mix(C.cream, '#FFFFFF', 0.35);
  const ink = mix(p.a, '#1A1720', 0.45);
  const desk = mix(p.bg, '#000000', 0.22);

  const m = Math.max(3, Math.min(width, height) * 0.055);
  const card: Frame = {
    x: m,
    y: m,
    w: Math.max(1, width - 2 * m),
    h: Math.max(1, height - 2 * m),
  };
  const pad = Math.max(2, Math.min(card.w, card.h) * 0.055);
  const rx = Math.min(card.w, card.h) * 0.03;
  const drop = m * 0.35;

  const written = (opts.text ?? '').trim();
  const text = written || (side === 'front' ? greetingFor(t.seed) : noteFor(t.seed));
  const about = describePostcard(t, side, text);
  const u = 'p' + hash(t.seed + side + text).toString(36);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="t${u} d${u}">
<title id="t${u}">${escapeXml(about.title)}</title><desc id="d${u}">${escapeXml(about.desc)}</desc>
<rect width="${width}" height="${height}" fill="${desk}"/>
<rect x="${N(card.x + drop)}" y="${N(card.y + drop)}" width="${N(card.w)}" height="${N(card.h)}" rx="${N(rx)}" fill="#000000" opacity=".18"/>
<rect x="${N(card.x)}" y="${N(card.y)}" width="${N(card.w)}" height="${N(card.h)}" rx="${N(rx)}" fill="${paper}"/>
${side === 'front' ? frontG(t, card, pad, text, paper, ink, u) : backG(t, card, pad, text, paper, ink, u)}
</svg>`;
}
