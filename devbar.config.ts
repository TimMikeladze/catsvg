import { defineConfig } from 'devbar.sh/config';

export default defineConfig({
  project: 'catsvg',

  // Pages on these origins are matched to this project automatically, so the
  // toolbar in main.tsx needs no server/token/project props. The ports are
  // pinned in vite.config.ts: 5180 is `bun run dev`, 4173 is `bun run preview`.
  origins: [
    'http://localhost:5180',
    'http://127.0.0.1:5180',
    'http://localhost:4173',
  ],

  agent: {
    command: 'claude', // "claude" | "codex" | "opencode" | any binary on PATH
    model: 'sonnet',
    // plan = read-only, auto = may edit the workspace, full = no sandbox
    permission: 'plan',
    // Reports only run an agent once you turn this on.
    autoDispatch: false,
  },

  live: {
    // Lets an agent inspect and screenshot the page you have open.
    enabled: true,
    allowMutating: false,
  },
});
