import { defineConfig, devices } from '@playwright/test';

// Two surfaces:
//  • 'chromium' → the BUILT static site on :4399 (prerendered pages, corpus
//    baked in; client fetches mocked per test). Fast and deterministic.
//  • 'owner' → the REAL worker on :4410 via `wrangler dev --local` with local
//    D1/KV and a test SESSION_SECRET, so the authenticated, SSR owner-route
//    editor is covered by automated tests (no real credentials needed).
//  • 'pwa' → the same static site with the service worker ALLOWED, which is
//    where offline behaviour is tested.
//  • 'ui-*' → four widths, for the sweeps that check a page holds together.
// The build runs in the first web server's command; globalSetup seeds the
// local D1 the worker binds to.
const OWNER_URL = 'http://127.0.0.1:4410';
const STATIC_URL = 'http://localhost:4399';

// Four widths, chosen for where layouts actually break rather than for which
// phones are popular: 320 is the narrowest screen still in use and the one no
// designer opens, 393 is an ordinary phone, the tablet is where a second
// column first appears, and the desktop is where everything fits and nothing
// is proved.
// Every one of them on Chromium, deliberately: this axis is width, and mixing
// an engine into it makes a failure ambiguous. WebKit's own quirks are a
// different sweep and want their own projects. It is also the only engine with
// the CDP throttling the budget specs need.
const FORM_FACTORS = [
  { name: 'narrow', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 568 } } },
  { name: 'phone', use: { ...devices['Pixel 7'], browserName: 'chromium' as const } },
  { name: 'tablet', use: { ...devices['iPad (gen 7)'], browserName: 'chromium' as const } },
  { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
];

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
  // Two different guards, and they are not the same number. MAX_WAIT_MS is how
  // long ONE wait may block before it has proved nothing — kept short, so a
  // spec that is really broken says so quickly. This is how long a whole
  // scenario may take before it is a runaway, and it has to clear a machine
  // running four browsers, a worker and a static server at once. The default
  // 30s failed a plain page load under exactly that load.
  timeout: 60_000,
  projects: [
    // Service workers are BLOCKED here on purpose. A worker sitting in front of
    // the network would answer requests these specs mock through page.route,
    // and a mock that silently stops applying is a test that stops testing.
    {
      name: 'chromium',
      testIgnore: [/owner-/, /[\\/]pwa\.spec\.ts$/, /[\\/]ui-[^\\/]*\.spec\.ts$/, /[\\/]offline-[^\\/]*\.spec\.ts$/],
      use: { ...devices['Desktop Chrome'], baseURL: STATIC_URL, serviceWorkers: 'block' },
    },
    {
      name: 'owner',
      testMatch: /owner-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: OWNER_URL, serviceWorkers: 'block' },
    },
    // The surfaces that want the worker running: it is what is under test.
    {
      name: 'pwa',
      // Anchored to the start of the FILE NAME. Unanchored, `offline-` also
      // matched owner-offline-writing.spec.ts, which then ran here against a
      // static server with no API and failed four times a run for a reason
      // that had nothing to do with what it tests.
      testMatch: [/[\\/]pwa\.spec\.ts$/, /[\\/]offline-[^\\/]*\.spec\.ts$/],
      use: { ...devices['Desktop Chrome'], baseURL: STATIC_URL, serviceWorkers: 'allow' },
    },
    // Form factors. The same specs, at the four widths where a layout breaks:
    // the narrow phone nobody develops on, the ordinary phone, the tablet
    // where a two-column layout first appears, and the desktop.
    ...FORM_FACTORS.map((factor) => ({
      name: `ui-${factor.name}`,
      testMatch: /[\\/]ui-[^\\/]*\.spec\.ts$/,
      use: { ...factor.use, baseURL: STATIC_URL, serviceWorkers: 'block' as const },
    })),
  ],
  webServer: [
    // The build happens HERE, not in globalSetup. Playwright starts the web
    // servers first and runs globalSetup afterwards, so a build in the setup
    // rewrote dist underneath two servers that were already serving it: the
    // static one answered a half-written directory and wrangler lost its
    // worker bundle mid-run. Both showed up as a timeout or an ECONNREFUSED in
    // a spec that had nothing to do with either.
    {
      command: 'bun run build && bunx serve dist -l 4399',
      url: 'http://localhost:4399/liguria/',
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
    {
      // Waits for the worker bundle rather than racing it. The poll is on a
      // file appearing, which is the only signal there is before the server it
      // belongs to can start.
      command:
        'node e2e/wait-for-worker.mjs && bun x wrangler dev --local --ip 127.0.0.1 --port 4410 --var SESSION_SECRET:e2e-secret',
      url: `${OWNER_URL}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
});
