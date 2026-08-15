import { useEffect } from 'react';
import { ApiDocs } from './ApiDocs';
import { Controls } from './Controls';
import { Favourites } from './Favourites';
import { Footer } from './Footer';
import { Masthead } from './Masthead';
import { Litter } from './Litter';
import { Stage } from './Stage';
import { UrlPanel } from './UrlPanel';
import { useCatMachine } from './useCatMachine';

const TYPING = /^(INPUT|SELECT|TEXTAREA)$/;

export function App() {
  const machine = useCatMachine();
  const { roll } = machine;

  // Space rolls a new cat, unless the user is typing into a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (TYPING.test(document.activeElement?.tagName ?? '')) return;
      e.preventDefault();
      roll();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [roll]);

  return (
    <div className="wrap">
      <Masthead />

      <div className="layout">
        <div>
          <Stage
            traits={machine.traits}
            locks={machine.locks}
            onToggleLock={machine.toggleLock}
          />
          <UrlPanel machine={machine} />
          <Litter litter={machine.litter} onKeep={machine.keep} />
          <ApiDocs />
        </div>

        <div>
          <Controls machine={machine} />
          <Favourites
            favourites={machine.favourites}
            onLoad={machine.loadRecipe}
            onRemove={machine.removeFavourite}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
