import { useEffect, useState } from 'react';
import { NARROW, useMediaQuery } from './useMediaQuery';
import { PRESET_NAMES, TRAIT_OPTIONS } from '../cat/spec';
import { renderCat, renderSheet } from '../cat/render';
import { greetingFor, markFor, noteFor, renderPostcard } from '../cat/postcard';
import { catName, makeTraits, newSeed } from '../cat/traits';
import { copyText, downloadPng, downloadSvg } from './download';
import type { TraitKey } from '../cat/types';
import type { CatMachine } from './useCatMachine';

const SHEET_CELLS = 9;

/** How many stamps the studio offers; the URL takes up to MAX_STAMPS. */
const STAMP_COUNTS = [0, 1, 2, 3];

const TINKER_GROUPS: Array<{ label: string; keys: TraitKey[] }> = [
  { label: 'Silhouette', keys: ['body', 'size', 'posture', 'fluff', 'tail', 'tailtip', 'paws'] },
  { label: 'Face', keys: ['head', 'ears', 'eyes', 'lashes', 'nose', 'mouth', 'whiskers', 'face'] },
  { label: 'Fur & colour', keys: ['palette', 'tone', 'coat'] },
  { label: 'Character', keys: ['extra', 'hold', 'prop', 'aura'] },
  { label: 'Backdrop', keys: ['scene', 'tint', 'frame'] },
];

const FIELD_LABEL: Partial<Record<TraitKey, string>> = {
  tailtip: 'tail tip',
  paws: 'front paws',
  face: 'face marking',
  extra: 'accessory',
  hold: 'held item',
  prop: 'floor prop',
  aura: 'mood marks',
  tint: 'colour wash',
  frame: 'border',
};

const VALUE_LABEL: Record<string, string> = {
  tiltleft: 'tilt left',
  tiltright: 'tilt right',
  vstripes: 'vertical stripes',
  starchest: 'star chest',
  patcheye: 'eye patch',
  longhair: 'long hair',
  onesided: 'one-sided',
  partyhat: 'party hat',
  hairbow: 'hair bow',
};

const pretty = (value: string): string => VALUE_LABEL[value] ?? value;

export interface ControlsProps {
  machine: CatMachine;
}

/** Roll / export / preset / seed / per-trait tinkering. */
export function Controls({ machine }: ControlsProps) {
  const { traits, locks, preset, width, height, mode, side, text, card } = machine;
  const postcard = mode === 'postcard';
  const stamps = card.stamp ?? 1;
  const branded = card.brand !== false;
  const [seedDraft, setSeedDraft] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy SVG code');

  // Twenty-five dropdowns is a wall on a phone: fold them away there, keep them
  // open on the desktop column where there is room for them.
  const narrow = useMediaQuery(NARROW);
  const [tinkerOpen, setTinkerOpen] = useState(() => !narrow);
  useEffect(() => setTinkerOpen(!narrow), [narrow]);
  const lockCount = Object.keys(locks).length;

  // Every export follows whatever is on the stage, postcard included.
  const currentSvg = () =>
    postcard
      ? renderPostcard(traits, { ...card, width, height, side, text })
      : renderCat(traits, { width, height });
  const fileStem = postcard ? `postcard-${side}-${traits.seed}` : `cat-${traits.seed}`;

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
    <div className="card controls">
      <div className="card-heading">
        <div>
          <h2>Cat studio</h2>
          <p>Roll freely, then pin the parts worth keeping.</p>
        </div>
        <span className="keyhint">space</span>
      </div>
      <button type="button" className="primary-action" aria-label="New cat" onClick={() => machine.roll()}>
        Roll a new cat
      </button>
      <div className="action-grid">
        <button
          type="button"
          className="ghost sm"
          onClick={() => downloadSvg(`${fileStem}.svg`, currentSvg())}
        >
          Download SVG
        </button>
        <button
          type="button"
          className="ghost sm"
          onClick={() => {
            const pngHeight = Math.round((800 * height) / width);
            const svg = postcard
              ? renderPostcard(traits, { ...card, width: 800, height: pngHeight, side, text })
              : renderCat(traits, { width: 800, height: pngHeight });
            void downloadPng(`${fileStem}.png`, svg, 800, pngHeight);
          }}
        >
          Download PNG
        </button>
      </div>
      <div className="action-grid">
        <button type="button" className="ghost sm" onClick={() => void onCopy()}>
          {copyLabel}
        </button>
        <button type="button" className="ghost sm" onClick={onSheet}>
          Export 3×3 sheet
        </button>
      </div>
      <button type="button" className="ghost sm save-action" aria-label="Save to favourites" onClick={machine.saveFavourite}>
        + Save this cat
      </button>

      <h2>Art direction</h2>
      <select
        aria-label="Style preset"
        value={preset}
        onChange={(e) => machine.setPreset(e.target.value)}
        className="preset-select"
      >
        {PRESET_NAMES.map((p) => (
          <option key={p} value={p}>
            {p === 'anything' ? 'Anything goes' : p[0].toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>

      <h2>Postcard</h2>
      <div className="sizes">
        <button type="button" aria-pressed={!postcard} onClick={() => machine.setMode('cat')}>
          Plain cat
        </button>
        <button type="button" aria-pressed={postcard} onClick={() => machine.setMode('postcard')}>
          Postcard
        </button>
      </div>
      {postcard && (
        <>
          <div className="sizes" style={{ marginTop: 8 }}>
            <button type="button" aria-pressed={side === 'front'} onClick={() => machine.setSide('front')}>
              Front
            </button>
            <button type="button" aria-pressed={side === 'back'} onClick={() => machine.setSide('back')}>
              Back
            </button>
          </div>
          <input
            type="text"
            className="block"
            value={text}
            aria-label={side === 'front' ? 'Greeting' : 'Message'}
            placeholder={side === 'front' ? greetingFor(traits.seed) : noteFor(traits.seed)}
            maxLength={240}
            onChange={(e) => machine.setText(e.target.value)}
          />

          {side === 'front' ? (
            <input
              type="text"
              className="block"
              value={card.caption ?? ''}
              aria-label="Caption"
              placeholder="Caption — small print under it"
              maxLength={48}
              onChange={(e) => machine.setCard({ caption: e.target.value })}
            />
          ) : (
            <>
              <input
                type="text"
                className="block"
                value={card.to ?? ''}
                aria-label="Addressed to"
                placeholder={`To — ${catName(traits.seed)}`}
                maxLength={40}
                onChange={(e) => machine.setCard({ to: e.target.value })}
              />
              <input
                type="text"
                className="block"
                value={card.from ?? ''}
                aria-label="Signed by"
                placeholder={`From — ${catName(traits.seed)}`}
                maxLength={40}
                onChange={(e) => machine.setCard({ from: e.target.value })}
              />
              {stamps > 0 && (
                <input
                  type="text"
                  className="block"
                  value={card.postmark ?? ''}
                  aria-label="Postmark"
                  placeholder={`Postmark — ${branded ? 'CATSVG' : markFor(traits.seed)}`}
                  maxLength={12}
                  onChange={(e) => machine.setCard({ postmark: e.target.value })}
                />
              )}
            </>
          )}

          {side === 'back' && (
            <div className="sizes" role="group" aria-label="Stamps">
              <span className="hint" style={{ margin: '6px 4px 0 0' }}>
                stamps
              </span>
              {STAMP_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={n === 0 ? 'No stamps' : `${n} stamp${n === 1 ? '' : 's'}`}
                  aria-pressed={stamps === n}
                  onClick={() => machine.setCard({ stamp: n })}
                >
                  {n === 0 ? 'none' : n}
                </button>
              ))}
            </div>
          )}

          <div className="sizes">
            <button
              type="button"
              aria-pressed={branded}
              onClick={() => machine.setCard({ brand: !branded })}
            >
              CatSVG mark
            </button>
          </div>

          <p className="hint">
            {side === 'front'
              ? 'Empty fields write themselves — the cat picks where it is writing from.'
              : 'Empty fields write themselves — the cat writes its own note and signs it.'}
          </p>
        </>
      )}

      <h2>Seed</h2>
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
        <button type="button" className="ghost seed-go" onClick={submitSeed}>
          Go
        </button>
      </div>
      <p className="hint">Same seed, same cat — every time.</p>

      <details
        className="fold"
        open={tinkerOpen}
        onToggle={(e) => setTinkerOpen(e.currentTarget.open)}
      >
        <summary>
          <h2>Tinker{lockCount > 0 ? ` · ${lockCount} pinned` : ''}</h2>
        </summary>
        <div className="tinker">
          {TINKER_GROUPS.map((group) => (
            <fieldset key={group.label} className="tinker-group">
              <legend>{group.label}</legend>
              <div className="tinker-grid">
                {group.keys.map((key) => (
                  <div key={key} className={locks[key] ? 'field pinned' : 'field'}>
                    <label className="f" htmlFor={`s_${key}`}>
                      {FIELD_LABEL[key] ?? key}
                    </label>
                    <select
                      id={`s_${key}`}
                      value={traits[key]}
                      onChange={(e) => machine.setTrait(key, e.target.value)}
                    >
                      {TRAIT_OPTIONS[key].map((v) => (
                        <option key={v} value={v}>
                          {pretty(v)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <button type="button" className="text-action" disabled={lockCount === 0} onClick={machine.clearLocks}>
          Clear pinned traits
        </button>
      </details>
    </div>
  );
}
