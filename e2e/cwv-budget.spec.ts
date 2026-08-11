import { test, expect } from '@playwright/test';

// Core Web Vitals budgets, to catch regressions. CLS is the metric most under
// our control (and currently 0 everywhere); the other guard is code-split
// integrity — the ~1.1 MB maplibre bundle must never leak onto a non-map page.
const FAST_3G = {
  offline: false,
  downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
  uploadThroughput: Math.floor((750 * 1024) / 8),
  latency: 150,
};

// Accumulated layout shift over a short settle window (buffered, so it counts
// shifts during load). Reflect.get keeps the browser callback cast-free.
const clsOf = (page: import('@playwright/test').Page): Promise<number> =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let cls = 0;
        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const value = Reflect.get(entry, 'value');
              const recentInput = Reflect.get(entry, 'hadRecentInput');
              if (recentInput !== true && typeof value === 'number') cls += value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
        } catch {
          resolve(0);
          return;
        }
        setTimeout(() => resolve(Number(cls.toFixed(3))), 1500);
      }),
  );

// The largest .js resource actually downloaded (encoded/transfer bytes).
const biggestJsKb = (page: import('@playwright/test').Page): Promise<number> =>
  page.evaluate(() => {
    const bytes = performance
      .getEntriesByType('resource')
      .filter((r) => r.name.endsWith('.js'))
      .map((r) => Number(Reflect.get(r, 'encodedBodySize') ?? Reflect.get(r, 'transferSize') ?? 0));
    return Math.round(Math.max(0, ...bytes) / 1024);
  });

test('feed: no layout shift, and the map bundle is not shipped here', async ({ page }) => {
  await page.goto('/liguria/');
  await expect(page.locator('.feed-list').first()).toBeVisible();
  expect(await clsOf(page)).toBeLessThan(0.1);
  // maplibre encodes to ~300 KB; a feed chunk that big means code-splitting broke.
  expect(await biggestJsKb(page)).toBeLessThan(250);
});

test('map: renders under Fast-3G without layout shift', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', FAST_3G);
  await page.goto('/liguria/map/', { waitUntil: 'commit' });
  await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible({ timeout: 30_000 });
  expect(await clsOf(page)).toBeLessThan(0.1);
});
