import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };

// A `from` date limits the trip: events before it are dropped from the route.
// e1/e2 are on 2099-07-10, e3 on 2099-07-05.
test('a `from` date drops earlier events from the route', async ({ page }) => {
  await page.route('**/events.json*', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }),
  );

  await page.goto('/favorites/');
  await page.evaluate(() => localStorage.setItem('dovego:favorites', JSON.stringify(['e1', 'e2', 'e3'])));
  await page.goto('/favorites/');

  await expect(page.locator('[data-route-generate]')).toBeVisible();
  await page.locator('[data-route-from]').fill('2099-07-10');
  await page.locator('[data-route-generate]').click();

  // e3 (2099-07-05) is excluded; only e1 + e2 remain.
  await expect(page.locator('.route-stop')).toHaveCount(2);
  await expect(page.locator('.route-span')).toBeVisible();
});
