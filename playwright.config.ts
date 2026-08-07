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
  webServer: {
    command: 'bun run dev -- --port 4399 --host',
    url: 'http://localhost:4399/liguria/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
