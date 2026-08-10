import { test, expect } from '@playwright/test';

// Performance of ALL main pages and back-and-forth navigation under a throttled
// (Fast-3G) connection. The point is twofold: nothing HANGS (each SPA transition
// completes — the progress bar returns to hidden = astro:page-load fired), and
// the timings are logged so a pathologically slow page shows up.
const FAST_3G = {
  offline: false,
  downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
  uploadThroughput: Math.floor((750 * 1024) / 8),
  latency: 150,
};
const BUDGET = 30_000; // a hang, not a slow page, fails the test

const throttle = async (page: import('@playwright/test').Page): Promise<void> => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', FAST_3G);
};

const settled = async (page: import('@playwright/test').Page): Promise<void> => {
  await expect(page.locator('main')).toBeVisible({ timeout: BUDGET });
  await expect(page.locator('#nav-progress')).toHaveCSS('opacity', '0', { timeout: BUDGET }); // page-load fired
};

const log = (msg: string): void => void process.stdout.write(`${msg}\n`);

const STEPS = ['/calendar/', '/map/', '/landmarks/', '/places/'];

test('main pages navigate forward and back under Fast-3G without hanging', async ({ page }) => {
  await throttle(page);
  const t0 = Date.now();
  await page.goto('/liguria/');
  await settled(page);
  log(`load /liguria/: ${Date.now() - t0}ms`);

  // No wall-clock budget here: 8-worker parallelism shares the CPU, so a timing
  // assertion would measure contention, not the page. `settled` (30s) still
  // fails on a genuine hang, and the logged ms surface a gross regression. The
  // isolated budget lives in owner-perf (its project runs few specs).
  for (const href of STEPS) {
    const t = Date.now();
    await page.locator(`.site-head nav a[href$="${href}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${href.replace(/\//g, '\\/')}$`), { timeout: BUDGET });
    await settled(page);
    log(`-> ${href}: ${Date.now() - t}ms`);
  }

  for (let i = 0; i < STEPS.length; i += 1) {
    const t = Date.now();
    await page.goBack();
    await settled(page);
    log(`<- back ${i + 1}: ${Date.now() - t}ms`);
  }
});
