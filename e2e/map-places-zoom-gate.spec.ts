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

// The other half — that a close camera DOES load and draw places — is verified
// by hand (z=13 over Genoa: 62 markers, liguria + piemonte shards) but is not
// asserted here on purpose. Decoding a region's venues blocks the main thread
// long enough that Playwright cannot even evaluate in the page, so any such test
// would be timing-flaky. That block is a real defect, tracked separately; it
// deserves a fix, not a test tuned to tolerate it.
