import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import type { Connect, Plugin } from 'vite';
import { handleCatRequest } from './src/server/handler.ts';

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

export default defineConfig({
  plugins: [react(), catApi()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
