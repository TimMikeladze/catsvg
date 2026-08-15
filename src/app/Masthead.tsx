import { COMBOS } from '../cat/spec';
import { GITHUB_URL, TAGLINE } from '../seo/site';

/**
 * `COMBOS` is ~10²⁶, where `Intl` compact notation gives up and prints
 * "298,535,074,684.6T". Scientific notation is the only readable form.
 */
function Combos() {
  const exponent = Math.floor(Math.log10(COMBOS));
  const mantissa = (COMBOS / 10 ** exponent).toFixed(2);
  return (
    <span
      className="combos"
      title={`${COMBOS.toLocaleString('en-US')} distinct cats`}
      aria-label={`${mantissa} times 10 to the power of ${exponent} possible cats`}
    >
      <span className="combos-dot" aria-hidden="true" />
      <span className="combos-number" aria-hidden="true">
        {mantissa}<span className="combos-times">×</span>10<sup>{exponent}</sup>
      </span>
      <span className="combos-label" aria-hidden="true">cats</span>
    </span>
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

function CatMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        d="M7.6 13.2 6 5.4l7 4.1a14 14 0 0 1 6 0l7-4.1-1.6 7.8c2 1.7 3.1 4.2 2.7 6.8-.7 5.4-5.1 8.3-11.1 8.3S5.6 25.4 4.9 20c-.4-2.6.7-5.1 2.7-6.8Z"
        fill="currentColor"
      />
      <path d="M10.5 18.2h.1m10.8 0h.1" stroke="var(--mustard)" strokeWidth="3" strokeLinecap="round" />
      <path d="m14 21.2 2 1.4 2-1.4M16 22.6v2" fill="none" stroke="var(--paper)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Wordmark, what the thing is, and where to find it. */
export function Masthead() {
  return (
    <header className="masthead">
      <div className="brand">
        <span className="brand-mark">
          <CatMark />
        </span>
        <div className="brand-copy">
          <h1>CatSVG</h1>
          <p className="lede">{TAGLINE}</p>
        </div>
      </div>

      <nav className="masthead-side" aria-label="Project links">
        <Combos />
        <a
          className="ghlink"
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="View CatSVG on GitHub"
        >
          <GithubMark />
          <span>GitHub</span>
        </a>
      </nav>
    </header>
  );
}
