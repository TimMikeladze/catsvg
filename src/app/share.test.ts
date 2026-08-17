import { afterEach, describe, expect, it, vi } from 'vitest';
import { catShareTarget, mailtoHref, nativeShare, pictures, rasterSize, smsHref } from './share';

const target = catShareTarget({
  seed: 'mackerel',
  locks: { eyes: 'star' },
  preset: 'noir',
  width: 400,
  height: 400,
  origin: 'https://cats.test',
});

/** Replace `navigator.share` / `canShare` for one test. */
function withShare(share: unknown, canShare?: unknown) {
  const nav = navigator as unknown as Record<string, unknown>;
  const before = { share: nav.share, canShare: nav.canShare };
  nav.share = share;
  nav.canShare = canShare;
  return () => {
    nav.share = before.share;
    nav.canShare = before.canShare;
  };
}

let restore: (() => void) | null = null;
afterEach(() => {
  restore?.();
  restore = null;
});

describe('catShareTarget', () => {
  it('links back to a page that reopens the same cat', () => {
    expect(target.url).toBe('https://cats.test/?preset=noir&eyes=star&seed=mackerel');
  });

  it('renders big enough to be worth sending', () => {
    expect([target.width, target.height]).toEqual([1200, 1200]);
    expect(target.svg).toContain('<svg');
    expect(target.filename).toBe('cat-mackerel.png');
    expect(target.companions).toBeUndefined();
  });

  it('carries a caption into the message and the link', () => {
    const captioned = catShareTarget({
      seed: 'biscuit',
      locks: {},
      preset: 'anything',
      width: 800,
      height: 600,
      text: 'happy birthday',
      origin: 'https://cats.test',
    });
    expect(captioned.message).toContain('happy birthday');
    expect(captioned.url).toContain('text=happy+birthday');
    expect([captioned.width, captioned.height]).toEqual([1200, 900]);
  });
});

describe('catShareTarget, in postcard mode', () => {
  const postcard = catShareTarget({
    seed: 'clementine',
    locks: {},
    preset: 'anything',
    width: 600,
    height: 400,
    mode: 'postcard',
    side: 'back',
    text: 'Send fish',
    card: { to: 'Sheehan', from: 'The Cat' },
    origin: 'https://cats.test',
  });

  it('sends the written side, signed by whoever signed the card', () => {
    expect(postcard.title).toContain('A postcard from');
    expect(postcard.message).toBe('Send fish — The Cat');
    expect(postcard.filename).toBe('postcard-back-clementine.png');
    expect(postcard.svg).toContain('Sheehan');
  });

  it('takes the other side of the card along with it', () => {
    expect(pictures(postcard).map((p) => p.filename)).toEqual([
      'postcard-back-clementine.png',
      'postcard-front-clementine.png',
    ]);
    expect(postcard.companions?.[0].svg).toContain('Send fish');
  });

  it('links back to the studio with the card and its side intact', () => {
    expect(postcard.url).toContain('mode=postcard');
    expect(postcard.url).toContain('side=back');
    expect(postcard.url).toContain('to=Sheehan');
    expect(postcard.url).toContain('from=The+Cat');
    expect(postcard.url).toContain('w=600&h=400');
  });
});

describe('rasterSize', () => {
  it('scales the longest side, keeping the aspect', () => {
    expect(rasterSize(1200, 300)).toEqual([1200, 300]);
    expect(rasterSize(600, 150)).toEqual([1200, 300]);
    expect(rasterSize(2000, 2000)).toEqual([1200, 1200]);
  });
});

describe('draft links', () => {
  it('writes a mail draft with real spaces, not plus signs', () => {
    const href = mailtoHref(target);
    expect(href.startsWith('mailto:?subject=')).toBe(true);
    expect(href).not.toContain('+');
    expect(decodeURIComponent(href)).toContain(target.url);
  });

  it('writes an sms draft in the form both phones accept', () => {
    expect(smsHref(target).startsWith('sms:?&body=')).toBe(true);
    expect(decodeURIComponent(smsHref(target))).toContain(target.url);
  });
});

describe('nativeShare', () => {
  it('reports unsupported when the device has no share sheet', async () => {
    restore = withShare(undefined, undefined);
    expect(await nativeShare(target)).toBe('unsupported');
  });

  it('falls back to a link when files cannot be shared', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    restore = withShare(share, () => false);
    expect(await nativeShare(target)).toBe('link');
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: target.url }));
  });

  it('stays quiet when the user dismisses the sheet', async () => {
    const abort = Object.assign(new Error('dismissed'), { name: 'AbortError' });
    restore = withShare(vi.fn().mockRejectedValue(abort), () => false);
    expect(await nativeShare(target)).toBe('cancelled');
  });

  it('reports failure so the caller can show its own menu', async () => {
    restore = withShare(vi.fn().mockRejectedValue(new Error('nope')), () => false);
    expect(await nativeShare(target)).toBe('failed');
  });
});
