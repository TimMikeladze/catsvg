/**
 * Sharing a cat — or a postcard — on whatever the device happens to be.
 *
 * Phones and tablets have a real share sheet (`navigator.share`), and it takes
 * files, so Messages and Mail get the picture itself as a PNG in the draft
 * rather than a link that may never render. Desktop browsers mostly do not, so
 * the same target is also expressible as a `mailto:` draft, an `sms:` draft, a
 * clipboard image or a plain link. Everything here is derived from a single
 * {@link ShareTarget}, so a plain cat and a written postcard share alike.
 */

import { renderPostcard } from '../cat/postcard';
import { renderCat } from '../cat/render';
import { catName, makeTraits } from '../cat/traits';
import { buildStudioQuery } from '../cat/url';
import { SITE_URL } from '../seo/site';
import { svgToPngBlob } from './download';
import type { PostcardSide } from '../cat/postcard';
import type { CardFields, CatMode } from '../cat/url';
import type { Locks, Traits } from '../cat/types';

/** Everything the share targets need, whatever drew the picture. */
export interface ShareTarget {
  /** Page URL that reopens this exact cat. */
  url: string;
  /** Share-sheet title and email subject. */
  title: string;
  /** One line of body copy. */
  message: string;
  /** SVG source, rasterised on demand for file shares and the clipboard. */
  svg: string;
  width: number;
  height: number;
  /** Attachment name, including the `.png`. */
  filename: string;
  /**
   * Pictures that belong with this one — the other side of a postcard. A share
   * sheet takes several files at once, and a card someone wrote on is only
   * half a card without its back.
   */
  companions?: Picture[];
}

/** One rasterisable picture: enough to become a PNG file. */
export interface Picture {
  svg: string;
  width: number;
  height: number;
  filename: string;
}

export type ShareOutcome =
  /** The PNG itself went into the share sheet. */
  | 'file'
  /** The sheet took a link only. */
  | 'link'
  /** User dismissed the sheet — not a failure, and not something to report. */
  | 'cancelled'
  /** No share sheet on this device; show the fallback menu. */
  | 'unsupported'
  /** There was a sheet and it refused; show the fallback menu. */
  | 'failed';

/** Longest side of the PNG handed to a share sheet or the clipboard. */
export const SHARE_RASTER = 1200;

/**
 * Scale an output size so its longest side is `longest` px — a 400px stage cat
 * is too small to send someone, and a 2000px one is a slow attachment.
 */
export function rasterSize(width: number, height: number, longest = SHARE_RASTER): [number, number] {
  const scale = longest / Math.max(width, height);
  return [Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale))];
}

export interface CatShareInput {
  seed: string;
  locks: Locks;
  preset: string;
  width: number;
  height: number;
  /** `cat` (default) or `postcard`. */
  mode?: CatMode;
  side?: PostcardSide;
  /** Caption on a cat; the greeting or the message on a postcard. */
  text?: string;
  /** The rest of what a postcard says. */
  card?: CardFields;
  /** Origin for the link. Defaults to this window's, or the canonical site. */
  origin?: string;
}

/** Build the share target for one cat or postcard, big enough to send. */
export function catShareTarget(input: CatShareInput): ShareTarget {
  const { seed, locks, preset, text, card } = input;
  const postcard = input.mode === 'postcard';
  const side: PostcardSide = input.side === 'back' ? 'back' : 'front';
  const [width, height] = rasterSize(input.width, input.height);
  const origin = input.origin ?? (typeof window === 'undefined' ? SITE_URL : window.location.origin);
  const traits = makeTraits(seed, locks, preset);
  const name = catName(seed);

  return {
    url: `${origin}/?${buildStudioQuery({
      seed, locks, preset, width: input.width, height: input.height, mode: input.mode, side, text, card,
    })}`,
    title: postcard ? `A postcard from ${name}` : `${name} — a cat from CatSVG`,
    message: postcardMessage(postcard, name, text, card),
    svg: postcard
      ? renderPostcard(traits, { ...card, width, height, side, text })
      : renderCat(traits, { width, height, text }),
    width,
    height,
    // Same stem the studio's own downloads use.
    filename: postcard ? `postcard-${side}-${seed}.png` : `cat-${seed}.png`,
    companions: postcard ? [otherSide(traits, side, width, height, seed, text, card)] : undefined,
  };
}

/** The side of the card that is not on screen, drawn to match. */
function otherSide(
  traits: Traits,
  side: PostcardSide,
  width: number,
  height: number,
  seed: string,
  text?: string,
  card?: CardFields,
): Picture {
  const back = side === 'front' ? 'back' : 'front';
  return {
    svg: renderPostcard(traits, { ...card, width, height, side: back, text }),
    width,
    height,
    filename: `postcard-${back}-${seed}.png`,
  };
}

/**
 * What the message says. A written postcard already carries its greeting, so
 * the share copy repeats it rather than talking over it.
 */
function postcardMessage(postcard: boolean, name: string, text?: string, card?: CardFields): string {
  if (!postcard) {
    return text ? `${text} — ${name}, drawn by CatSVG.` : `Meet ${name}, a one-of-one cat drawn by CatSVG.`;
  }
  const signed = card?.from?.trim() || name;
  return text?.trim() ? `${text.trim()} — ${signed}` : `A postcard from ${signed}.`;
}

const isAbort = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { name?: string }).name === 'AbortError';

/** The PNG a share sheet or the clipboard receives. */
export async function targetPng(target: ShareTarget): Promise<Blob> {
  return svgToPngBlob(target.svg, target.width, target.height);
}

/** Every picture in a target — the main one first, then any companions. */
export const pictures = (target: ShareTarget): Picture[] => [target, ...(target.companions ?? [])];

const pngFile = async (p: Picture): Promise<File> =>
  new File([await svgToPngBlob(p.svg, p.width, p.height)], p.filename, { type: 'image/png' });

/**
 * Try the device's own share sheet, best form first. `unsupported` and
 * `failed` mean the caller should show the fallback menu instead.
 */
export async function nativeShare(target: ShareTarget): Promise<ShareOutcome> {
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (typeof nav.share !== 'function') return 'unsupported';

  // Ask with empty stand-ins before rasterising: on a browser that cannot
  // share files at all, drawing 1200px of cat first would be wasted work.
  const stand = pictures(target).map((p) => new File([], p.filename, { type: 'image/png' }));
  if (typeof nav.canShare === 'function' && typeof File !== 'undefined'
      && nav.canShare({ files: stand })) {
    try {
      const files = await Promise.all(pictures(target).map(pngFile));
      // Some platforms reject a share that mixes files with a url, so the link
      // is left out here — the picture is the point.
      await nav.share({ files, title: target.title, text: target.message });
      return 'file';
    } catch (err) {
      if (isAbort(err)) return 'cancelled';
      // Rasterising or the file share failed; the link share below still works.
    }
  }

  try {
    await nav.share({ title: target.title, text: target.message, url: target.url });
    return 'link';
  } catch (err) {
    return isAbort(err) ? 'cancelled' : 'failed';
  }
}

/**
 * `URLSearchParams` would encode the spaces as `+`, which mail clients show
 * literally, so these hrefs are built by hand.
 */
export function mailtoHref(target: ShareTarget): string {
  const body = `${target.message}\n\n${target.url}\n`;
  return `mailto:?subject=${encodeURIComponent(target.title)}&body=${encodeURIComponent(body)}`;
}

/** `sms:?&body=` is the one spelling both iOS and Android accept. */
export function smsHref(target: ShareTarget): string {
  return `sms:?&body=${encodeURIComponent(`${target.message} ${target.url}`)}`;
}

/** Put the PNG on the clipboard, for pasting straight into an email body. */
export async function copyImage(target: ShareTarget): Promise<boolean> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) return false;
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': await targetPng(target) })]);
    return true;
  } catch {
    return false;
  }
}
