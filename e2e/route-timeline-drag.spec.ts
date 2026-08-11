import { test, expect } from '@playwright/test';

// The favourites generator offers the vertical-timeline view with the same
// Teams-style drag as the saved-route editor: dragging a block's BODY pins it to
// a new time (persisted), while the top/bottom edges resize it. This covers the
// shared makeTimelineDrag body-move path.
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

test('generator timeline: dragging a block body pins its start time and persists', async ({ page }) => {
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

  // Wait until real routing has settled before switching views, so the timeline
  // blocks aren't re-rendered mid-drag.
  await expect(page.locator('.route-leg[data-real="1"]').first()).toBeVisible();

  await page.locator('[data-route-view="timeline"]').click();
  await expect(page.locator('.tl-block')).toHaveCount(2);
  const first = page.locator('.tl-block').first();
  const before = await first.locator('.tl-time').textContent();

  // Grab the block BODY (its centre, clear of the top/bottom resize handles) and
  // drag down — the block is pinned to a later time.
  const box = (await first.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 120, { steps: 8 });
  await page.mouse.up();

  // Its time changed and the pin persisted.
  await expect(page.locator('.tl-block').first().locator('.tl-time')).not.toHaveText(before ?? '');
  const times = await page.evaluate(() => localStorage.getItem('dovego:route-times'));
  expect(times).toBeTruthy();
  expect(Object.keys(JSON.parse(times ?? '{}')).length).toBeGreaterThan(0);
});
