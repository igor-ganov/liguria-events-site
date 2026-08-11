import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };
import { signInAsOwner } from './owner-fixture.ts';

// Performance of the AUTHENTICATED, SSR route editor under Fast-3G — the "behind
// login" case — plus navigating away and back. Must not hang; the progress bar
// completes (page-load) each way.
const FAST_3G = {
  offline: false,
  downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
  uploadThroughput: Math.floor((750 * 1024) / 8),
  latency: 150,
};
const BUDGET = 30_000;
const log = (msg: string): void => void process.stdout.write(`${msg}\n`);

test('authenticated route editor loads and navigates back and forth under Fast-3G', async ({ page, context }) => {
  await signInAsOwner(page, context);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));
  const data = JSON.stringify({ mode: 'walking', dayIds: [{ day: corpus.events[0].s, ids: ['e1', 'e2'] }], durations: {} });
  const created = await page.request.post('/api/routes', { data: { name: 'Perf', data } });
  const id = (await created.json()).id;

  // Throttle only now (setup done), so we measure the real authenticated load.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', FAST_3G);

  const t0 = Date.now();
  await page.goto(`/route/${id}`);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1', { timeout: BUDGET });
  await expect(page.locator('.tl-block')).toHaveCount(2, { timeout: BUDGET }); // editor opens on the timeline
  await expect(page.locator('#nav-progress')).toHaveCSS('opacity', '0', { timeout: BUDGET });
  const loadMs = Date.now() - t0;
  log(`owner /route load: ${loadMs}ms`);
  expect(loadMs, 'authenticated route editor load under Fast-3G').toBeLessThan(14_000);

  // Away to the feed and back — the round trip that must feel responsive.
  const t1 = Date.now();
  await page.locator('.site-head .brand').first().click();
  await expect(page).toHaveURL(/\/liguria\/?$/, { timeout: BUDGET });
  await expect(page.locator('#nav-progress')).toHaveCSS('opacity', '0', { timeout: BUDGET });
  log(`owner -> feed: ${Date.now() - t1}ms`);

  const t2 = Date.now();
  await page.goBack();
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1', { timeout: BUDGET });
  await expect(page.locator('#nav-progress')).toHaveCSS('opacity', '0', { timeout: BUDGET });
  log(`owner <- back to route: ${Date.now() - t2}ms`);
});
