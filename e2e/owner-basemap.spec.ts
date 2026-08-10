import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };
import { signSession } from '../src/lib/auth/session.ts';

// The one interaction the claude-in-chrome tool couldn't drive (WebGL): setting
// the base by CLICKING the map. Real Chromium under Playwright renders maplibre,
// so this closes the last gap — arm the base picker, click the map, and the
// from/back-to-base legs must appear.
const OWNER = 'e2e-owner';
const SECRET = 'e2e-secret';

test('clicking the map sets the base and the from/back legs appear', async ({ page, context }) => {
  const token = await signSession(SECRET, OWNER, Date.now());
  await context.addCookies([{ name: 'dg_session', value: token, url: 'http://127.0.0.1:4410' }]);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));

  const day = corpus.events[0].s;
  const data = JSON.stringify({ mode: 'walking', dayIds: [{ day, ids: ['e1', 'e2'] }], durations: {} });
  const created = await page.request.post('/api/routes', { data: { name: 'Base map', data } });
  const id = (await created.json()).id;

  await page.goto(`/route/${id}`);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');
  await expect(page.locator('.route-leg--base')).toHaveCount(0); // no base yet

  // The map must actually initialise (a maplibre canvas) for the click to project.
  const canvas = page.locator('[data-route-map] canvas.maplibregl-canvas');
  await expect(canvas).toBeVisible({ timeout: 15_000 });

  // Arm the route-base picker, then click the map centre.
  await page.locator('[data-pick-base-route]').click();
  await expect(page.locator('.route-pick-hint')).toBeVisible();
  const box = await canvas.boundingBox();
  if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

  // The click set the base → departure + return legs render.
  await expect(page.locator('.route-leg--base')).toHaveCount(2, { timeout: 10_000 });
  await expect(page.locator('.route-leg--base').first()).toContainText(/from base/i);
});
