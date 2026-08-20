import { describe, expect, it } from 'vitest';
import { umamiTag } from './analytics';
import { SITE_URL } from './site';

describe('umami tag', () => {
  it('emits nothing without a website id, so an unconfigured build ships no script', () => {
    expect(umamiTag({})).toBe('');
    expect(umamiTag({ UMAMI_WEBSITE_ID: '  ' })).toBe('');
    expect(umamiTag({ UMAMI_SCRIPT_URL: 'https://example.com/script.js' })).toBe('');
  });

  it('points at the configured instance and reports only from the canonical host', () => {
    const tag = umamiTag({
      UMAMI_WEBSITE_ID: 'cf4a90c2-47f5-4a05-bfb0-39019c7902e3',
      UMAMI_SCRIPT_URL: 'https://analytics.example.com/script.js',
    });
    expect(tag).toContain('src="https://analytics.example.com/script.js"');
    expect(tag).toContain('data-website-id="cf4a90c2-47f5-4a05-bfb0-39019c7902e3"');
    expect(tag).toContain(`data-domains="${new URL(SITE_URL).host}"`);
    expect(tag).toContain('defer');
  });

  it('falls back to Umami Cloud when only the id is set', () => {
    expect(umamiTag({ UMAMI_WEBSITE_ID: 'abc' })).toContain('src="https://cloud.umami.is/script.js"');
  });

  it('escapes what it puts in attributes', () => {
    const tag = umamiTag({ UMAMI_WEBSITE_ID: 'a" onload="alert(1)' });
    expect(tag).not.toContain('onload="alert(1)"');
    expect(tag).toContain('&quot;');
  });
});
