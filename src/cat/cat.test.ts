import { describe, expect, it } from 'vitest';
import { computeFrame, renderCat, renderSheet } from './render.ts';
import { catName, makeTraits } from './traits.ts';
import { SPEC, TRAIT_OPTIONS } from './spec.ts';
import { TRAIT_KEYS } from './types.ts';

describe('makeTraits', () => {
  it('is deterministic for a seed', () => {
    expect(makeTraits('mackerel')).toEqual(makeTraits('mackerel'));
    expect(makeTraits('mackerel')).not.toEqual(makeTraits('biscuit'));
  });

  it('only ever picks values from the spec', () => {
    for (const seed of ['a', 'mackerel', 'ザ・キャット', '9000']) {
      const t = makeTraits(seed);
      for (const key of TRAIT_KEYS) expect(SPEC[key]).toContain(t[key]);
    }
  });

  it('honours locks over the roll', () => {
    const t = makeTraits('pickle', { eyes: 'star', palette: 'neon' });
    expect(t.eyes).toBe('star');
    expect(t.palette).toBe('neon');
  });

  it('drops neck accessories on bodies with no visible neck', () => {
    const t = makeTraits('anything', { body: 'curl', extra: 'bell' });
    // An explicit lock wins even on a low-headed body.
    expect(t.extra).toBe('bell');
    const rolled = makeTraits('anything', { body: 'curl' });
    expect(rolled.hold).toBe('none');
  });

  it('respects a preset pool', () => {
    for (let i = 0; i < 25; i++) {
      const t = makeTraits(`noir-${i}`, {}, 'noir');
      expect(['ink', 'midnight', 'storm', 'slate', 'ash', 'arctic', 'glacier']).toContain(t.palette);
    }
  });

  it('names cats deterministically', () => {
    expect(catName('mackerel')).toBe(catName('mackerel'));
    expect(catName('mackerel')).toMatch(/^\S+ /);
  });
});

describe('computeFrame', () => {
  it('keeps the art square for square output', () => {
    expect(computeFrame(400, 400)).toEqual({ x: 0, y: 0, w: 400, h: 400 });
  });

  it('extends sideways around the cat for wide output', () => {
    const f = computeFrame(1200, 300);
    expect(f.h).toBe(400);
    expect(f.w).toBe(1600);
    expect(f.x + f.w / 2).toBe(200); // still centred on the cat
  });

  it('extends upward for tall output so the cat keeps its footing', () => {
    const f = computeFrame(300, 600);
    expect(f.w).toBe(400);
    expect(f.h).toBe(800);
    expect(f.y + f.h).toBe(400); // ground line stays at the bottom
  });

  it('clamps absurd aspect ratios', () => {
    expect(computeFrame(20000, 10).w).toBe(400 * 8);
  });
});

describe('renderCat', () => {
  const traits = makeTraits('mackerel');

  it('emits a standalone SVG at the requested size', () => {
    const svg = renderCat(traits, { width: 320, height: 240 });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="240"');
  });

  it('is byte-identical for identical input', () => {
    expect(renderCat(traits, { width: 200 })).toBe(renderCat(makeTraits('mackerel'), { width: 200 }));
  });

  it('never emits animation markup', () => {
    expect(renderCat(traits)).not.toContain('@keyframes');
    expect(renderCat(traits)).not.toContain('animation:');
  });

  it('escapes caption text', () => {
    const svg = renderCat(traits, { text: '<script>x</script>' });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });

  it('renders every option of every trait without throwing', () => {
    for (const key of TRAIT_KEYS) {
      for (const value of TRAIT_OPTIONS[key]) {
        const t = makeTraits('coverage', { [key]: value });
        const svg = renderCat(t, { width: 200 });
        expect(svg).toContain('</svg>');
        expect(svg).not.toContain('undefined');
        expect(svg).not.toContain('NaN');
      }
    }
  });

  it('renders wide and tall frames without NaN coordinates', () => {
    for (const [w, h] of [[1200, 300], [300, 1200], [16, 2000], [2000, 16]]) {
      const svg = renderCat(makeTraits(`frame-${w}-${h}`), { width: w, height: h });
      expect(svg).not.toContain('NaN');
    }
  });
});

describe('renderSheet', () => {
  it('tiles cats into one document', () => {
    const cats = ['a', 'b', 'c', 'd'].map((s) => makeTraits(s));
    const sheet = renderSheet(cats, 2, 400);
    expect(sheet).toContain('viewBox="0 0 800 800"');
    expect(sheet.match(/<g transform="translate\(/g)?.length).toBeGreaterThanOrEqual(4);
  });
});
