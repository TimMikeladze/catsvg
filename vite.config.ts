import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadEnv, type Connect, type Plugin } from 'vite';
import { handleCatRequest } from './src/server/handler';
import { umamiTag, type AnalyticsEnv } from './src/seo/analytics';
import { HOME, fullHead, robotsTxt, sitemapXml } from './src/seo/html';
import { homeShell } from './src/seo/shell';

/** URL prefixes handled by the image API rather than the SPA. */
const API_PREFIXES = new Set(['cat', 'cats', 'i']);

/**
 * Serves the cat image API during `vite dev` and `vite preview`, so local URLs
 * behave exactly like the deployed edge function in api/cat.ts.
 */
function catApi(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const first = url.pathname.split('/')[1]?.toLowerCase() ?? '';
    if (!API_PREFIXES.has(first) && url.pathname !== '/api/cat') return next();
    const { status, body, headers } = handleCatRequest(url);
    res.statusCode = status;
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
    res.end(body);
  };
  return {
    name: 'cat-api',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  };
}

/**
 * Everything a crawler needs: the `<head>`, the structured data and a
 * prerendered home page, plus the sitemap and robots.txt. React replaces the
 * prerender when it mounts, so both readings of the page say the same thing.
 *
 * The analytics tag rides along here: `env` decides whether there is one at all.
 */
function seo(env: AnalyticsEnv): Plugin {
  return {
    name: 'seo',
    transformIndexHtml(html) {
      // Head-first, so <meta charset> lands well inside the first 1024 bytes a
      // parser reads rather than behind whatever Vite injected.
      const head = [fullHead(HOME), umamiTag(env)].filter(Boolean).join('\n    ');
      return html
        .replace('<head>', `<head>\n    ${head}`)
        .replace('<div id="root"></div>', `<div id="root">${homeShell()}\n    </div>`);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '/').split('?')[0];
        if (path === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          return void res.end(sitemapXml());
        }
        if (path === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return void res.end(robotsTxt());
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() });
    },
  };
}

/**
 * Umami's two variables, from `.env*` locally and from the build environment on
 * Vercel. Unprefixed on purpose: they are read here and baked into the HTML, so
 * they never need to reach the client bundle as `import.meta.env`.
 */
function analyticsEnv(mode: string): AnalyticsEnv {
  return { ...process.env, ...loadEnv(mode, process.cwd(), 'UMAMI_') };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), catApi(), seo(analyticsEnv(mode))],
  // Pinned so the origin never drifts: devbar.config.ts claims these origins,
  // and a page on an unexpected port would not be matched to this project.
  server: { port: 5180, strictPort: true },
  preview: { port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
}));
