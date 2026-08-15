# CatSVG

**[catsvg.vercel.app](https://catsvg.vercel.app)**

A cat-based image placeholder service. Every URL is a cat, rendered as pure SVG
by a deterministic generator — no image files, no storage, no network calls.

```html
<img src="https://catsvg.vercel.app/cat/1200x300/mackerel.svg" width="1200" height="300" />
```

Same seed, same cat, forever. ~2.9 × 10¹⁴ combinations.

## Running it

```bash
bun install
bun run dev        # app + image endpoint on http://localhost:5173
bun run test       # vitest
bun run typecheck
bun run build      # tsc + vite build
```

`bun run dev` serves the SPA *and* the `/cat/*` image endpoint through the same
Vite plugin (`catApi` in `vite.config.ts`), so local URLs behave exactly like
the deployed edge function.

## URL API

| URL | What you get |
| --- | --- |
| `/cat/mackerel.svg` | Seeded cat, 400×400 |
| `/cat/240/mackerel.svg` | Square at 240px |
| `/cat/1200x300/mackerel.svg` | Any `width x height`, 16–2000px each |
| `/cat/320/240/mackerel.svg` | Two numeric segments work too |
| `/cat/320x320/random.svg` | A different cat every request (`no-store`) |
| `/cat/400?seed=biscuit` | Query form — same thing |

`/i/…` and `/cats/…` are accepted as aliases of `/cat/…`, and the `.svg`
suffix is optional.

### Query parameters

| Param | Effect |
| --- | --- |
| `seed`, `s` | Any string. `random` (or no seed) rolls a fresh cat. |
| `w`, `h` (`width`, `height`) | Size override, clamped to 16–2000. |
| `preset` | `anything` · `minimal` · `maximal` · `noir` · `pastel` · `feral` |
| `text` | Caption pill, e.g. `?text=1200x300`. |
| *any trait name* | Pin one trait: `?eyes=star&palette=neon&body=loaf` |

Trait names are the 25 keys in `TRAIT_KEYS` (`palette`, `tone`, `body`, `size`,
`posture`, `coat`, `fluff`, `face`, `head`, `ears`, `eyes`, `lashes`, `nose`,
`mouth`, `whiskers`, `tail`, `tailtip`, `paws`, `extra`, `hold`, `prop`,
`aura`, `scene`, `tint`, `frame`). Unknown names and invalid values are ignored.

### Response

`image/svg+xml; charset=utf-8`, `Access-Control-Allow-Origin: *`, and an
`X-Cat-Seed` header naming the seed used. Seeded cats are a pure function of
their URL, so they are served `public, max-age=31536000, immutable`; `random`
cats are `no-store`.

### Non-square sizes

The cat is drawn in a fixed 400×400 art space. Wider output extends the visible
frame sideways around the cat; taller output extends it upward, keeping the
cat's feet near the bottom edge. Backgrounds, tints and frames paint the whole
visible frame, so a 1200×300 banner has a full-size cat with the scene running
edge to edge — nothing is cropped or letterboxed.

## The app

`/` is the studio: roll cats, lock traits you like, pick a preset, type a seed,
tinker with any single trait, save favourites (localStorage), and export SVG,
PNG or a 3×3 contact sheet. The **Cat URL** panel gives you the image URL for
whatever is on screen, an `<img>` snippet and a markdown snippet, plus a field
where you can paste any cat URL back in to preview and load it.

The page URL always describes the current cat, so it is shareable as-is.

## Layout

```
src/cat/        the generator — pure, dependency-free, runs in browser or edge
  rng.ts        seeded hash + PRNG (same seed ⇒ same cat)
  spec.ts       trait pools, presets, labels
  traits.ts     makeTraits / catName / newSeed
  render.ts     renderCat, renderSheet, frame maths
  url.ts        parseCatUrl / buildCatPath / renderCatRequest
  *.ts          the art: bodies, tails, heads, face, coats, accessories, scenes
src/server/     handler.ts — URL ⇒ SVG response (status, body, headers)
src/app/        the React studio
api/cat.ts      Vercel edge function wrapping the handler
scripts/        favicon generator (`bun run favicon`)
```

## Deploying

Vercel, no configuration beyond the checked-in `vercel.json`, which rewrites
`/cat/*`, `/cats/*` and `/i/*` to the edge function in `api/cat.ts`.

```bash
vercel deploy
```

## Credits

Created by [Tim Mikeladze](https://linesofcode.dev) —
[linesofcode.dev](https://linesofcode.dev) · [@linesofcode](https://x.com/linesofcode)

## Origin

`mvp.html` is the original single-file prototype this was built from. It is
kept for reference; the app no longer uses it.
