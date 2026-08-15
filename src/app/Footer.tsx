import { AUTHOR_SITE, GITHUB_URL } from '../seo/site';

export { AUTHOR_SITE, GITHUB_URL };

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
