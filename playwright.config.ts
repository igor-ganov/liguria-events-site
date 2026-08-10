import { defineConfig, devices } from '@playwright/test';

// Two surfaces:
//  • 'chromium' → the BUILT static site on :4399 (prerendered pages, corpus
//    baked in; client fetches mocked per test). Fast and deterministic.
//  • 'owner' → the REAL worker on :4410 via `wrangler dev --local` with local
//    D1/KV and a test SESSION_SECRET, so the authenticated, SSR owner-route
//    editor is covered by automated tests (no real credentials needed).
// globalSetup builds once and seeds the local D1 the worker binds to.
const OWNER_URL = 'http://localhost:4410';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  reporter: 'list',
  globalSetup: './e2e/global-setup.ts',
  use: { trace: 'on-first-retry' },
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
      command: 'bun x wrangler dev --local --port 4410 --var SESSION_SECRET:e2e-secret',
      url: `${OWNER_URL}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
