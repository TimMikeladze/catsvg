/**
 * One source of truth for everything search engines, social cards, the static
 * prerender and the app itself need to say about this site. Anything a crawler
 * reads should be derived from here rather than written twice.
 */

export const SITE_URL = 'https://catsvg.vercel.app';
export const SITE_NAME = 'CatSVG';
export const GITHUB_URL = 'https://github.com/TimMikeladze/catsvg';
export const AUTHOR = 'Tim Mikeladze';
export const AUTHOR_SITE = 'https://linesofcode.dev';

export const LICENSE = 'MIT';
export const LICENSE_URL = 'https://opensource.org/licenses/MIT';

export const TITLE = 'CatSVG — cat placeholder images, drawn as SVG';
export const TAGLINE = 'Cat placeholder images — any size, any seed, pure SVG.';

/** Meta description. Kept under 160 characters so it survives the SERP. */
export const DESCRIPTION =
  'Free cat placeholder images for developers. Any size, any seed — CatSVG draws a unique vector cat for every URL. No signup, no API key, pure SVG.';

/** First paragraph of the page, and the thing an answer engine will quote. */
export const INTRO =
  'CatSVG is a placeholder image service that draws cats. Ask for any size and any seed word and you get a cat: generated as SVG on the fly, a few kilobytes on the wire, sharp at any resolution, and identical every time that URL is requested.';

export const KEYWORDS = [
  'cat placeholder images',
  'placeholder image API',
  'svg placeholder',
  'placekitten alternative',
  'random cat generator',
  'cat avatar generator',
  'lorem ipsum for images',
  'dummy images',
];

export const OG_IMAGE = '/og.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = 'CatSVG — geometric SVG cats beside the wordmark';

/** Brand colour used for the browser chrome and the social card. */
export const THEME_COLOR = '#e6e1f5';

export interface Page {
  /** Absolute path, with a trailing slash for directories. */
  path: string;
  title: string;
  description: string;
  /** Heading shown at the top of the page body. */
  heading: string;
  /** Sitemap priority. */
  priority: string;
}

export const HOME: Page = {
  path: '/',
  title: TITLE,
  description: DESCRIPTION,
  heading: SITE_NAME,
  priority: '1.0',
};

export const PAGES: Page[] = [HOME];

/** The image endpoint, as documented on the page and in the README. */
export const ROUTES: Array<[string, string]> = [
  ['/cat/mackerel.svg', 'Seeded cat, 400×400.'],
  ['/cat/240/mackerel.svg', 'Square at 240px.'],
  ['/cat/1200x300/mackerel.svg', 'Any width×height up to 2000.'],
  ['/cat/320x320/random.svg', 'A different cat every request (never cached).'],
  ['/cat/400?seed=biscuit', 'Query form — same thing.'],
];

export const PARAMS: Array<[string, string]> = [
  ['seed', 'Any string. Same seed always returns the same cat.'],
  ['w, h', 'Size override, 16–2000px.'],
  ['preset', 'anything · minimal · maximal · noir · pastel · feral'],
  ['text', 'Caption pill, e.g. text=1200x300.'],
  ['<trait>', 'Pin one trait: eyes=star, palette=neon, body=loaf, …'],
];

/** Copy-paste examples. Shown in the app and in the prerendered HTML. */
export const SNIPPETS: Array<{ label: string; code: string }> = [
  {
    label: 'HTML',
    code: `<img src="${SITE_URL}/cat/1200x300/mackerel.svg" width="1200" height="300" alt="Cat placeholder" />`,
  },
  {
    label: 'Markdown',
    code: `![Cat placeholder](${SITE_URL}/cat/800x450/biscuit.svg)`,
  },
  {
    label: 'CSS',
    code: `background-image: url("${SITE_URL}/cat/1200x600/pebble.svg");`,
  },
  {
    label: 'Avatar',
    code: `<img src="${SITE_URL}/cat/96/${'${userId}'}.svg" width="96" height="96" alt="Avatar" />`,
  },
];

/** Questions people actually ask about placeholder services, answered plainly. */
export const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'What is CatSVG?',
    a: 'A placeholder image service that draws cats. Every URL — say /cat/1200x300/mackerel.svg — is turned into one specific cat and rendered as SVG on the fly. No image files are stored and nothing is fetched from anywhere else.',
  },
  {
    q: 'How do I use a cat placeholder image?',
    a: `Point an <img> at it: <img src="${SITE_URL}/cat/1200x300/mackerel.svg" />. The size segment is optional and so is the .svg suffix, so ${SITE_URL}/cat/mackerel works too.`,
  },
  {
    q: 'Will the same URL always give me the same cat?',
    a: 'Yes. A cat is a pure function of its URL, so seeded cats are served immutable and cached for a year. The one exception is the seed "random", which rolls a fresh cat on every request and is never cached.',
  },
  {
    q: 'Do I need an API key or an account?',
    a: 'No. The image endpoint is public, sends Access-Control-Allow-Origin: *, and needs no key, token or signup.',
  },
  {
    q: 'Can I use the cats commercially?',
    a: 'Yes. CatSVG is MIT licensed, and a generated cat is plain SVG with no third-party artwork in it — put it in a client mockup, a product screenshot or a shipped page, no attribution required.',
  },
  {
    q: 'Is this a PlaceKitten alternative?',
    a: 'Same job, different method. PlaceKitten serves photographs of cats; CatSVG draws each cat as vector artwork from the URL, so a placeholder is a few kilobytes, stays sharp on any display, and the same URL always returns the same cat.',
  },
  {
    q: 'What sizes and aspect ratios work?',
    a: 'Anything from 16 to 2000 pixels on each side. Wide and tall requests extend the scene around the cat instead of cropping it, so a 1200×300 banner still shows a whole cat.',
  },
  {
    q: 'Can I use the cats as avatars?',
    a: 'Yes. Pass a user id, username or email hash as the seed and every person gets their own stable cat, the way an identicon works — but a cat.',
  },
  {
    q: 'Can I run CatSVG myself?',
    a: 'Yes. The whole thing is open source on GitHub: the generator is a dependency-free TypeScript module and the service is a single function you can host anywhere.',
  },
];

export interface GalleryItem {
  seed: string;
  width: number;
  height: number;
  /** What this size is for — the caption and the alt text lean on it. */
  use: string;
  preset?: string;
}

/** Worked examples, ordered by how often people need that shape. */
export const GALLERY: GalleryItem[] = [
  { seed: 'mackerel', width: 1200, height: 300, use: 'Wide banner' },
  { seed: 'biscuit', width: 800, height: 450, use: 'Card image, 16:9' },
  { seed: 'pebble', width: 600, height: 800, use: 'Portrait crop' },
  { seed: 'juniper', width: 400, height: 400, use: 'Square thumbnail' },
  { seed: 'noodle', width: 160, height: 160, use: 'Avatar' },
  { seed: 'domino', width: 96, height: 96, use: 'Small avatar' },
];

/** The path a gallery item is served from. */
export const galleryPath = (item: GalleryItem): string => {
  const size = item.width === item.height ? `${item.width}` : `${item.width}x${item.height}`;
  return `/cat/${size}/${item.seed}.svg${item.preset ? `?preset=${item.preset}` : ''}`;
};

/** Alt text for a gallery item — descriptive, not keyword soup. */
export const galleryAlt = (item: GalleryItem): string =>
  `${item.use}: a ${item.width}×${item.height} cat placeholder image, seed "${item.seed}"${
    item.preset ? `, ${item.preset} preset` : ''
  }`;
