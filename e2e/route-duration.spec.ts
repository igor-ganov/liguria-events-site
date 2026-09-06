import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };

// Each stop shows an attendance duration (category default when the source has
// none) and lets the user override it; the override persists and the itinerary
// recomputes. e1 is a music event → 150-minute default.
test('route shows a duration per stop and honours a manual override', async ({ page }) => {
  await page.route('**/events.json*', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }),
  );
  await page.goto('/favorites/');
  await page.evaluate(() => localStorage.setItem('dovego:favorites', JSON.stringify(['e1', 'e2'])));
  await page.goto('/favorites/');

  await page.locator('[data-route-from]').fill('2099-07-10');
  await page.locator('[data-route-generate]').click();
  // The itinerary is built before anything in it can be read. Without this the
  // first assertion below waits on an input that does not exist yet, and on a
  // loaded machine it can still not exist when the wait gives up — a failure
  // about durations that is really about a route that had not been generated.
  await expect(page.locator('.route-stop')).toHaveCount(2);

  const firstDuration = page.locator('.dur-input').first();
  await expect(firstDuration).toHaveValue('150'); // music default

  await firstDuration.fill('60');
  await page.keyboard.press('Tab'); // blur → change → persist + recompute

  await expect(page.locator('.dur-input').first()).toHaveValue('60');
  const stored = await page.evaluate(() => localStorage.getItem('dovego:durations') ?? '');
  expect(stored).toContain('60');
});
