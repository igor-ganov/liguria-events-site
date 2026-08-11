import { test, expect } from '@playwright/test';

// A transit leg shows the compact multimodal breakdown: mode, line, destination
// and per-part time (🚶 → 🚌 20 → De Ferrari → 🚶), from the real routing.
const PLAN = {
  itineraries: [
    {
      duration: 1620,
      startTime: '2026-01-01T09:00:00Z',
      endTime: '2026-01-01T09:27:00Z',
      transfers: 0,
      legs: [
        { mode: 'WALK', from: { name: 'A', lat: 44.4, lon: 8.9 }, to: { name: 'Stop', lat: 44.4, lon: 8.91 }, startTime: '2026-01-01T09:00:00Z', endTime: '2026-01-01T09:04:00Z', duration: 240, realTime: false, legGeometry: { points: '_p~iF~ps|U_ulLnnqC', precision: 5 } },
        { mode: 'BUS', routeShortName: '20', from: { name: 'Stop', lat: 44.4, lon: 8.91 }, to: { name: 'De Ferrari', lat: 44.41, lon: 8.93 }, startTime: '2026-01-01T09:04:00Z', endTime: '2026-01-01T09:24:00Z', duration: 1200, realTime: false, legGeometry: { points: '_p~iF~ps|U_ulLnnqC', precision: 5 } },
        { mode: 'WALK', from: { name: 'De Ferrari', lat: 44.41, lon: 8.93 }, to: { name: 'B', lat: 44.41, lon: 8.94 }, startTime: '2026-01-01T09:24:00Z', endTime: '2026-01-01T09:27:00Z', duration: 180, realTime: false, legGeometry: { points: '_p~iF~ps|U_ulLnnqC', precision: 5 } },
      ],
    },
  ],
  direct: [],
};

const poi = (id: string, lat: number, lng: number) => ({ id, kind: 'landmark', region: 'liguria', name: id, lat, lng, cat: 'castle', url: `/landmark/liguria/${id}/` });

test('a transit leg shows the compact walk → bus → walk breakdown', async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem('dovego:favorites', JSON.stringify(['f1', 'f2']));
    localStorage.setItem('dovego:fav-pois', JSON.stringify(data));
  }, { f1: poi('f1', 44.4, 8.9), f2: poi('f2', 44.41, 8.94) });
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ events: [] }) }));
  await page.route('https://api.transitous.org/**', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(PLAN) }));

  await page.goto('/favorites/');
  await page.locator('[data-route-mode="transit"]').click();
  await page.locator('[data-route-generate]').click();

  const parts = page.locator('.route-leg[data-real="1"] .route-leg-parts').first();
  await expect(parts).toBeVisible();
  await expect(parts).toContainText('🚌 20');
  await expect(parts).toContainText('De Ferrari');
  await expect(parts.locator('.route-leg-part')).toHaveCount(3); // walk, bus, walk
});
