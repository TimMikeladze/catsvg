import { CatSvg } from './CatSvg.tsx';
import { TRAIT_LABEL } from '../cat/spec.ts';
import { catName } from '../cat/traits.ts';
import type { Locks, TraitKey, Traits } from '../cat/types.ts';

const CHIP_ORDER = Object.keys(TRAIT_LABEL) as TraitKey[];

export interface StageProps {
  traits: Traits;
  locks: Locks;
  onToggleLock: (key: TraitKey) => void;
}

/** The hero cat, its name, and one lockable chip per trait. */
export function Stage({ traits, locks, onToggleLock }: StageProps) {
  return (
    <div className="card stage">
      <CatSvg traits={traits} width={400} />
      <div className="name">{catName(traits.seed)}</div>
      <div className="seedline">seed · {traits.seed}</div>
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
    </div>
  );
}
