/**
 * The `<head>` every page shares, the structured data search and answer engines
 * read, and the sitemap. Generated from `site.ts` so there is exactly one place
 * where the site describes itself.
 */
import { escapeHtml } from './shell';
import {
  AUTHOR,
  AUTHOR_SITE,
  DESCRIPTION,
  FAQ,
  GITHUB_URL,
  HOME,
  KEYWORDS,
  OG_IMAGE,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  PAGES,
  SITE_NAME,
  SITE_URL,
  THEME_COLOR,
} from './site';
import type { Page } from './site';

const abs = (path: string): string => new URL(path, SITE_URL).toString();

const meta = (attr: 'name' | 'property', key: string, value: string): string =>
  `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;

/**
 * `</script>` inside a JSON string would close the block early, so the escape
 * has to happen at the HTML layer, not the JSON one.
 */
const jsonScript = (data: unknown): string =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

/** Everything head-level that is not the page's own title/description. */
export function commonHead(): string {
  return [
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    meta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1'),
    meta('name', 'author', AUTHOR),
    meta('name', 'keywords', KEYWORDS.join(', ')),
    meta('name', 'theme-color', THEME_COLOR),
    meta('name', 'color-scheme', 'light'),
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,800&family=IBM+Plex+Mono:wght@400;600&family=Karla:wght@400;600&display=swap" rel="stylesheet" />',
  ].join('\n    ');
}

/** Title, description, canonical and the social cards for one page. */
export function pageHead(page: Page): string {
  const url = abs(page.path);
  return [
    `<title>${escapeHtml(page.title)}</title>`,
    meta('name', 'description', page.description),
    `<link rel="canonical" href="${url}" />`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:title', page.title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:url', url),
    meta('property', 'og:image', abs(OG_IMAGE)),
    meta('property', 'og:image:width', String(OG_IMAGE_WIDTH)),
    meta('property', 'og:image:height', String(OG_IMAGE_HEIGHT)),
    meta('property', 'og:image:alt', OG_IMAGE_ALT),
    meta('property', 'og:locale', 'en_US'),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', page.title),
    meta('name', 'twitter:description', page.description),
    meta('name', 'twitter:image', abs(OG_IMAGE)),
    meta('name', 'twitter:image:alt', OG_IMAGE_ALT),
  ].join('\n    ');
}

/**
 * One `@graph` rather than several blocks, so every node can point at the
 * others by id — that is what lets a crawler tie the FAQ and the app to the
 * site instead of reading three unrelated documents.
 */
export function structuredData(page: Page): string {
  const siteId = `${SITE_URL}/#website`;
  const appId = `${SITE_URL}/#app`;
  const authorId = `${AUTHOR_SITE}#person`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Person',
      '@id': authorId,
      name: AUTHOR,
      url: AUTHOR_SITE,
      sameAs: ['https://github.com/TimMikeladze', AUTHOR_SITE],
    },
    {
      '@type': 'WebSite',
      '@id': siteId,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: DESCRIPTION,
      inLanguage: 'en',
      author: { '@id': authorId },
      publisher: { '@id': authorId },
    },
    {
      '@type': 'WebApplication',
      '@id': appId,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: DESCRIPTION,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript for the studio; the image API needs none.',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@id': authorId },
      isPartOf: { '@id': siteId },
      image: abs(OG_IMAGE),
      softwareHelp: GITHUB_URL,
      featureList: [
        'Deterministic cat placeholder images from any URL',
        'Any size from 16 to 2000 pixels, any aspect ratio',
        'Pin individual traits or pick a style preset',
        'SVG and PNG export, plus a contact sheet',
      ],
    },
    {
      '@type': 'WebPage',
      '@id': `${abs(page.path)}#webpage`,
      url: abs(page.path),
      name: page.title,
      description: page.description,
      isPartOf: { '@id': siteId },
      about: { '@id': appId },
      primaryImageOfPage: abs(OG_IMAGE),
      inLanguage: 'en',
    },
    {
      '@type': 'FAQPage',
      '@id': `${abs(page.path)}#faq`,
      isPartOf: { '@id': siteId },
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return jsonScript({ '@context': 'https://schema.org', '@graph': graph });
}

/** Head block for a page: shared tags, page tags, structured data. */
export const fullHead = (page: Page): string =>
  `${commonHead()}\n    ${pageHead(page)}\n    ${structuredData(page)}`;

/** Sitemap covering the HTML pages. Generated cat images are not listed. */
export function sitemapXml(): string {
  const urls = PAGES.map(
    (p) =>
      `  <url>\n    <loc>${abs(p.path)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export { HOME };
