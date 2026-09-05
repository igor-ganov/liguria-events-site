import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };
import { signInAsOwner } from './owner-fixture.ts';

// The authenticated route editor must also upgrade its straight-line legs to
// real routing (via the cached path), under throttling. Transitous is stubbed
// so the test is hermetic; the leg starts as an estimate and becomes real.
const FAST_3G = {
  offline: false,
  downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
  uploadThroughput: Math.floor((750 * 1024) / 8),
  latency: 150,
};

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

test('the owner editor upgrades a leg to real routing (cached, throttled)', async ({ page, context }) => {
  await signInAsOwner(page, context);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));
  await page.route('https://api.transitous.org/**', async (r) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await r.fulfill({ contentType: 'application/json', body: JSON.stringify(PLAN) });
  });

  const day = (corpus.events[0]?.s ?? '');
  const data = JSON.stringify({ mode: 'walking', dayIds: [{ day, ids: ['e1', 'e2'] }], durations: {} });
  const created = await page.request.post('/api/routes', { data: { name: 'Real routing', data } });
  const id = (await created.json()).id;

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', FAST_3G);

  await page.goto(`/route/${id}`);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');
  await page.locator('[data-route-view="list"]').click(); // the routed leg summary is in the list
  await expect(page.locator('.route-stop')).toHaveCount(2);

  // The estimate paints first; then the cached real routing arrives → 30 min.
  const real = page.locator('.route-leg[data-real="1"]').first();
  await expect(real).toBeVisible();
  await expect(real).toContainText('30');
});
