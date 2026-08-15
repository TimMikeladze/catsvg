import { parseCatUrl, renderCatRequest } from '../cat/url';

export interface SvgResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
}

/**
 * Vercel rewrites `/cat/*` to `/api/cat?path=*`. Fold that back into a normal
 * pathname so one parser serves both the rewritten and the direct URL.
 */
export function normalizeCatUrl(url: URL): URL {
  const path = url.searchParams.get('path');
  if (path === null) return url;
  const next = new URL(url.toString());
  next.searchParams.delete('path');
  next.pathname = '/' + path.replace(/^\/+/, '');
  return next;
}

/** Render the cat an incoming request asks for, as an HTTP-ready payload. */
export function handleCatRequest(rawUrl: URL): SvgResponse {
  try {
    const req = parseCatUrl(normalizeCatUrl(rawUrl));
    const svg = renderCatRequest(req);
    return {
      status: 200,
      body: svg,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        // Seeded cats are pure functions of their URL, so they cache forever.
        'Cache-Control': req.random
          ? 'no-store'
          : 'public, max-age=31536000, s-maxage=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'X-Cat-Seed': encodeURIComponent(req.seed),
      },
    };
  } catch (err) {
    return {
      status: 500,
      body: `<!-- cat render failed: ${String(err instanceof Error ? err.message : err).replace(/--+>/g, '')} -->`,
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'no-store' },
    };
  }
}
