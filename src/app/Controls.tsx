import { useState } from 'react';
import { PRESET_NAMES, TRAIT_OPTIONS } from '../cat/spec.ts';
import { renderCat, renderSheet } from '../cat/render.ts';
import { makeTraits, newSeed } from '../cat/traits.ts';
import { copyText, downloadPng, downloadSvg } from './download.ts';
import { TRAIT_KEYS } from '../cat/types.ts';
import type { TraitKey } from '../cat/types.ts';
import type { CatMachine } from './useCatMachine.ts';

const SHEET_CELLS = 9;

export interface ControlsProps {
  machine: CatMachine;
}

/** Roll / export / preset / seed / per-trait tinkering. */
export function Controls({ machine }: ControlsProps) {
  const { traits, locks, preset, width, height } = machine;
  const [seedDraft, setSeedDraft] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy SVG code');

  const currentSvg = () => renderCat(traits, { width, height });

  const onCopy = async () => {
    const ok = await copyText(currentSvg());
    setCopyLabel(ok ? 'Copied' : 'Copy blocked');
    setTimeout(() => setCopyLabel('Copy SVG code'), 1200);
  };

  const onSheet = () => {
    const cats = Array.from({ length: SHEET_CELLS }, () => makeTraits(newSeed(), locks, preset));
    downloadSvg('cat-sheet.svg', renderSheet(cats));
  };

  const submitSeed = () => {
    const value = seedDraft.trim();
    if (!value) return;
    machine.roll(value);
    setSeedDraft('');
  };

  return (
    <div className="card">
      <h2>Make a cat</h2>
      <button type="button" onClick={() => machine.roll()}>
        New cat <span style={{ opacity: 0.5, fontSize: 13 }}>(space)</span>
      </button>
      <div className="row2">
        <button
          type="button"
          className="ghost sm"
          onClick={() => downloadSvg(`cat-${traits.seed}.svg`, currentSvg())}
        >
          Download SVG
        </button>
        <button
          type="button"
          className="ghost sm"
          onClick={() => {
            const pngHeight = Math.round((800 * height) / width);
            void downloadPng(`cat-${traits.seed}.png`, renderCat(traits, { width: 800, height: pngHeight }), 800, pngHeight);
          }}
        >
          Download PNG
        </button>
      </div>
      <div className="row2">
        <button type="button" className="ghost sm" onClick={() => void onCopy()}>
          {copyLabel}
        </button>
        <button type="button" className="ghost sm" onClick={onSheet}>
          Export 3×3 sheet
        </button>
      </div>
      <button type="button" className="ghost sm" onClick={machine.saveFavourite}>
        Save to favourites
      </button>

      <h2>Style preset</h2>
      <select
        aria-label="Style preset"
        value={preset}
        onChange={(e) => machine.setPreset(e.target.value)}
        style={{ marginBottom: 4 }}
      >
        {PRESET_NAMES.map((p) => (
          <option key={p} value={p}>
            {p === 'anything' ? 'Anything goes' : p[0].toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>

      <h2>Type a seed</h2>
      <div className="seedrow">
        <input
          type="text"
          value={seedDraft}
          placeholder="e.g. mackerel"
          aria-label="Seed word"
          onChange={(e) => setSeedDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitSeed();
          }}
        />
        <button type="button" className="ghost" style={{ width: 'auto', margin: 0, padding: '11px 16px' }} onClick={submitSeed}>
          Go
        </button>
      </div>
      <p className="hint">Same seed, same cat — every time.</p>

      <h2>Tinker</h2>
      <div className="tinker">
        {TRAIT_KEYS.map((key: TraitKey) => (
          <div key={key}>
            <label className="f" htmlFor={`s_${key}`}>
              {key}
            </label>
            <select
              id={`s_${key}`}
              value={traits[key]}
              onChange={(e) => machine.setTrait(key, e.target.value)}
            >
              {TRAIT_OPTIONS[key].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button type="button" className="ghost sm" style={{ marginTop: 10 }} onClick={machine.clearLocks}>
        Clear all locks
      </button>
    </div>
  );
}
