import { describe, expect, it } from 'vitest';
import { handleCatRequest, normalizeCatUrl } from './handler.ts';

const get = (path: string) => handleCatRequest(new URL(path, 'https://cats.test'));

describe('handleCatRequest', () => {
  it('serves SVG', () => {
    const res = get('/cat/400/mackerel.svg');
    expect(res.status).toBe(200);
    expect(res.headers['Content-Type']).toBe('image/svg+xml; charset=utf-8');
    expect(res.body).toContain('<svg');
  });

  it('caches seeded cats forever and never caches random ones', () => {
    expect(get('/cat/mackerel.svg').headers['Cache-Control']).toContain('immutable');
    expect(get('/cat/400/random.svg').headers['Cache-Control']).toBe('no-store');
  });

  it('is byte-identical across requests for the same seeded URL', () => {
    expect(get('/cat/300x200/pickle.svg').body).toBe(get('/cat/300x200/pickle.svg').body);
  });

  it('reports the seed it used', () => {
    expect(get('/cat/mackerel.svg').headers['X-Cat-Seed']).toBe('mackerel');
  });

  it('allows cross-origin embedding', () => {
    expect(get('/cat/mackerel.svg').headers['Access-Control-Allow-Origin']).toBe('*');
  });
});

describe('normalizeCatUrl', () => {
  it('folds the Vercel rewrite back into a pathname', () => {
    const url = normalizeCatUrl(new URL('https://cats.test/api/cat?path=1200x300/mackerel.svg&eyes=star'));
    expect(url.pathname).toBe('/1200x300/mackerel.svg');
    expect(url.searchParams.get('path')).toBeNull();
    expect(url.searchParams.get('eyes')).toBe('star');
  });

  it('renders the same cat via the rewritten and the direct URL', () => {
    expect(get('/api/cat?path=1200x300/mackerel.svg').body).toBe(get('/cat/1200x300/mackerel.svg').body);
  });
});
