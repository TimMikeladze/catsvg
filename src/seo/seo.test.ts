import { describe, expect, it } from 'vitest';
import { fullHead, robotsTxt, sitemapXml, structuredData } from './html';
import { homeShell } from './shell';
import { DESCRIPTION, FAQ, GALLERY, HOME, PAGES, SITE_URL, TITLE, galleryAlt, galleryPath } from './site';

const ld = (page = HOME) => JSON.parse(structuredData(page).replace(/^[^{]*|<\/script>$/g, ''));

describe('site metadata', () => {
  it('keeps the title and description inside what a SERP will show', () => {
    expect(TITLE.length).toBeLessThanOrEqual(60);
    expect(DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it('builds cat paths and alt text from a gallery item', () => {
    expect(galleryPath({ seed: 'mackerel', width: 1200, height: 300, use: 'Banner' })).toBe(
      '/cat/1200x300/mackerel.svg',
    );
    expect(galleryPath({ seed: 'pickle', width: 400, height: 400, use: 'Square', preset: 'noir' })).toBe(
      '/cat/400/pickle.svg?preset=noir',
    );
    expect(galleryAlt(GALLERY[0])).toContain('cat placeholder image');
  });
});

describe('head', () => {
  it('carries one canonical URL, absolute — the app rewrites the query string as you roll', () => {
    const head = fullHead(HOME);
    expect(head).toContain(`<link rel="canonical" href="${SITE_URL}/" />`);
    expect(head.match(/rel="canonical"/g)).toHaveLength(1);
  });

  it('ships an absolute social image both cards can read', () => {
    const head = fullHead(HOME);
    expect(head).toContain(`<meta property="og:image" content="${SITE_URL}/og.png" />`);
    expect(head).toContain(`<meta name="twitter:image" content="${SITE_URL}/og.png" />`);
    expect(head).toContain('name="twitter:card" content="summary_large_image"');
  });

  it('lets crawlers index and use large image previews', () => {
    expect(fullHead(HOME)).toContain('max-image-preview:large');
  });
});

describe('structured data', () => {
  it('is valid JSON-LD that cannot break out of its script tag', () => {
    const open = '<script type="application/ld+json">';
    const payload = structuredData(HOME).slice(open.length, -'</script>'.length);
    expect(payload).not.toContain('<'); // an unescaped </script> in the data would end the block
    expect(ld()['@context']).toBe('https://schema.org');
  });

  it('describes the site, the app and every question on the page', () => {
    const types = ld()['@graph'].map((n: { '@type': string }) => n['@type']);
    expect(types).toEqual(expect.arrayContaining(['WebSite', 'WebApplication', 'FAQPage', 'WebPage']));
    const faq = ld()['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage');
    expect(faq.mainEntity).toHaveLength(FAQ.length);
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe(FAQ[0].a);
  });

});

describe('prerendered shell', () => {
  it('gives a crawler the heading, the pitch and the answers without JavaScript', () => {
    const html = homeShell();
    expect(html).toContain('<h1>CatSVG</h1>');
    expect(html).toContain('placeholder image service');
    for (const item of FAQ) expect(html).toContain(item.q.replace(/'/g, '&#39;'));
  });

  it('escapes markup inside the copy instead of emitting it', () => {
    expect(homeShell()).toContain('&lt;img src=');
  });

  it('links every example to a real image endpoint URL', () => {
    const html = homeShell();
    for (const item of GALLERY) {
      expect(html).toContain(`src="${galleryPath(item)}"`);
      expect(html).toContain(galleryAlt(item).replace(/"/g, '&quot;'));
    }
  });

  it('gives banner-shaped examples their own row', () => {
    expect(homeShell()).toContain('class="shot wide"');
  });
});

describe('sitemap', () => {
  it('lists every page once, absolute', () => {
    const xml = sitemapXml();
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    for (const page of PAGES) expect(xml).toContain(`<loc>${new URL(page.path, SITE_URL)}</loc>`);
    expect(xml.match(/<loc>/g)).toHaveLength(PAGES.length);
  });
});

describe('canonical origin', () => {
  it('never leaks the deploy URL into anything a crawler reads', () => {
    expect(SITE_URL).toBe('https://catsvg.app');
    for (const doc of [fullHead(HOME), homeShell(), sitemapXml(), robotsTxt()]) {
      expect(doc).not.toContain('vercel.app');
    }
  });
});

describe('robots.txt', () => {
  it('points at the sitemap on the canonical origin and keeps random cats out', () => {
    const txt = robotsTxt();
    expect(txt).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
    expect(txt).toContain('Disallow: /cat/*random');
  });
});
