import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };

// The real user flow: heart a couple of events, open Favourites through the
// site's own navigation (a ClientRouter SPA swap), pick a mode and press
// "Generate route" — the itinerary must render. A one-time initRoute() that
// wired the buttons only on first module load left them dead after the SPA
// navigation, so nothing happened on click.
test('route builds after opening Favourites via the SPA router', async ({ page }) => {
  // Deterministic corpus — the favourites page fetches it client-side.
  await page.route('**/events.json*', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }),
  );

  await page.goto('/liguria/');
  await page.evaluate(() => localStorage.setItem('dovego:favorites', JSON.stringify(['e1', 'e2'])));

  // Open Favourites the way a user does — the header link, intercepted by
  // ClientRouter (an in-page swap, no full reload).
  await page.locator('.nav-fav').first().click();
  await expect(page).toHaveURL(/favorites\/?$/);

  // The tools appear once the (mocked) favourites load.
  const generate = page.locator('[data-route-generate]');
  await expect(generate).toBeVisible();

  await page.locator('[data-route-mode="driving"]').click();
  await generate.click();

  // The itinerary renders both stops in one day, with a leg between them.
  await expect(page.locator('.route-stop')).toHaveCount(2);
  await expect(page.locator('.route-leg')).toHaveCount(1);
  await expect(page.locator('.route-leg a[href*="travelmode=driving"]')).toBeVisible();
});
