import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };
import { signInAsOwner } from './owner-fixture.ts';

// The one interaction the claude-in-chrome tool couldn't drive (WebGL): setting
// the base by CLICKING the map. Real Chromium under Playwright renders maplibre,
// so this closes the last gap — arm the base picker, click the map, and the
// from/back-to-base legs must appear.
test('clicking the map sets the base and the from/back legs appear', async ({ page, context }) => {
  await signInAsOwner(page, context);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));

  const day = (corpus.events[0]?.s ?? '');
  const data = JSON.stringify({ mode: 'walking', dayIds: [{ day, ids: ['e1', 'e2'] }], durations: {} });
  const created = await page.request.post('/api/routes', { data: { name: 'Base map', data } });
  const id = (await created.json()).id;

  await page.goto(`/route/${id}`);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');
  await page.locator('[data-route-view="list"]').click(); // base legs render in the list view
  await expect(page.locator('.route-leg--base')).toHaveCount(0); // no base yet

  // The map must actually initialise (a maplibre canvas) for the click to project.
  const canvas = page.locator('[data-route-map] canvas.maplibregl-canvas');
  await expect(canvas).toBeVisible({ timeout: 15_000 });

  // Arm the route-base picker, then click the map centre.
  await page.locator('[data-pick-base-route]').click();
  await expect(page.locator('.route-pick-hint')).toBeVisible();
  // The mouse works in viewport coordinates and does not scroll on its own:
  // once the page above the map grew by a row, the canvas centre sat below the
  // fold and the click landed nowhere.
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  await Promise.all(
    [box].filter((found) => found !== null).map((found) => page.mouse.click(found.x + found.width / 2, found.y + found.height / 2)),
  );

  // The click set the base → departure + return legs render.
  await expect(page.locator('.route-leg--base')).toHaveCount(2, { timeout: 10_000 });
  await expect(page.locator('.route-leg--base').first()).toContainText(/from base/i);
});
