import { test, expect } from '@playwright/test';

// The favourites generator offers the vertical-timeline view with the same
// Teams-style drag as the saved-route editor: dragging a block REORDERS the
// stop (insert above/below — no overlaps) and the arrangement persists. This
// also covers the shared makeTimelineDrag reorder path.
const PLAN = {
  itineraries: [],
  direct: [
    {
      duration: 600,
      startTime: '2026-01-01T00:00:00Z',
      endTime: '2026-01-01T00:10:00Z',
      transfers: 0,
      legs: [
        {
          mode: 'WALK',
          from: { name: 'A', lat: 44.4, lon: 8.9 },
          to: { name: 'B', lat: 44.41, lon: 8.94 },
          startTime: '2026-01-01T00:00:00Z',
          endTime: '2026-01-01T00:10:00Z',
          duration: 600,
          realTime: false,
          legGeometry: { points: '_p~iF~ps|U_ulLnnqC', precision: 5 },
        },
      ],
    },
  ],
};

const poi = (id: string, lat: number, lng: number) => ({
  id,
  kind: 'landmark',
  region: 'liguria',
  name: id,
  lat,
  lng,
  cat: 'castle',
  url: `/landmark/liguria/${id}/`,
});

test('generator timeline: dragging a block reorders the stop and persists', async ({ page }) => {
  const pois = { f1: poi('f1', 44.4, 8.9), f2: poi('f2', 44.41, 8.94) };
  await page.addInitScript((data) => {
    localStorage.setItem('dovego:favorites', JSON.stringify(['f1', 'f2']));
    localStorage.setItem('dovego:fav-pois', JSON.stringify(data));
    localStorage.removeItem('dovego:route-order');
  }, pois);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ events: [] }) }));
  await page.route('https://api.transitous.org/**', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(PLAN) }));

  await page.goto('/favorites/');
  await page.locator('[data-route-generate]').click();

  // Wait until real routing has settled before switching views, so the timeline
  // blocks aren't re-rendered mid-drag.
  await expect(page.locator('.route-leg[data-real="1"]').first()).toBeVisible();

  // Switch to the timeline view; two stops → two ordered blocks.
  await page.locator('[data-route-view="timeline"]').click();
  await expect(page.locator('.tl-block')).toHaveCount(2);
  const firstTitle = await page.locator('.tl-block').first().locator('.tl-title').textContent();

  // Drag the first block down, past the second (grab near the top to avoid the
  // bottom resize handle). It should drop into the last slot.
  const box = (await page.locator('.tl-block').first().boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 8 + 160, { steps: 8 });
  await page.mouse.up();

  // The order changed: the first block is now the OTHER stop, and it persisted.
  await expect(page.locator('.tl-block').first().locator('.tl-title')).not.toHaveText(firstTitle ?? '');
  const order = await page.evaluate(() => localStorage.getItem('dovego:route-order'));
  expect(order).toBeTruthy();
  const days: Record<string, string[]> = JSON.parse(order ?? '{}');
  expect(Object.values(days).some((ids) => ids.length === 2)).toBe(true);
});
