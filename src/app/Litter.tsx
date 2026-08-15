import { CatSvg } from './CatSvg.tsx';
import { catName } from '../cat/traits.ts';
import type { Traits } from '../cat/types.ts';

export interface LitterProps {
  litter: Traits[];
  onKeep: (t: Traits) => void;
}

/** Nine alternates under the current locks and preset. */
export function Litter({ litter, onKeep }: LitterProps) {
  return (
    <div className="card">
      <h2>The litter — tap to keep one</h2>
      <div className="grid3">
        {litter.map((t) => (
          <button key={t.seed} type="button" aria-label={`Keep ${catName(t.seed)}`} onClick={() => onKeep(t)}>
            <CatSvg traits={t} width={120} />
          </button>
        ))}
      </div>
    </div>
  );
}
