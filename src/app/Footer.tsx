export const GITHUB_URL = 'https://github.com/TimMikeladze/catsvg';
export const AUTHOR_SITE = 'https://linesofcode.dev';
export const AUTHOR_X = 'https://x.com/linesofcode';

/** Project + author links. */
export function Footer() {
  return (
    <footer className="colophon">
      <span>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
          github.com/TimMikeladze/catsvg
        </a>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        Created by{' '}
        <a href={AUTHOR_SITE} target="_blank" rel="noreferrer noopener">
          Tim Mikeladze
        </a>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        <a href={AUTHOR_X} target="_blank" rel="noreferrer noopener">
          @linesofcode
        </a>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        <a href={AUTHOR_SITE} target="_blank" rel="noreferrer noopener">
          linesofcode.dev
        </a>
      </span>
    </footer>
  );
}
