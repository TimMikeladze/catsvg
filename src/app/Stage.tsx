import { useEffect, useState } from 'react';
import { CatSvg } from './CatSvg';
import { NARROW, useMediaQuery } from './useMediaQuery';
import { TRAIT_LABEL } from '../cat/spec';
import { catName } from '../cat/traits';
import type { Locks, TraitKey, Traits } from '../cat/types';

const CHIP_ORDER = Object.keys(TRAIT_LABEL) as TraitKey[];

export interface StageProps {
  traits: Traits;
  locks: Locks;
  onToggleLock: (key: TraitKey) => void;
}

/** The hero cat, its name, and one lockable chip per trait. */
export function Stage({ traits, locks, onToggleLock }: StageProps) {
  // Twenty-odd chips push everything else off a phone screen, so they fold
  // away there and stay open in the wide column.
  const narrow = useMediaQuery(NARROW);
  const [open, setOpen] = useState(() => !narrow);
  useEffect(() => setOpen(!narrow), [narrow]);

  const lockCount = CHIP_ORDER.filter((key) => locks[key]).length;

  return (
    <div className="card stage">
      <CatSvg traits={traits} width={400} />
      <div className="name">{catName(traits.seed)}</div>
      <div className="seedline">seed · {traits.seed}</div>
      <details className="fold" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary>
          <h2>Traits{lockCount > 0 ? ` · ${lockCount} locked` : ''}</h2>
        </summary>
        <div className="chips">
          {CHIP_ORDER.map((key) => {
            const locked = Boolean(locks[key]);
            return (
              <button
                key={key}
                type="button"
                className={locked ? 'chip locked' : 'chip'}
                aria-pressed={locked}
                onClick={() => onToggleLock(key)}
              >
                {locked ? '🔒 ' : ''}
                {TRAIT_LABEL[key](traits)}
              </button>
            );
          })}
        </div>
        <p className="hint">Tap a trait to lock it — locked traits survive the next roll.</p>
      </details>
    </div>
  );
}
