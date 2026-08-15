import { useEffect, useState } from 'react';

/** Width below which the two columns stack — must match the 900px breakpoint in styles.css. */
export const NARROW = '(max-width: 900px)';

const matches = (query: string): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false;

/** Live `matchMedia` result, for layout decisions CSS alone cannot express. */
export function useMediaQuery(query: string): boolean {
  const [on, setOn] = useState(() => matches(query));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const list = window.matchMedia(query);
    const onChange = () => setOn(list.matches);
    onChange();
    // jsdom's MediaQueryList has no listener methods.
    list.addEventListener?.('change', onChange);
    return () => list.removeEventListener?.('change', onChange);
  }, [query]);

  return on;
}
