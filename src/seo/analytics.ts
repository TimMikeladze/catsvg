/**
 * The Umami tag, injected into the `<head>` at build time.
 *
 * Both halves come from the environment and nothing at all is emitted without a
 * website id, so a fork, a local `vite dev` or any checkout that never set the
 * variables serves a page with no third-party script on it.
 */
import { escapeHtml } from './shell';
import { SITE_URL } from './site';

/** Just the environment, narrowed to what this file reads. */
export type AnalyticsEnv = {
  UMAMI_WEBSITE_ID?: string;
  UMAMI_SCRIPT_URL?: string;
};

/** Umami Cloud's tag. A self-hosted instance sets `UMAMI_SCRIPT_URL` instead. */
const CLOUD_SCRIPT = 'https://cloud.umami.is/script.js';

/**
 * `''` when unconfigured, otherwise the script tag. `data-domains` pins
 * reporting to the canonical host, so preview deployments and localhost load
 * the script but never send anything — the numbers stay production-only.
 */
export function umamiTag(env: AnalyticsEnv): string {
  const websiteId = env.UMAMI_WEBSITE_ID?.trim();
  if (!websiteId) return '';
  const src = env.UMAMI_SCRIPT_URL?.trim() || CLOUD_SCRIPT;
  const attrs = [
    'defer',
    `src="${escapeHtml(src)}"`,
    `data-website-id="${escapeHtml(websiteId)}"`,
    `data-domains="${escapeHtml(new URL(SITE_URL).host)}"`,
  ].join(' ');
  return `<script ${attrs}></script>`;
}
