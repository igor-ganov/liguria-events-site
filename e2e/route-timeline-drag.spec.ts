import { test, expect } from '@playwright/test';

// The favourites generator must offer the vertical-timeline view with the same
// Teams-style drag as the saved-route editor: dragging a block sets its start
// time and the arrangement persists. This also covers the shared makeTimelineDrag.
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

test('generator timeline: dragging a block sets and persists its start time', async ({ page }) => {
  const pois = { f1: poi('f1', 44.4, 8.9), f2: poi('f2', 44.41, 8.94) };
  await page.addInitScript((data) => {
    localStorage.setItem('dovego:favorites', JSON.stringify(['f1', 'f2']));
    localStorage.setItem('dovego:fav-pois', JSON.stringify(data));
    localStorage.removeItem('dovego:route-times');
  }, pois);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ events: [] }) }));
  await page.route('https://api.transitous.org/**', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(PLAN) }));

  await page.goto('/favorites/');
  await page.locator('[data-route-generate]').click();

  // Wait until real routing has settled (lastDays stable) before switching views,
  // so the timeline blocks aren't re-rendered mid-drag.
  await expect(page.locator('.route-leg[data-real="1"]').first()).toBeVisible();

  // Switch to the timeline view.
  await page.locator('[data-route-view="timeline"]').click();
  const block = page.locator('.tl-block').first();
  await expect(block).toBeVisible();
  const before = await block.locator('.tl-time').textContent();

  // Drag the block body down (later start). Grab near the top to avoid the
  // resize handle at the bottom.
  const box = (await block.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 8 + 66, { steps: 6 });
  await page.mouse.up();

  // The start time was committed and persisted.
  await expect(page.locator('.tl-block').first().locator('.tl-time')).not.toHaveText(before ?? '');
  const times = await page.evaluate(() => localStorage.getItem('dovego:route-times'));
  expect(times).toBeTruthy();
  expect(Object.keys(JSON.parse(times ?? '{}')).length).toBeGreaterThan(0);
});
