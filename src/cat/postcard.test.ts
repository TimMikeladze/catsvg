import { describe, expect, it } from 'vitest';
import {
  POSTCARD_SIDES,
  greetingFor,
  noteFor,
  postcardHeightFor,
  renderPostcard,
  wrapText,
} from './postcard';
import { PALETTES } from './palettes';
import { TONES } from './scenes';
import { catName, makeTraits } from './traits';

const traits = makeTraits('mackerel');

/** Every id an SVG document defines, in source order. */
const ids = (svg: string): string[] => [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

describe('renderPostcard', () => {
  it('emits a standalone SVG at the requested size', () => {
    const svg = renderPostcard(traits, { width: 900, height: 600 });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('width="900"');
    expect(svg).toContain('height="600"');
    expect(svg).toContain('viewBox="0 0 900 600"');
  });

  it('defaults to a 3:2 card rather than a square', () => {
    expect(renderPostcard(traits)).toContain('viewBox="0 0 600 400"');
    expect(renderPostcard(traits, { width: 900 })).toContain('viewBox="0 0 900 600"');
    expect(postcardHeightFor(900)).toBe(600);
  });

  it('is byte-identical for identical input', () => {
    expect(renderPostcard(traits, { side: 'back' })).toBe(
      renderPostcard(makeTraits('mackerel'), { side: 'back' }),
    );
  });

  it('draws a different thing on each side', () => {
    const front = renderPostcard(traits, { side: 'front' });
    const back = renderPostcard(traits, { side: 'back' });
    expect(front).not.toBe(back);
    // The stamp, the postmark and the address rules only exist on the back.
    expect(back).toContain('1 CAT');
    expect(back).toContain('CATSVG');
    expect(front).not.toContain('1 CAT');
  });

  it('falls back to an unknown side rather than throwing', () => {
    expect(renderPostcard(traits, { side: 'sideways' })).toBe(
      renderPostcard(traits, { side: 'front' }),
    );
  });

  it('prints the seed’s own greeting and note when the URL supplies none', () => {
    expect(renderPostcard(traits, { side: 'front' })).toContain(greetingFor('mackerel'));
    expect(renderPostcard(traits, { side: 'back' })).toContain(noteFor('mackerel').slice(0, 20));
    expect(greetingFor('mackerel')).toBe(greetingFor('mackerel'));
    expect(greetingFor('mackerel')).toMatch(/^Greetings from /);
  });

  it('prints the text it is given instead', () => {
    expect(renderPostcard(traits, { text: 'Greetings from Hull' })).toContain('Greetings from Hull');
    expect(renderPostcard(traits, { side: 'back', text: 'Send fish' })).toContain('Send fish');
    // Whitespace is not a message.
    expect(renderPostcard(traits, { text: '   ' })).toBe(renderPostcard(traits));
  });

  it('signs and addresses the back with the cat’s name', () => {
    const back = renderPostcard(traits, { side: 'back' });
    expect(back).toContain(catName('mackerel'));
  });

  it('escapes text instead of emitting it as markup', () => {
    const svg = renderPostcard(traits, { text: '<script>x</script>' });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });

  it('names and describes itself for screen readers and crawlers', () => {
    for (const side of POSTCARD_SIDES) {
      const svg = renderPostcard(traits, { side });
      expect(svg).toMatch(/aria-labelledby="t\w+ d\w+"/);
      expect(svg).toContain(`A postcard from ${catName('mackerel')}`);
      expect(svg).toContain('<desc');
    }
  });

  it('gives every element in one card a unique id', () => {
    for (const side of POSTCARD_SIDES) {
      const list = ids(renderPostcard(traits, { side }));
      expect(list.length).toBeGreaterThan(0);
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it('keeps two cards on one page from clashing over ids', () => {
    // The studio inlines several SVGs into one document, where `url(#id)`
    // resolves against the page — so cards must not share id names.
    const a = ids(renderPostcard(makeTraits('mackerel'), { side: 'front' }));
    const b = ids(renderPostcard(makeTraits('biscuit'), { side: 'front' }));
    const c = ids(renderPostcard(makeTraits('mackerel'), { side: 'back' }));
    expect(a.filter((id) => b.includes(id))).toEqual([]);
    expect(a.filter((id) => c.includes(id))).toEqual([]);
  });

  it('survives every shape and palette without NaN coordinates', () => {
    const sizes = [[600, 400], [400, 600], [400, 400], [2000, 250], [250, 2000], [16, 16], [2000, 2000]];
    for (const [w, h] of sizes) {
      for (const side of POSTCARD_SIDES) {
        const svg = renderPostcard(makeTraits(`shape-${w}-${h}`), { width: w, height: h, side });
        expect(svg).not.toContain('NaN');
        expect(svg).not.toContain('undefined');
        expect(svg).toContain('</svg>');
      }
    }
    for (const palette of Object.keys(PALETTES)) {
      for (const tone of new Set(TONES)) {
        const svg = renderPostcard(makeTraits('paint', { palette, tone }), { side: 'back' });
        expect(svg).not.toContain('NaN');
        expect(svg).not.toContain('undefined');
      }
    }
  });

  it('never emits animation markup', () => {
    expect(renderPostcard(traits, { side: 'back' })).not.toContain('@keyframes');
    expect(renderPostcard(traits, { side: 'back' })).not.toContain('animation:');
  });
});

describe('wrapText', () => {
  it('breaks on words, up to a line budget', () => {
    expect(wrapText('one two three four', 9, 4)).toEqual(['one two', 'three', 'four']);
  });

  it('breaks a word that is wider than the line', () => {
    // Left whole it would run off the panel and across the fold.
    expect(wrapText('supercalifragilistic ok', 5, 6)).toEqual(['super', 'calif', 'ragil', 'istic', 'ok']);
    expect(wrapText('hi supercalifragilistic', 5, 6)).toEqual(['hi', 'super', 'calif', 'ragil', 'istic']);
  });

  it('keeps every line inside the budget, whatever it is given', () => {
    const typed = "Hi how's it going Sheehan'snejeheejejjejejejejejejejeje";
    for (const perLine of [8, 12, 29, 40]) {
      for (const line of wrapText(typed, perLine, 12)) expect(line.length).toBeLessThanOrEqual(perLine);
    }
  });

  it('stops at the line budget instead of running off the card', () => {
    expect(wrapText('a b c d e f g h', 1, 3)).toHaveLength(3);
  });
});
