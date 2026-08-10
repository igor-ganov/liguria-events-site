import { test, expect } from '@playwright/test';

// The favourites route generator must upgrade its straight-line estimate to
// REAL walk/transit routing from Transitous/MOTIS (via italian-transport-core).
// We stub the upstream (delayed, to model routing latency) so the test is
// hermetic and asserts the progressive enhancement: instant estimate → real leg.
const FAST_3G = {
  offline: false,
  downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
  uploadThroughput: Math.floor((750 * 1024) / 8),
  latency: 150,
};

// A MOTIS response with a single walk-only "direct" itinerary of 1800s (30 min).
const PLAN = {
  itineraries: [],
  direct: [
    {
      duration: 1800,
      startTime: '2026-01-01T00:00:00Z',
      endTime: '2026-01-01T00:30:00Z',
      transfers: 0,
      legs: [
        {
          mode: 'WALK',
          from: { name: 'A', lat: 44.4, lon: 8.9 },
          to: { name: 'B', lat: 44.41, lon: 8.94 },
          startTime: '2026-01-01T00:00:00Z',
          endTime: '2026-01-01T00:30:00Z',
          duration: 1800,
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

test('generated route upgrades from the estimate to real transit routing', async ({ page }) => {
  const pois = { f1: poi('f1', 44.4, 8.9), f2: poi('f2', 44.41, 8.94) };
  await page.addInitScript((data) => {
    localStorage.setItem('dovego:favorites', JSON.stringify(['f1', 'f2']));
    localStorage.setItem('dovego:fav-pois', JSON.stringify(data));
  }, pois);

  // Hermetic upstreams: empty event corpus, and the stubbed MOTIS plan (delayed
  // ~400 ms so the straight-line estimate paints first, then the real leg).
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ events: [] }) }));
  await page.route('https://api.transitous.org/**', async (r) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await r.fulfill({ contentType: 'application/json', body: JSON.stringify(PLAN) });
  });

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', FAST_3G);

  await page.goto('/favorites/');
  await page.locator('[data-route-generate]').click();

  // Instant paint: the straight-line estimate (no data-real yet).
  const leg = page.locator('.route-leg').first();
  await expect(leg).toBeVisible();

  // Progressive upgrade: the real routed leg — 30 min from the stubbed plan.
  const real = page.locator('.route-leg[data-real="1"]').first();
  await expect(real).toBeVisible();
  await expect(real).toContainText('30');
});
