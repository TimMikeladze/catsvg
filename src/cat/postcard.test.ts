import { describe, expect, it } from 'vitest';
import {
  MAX_STAMPS,
  POSTCARD_SIDES,
  clampStamps,
  greetingFor,
  markFor,
  noteFor,
  placeFor,
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
    expect(greetingFor('mackerel')).toContain(placeFor('mackerel'));
    expect(markFor('mackerel')).toBe(markFor('mackerel'));
    expect(markFor('mackerel')).not.toMatch(/^THE /);
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

  it('takes an addressee and a signature', () => {
    const back = renderPostcard(traits, { side: 'back', to: 'Sheehan', from: 'The Cat' });
    expect(back).toContain('>Sheehan</text>');
    expect(back).toContain('— The Cat');
    expect(back).not.toContain(catName('mackerel'));
  });

  it('prints a caption under the greeting on the front', () => {
    const plain = renderPostcard(traits);
    const withCaption = renderPostcard(traits, { caption: 'est. 2026' });
    expect(plain).not.toContain('est. 2026');
    expect(withCaption).toContain('est. 2026');
    // The greeting is still there, and still the headline.
    expect(withCaption).toContain(greetingFor('mackerel'));
  });

  it('drops the stamp and its postmark when asked', () => {
    const franked = renderPostcard(traits, { side: 'back' });
    const bare = renderPostcard(traits, { side: 'back', stamp: 0 });
    expect(franked).toContain('1 CAT');
    expect(bare).not.toContain('1 CAT');
    expect(bare).not.toContain('CATSVG');
    // The address rules stay — they just take the room the stamp had.
    expect(bare).toContain(catName('mackerel'));
  });

  it('franks the back with as many stamps as asked for', () => {
    for (const n of [0, 1, 2, 3, 5]) {
      const svg = renderPostcard(traits, { side: 'back', stamp: n });
      expect(svg.match(/1 CAT/g) ?? []).toHaveLength(n);
      // However many, they stay on the card and one postmark cancels the row.
      expect(svg).not.toContain('NaN');
      expect(svg.match(/CATSVG<\/text>/g) ?? []).toHaveLength(n > 0 ? 1 : 0);
    }
  });

  it('clamps a silly number of stamps', () => {
    expect(clampStamps(99)).toBe(MAX_STAMPS);
    expect(clampStamps(-3)).toBe(0);
    expect(clampStamps(Number.NaN)).toBe(1);
    expect(renderPostcard(traits, { side: 'back', stamp: 99 }).match(/1 CAT/g)).toHaveLength(MAX_STAMPS);
  });

  it('takes its own words for the postmark', () => {
    expect(renderPostcard(traits, { side: 'back', postmark: 'Hull' })).toContain('>HULL</text>');
  });

  it('drops every CatSVG mark when branding is off', () => {
    for (const side of POSTCARD_SIDES) {
      const branded = renderPostcard(traits, { side });
      const unbranded = renderPostcard(traits, { side, brand: false });
      expect(branded.toLowerCase()).toContain('catsvg');
      expect(unbranded.toLowerCase()).not.toContain('catsvg');
    }
    // The back still gets postmarked — with where the cat is, not who drew it.
    expect(renderPostcard(traits, { side: 'back', brand: false })).toContain(markFor('mackerel'));
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
        const svg = renderPostcard(makeTraits(`shape-${w}-${h}`), {
          width: w,
          height: h,
          side,
          caption: 'a caption long enough to need fitting',
          to: 'Someone With A Long Name',
        });
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
