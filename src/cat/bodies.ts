import type { Body, Colors } from './types';

export const BODIES: Record<string, Body> = {
  sit: { d: 'M150,230 C126,264 110,316 112,356 L288,356 C290,316 274,264 250,230 C226,218 174,218 150,230 Z', hx: 200, hy: 168, hs: 1, tx: 286, ty: 344, px: 200, py: 341, ps: 21, holdX: 200, holdY: 298, shadowRx: 128 },
  loaf: { d: 'M112,314 C114,268 150,246 202,246 C256,246 290,272 292,316 L292,356 L108,356 Z', hx: 174, hy: 206, hs: .96, tx: 288, ty: 338, px: 154, py: 341, ps: 20, holdX: 174, holdY: 304, shadowRx: 132 },
  tall: { d: 'M158,220 C143,260 141,316 146,356 L254,356 C259,316 257,260 242,220 C220,210 180,210 158,220 Z', hx: 200, hy: 154, hs: .96, tx: 254, ty: 346, px: 200, py: 341, ps: 20, holdX: 200, holdY: 286, shadowRx: 96 },
  perch: { d: 'M144,242 C124,280 118,326 122,356 L278,356 C282,320 270,280 254,242 C226,226 172,226 144,242 Z', hx: 200, hy: 178, hs: 1, tx: 276, ty: 344, px: 200, py: 341, ps: 21, holdX: 200, holdY: 300, shadowRx: 118 },
  stretch: { d: 'M104,286 C140,252 228,252 290,278 C310,286 318,310 304,330 C286,354 236,356 178,348 C138,344 108,330 96,312 C90,302 94,294 104,286 Z', hx: 112, hy: 286, hs: .82, tx: 296, ty: 292, px: 206, py: 334, ps: 31, holdX: 144, holdY: 318, shadowRx: 142, shadowX: 190 },
  curl: { d: 'M188,248 C258,238 316,278 316,320 C316,348 286,358 238,356 L122,356 C94,356 84,334 96,310 C114,274 148,252 188,248 Z', hx: 146, hy: 296, hs: .86, tx: 304, ty: 326, px: 146, py: 344, ps: 18, holdX: 154, holdY: 330, shadowRx: 132 },
  ready: { d: 'M112,304 C138,260 216,248 280,274 C302,284 306,314 292,334 C276,356 238,360 180,352 C126,346 98,326 112,304 Z', hx: 128, hy: 258, hs: .84, tx: 286, ty: 302, px: 184, py: 339, ps: 28, holdX: 150, holdY: 316, shadowRx: 134, shadowX: 188 },
  sphinx: { d: 'M90,322 C92,286 136,268 204,270 C272,272 310,292 310,326 L308,356 L92,356 Z', hx: 174, hy: 224, hs: .94, tx: 304, ty: 334, px: 138, py: 341, ps: 22, holdX: 174, holdY: 312, shadowRx: 146 },
  chonk: { d: 'M200,222 C268,222 304,276 304,318 C304,348 264,358 200,358 C136,358 96,348 96,318 C96,276 132,222 200,222 Z', hx: 200, hy: 170, hs: .96, tx: 300, ty: 330, px: 200, py: 343, ps: 22, holdX: 200, holdY: 300, shadowRx: 142 },
  kitten: { d: 'M166,280 C150,304 146,334 150,356 L250,356 C254,334 250,304 234,280 C218,270 182,270 166,280 Z', hx: 200, hy: 210, hs: 1.1, tx: 248, ty: 348, px: 200, py: 342, ps: 20, holdX: 200, holdY: 315, shadowRx: 88 },
  leap: { d: 'M126,264 C166,230 236,230 280,256 C298,266 302,288 288,302 C266,324 222,318 180,310 C150,304 116,294 112,280 C110,274 116,268 126,264 Z', hx: 116, hy: 250, hs: .82, tx: 282, ty: 268, px: 202, py: 305, ps: 34, holdX: 148, holdY: 290, shadowRx: 106, shadowX: 174 },
  slink: { d: 'M82,340 C86,308 124,298 210,304 C284,308 318,322 318,342 L316,356 L84,356 Z', hx: 116, hy: 288, hs: .78, tx: 312, ty: 340, px: 176, py: 343, ps: 30, holdX: 140, holdY: 328, shadowRx: 148, shadowX: 190 },
  beg: { d: 'M164,220 C146,260 140,320 148,356 L252,356 C260,320 254,260 236,220 C220,208 180,208 164,220 Z', hx: 200, hy: 154, hs: .98, tx: 250, ty: 348, px: 200, py: 342, ps: 20, holdX: 200, holdY: 276, shadowRx: 94 },
  bread: { d: 'M106,356 C108,292 148,256 200,256 C254,256 294,294 294,356 Z', hx: 184, hy: 204, hs: 1, tx: 290, ty: 342, px: 174, py: 342, ps: 21, holdX: 184, holdY: 314, shadowRx: 136 },
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

export const SIZES: Record<string, number> = { regular: 1, petite: 0.86, grand: 1.12 };
export const POSTURES: Record<string, number> = { upright: 0, tiltleft: -6, tiltright: 6 };
