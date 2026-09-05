import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Regression guard. The event corpus is fetched as an asset, so on a real
// connection the map's own `load` can fire BEFORE it arrives. Everything wired
// after that await — the marker draw, the opening fit, the skeleton teardown —
// used to hang off `map.on('load')`, which by then had already fired: the map
// came up, then froze behind a re-shown skeleton until the 9 s soft reveal, with
// no markers. Delaying the corpus reproduces that ordering deterministically.
const slowCorpus = (page: Page, ms: number): Promise<unknown> =>
  page.route('**/data/map-events.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    await route.continue();
  });

test('the map still draws and clears its skeleton when the corpus arrives late', async ({ page }) => {
  await slowCorpus(page, 2500);
  await page.goto('/liguria/map/');

  // The map itself comes up while the corpus is still in flight.
  await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible({ timeout: 30_000 });

  // Once it lands, markers are drawn and the loading skeleton is gone — without
  // waiting out the soft-reveal timer.
  await expect(page.locator('.ev-marker').first()).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('[data-map-canvas]')).toHaveAttribute('data-loading', 'false', {
    timeout: 8_000,
  });
});
