import { useEffect } from 'react';
import { ApiDocs } from './ApiDocs';
import { Controls } from './Controls';
import { Faq } from './Faq';
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

      {/* On narrow screens the two columns dissolve (`display: contents`) and the
          cards reorder: cat, controls, URL — see the ordering rules in styles.css. */}
      <div className="layout">
        <div className="col">
          <Stage
            traits={machine.traits}
            locks={machine.locks}
            onToggleLock={machine.toggleLock}
          />
          <UrlPanel machine={machine} />
          <Litter litter={machine.litter} onKeep={machine.keep} />
          <ApiDocs />
          <Faq />
        </div>

        <div className="col">
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
