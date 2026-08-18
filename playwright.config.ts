import { defineConfig, devices } from '@playwright/test';

// Two surfaces:
//  • 'chromium' → the BUILT static site on :4399 (prerendered pages, corpus
//    baked in; client fetches mocked per test). Fast and deterministic.
//  • 'owner' → the REAL worker on :4410 via `wrangler dev --local` with local
//    D1/KV and a test SESSION_SECRET, so the authenticated, SSR owner-route
//    editor is covered by automated tests (no real credentials needed).
// globalSetup builds once and seeds the local D1 the worker binds to.
const OWNER_URL = 'http://127.0.0.1:4410';

// ONE ceiling for every event wait, not per-spec overrides: a spec that needs
// its own number is hiding whether it is slow or broken. The specs that throttle
// the network on purpose run alongside everything else, so the default has to
// clear a loaded machine — CI raises it through the environment.
const MAX_WAIT_MS = Number(process.env.E2E_MAX_WAIT_MS ?? 10_000);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  reporter: 'list',
  globalSetup: './e2e/global-setup.ts',
  use: { trace: 'on-first-retry' },
  expect: { timeout: MAX_WAIT_MS },
  projects: [
    { name: 'chromium', testIgnore: /owner-/, use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4399' } },
    { name: 'owner', testMatch: /owner-.*\.spec\.ts/, use: { ...devices['Desktop Chrome'], baseURL: OWNER_URL } },
  ],
  webServer: [
    {
      command: 'bunx serve dist -l 4399',
      url: 'http://localhost:4399/liguria/',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: 'bun x wrangler dev --local --ip 127.0.0.1 --port 4410 --var SESSION_SECRET:e2e-secret',
      url: `${OWNER_URL}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
