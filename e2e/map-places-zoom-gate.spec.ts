import { test, expect } from '@playwright/test';

// Measured on production before the gate existed: switching Places on from an
// overview camera pulled four neighbouring region shards — 15.6 MB — and blocked
// the main thread for minutes. The region-count cap did not stop it, because
// four dense regions sit under that cap. Places are venue-level detail, so the
// layer now waits for a close enough camera; this guards that it stays that way.

/** Every place-shard request the page has made so far. */
const shardRequests = (page: import('@playwright/test').Page): Promise<readonly string[]> =>
  page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((entry) => entry.name.includes('/data/places/'))
      .map((entry) => entry.name.split('/').pop() ?? ''),
  );

test('switching Places on from an overview camera downloads nothing', async ({ page }) => {
  await page.goto('/liguria/map/?z=8.9&c=44.40,9.30');
  await expect(page.locator('.ev-marker').first()).toBeVisible({ timeout: 30_000 });

  await page.locator('[data-map-places]').click();
  await expect(page.locator('[data-map-places]')).toHaveAttribute('aria-pressed', 'true');
  // The chip is on and the URL records it, but no venue data is fetched…
  await expect(page).toHaveURL(/[?&]pl=1/);
  await expect.poll(() => shardRequests(page), { timeout: 5_000 }).toEqual([]);
  // …and the visitor is told why, instead of the map looking broken.
  await expect(page.locator('.map-toast, [data-map-toast]').first()).toBeVisible({ timeout: 5_000 });
});

test('a close camera past the threshold loads the places and draws them', async ({ page }) => {
  await page.goto('/liguria/map/?pl=1&z=13&c=44.4072,8.9340');
  await expect(page.locator('.pl-marker').first()).toBeVisible({ timeout: 30_000 });

  const shards = await shardRequests(page);
  expect(shards.length).toBeGreaterThan(0);
  // Only the regions the close camera touches — not a swathe of them.
  expect(shards.length).toBeLessThanOrEqual(2);

  // The layer must not wedge the main thread while it indexes those venues —
  // this is what the quadratic dedupe used to do, for minutes at a time.
  const responsive = await page.evaluate(() => {
    const started = performance.now();
    return new Promise<number>((resolve) => {
      requestAnimationFrame(() => resolve(performance.now() - started));
    });
  });
  expect(responsive).toBeLessThan(2_000);
});
