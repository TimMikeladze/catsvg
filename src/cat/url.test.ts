import { describe, expect, it } from 'vitest';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE, buildCatPath, parseCatUrl, renderCatRequest } from './url';

const parse = (path: string) => parseCatUrl(new URL(path, 'https://cats.test'));

describe('parseCatUrl', () => {
  it('reads a bare seed', () => {
    const r = parse('/cat/mackerel.svg');
    expect(r).toMatchObject({ seed: 'mackerel', width: DEFAULT_SIZE, height: DEFAULT_SIZE, random: false });
  });

  it('reads a single size segment as a square', () => {
    expect(parse('/cat/240/mackerel.svg')).toMatchObject({ width: 240, height: 240, seed: 'mackerel' });
  });

  it('reads a WxH segment', () => {
    expect(parse('/cat/1200x300/mackerel.svg')).toMatchObject({ width: 1200, height: 300 });
  });

  it('reads two numeric segments', () => {
    expect(parse('/cat/320/240/pickle')).toMatchObject({ width: 320, height: 240, seed: 'pickle' });
  });

  it('accepts the /i and /cats prefixes', () => {
    expect(parse('/i/120/tuna.svg')).toMatchObject({ seed: 'tuna', width: 120 });
    expect(parse('/cats/120/tuna.svg')).toMatchObject({ seed: 'tuna' });
  });

  it('prefers query parameters over path segments', () => {
    expect(parse('/cat/100/pickle.svg?seed=biscuit&w=640&h=480')).toMatchObject({
      seed: 'biscuit',
      width: 640,
      height: 480,
    });
  });

  it('treats a missing or "random" seed as random', () => {
    expect(parse('/cat/300').random).toBe(true);
    expect(parse('/cat/300/random.svg').random).toBe(true);
    expect(parse('/cat/300/random.svg').seed).not.toBe('random');
  });

  it('clamps sizes', () => {
    expect(parse('/cat/1x1/x.svg').width).toBe(MIN_SIZE);
    expect(parse('/cat/99999x99999/x.svg').width).toBe(MAX_SIZE);
  });

  it('pins valid trait overrides and ignores junk', () => {
    const r = parse('/cat/mackerel.svg?eyes=star&palette=neon&eyes2=nope&body=notabody');
    expect(r.locks).toEqual({ eyes: 'star', palette: 'neon' });
  });

  it('reads preset and text', () => {
    expect(parse('/cat/a.svg?preset=noir&text=hi')).toMatchObject({ preset: 'noir', text: 'hi' });
    expect(parse('/cat/a.svg?preset=bogus').preset).toBe('anything');
  });

  it('reads postcard mode off the path', () => {
    expect(parse('/cat/postcard/mackerel.svg')).toMatchObject({
      mode: 'postcard',
      side: 'front',
      seed: 'mackerel',
      width: 600,
      height: 400,
    });
    expect(parse('/cat/postcard/back/900x600/mackerel.svg')).toMatchObject({
      mode: 'postcard',
      side: 'back',
      width: 900,
      height: 600,
    });
  });

  it('reads postcard mode off the query', () => {
    expect(parse('/cat/mackerel.svg?mode=postcard')).toMatchObject({ mode: 'postcard', side: 'front' });
    // Asking for a side is asking for a postcard.
    expect(parse('/cat/mackerel.svg?side=back')).toMatchObject({ mode: 'postcard', side: 'back' });
    expect(parse('/cat/postcard/mackerel.svg?mode=cat')).toMatchObject({ mode: 'cat' });
  });

  it('keeps a postcard 3:2 when only one dimension is given', () => {
    expect(parse('/cat/postcard/300/mackerel.svg')).toMatchObject({ width: 300, height: 200 });
    expect(parse('/cat/300/mackerel.svg')).toMatchObject({ width: 300, height: 300 });
  });

  it('leaves plain cats alone', () => {
    expect(parse('/cat/mackerel.svg')).toMatchObject({ mode: 'cat', width: 400, height: 400 });
  });

  it('decodes seeds with spaces and unicode', () => {
    expect(parse('/cat/' + encodeURIComponent('grey tabby 🐈') + '.svg').seed).toBe('grey tabby 🐈');
  });
});

describe('buildCatPath', () => {
  it('round-trips through the parser', () => {
    const input = {
      seed: 'mackerel',
      width: 1200,
      height: 300,
      preset: 'noir',
      locks: { eyes: 'star' as const },
    };
    const parsed = parse(buildCatPath(input));
    expect(parsed).toMatchObject({
      seed: 'mackerel',
      width: 1200,
      height: 300,
      preset: 'noir',
      locks: { eyes: 'star' },
    });
  });

  it('round-trips a postcard, side and all', () => {
    const path = buildCatPath({ seed: 'mackerel', mode: 'postcard', side: 'back', text: 'Send fish' });
    expect(path).toBe('/cat/postcard/back/600x400/mackerel.svg?text=Send+fish');
    expect(parse(path)).toMatchObject({
      seed: 'mackerel',
      mode: 'postcard',
      side: 'back',
      width: 600,
      height: 400,
      text: 'Send fish',
    });
  });

  it('collapses equal dimensions to one segment', () => {
    expect(buildCatPath({ seed: 'x', width: 300, height: 300 })).toBe('/cat/300/x.svg');
  });
});

describe('renderCatRequest', () => {
  it('renders the SVG a URL describes', () => {
    const svg = renderCatRequest(parse('/cat/1200x300/mackerel.svg?eyes=star'));
    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="300"');
  });

  it('renders a postcard when the URL asks for one', () => {
    const svg = renderCatRequest(parse('/cat/postcard/back/900x600/mackerel.svg?text=Send+fish'));
    expect(svg).toContain('width="900"');
    expect(svg).toContain('A postcard from');
    expect(svg).toContain('Send fish');
    expect(svg).toContain('1 CAT');
  });
});
