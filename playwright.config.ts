import { defineConfig, devices } from '@playwright/test';

// E2E against the dev server (ClientRouter view transitions need a real
// browser). One project (Chromium) — the View Transitions API is Chromium-only
// for now, which is exactly the surface these tests cover.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4399', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Serve the BUILT site (prerendered pages, corpus baked in) rather than the
  // dev server (which re-fetches the corpus server-side per request and stalls
  // under parallel load). Deterministic and fast; client-side fetches are
  // mocked per test.
  webServer: {
    command: 'bun run build && bunx serve dist -l 4399',
    url: 'http://localhost:4399/liguria/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
