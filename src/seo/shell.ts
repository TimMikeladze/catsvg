/**
 * Static HTML for crawlers.
 *
 * The studio is a client-rendered React app, so a bare `#root` is all a client
 * that does not run JavaScript would ever see — and most answer-engine crawlers
 * do not run JavaScript. These functions render the same words the app renders,
 * as plain HTML, at build time. React replaces the markup on mount, so what a
 * crawler reads and what a person sees stay in agreement.
 */
import { renderCat } from '../cat/render';
import { makeTraits } from '../cat/traits';
import {
  FAQ,
  GALLERY,
  GITHUB_URL,
  INTRO,
  PARAMS,
  ROUTES,
  SITE_NAME,
  SNIPPETS,
  TAGLINE,
  AUTHOR_SITE,
  galleryAlt,
  galleryPath,
} from './site';
import type { GalleryItem } from './site';

/** Cat on the home page before the app boots and rolls its own. */
const HERO_SEED = 'mackerel';

export const escapeHtml = (s: string): string =>
  s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c]!);

const rows = (pairs: Array<[string, string]>, head: [string, string]): string => `
      <table>
        <thead><tr><th scope="col">${head[0]}</th><th scope="col">${head[1]}</th></tr></thead>
        <tbody>${pairs
          .map(([a, b]) => `<tr><td>${escapeHtml(a)}</td><td>${escapeHtml(b)}</td></tr>`)
          .join('')}</tbody>
      </table>`;

const snippetList = (): string => `
      <ul class="snippet-list">${SNIPPETS.map(
        (s) => `<li><span class="snippet-label">${escapeHtml(s.label)}</span><code class="mono">${escapeHtml(s.code)}</code></li>`,
      ).join('')}</ul>`;

const faqList = (): string => `
      <dl class="faq">${FAQ.map(
        (f) => `<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`,
      ).join('')}</dl>`;

/** Banner-shaped cats get the full row; anything else shares one. */
const figure = (item: GalleryItem): string => `
        <figure class="shot${item.width / item.height >= 2 ? ' wide' : ''}">
          <img src="${escapeHtml(galleryPath(item))}" width="${item.width}" height="${item.height}"
               alt="${escapeHtml(galleryAlt(item))}" loading="lazy" decoding="async" />
          <figcaption>${escapeHtml(item.use)} · <code>${escapeHtml(galleryPath(item))}</code></figcaption>
        </figure>`;

const colophon = (): string => `
    <footer class="colophon">
      <a href="${GITHUB_URL}">GitHub</a>
      <span aria-hidden="true">·</span>
      <a href="${AUTHOR_SITE}">linesofcode.dev</a>
    </footer>`;

/**
 * The home page as static HTML, injected inside `#root`. React discards it the
 * moment it mounts, so it must never say anything the app does not.
 */
export function homeShell(): string {
  const hero = renderCat(makeTraits(HERO_SEED), { width: 400 });
  return `
    <header class="masthead">
      <div class="brand">
        <h1>${SITE_NAME}</h1>
        <p class="lede">${escapeHtml(TAGLINE)}</p>
      </div>
    </header>

    <div class="prose">
      <div class="card stage">${hero}<p class="hint">A cat from the seed “${HERO_SEED}”. Same seed, same cat, forever.</p></div>

      <p>${escapeHtml(INTRO)}</p>

      <h2>Use it anywhere</h2>${snippetList()}

      <h2>URL API</h2>${rows(ROUTES, ['URL', 'What you get'])}

      <h2>Query parameters</h2>${rows(PARAMS, ['Param', 'Effect'])}

      <h2>Examples</h2>
      <div class="shots">${GALLERY.map(figure).join('')}</div>

      <h2>Questions</h2>${faqList()}
    </div>
${colophon()}`;
}
