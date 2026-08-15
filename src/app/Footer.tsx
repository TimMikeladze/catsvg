export const GITHUB_URL = 'https://github.com/TimMikeladze/catsvg';
export const AUTHOR_SITE = 'https://linesofcode.dev';

/** Project + author links. */
export function Footer() {
  return (
    <footer className="colophon">
      <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
        GitHub
      </a>
      <span aria-hidden="true">·</span>
      <a href={AUTHOR_SITE} target="_blank" rel="noreferrer noopener">
        linesofcode.dev
      </a>
    </footer>
  );
}
