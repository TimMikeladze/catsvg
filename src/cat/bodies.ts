import type { Body, Colors } from './types';

export const BODIES: Record<string, Body> = {
  sit: { d: 'M150,238 C124,270 108,320 112,356 L288,356 C292,320 276,270 250,238 Z', hx: 200, hy: 168, hs: 1, tx: 288, ty: 344 },
  loaf: { d: 'M116,304 C116,264 150,246 200,246 C250,246 284,264 284,304 L284,356 L116,356 Z', hx: 200, hy: 196, hs: 1, tx: 284, ty: 338 },
  tall: { d: 'M160,228 C144,268 142,320 146,356 L254,356 C258,320 256,268 240,228 Z', hx: 200, hy: 158, hs: 0.96, tx: 254, ty: 346 },
  perch: { d: 'M144,250 C126,286 118,326 122,356 L278,356 C282,318 268,282 252,250 Z', hx: 200, hy: 180, hs: 1, tx: 276, ty: 344 },
  stretch: { d: 'M96,306 C96,272 132,254 200,254 C268,254 304,272 304,306 L304,356 L96,356 Z', hx: 196, hy: 208, hs: 0.98, tx: 302, ty: 330 },
  curl: { d: 'M204,244 C270,244 314,288 314,320 C314,346 290,356 244,356 L118,356 C94,356 86,334 96,312 C110,280 152,244 204,244 Z', hx: 158, hy: 296, hs: 0.9, tx: 302, ty: 326 },
  ready: { d: 'M138,262 C120,292 112,330 116,356 L284,356 C288,330 280,292 262,262 C240,240 160,240 138,262 Z', hx: 200, hy: 188, hs: 1, tx: 282, ty: 342 },
  sphinx: { d: 'M92,322 C92,290 134,272 200,272 C266,272 308,290 308,322 L308,356 L92,356 Z', hx: 200, hy: 226, hs: 0.95, tx: 306, ty: 334 },
  chonk: { d: 'M200,232 C268,232 302,280 302,318 C302,346 262,356 200,356 C138,356 98,346 98,318 C98,280 132,232 200,232 Z', hx: 200, hy: 176, hs: 0.94, tx: 300, ty: 330 },
  kitten: { d: 'M170,286 C154,306 148,334 152,356 L248,356 C252,334 246,306 230,286 Z', hx: 200, hy: 216, hs: 1.14, tx: 248, ty: 348 },
  leap: { d: 'M152,300 C142,262 172,232 214,238 C256,244 272,286 264,320 L258,356 L148,356 Z', hx: 206, hy: 180, hs: 0.95, tx: 262, ty: 330 },
  slink: { d: 'M84,340 C84,318 116,306 200,306 C284,306 316,318 316,340 L316,356 L84,356 Z', hx: 196, hy: 262, hs: 0.86, tx: 314, ty: 340 },
  beg: { d: 'M168,232 C150,268 142,322 148,356 L252,356 C258,322 250,268 232,232 C220,218 180,218 168,232 Z', hx: 200, hy: 162, hs: 0.98, tx: 250, ty: 348 },
  bread: { d: 'M108,356 C108,296 148,264 200,264 C252,264 292,296 292,356 Z', hx: 200, hy: 206, hs: 1.02, tx: 290, ty: 342 },
};

/** Coat length. Drawn as a dashed stroke riding the body silhouette. */
export const FLUFF = ['smooth', 'smooth', 'tufty', 'spiky', 'longhair'] as const;

export function fluffG(k: string, body: Body, C: Colors): string {
  if (k === 'smooth') return '';
  if (k === 'spiky')
    return `<path d="${body.d}" fill="none" stroke="${C.body}" stroke-width="14" stroke-dasharray="3 13"/>`;
  if (k === 'longhair')
    return `<path d="${body.d}" fill="none" stroke="${C.body}" stroke-width="22" stroke-linecap="round" stroke-dasharray="2 18"/>`;
  return `<path d="${body.d}" fill="none" stroke="${C.body}" stroke-width="10" stroke-dasharray="4 10"/>`;
}

export const SIZES: Record<string, number> = { regular: 1, regular2: 1, petite: 0.86, grand: 1.12 };
export const POSTURES: Record<string, number> = { upright: 0, upright2: 0, tiltleft: -6, tiltright: 6 };
