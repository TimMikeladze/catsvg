import { CatSvg } from './CatSvg.tsx';
import { catName, makeTraits } from '../cat/traits.ts';
import type { CatRecipe } from './useCatMachine.ts';

export interface FavouritesProps {
  favourites: CatRecipe[];
  onLoad: (recipe: CatRecipe) => void;
  onRemove: (index: number) => void;
}

/** Saved recipes, kept in localStorage. Click loads, shift-click removes. */
export function Favourites({ favourites, onLoad, onRemove }: FavouritesProps) {
  return (
    <div className="card">
      <h2>Favourites</h2>
      <div className="favs">
        {favourites.length === 0 ? (
          <span className="empty">Nothing saved yet.</span>
        ) : (
          favourites.map((recipe, i) => (
            <button
              key={`${recipe.seed}-${i}`}
              type="button"
              aria-label={`Load ${catName(recipe.seed)} (shift-click to remove)`}
              onClick={(e) => (e.shiftKey ? onRemove(i) : onLoad(recipe))}
            >
              <CatSvg traits={makeTraits(recipe.seed, recipe.locks, recipe.preset)} width={90} />
            </button>
          ))
        )}
      </div>
      {favourites.length > 0 && <p className="hint">Shift-click a favourite to remove it.</p>}
    </div>
  );
}
