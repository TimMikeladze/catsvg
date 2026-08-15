import { useCallback, useEffect, useMemo, useState } from 'react';
import { makeTraits, newSeed } from '../cat/traits';
import { POSTCARD_WIDTH, postcardHeightFor } from '../cat/postcard';
import { buildCatPath, parseCatUrl } from '../cat/url';
import { useLocalStorage } from './useLocalStorage';
import type { PostcardSide } from '../cat/postcard';
import type { CatMode } from '../cat/url';
import type { Locks, TraitKey, Traits } from '../cat/types';

const LITTER_SIZE = 9;
const MAX_FAVOURITES = 16;
const FAVOURITES_KEY = 'catsvg:favourites';

/** The minimum you need to reproduce a cat exactly. */
export interface CatRecipe {
  seed: string;
  locks: Locks;
  preset: string;
}

export interface CatMachine {
  traits: Traits;
  seed: string;
  locks: Locks;
  preset: string;
  width: number;
  height: number;
  mode: CatMode;
  side: PostcardSide;
  /** Caption on a cat, greeting or message on a postcard. */
  text: string;
  litter: Traits[];
  favourites: CatRecipe[];
  roll: (seed?: string) => void;
  refreshLitter: () => void;
  keep: (t: Traits) => void;
  toggleLock: (key: TraitKey) => void;
  setTrait: (key: TraitKey, value: string) => void;
  clearLocks: () => void;
  setPreset: (preset: string) => void;
  setSize: (width: number, height: number) => void;
  setMode: (mode: CatMode) => void;
  setSide: (side: PostcardSide) => void;
  setText: (text: string) => void;
  saveFavourite: () => void;
  loadRecipe: (recipe: CatRecipe) => void;
  removeFavourite: (index: number) => void;
  recipe: CatRecipe;
}

const seeds = (n: number): string[] => Array.from({ length: n }, () => newSeed());

/**
 * All the app state for one cat: its recipe, the litter beside it, favourites,
 * and the output size the URL panel is pointed at. The current cat is always
 * `makeTraits(seed, locks, preset)`, so state stays a recipe rather than a
 * baked object — that is what keeps the URL, the preview and the download in
 * agreement.
 */
export function useCatMachine(): CatMachine {
  const initial = useMemo(() => {
    const req = parseCatUrl(new URL(window.location.href));
    return req;
  }, []);

  const [seed, setSeed] = useState(initial.seed);
  const [locks, setLocks] = useState<Locks>(initial.locks);
  const [preset, setPresetState] = useState(initial.preset);
  const [width, setWidth] = useState(initial.width);
  const [height, setHeight] = useState(initial.height);
  const [mode, setModeState] = useState<CatMode>(initial.mode);
  const [side, setSide] = useState<PostcardSide>(initial.side);
  const [text, setText] = useState(initial.text ?? '');
  const [litterSeeds, setLitterSeeds] = useState<string[]>(() => seeds(LITTER_SIZE));
  const [favourites, setFavourites] = useLocalStorage<CatRecipe[]>(FAVOURITES_KEY, []);

  const traits = useMemo(() => makeTraits(seed, locks, preset), [seed, locks, preset]);
  const litter = useMemo(
    () => litterSeeds.map((s) => makeTraits(s, locks, preset)),
    [litterSeeds, locks, preset],
  );

  const refreshLitter = useCallback(() => setLitterSeeds(seeds(LITTER_SIZE)), []);

  const roll = useCallback(
    (next?: string) => {
      setSeed(next && next.trim() ? next.trim() : newSeed());
      refreshLitter();
    },
    [refreshLitter],
  );

  // Adopting a cat from the litter keeps its exact look by pinning nothing —
  // the seed alone reproduces it under the same locks and preset.
  const keep = useCallback((t: Traits) => setSeed(t.seed), []);

  const toggleLock = useCallback(
    (key: TraitKey) =>
      setLocks((prev) => {
        const next = { ...prev };
        if (next[key]) delete next[key];
        else next[key] = traits[key];
        return next;
      }),
    [traits],
  );

  const setTrait = useCallback(
    (key: TraitKey, value: string) => setLocks((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const clearLocks = useCallback(() => setLocks({}), []);

  const setPreset = useCallback(
    (next: string) => {
      setPresetState(next);
      refreshLitter();
    },
    [refreshLitter],
  );

  const setSize = useCallback((w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  }, []);

  // A square is the right default for a cat and the wrong one for a postcard,
  // so switching modes moves the size off the other mode's default — and only
  // off that default, never off a size the user chose.
  const setMode = useCallback(
    (next: CatMode) => {
      setModeState(next);
      const cardH = postcardHeightFor(POSTCARD_WIDTH);
      if (next === 'postcard' && width === 400 && height === 400) setSize(POSTCARD_WIDTH, cardH);
      if (next === 'cat' && width === POSTCARD_WIDTH && height === cardH) setSize(400, 400);
    },
    [width, height, setSize],
  );

  const recipe = useMemo<CatRecipe>(() => ({ seed, locks, preset }), [seed, locks, preset]);

  const saveFavourite = useCallback(() => {
    setFavourites((prev) => {
      const without = prev.filter((f) => f.seed !== recipe.seed);
      return [recipe, ...without].slice(0, MAX_FAVOURITES);
    });
  }, [recipe, setFavourites]);

  const removeFavourite = useCallback(
    (index: number) => setFavourites((prev) => prev.filter((_, i) => i !== index)),
    [setFavourites],
  );

  const loadRecipe = useCallback((next: CatRecipe) => {
    setSeed(next.seed);
    setLocks(next.locks ?? {});
    setPresetState(next.preset ?? 'anything');
  }, []);

  // Keep the address bar shareable: the page URL always describes the cat.
  useEffect(() => {
    const path = buildCatPath({ seed, locks, preset, width, height, mode, side, text });
    const query = path.slice(path.indexOf('?') === -1 ? path.length : path.indexOf('?'));
    const params = new URLSearchParams(query);
    params.set('seed', seed);
    if (width !== 400 || height !== 400) {
      params.set('w', String(width));
      params.set('h', String(height));
    }
    // The page is always `/`, so the mode rides in the query here even though
    // the image URL wears it as a path segment.
    if (mode === 'postcard') {
      params.set('mode', 'postcard');
      params.set('side', side);
    }
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [seed, locks, preset, width, height, mode, side, text]);

  return {
    traits, seed, locks, preset, width, height, mode, side, text, litter, favourites,
    roll, refreshLitter, keep, toggleLock, setTrait, clearLocks, setPreset,
    setSize, setMode, setSide, setText, saveFavourite, loadRecipe, removeFavourite, recipe,
  };
}
