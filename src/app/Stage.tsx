import { useEffect, useState } from 'react';
import { CatSvg, PostcardSvg } from './CatSvg';
import { NARROW, useMediaQuery } from './useMediaQuery';
import { TRAIT_LABEL } from '../cat/spec';
import { catName } from '../cat/traits';
import type { TraitKey } from '../cat/types';
import type { CatMachine } from './useCatMachine';

const CHIP_ORDER = Object.keys(TRAIT_LABEL) as TraitKey[];

/** How wide the hero is drawn, whatever size the URL is pointed at. */
const STAGE_WIDTH = 400;

export interface StageProps {
  machine: CatMachine;
}

/** The hero cat — or postcard — its name, and one lockable chip per trait. */
export function Stage({ machine }: StageProps) {
  const { traits, locks, mode, side, text, width, height } = machine;
  const onToggleLock = machine.toggleLock;
  // Twenty-odd chips push everything else off a phone screen, so they fold
  // away there and stay open in the wide column.
  const narrow = useMediaQuery(NARROW);
  const [open, setOpen] = useState(() => !narrow);
  useEffect(() => setOpen(!narrow), [narrow]);

  const lockCount = CHIP_ORDER.filter((key) => locks[key]).length;

  return (
    <div className="card stage">
      <div className="artboard">
        {mode === 'postcard' ? (
          <PostcardSvg
            traits={traits}
            width={STAGE_WIDTH}
            height={Math.round((STAGE_WIDTH * height) / width)}
            side={side}
            text={text}
          />
        ) : (
          <CatSvg traits={traits} width={STAGE_WIDTH} />
        )}
      </div>
      <div className="cat-id">
        <div>
          <div className="name">{catName(traits.seed)}</div>
          <div className="seedline">seed · {traits.seed}</div>
        </div>
        <span className="edition">one of one</span>
      </div>
      <details className="fold" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary>
          <h2>Traits{lockCount > 0 ? ` · ${lockCount} pinned` : ''}</h2>
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
                {locked && <span className="pin-mark" aria-hidden="true" />}
                {TRAIT_LABEL[key](traits)}
              </button>
            );
          })}
        </div>
        <p className="hint">Tap a trait to pin it — pinned traits survive the next roll.</p>
      </details>
    </div>
  );
}
